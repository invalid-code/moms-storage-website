import { ObjectId } from 'mongodb';
import { branchCollection } from '../config/db';

export const getAllBranches = async () => {
  return await branchCollection.find({}).toArray();
};

export const getGlobalLowestStock = async () => {
  return await branchCollection.aggregate([
    { $unwind: "$stocks" },
    {
      $lookup: {
        from: "medicine",
        localField: "stocks.stock_id",
        foreignField: "_id",
        as: "medicine_info"
      }
    },
    { $unwind: "$medicine_info" },
    {
      $project: {
        _id: 0,
        stock_name: "$medicine_info.name",
        branch: "$name",
        stock_onhold_amount: "$stocks.stock_onhold_amount",
        percentage: {
          $cond: {
            if: { $eq: ["$medicine_info.count", 0] },
            then: 0,
            else: {
              $multiply: [
                { $divide: ["$stocks.stock_onhold_amount", "$medicine_info.count"] },
                100
              ]
            }
          }
        }
      }
    },
    { $match: { percentage: { $lt: 30 } } },
    { $sort: { stock_name: 1, stock_onhold_amount: 1 } },
    {
      $group: {
        _id: "$stock_name",
        lowestBranch: { $first: "$branch" },
        lowestPercentage: { $first: "$percentage" }
      }
    },
    { $sort: { lowestPercentage: 1 } },
    { $limit: 3 },
    {
      $project: {
        _id: 0,
        "stock-name": "$_id",
        "branch": "$lowestBranch",
        "stock-percentage": {
          $concat: [{ $toString: { $round: ["$lowestPercentage", 2] } }, "%"]
        }
      }
    }
  ]).toArray();
};

export const getBranchStocks = async (id: string, options: { page: number; limit: number; stockName?: string; stockQuantity?: number }) => {
  const { page, limit, stockName, stockQuantity } = options;
  const skip = (page - 1) * limit;

  const filterMatch: any = {};
  if (stockName) filterMatch["stock_name"] = { $regex: stockName, $options: 'i' };

  const percentageMatch = stockQuantity !== undefined ? [{ $match: { percentage: { $lte: stockQuantity } } }] : [];

  const pipeline: any[] = [
    { $match: { _id: new ObjectId(id) } },
    { $unwind: "$stocks" },
    {
      $lookup: {
        from: "medicine",
        localField: "stocks.stock_id",
        foreignField: "_id",
        as: "medicine_info"
      }
    },
    { $unwind: "$medicine_info" },
    {
      $project: {
        _id: 0,
        stock_id: "$stocks.stock_id",
        stock_name: "$medicine_info.name",
        stock_onhold_amount: "$stocks.stock_onhold_amount",
        percentage: {
          $cond: {
            if: { $gt: ["$medicine_info.count", 0] },
            then: { $multiply: [{ $divide: ["$stocks.stock_onhold_amount", "$medicine_info.count"] }, 100] },
            else: 0
          }
        }
      }
    },
    ...(Object.keys(filterMatch).length > 0 ? [{ $match: filterMatch }] : []),
    ...percentageMatch,
    {
      $facet: {
        metadata: [{ $count: "total" }],
        data: [
          { $skip: skip },
          { $limit: limit },
          {
            $project: {
              _id: 0,
              "stock-id": "$stock_id",
              "stock-name": "$stock_name",
              stock_onhold_amount: "$stock_onhold_amount",
              percentage: { $round: ["$percentage", 2] }
            }
          }
        ]
      }
    }
  ];

  const result = await branchCollection.aggregate(pipeline).toArray();
  return {
    data: result[0]?.data || [],
    totalItems: result[0]?.metadata[0]?.total || 0
  };
};

export const getSpecificBranchStock = async (branchId: string, stockId: string) => {
  const pipeline = [
    { $match: { _id: new ObjectId(branchId) } },
    { $unwind: "$stocks" },
    { $match: { "stocks.stock_id": new ObjectId(stockId) } },
    {
      $lookup: {
        from: "medicine",
        localField: "stocks.stock_id",
        foreignField: "_id",
        as: "medicine_info"
      }
    },
    { $unwind: "$medicine_info" },
    {
      $project: {
        _id: 0,
        stock_name: "$medicine_info.name",
        stock_id: "$stocks.stock_id",
        stock_onhold_amount: "$stocks.stock_onhold_amount"
      }
    }
  ];
  return await branchCollection.aggregate(pipeline).toArray();
};

export const getBranchLowestStock = async (id: string, page: number, limit: number) => {
  const skip = (page - 1) * limit;
  const pipeline = [
    { $match: { _id: new ObjectId(id) } },
    { $unwind: "$stocks" },
    {
      $lookup: {
        from: "medicine",
        localField: "stocks.stock_id",
        foreignField: "_id",
        as: "medicine_info"
      }
    },
    { $unwind: "$medicine_info" },
    {
      $project: {
        _id: 0,
        stock_name: "$medicine_info.name",
        stock_onhold_amount: "$stocks.stock_onhold_amount",
        percentage: {
          $cond: {
            if: { $eq: ["$medicine_info.count", 0] },
            then: 0,
            else: { $multiply: [{ $divide: ["$stocks.stock_onhold_amount", "$medicine_info.count"] }, 100] }
          }
        }
      }
    },
    { $match: { percentage: { $lt: 30 } } },
    { $sort: { percentage: 1 } },
    {
      $facet: {
        metadata: [{ $count: "total" }],
        data: [
          { $skip: skip },
          { $limit: limit },
          {
            $project: {
              _id: 0,
              "stock-name": "$stock_name",
              stock_onhold_amount: "$stock_onhold_amount",
            }
          }
        ]
      }
    }
  ];

  const result = await branchCollection.aggregate(pipeline).toArray();
  return {
    data: result[0]?.data || [],
    totalItems: result[0]?.metadata[0]?.total || 0
  };
};