import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ObjectId } from 'mongodb';

const { branchCollection, medicineCollection, saleCollection } = vi.hoisted(() => ({
  branchCollection: {
    find: vi.fn(),
    aggregate: vi.fn(),
    findOne: vi.fn(),
    findOneAndUpdate: vi.fn(),
    insertOne: vi.fn(),
    updateOne: vi.fn(),
  },
  medicineCollection: {
    find: vi.fn(),
    aggregate: vi.fn(),
    findOne: vi.fn(),
    findOneAndUpdate: vi.fn(),
    insertOne: vi.fn(),
    updateOne: vi.fn(),
  },
  saleCollection: {
    find: vi.fn(),
    aggregate: vi.fn(),
    findOne: vi.fn(),
    findOneAndUpdate: vi.fn(),
    insertOne: vi.fn(),
    updateOne: vi.fn(),
  },
}));

vi.mock('../../src/config/db.js', () => ({
  branchCollection,
  deliveryCollection: {},
  medicineCollection,
  saleCollection,
  client: {},
  connectDB: vi.fn(),
}));

import {
  createSaleService,
  getSaleService,
  getSalesService,
  voidSaleService,
} from '../../src/services/saleService.js';

const branchId = new ObjectId();
const stockId = new ObjectId();
const stockId2 = new ObjectId();

