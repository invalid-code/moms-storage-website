import { ObjectId } from 'mongodb';
import { branchCollection, medicineCollection, saleCollection } from '../config/db.js';
import type { BranchDTO, BranchStock, GetSaleDTO, SaleDTO, SaleItemDTO } from '@my-app/types';
import type { SaleDocument, SaleItem } from '../types/models.js';

export interface SaleLineInput {
  stockId: ObjectId;
  quantity: number;
  unitPrice?: number;
}

interface RawSaleItem {
  stock_id: ObjectId;
  quantity: number;
  unitPrice: number;
}

interface RawSaleRow {
  _id: ObjectId;
  branch: ObjectId;
  branchDetails?: { _id: ObjectId; name: string; stocks: { stock_id?: ObjectId; stock_onhold_amount: number }[] };
  items: RawSaleItem[];
  medicineDetails?: { _id: ObjectId; name: string }[];
  total: number;
  dateSold: Date;
  voided: boolean;
  dateVoided?: Date;
}

const toSaleDTO = (sale: SaleDocument & { _id: ObjectId }): SaleDTO => ({
  _id: sale._id.toString(),
  branch: sale.branch.toString(),
  items: sale.items.map((item): SaleItemDTO => ({
    stock_id: item.stock_id.toString(),
    quantity: item.quantity,
    unitPrice: item.unitPrice,
  })),
  total: sale.total,
  dateSold: sale.dateSold.toISOString(),
  voided: sale.voided,
  ...(sale.dateVoided !== undefined ? { dateVoided: sale.dateVoided.toISOString() } : {}),
});

const toGetSaleDTO = (row: RawSaleRow): GetSaleDTO => {
  const names = new Map((row.medicineDetails ?? []).map(m => [m._id.toString(), m.name]));
  return {
    _id: row._id.toString(),
    branch: row.branch.toString(),
    ...(row.branchDetails !== undefined
      ? {
          branchDetails: {
            _id: row.branchDetails._id.toString(),
            name: row.branchDetails.name,
            stocks: (row.branchDetails.stocks ?? []).map(
              (s): BranchStock => ({
                ...(s.stock_id !== undefined ? { stock_id: s.stock_id.toString() } : {}),
                stock_onhold_amount: s.stock_onhold_amount,
              }),
            ),
          } satisfies BranchDTO,
        }
      : {}),
    items: row.items.map((item): SaleItemDTO => ({
      stock_id: item.stock_id.toString(),
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      ...(names.get(item.stock_id.toString()) !== undefined
        ? { stock_name: names.get(item.stock_id.toString()) as string }
        : {}),
    })),
    total: row.total,
    dateSold: row.dateSold.toISOString(),
    voided: row.voided,
    ...(row.dateVoided !== undefined ? { dateVoided: row.dateVoided.toISOString() } : {}),
  };
};

const saleDetailPipeline = (match: object) => [
  { $match: match },
  {
    $lookup: {
      from: 'branches',
      localField: 'branch',
      foreignField: '_id',
      as: 'branchDetails',
    },
  },
  { $unwind: { path: '$branchDetails', preserveNullAndEmptyArrays: true } },
  {
    $lookup: {
      from: 'medicine',
      localField: 'items.stock_id',
      foreignField: '_id',
      as: 'medicineDetails',
    },
  },
];

