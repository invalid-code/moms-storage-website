import { ObjectId } from 'mongodb';
import { medicineCollection } from '../config/db.js';
import type { GetMedicinesDTO, MedicineDTO } from '@my-app/types/index.js';

export const getPaginatedMedicinesService = async (page: number, limit: number, stockName?: string) => {
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

  const data: MedicineDTO[] = (aggregationResult[0]?.data || []).map(item => ({
    ...(item._id !== undefined ? { _id: item._id.toString() } : {}),
    name: item.name,
    count: item.count,
  }));
  const totalItems = aggregationResult[0]?.metadata[0]?.totalItems || 0;

  return { data, totalItems };
};

export const getMedicineService = async (id: ObjectId) => {
  const doc = await medicineCollection.findOne({ _id: id });
  if (!doc) return null;
  const dto: MedicineDTO = {
    ...(doc._id !== undefined ? { _id: doc._id.toString() } : {}),
    name: doc.name,
    count: doc.count,
  };
  return dto;
};