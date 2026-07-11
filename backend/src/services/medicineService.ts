import { ObjectId } from 'mongodb';
import { medicineCollection } from '../config/db.js';
import type { GetMedicinesDTO } from '@my-app/types/index.js';

export const getPaginatedMedicines = async (page: number, limit: number, stockName?: string) => {
  const skip = (page - 1) * limit;
  const matchStage: any = {};

  if (stockName) {
    matchStage.name = { $regex: stockName, $options: 'i' };
  }

  const aggregationResult = await medicineCollection.aggregate<GetMedicinesDTO>([
    { $match: matchStage },
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

export const getMedicineById = async (id: ObjectId) => {
  return await medicineCollection.findOne({ _id: id });
};