export const createSaleService = async (branchId: ObjectId, lines: SaleLineInput[]) => {
  if (lines.length === 0) throw new Error('Sale must include at least one item');

  const branch = await branchCollection.findOne({ _id: branchId });
  if (!branch) throw new Error('Branch not found');

  const stockIds = lines.map(line => line.stockId);
  const medicines = await medicineCollection.find({ _id: { $in: stockIds } }).toArray();
  const medicineById = new Map(medicines.map(m => [m._id?.toString(), m]));

  const items: SaleItem[] = lines.map(line => {
    const medicine = medicineById.get(line.stockId.toString());
    if (!medicine) throw new Error('Medicine not found');
    // Per-item price override from the POS; falls back to the catalogue price.
    // This also lets priceless legacy docs be sold once the cashier sets a price.
    const override = line.unitPrice;
    if (override !== undefined && (!Number.isFinite(override) || override < 0)) {
      throw new Error(`Invalid price for medicine ${medicine.name}`);
    }
    const effectivePrice = override ?? medicine.price;
    if (typeof effectivePrice !== 'number' || !Number.isFinite(effectivePrice)) {
      throw new Error(`Price not set for medicine ${medicine.name}`);
    }
    const branchStock = (branch.stocks ?? []).find(s => s.stock_id?.toString() === line.stockId.toString());
    const available = branchStock?.stock_onhold_amount ?? 0;
    if (available < line.quantity) throw new Error(`Insufficient stock for ${medicine.name}`);
    if (medicine.count < line.quantity) throw new Error(`Insufficient stock for ${medicine.name}`);
    return { stock_id: line.stockId, quantity: line.quantity, unitPrice: effectivePrice };
  });

  const total = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const newSale: SaleDocument = {
    branch: branchId,
    items,
    total,
    dateSold: new Date(),
    voided: false,
  };

  const status = await saleCollection.insertOne(newSale);
  if (!status.acknowledged) throw new Error("Sale couldn't be recorded");

  for (const item of items) {
    await branchCollection.updateOne(
      { _id: branchId, 'stocks.stock_id': item.stock_id },
      { $inc: { 'stocks.$.stock_onhold_amount': -item.quantity } },
    );
    await medicineCollection.updateOne({ _id: item.stock_id }, { $inc: { count: -item.quantity } });
  }

  return toSaleDTO({ ...newSale, _id: status.insertedId });
};

export const getSaleService = async (id: ObjectId) => {
  const data = await saleCollection.aggregate<RawSaleRow>(saleDetailPipeline({ _id: id })).toArray();

  return data.length > 0 && data[0] !== undefined ? toGetSaleDTO(data[0]) : null;
};

export const getSalesService = async (page: number, limit: number, branchId?: ObjectId) => {
  const branchIdMatch = branchId !== undefined ? [{ $match: { branch: branchId } }] : [];
  const skip = (page - 1) * limit;
  const aggregationResult = await saleCollection
    .aggregate<{ data: RawSaleRow[]; metadata: { totalItems: number }[] }>([
      ...branchIdMatch,
      { $sort: { dateSold: -1 } },
      ...saleDetailPipeline({}),
      {
        $facet: {
          metadata: [{ $count: 'totalItems' }],
          data: [{ $skip: skip }, { $limit: limit }],
        },
      },
    ])
    .toArray();

  const facet = aggregationResult[0];
  const rows = facet?.data ?? [];
  return { data: rows.map(toGetSaleDTO), totalItems: facet?.metadata[0]?.totalItems || 0 };
};

export const voidSaleService = async (id: ObjectId) => {
  const sale = await saleCollection.findOne({ _id: id });
  if (!sale) throw new Error('Sale not found');
  if (sale.voided) throw new Error('Sale already voided');

  const updatedSale = await saleCollection.findOneAndUpdate(
    { _id: id },
    { $set: { voided: true, dateVoided: new Date() } },
    { returnDocument: 'after' },
  );
  if (!updatedSale) return null;

  for (const item of sale.items) {
    const updateResult = await branchCollection.updateOne(
      { _id: sale.branch, 'stocks.stock_id': item.stock_id },
      { $inc: { 'stocks.$.stock_onhold_amount': item.quantity } },
    );
    if (updateResult.matchedCount === 0) {
      await branchCollection.updateOne(
        { _id: sale.branch },
        { $push: { stocks: { stock_id: item.stock_id, stock_onhold_amount: item.quantity } } },
      );
    }
    await medicineCollection.updateOne({ _id: item.stock_id }, { $inc: { count: item.quantity } });
  }

  return toSaleDTO({ ...updatedSale, _id: updatedSale._id });
};