const setupHappyPath = () => {
  branchCollection.findOne.mockResolvedValue({
    _id: branchId,
    name: 'Main',
    stocks: [
      { stock_id: stockId, stock_onhold_amount: 10 },
      { stock_id: stockId2, stock_onhold_amount: 5 },
    ],
  });
  medicineCollection.find.mockReturnValue({
    toArray: () =>
      Promise.resolve([
        { _id: stockId, name: 'Paracetamol', count: 100, price: 25 },
        { _id: stockId2, name: 'Ibuprofen', count: 50, price: 12.5 },
      ]),
  });
  saleCollection.insertOne.mockResolvedValue({ acknowledged: true, insertedId: new ObjectId() });
  branchCollection.updateOne.mockResolvedValue({ matchedCount: 1 });
  medicineCollection.updateOne.mockResolvedValue({ matchedCount: 1 });
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('createSaleService', () => {
  it('records the sale with server-computed total and decrements branch + central stock', async () => {
    setupHappyPath();

    const result = await createSaleService(branchId, [
      { stockId, quantity: 2 },
      { stockId: stockId2, quantity: 4 },
    ]);

    // total = 2*25 + 4*12.5 = 100
    expect(result.total).toBe(100);
    expect(result.branch).toBe(branchId.toString());
    expect(result.voided).toBe(false);
    expect(result.items).toEqual([
      { stock_id: stockId.toString(), quantity: 2, unitPrice: 25 },
      { stock_id: stockId2.toString(), quantity: 4, unitPrice: 12.5 },
    ]);

    const doc = saleCollection.insertOne.mock.calls[0]?.[0] as {
      total: number;
      voided: boolean;
      dateSold: Date;
    };
    expect(doc.total).toBe(100);
    expect(doc.voided).toBe(false);
    expect(doc.dateSold).toBeInstanceOf(Date);

    expect(branchCollection.updateOne).toHaveBeenCalledWith(
      { _id: branchId, 'stocks.stock_id': stockId },
      { $inc: { 'stocks.$.stock_onhold_amount': -2 } },
    );
    expect(medicineCollection.updateOne).toHaveBeenCalledWith(
      { _id: stockId },
      { $inc: { count: -2 } },
    );
  });

  it('throws when no items are provided', async () => {
    await expect(createSaleService(branchId, [])).rejects.toThrow('at least one item');
  });

  it('throws when the branch does not exist', async () => {
    branchCollection.findOne.mockResolvedValue(null);

    await expect(createSaleService(branchId, [{ stockId, quantity: 1 }])).rejects.toThrow('Branch not found');
  });

  it('throws when a medicine does not exist', async () => {
    branchCollection.findOne.mockResolvedValue({ _id: branchId, name: 'Main', stocks: [] });
    medicineCollection.find.mockReturnValue({ toArray: () => Promise.resolve([]) });

    await expect(createSaleService(branchId, [{ stockId, quantity: 1 }])).rejects.toThrow('Medicine not found');
  });

  it('throws when the medicine has no usable price', async () => {
    branchCollection.findOne.mockResolvedValue({
      _id: branchId,
      name: 'Main',
      stocks: [{ stock_id: stockId, stock_onhold_amount: 10 }],
    });
    medicineCollection.find.mockReturnValue({
      toArray: () => Promise.resolve([{ _id: stockId, name: 'Paracetamol', count: 100 }]),
    });

    await expect(createSaleService(branchId, [{ stockId, quantity: 1 }])).rejects.toThrow(
      'Price not set for medicine Paracetamol',
    );
  });

  it('throws when the branch stock is insufficient', async () => {
    setupHappyPath();

    await expect(createSaleService(branchId, [{ stockId, quantity: 11 }])).rejects.toThrow(
      'Insufficient stock for Paracetamol',
    );
    expect(saleCollection.insertOne).not.toHaveBeenCalled();
  });

  it('throws when the central count is insufficient', async () => {
    branchCollection.findOne.mockResolvedValue({
      _id: branchId,
      name: 'Main',
      stocks: [{ stock_id: stockId, stock_onhold_amount: 500 }],
    });
    medicineCollection.find.mockReturnValue({
      toArray: () => Promise.resolve([{ _id: stockId, name: 'Paracetamol', count: 3, price: 25 }]),
    });

    await expect(createSaleService(branchId, [{ stockId, quantity: 4 }])).rejects.toThrow(
      'Insufficient stock for Paracetamol',
    );
  });

  it('throws when the insert is not acknowledged', async () => {
    setupHappyPath();
    saleCollection.insertOne.mockResolvedValue({ acknowledged: false });

    await expect(createSaleService(branchId, [{ stockId, quantity: 1 }])).rejects.toThrow(
      "Sale couldn't be recorded",
    );
  });
});

describe('getSaleService', () => {
  it('returns the mapped sale with stock names', async () => {
    const saleId = new ObjectId();
    saleCollection.aggregate.mockReturnValue({
      toArray: () =>
        Promise.resolve([
          {
            _id: saleId,
            branch: branchId,
            branchDetails: { _id: branchId, name: 'Main', stocks: [] },
            items: [{ stock_id: stockId, quantity: 2, unitPrice: 25 }],
            medicineDetails: [{ _id: stockId, name: 'Paracetamol' }],
            total: 50,
            dateSold: new Date('2026-02-01T00:00:00.000Z'),
            voided: false,
          },
        ]),
    });

    const result = await getSaleService(saleId);

    expect(result).toEqual({
      _id: saleId.toString(),
      branch: branchId.toString(),
      branchDetails: { _id: branchId.toString(), name: 'Main', stocks: [] },
      items: [{ stock_id: stockId.toString(), quantity: 2, unitPrice: 25, stock_name: 'Paracetamol' }],
      total: 50,
      dateSold: '2026-02-01T00:00:00.000Z',
      voided: false,
    });
  });

  it('returns null when nothing matches', async () => {
    saleCollection.aggregate.mockReturnValue({ toArray: () => Promise.resolve([]) });

    await expect(getSaleService(new ObjectId())).resolves.toBeNull();
  });
});

describe('getSalesService', () => {
  it('returns mapped data and totalItems', async () => {
    const saleId = new ObjectId();
    saleCollection.aggregate.mockReturnValue({
      toArray: () =>
        Promise.resolve([
          {
            data: [
              {
                _id: saleId,
                branch: branchId,
                items: [{ stock_id: stockId, quantity: 1, unitPrice: 25 }],
                total: 25,
                dateSold: new Date('2026-02-01T00:00:00.000Z'),
                voided: false,
              },
            ],
            metadata: [{ totalItems: 7 }],
          },
        ]),
    });

    const result = await getSalesService(1, 10);

    expect(result.totalItems).toBe(7);
    expect(result.data).toEqual([
      {
        _id: saleId.toString(),
        branch: branchId.toString(),
        items: [{ stock_id: stockId.toString(), quantity: 1, unitPrice: 25 }],
        total: 25,
        dateSold: '2026-02-01T00:00:00.000Z',
        voided: false,
      },
    ]);
  });

  it('returns empty data when the aggregation has no facet result', async () => {
    saleCollection.aggregate.mockReturnValue({ toArray: () => Promise.resolve([]) });

    await expect(getSalesService(1, 10)).resolves.toEqual({ data: [], totalItems: 0 });
  });
});

describe('voidSaleService', () => {
  const saleId = new ObjectId();
  const sale = {
    _id: saleId,
    branch: branchId,
    items: [{ stock_id: stockId, quantity: 2, unitPrice: 25 }],
    total: 50,
    dateSold: new Date('2026-02-01T00:00:00.000Z'),
    voided: false,
  };

  beforeEach(() => {
    saleCollection.findOne.mockResolvedValue(sale);
    saleCollection.findOneAndUpdate.mockResolvedValue({ ...sale, voided: true, dateVoided: new Date() });
    branchCollection.updateOne.mockResolvedValue({ matchedCount: 1 });
    medicineCollection.updateOne.mockResolvedValue({ matchedCount: 1 });
  });

  it('voids the sale and restores branch + central stock', async () => {
    const result = await voidSaleService(saleId);

    expect(saleCollection.findOneAndUpdate).toHaveBeenCalledWith(
      { _id: saleId },
      { $set: { voided: true, dateVoided: expect.any(Date) } },
      { returnDocument: 'after' },
    );
    expect(branchCollection.updateOne).toHaveBeenCalledWith(
      { _id: branchId, 'stocks.stock_id': stockId },
      { $inc: { 'stocks.$.stock_onhold_amount': 2 } },
    );
    expect(medicineCollection.updateOne).toHaveBeenCalledWith(
      { _id: stockId },
      { $inc: { count: 2 } },
    );
    expect(result?.voided).toBe(true);
    expect(result?._id).toBe(saleId.toString());
  });

  it('throws when the sale does not exist', async () => {
    saleCollection.findOne.mockResolvedValue(null);

    await expect(voidSaleService(saleId)).rejects.toThrow('Sale not found');
  });

  it('throws when the sale is already voided', async () => {
    saleCollection.findOne.mockResolvedValue({ ...sale, voided: true });

    await expect(voidSaleService(saleId)).rejects.toThrow('Sale already voided');
    expect(saleCollection.findOneAndUpdate).not.toHaveBeenCalled();
  });

  it('returns null when the update finds nothing', async () => {
    saleCollection.findOneAndUpdate.mockResolvedValue(null);

    await expect(voidSaleService(saleId)).resolves.toBeNull();
  });
});
