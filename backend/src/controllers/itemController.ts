import type { Request, Response, NextFunction } from 'express';
import { ObjectId } from 'mongodb';
import * as itemService from '../services/itemService';

export const getItems = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const stockName = req.query.stockName as string;

    const { data, totalItems } = await itemService.getPaginatedItems(page, limit, stockName);
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

export const getItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid ID format' });
    }

    const data = await itemService.getItemById(id);
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};