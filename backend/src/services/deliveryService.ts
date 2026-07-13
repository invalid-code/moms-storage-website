import { ObjectId } from 'mongodb';
import { deliveryCollection, branchCollection } from '../config/db.js';
import type { DeliveryDocument, GetDeliveriesDTO, GetDeliveryDTO, UpdateDeliverySelectivelyDTO } from '@my-app/types/index.js';

export const getAllDeliveries = async (page: number, limit: number, branchId?: ObjectId) => {
  const branchIdMatch = branchId !== undefined ? [{ $match: { branch: branchId } }] : [];
  const skip = (page - 1) * limit;
  const pipeline = [
    ...branchIdMatch,
    { $sort: { createdAt: -1 } },
    { $skip: skip },
    { $limit: limit },
    {
      $lookup: {
        from: "branches",
        localField: "branch",
        foreignField: "_id",
        as: "branchDetails"
      }
    },
    { $unwind: { path: "$branchDetails", preserveNullAndEmptyArrays: true } }
  ];

  const [data, totalItems] = await Promise.all([
    deliveryCollection.aggregate<GetDeliveriesDTO>(pipeline).toArray(),
    deliveryCollection.countDocuments()
  ]);

  return { data, totalItems };
};

export const getDelivery = async (id: ObjectId) => {
  const data = await deliveryCollection.aggregate<GetDeliveryDTO>([
    {
      $match: { _id: id }
    },
    {
      $lookup: {
        from: 'medicine',
        localField: 'stocksRequested',
        foreignField: '_id',
        as: 'stocksRequested'
      }
    }
  ]).toArray();

  return data.length > 0 ? data[0] : null;
};

export const createDeliveryOrder = async (branchId: ObjectId, stocksRequested: ObjectId[]) => {
  const newDelivery: DeliveryDocument = {
    dateRequested: new Date(),
    delivered: false,
    stocksRequested: stocksRequested,
    branch: branchId
  };

  const status = await deliveryCollection.insertOne(newDelivery);
  if (!status.acknowledged) throw new Error("Delivery couldn't be ordered");
  return status;
};

export const processDeliveryUpdate = async (id: ObjectId, body: UpdateDeliverySelectivelyDTO) => {
  const delivery = await deliveryCollection.findOne({ _id: id });
  if (!delivery) throw new Error("Delivery not found");

  const updatedDelivery = await deliveryCollection.findOneAndUpdate(
    { _id: id },
    { $set: body },
    { returnDocument: 'after' }
  );

  const branchId = delivery.branch;

  for (const item of body.stocksReceived) {
    const stockObjectId = item.stockId;
    const amountToAdd = item.amount;

    const updateResult = await branchCollection.updateOne(
      { _id: branchId, "stocks.stock_id": stockObjectId },
      { $inc: { "stocks.$.stock_onhold_amount": amountToAdd } }
    );

    if (updateResult.matchedCount === 0) {
      await branchCollection.updateOne(
        { _id: branchId },
        {
          $push: {
            stocks: { stock_id: stockObjectId, stock_onhold_amount: amountToAdd }
          }
        }
      );
    }
  }

  return updatedDelivery;
};