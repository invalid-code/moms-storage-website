import { ObjectId } from 'mongodb';
import { deliveryCollection, branchCollection } from '../config/db.js';

export const getAllDeliveries = async (page: number, limit: number) => {
  const skip = (page - 1) * limit;
  const pipeline = [
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
    deliveryCollection.aggregate(pipeline).toArray(),
    deliveryCollection.countDocuments()
  ]);

  return { data, totalItems };
};

export const getDelivery = async (id: string) => {
  const data = deliveryCollection.findOne({_id: new ObjectId(id)});

  return data;
};

export const createDeliveryOrder = async (branchId: string, stocksRequested: string[]) => {
  const newDelivery = {
    dateRequested: new Date(),
    delivered: false,
    stocksRequested: stocksRequested.map((id) => new ObjectId(id)),
    branch: new ObjectId(branchId)
  };
  
  const status = await deliveryCollection.insertOne(newDelivery);
  if (!status.acknowledged) throw new Error("Delivery couldn't be ordered");
  return status;
};

export const processDeliveryUpdate = async (id: string, body: any) => {
  const delivery = await deliveryCollection.findOne({ _id: new ObjectId(id) });
  if (!delivery) throw new Error("Delivery not found");

  const { stocksReceived, ...restPayload } = body;
  const updatePayload = { ...restPayload };

  if (stocksReceived && Array.isArray(stocksReceived)) {
    updatePayload.stocksReceived = stocksReceived.map((item: any) => ({
      stockId: new ObjectId(item.stockId),
      amount: Number(item.amount)
    }));
  }

  const updatedDelivery = await deliveryCollection.findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: updatePayload },
    { returnDocument: 'after' }
  );

  const branchId = delivery.branch;

  for (const item of stocksReceived) {
    const stockObjectId = new ObjectId(item.stockId);
    const amountToAdd = Number(item.amount);

    const updateResult = await branchCollection.updateOne(
      { _id: new ObjectId(branchId), "stocks.stock_id": stockObjectId },
      { $inc: { "stocks.$.stock_onhold_amount": amountToAdd } }
    );

    if (updateResult.matchedCount === 0) {
      await branchCollection.updateOne(
        { _id: new ObjectId(branchId) },
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