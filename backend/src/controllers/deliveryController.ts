import type { Request, Response, NextFunction } from 'express';
import { ObjectId } from 'mongodb';
import * as deliveryService from '../services/deliveryService.js';

export const getDeliveries = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const { data, totalItems } = await deliveryService.getAllDeliveries(page, limit);
    const totalPages = Math.ceil(totalItems / limit);

    res.status(200).json({
      success: true,
      data,
      pagination: { totalItems, totalPages, currentPage: page, limit, hasNextPage: page < totalPages, hasPrevPage: page > 1 }
    });
  } catch (err) {
    next(err);
  }
};

export const getDelivery = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const data = await deliveryService.getDelivery(id);

    res.status(200).json({
      success: true,
      data,
    });
  } catch (err) {
    next(err);
  }
};

export const createDelivery = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { branchId, stocksRequested } = req.body;
    await deliveryService.createDeliveryOrder(branchId, stocksRequested);
    res.status(201).json({ success: true, message: "New delivery was ordered" });
  } catch (err) {
    next(err);
  }
};

export const updateDelivery = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid ID format' });
    }
    const updatedData = await deliveryService.processDeliveryUpdate(id, req.body);
    res.status(200).json({ success: true, data: updatedData });
  } catch (err) {
    next(err);
  }
};