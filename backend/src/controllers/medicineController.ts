import type { Request, Response, NextFunction } from 'express';
import { ObjectId } from 'mongodb';
import * as medicineService from '../services/medicineService.js';
import type { GetMedicineRespDTO, GetMedicineRouteParams, GetMedicinesQueryParams, GetMedicinesRespDTO } from '../types/index.js';

export const getMedicines = async (req: Request<{}, {}, {}, GetMedicinesQueryParams>, res: Response<GetMedicinesRespDTO>, next: NextFunction) => {
  try {
    const reqPage = req.query.page;
    const reqLimit = req.query.limit;

    const page = reqPage != undefined ? parseInt(reqPage.toString()) : 1;
    const limit = reqLimit != undefined ? parseInt(reqLimit.toString()) : 10;
    const stockName = req.query.stockName || "";

    const { data, totalItems } = await medicineService.getPaginatedMedicines(page, limit, stockName);
    const totalPages = Math.ceil(totalItems / limit);

    res.status(200).json({
      success: true,
      data,
      pagination: {
        totalItems,
        totalPages,
        currentPage: page,
        limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });
  } catch (err) {
    next(err);
  }
};

export const getMedicine = async (req: Request<GetMedicineRouteParams>, res: Response<GetMedicineRespDTO>, next: NextFunction) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid ID format' });
    }
    const data = await medicineService.getMedicineById(new ObjectId(id));

    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};