import { ObjectId } from 'mongodb';
import { deliveryCollection, branchCollection } from '../config/db.js';
import type { DeliveryDTO, GetDeliveriesDTO, GetDeliveryDTO, UpdateDeliverySelectivelyDTO } from '@my-app/types';
import type { DeliveryDocument } from '../types/models.js';

export const getDeliveriesService = async (page: number, limit: number, branchId?: ObjectId) => {
  const branchIdMatch = branchId !== undefined ? [{ $match: { branch: branchId } }] : [];
  const skip = (page - 1) * limit;
  const aggregationResult = await deliveryCollection.aggregate<GetDeliveriesDTO>([
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
    { $unwind: { path: "$branchDetails", preserveNullAndEmptyArrays: true } },
     {
      $facet: {
        metadata: [{ $count: 'totalItems' }],
        data: [{ $skip: skip }, { $limit: limit }]
      }
    }
  ]).toArray();

  const data = aggregationResult[0]?.data || [];
  const totalItems = aggregationResult[0]?.metadata[0]?.totalItems || 0;

  return { data, totalItems };
};

export const getDeliveryService = async (id: ObjectId) => {
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

export const createDeliveryService = async (branchId: ObjectId, stocksRequested: ObjectId[]) => {
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

export const updateDeliveryService = async (id: ObjectId, body: UpdateDeliverySelectivelyDTO) => {
  const delivery = await deliveryCollection.findOne({ _id: id });
  if (!delivery) throw new Error("Delivery not found");

  const updatedDelivery = await deliveryCollection.findOneAndUpdate(
    { _id: id },
    { $set: { delivered: body.delivered, dateDelivered: new Date(body.dateDelivered) } },
    { returnDocument: 'after' }
  );

  const branchId = delivery.branch;

  for (const item of body.stocksReceived) {
    const stockObjectId = new ObjectId(item.stockId);
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

  if (!updatedDelivery) return null;
  const dto: DeliveryDTO = {
    _id: updatedDelivery._id.toString(),
    dateRequested: updatedDelivery.dateRequested.toISOString(),
    ...(updatedDelivery.dateDelivered !== undefined ? { dateDelivered: updatedDelivery.dateDelivered.toISOString() } : {}),
    delivered: updatedDelivery.delivered,
    branch: updatedDelivery.branch.toString(),
    stocksRequested: updatedDelivery.stocksRequested.map(id => id.toString()),
  };
  return dto;
};