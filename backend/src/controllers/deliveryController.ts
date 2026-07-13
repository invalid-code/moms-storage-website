import type { Request, Response, NextFunction } from 'express';
import { ObjectId } from 'mongodb';
import * as deliveryService from '../services/deliveryService.js';
import type { CreateDeliveryDTO, CreateDeliveryRespDTO, GetDeliveriesRespDTO, GetDeliveriesRouteQueries, GetDeliveryRespDTO, GetDeliveryRouteParams, StocksReceivedDTO, UpdateDeliveryRespDTO, UpdateDeliverySelectivelyDTO, UpdateDeliverySelectivelyRouteParams } from '@my-app/types/index.js';

export const getDeliveries = async (req: Request<{}, {}, {}, GetDeliveriesRouteQueries>, res: Response<GetDeliveriesRespDTO>, next: NextFunction) => {
  try {
    const reqPage = req.query.page;
    const reqLimit = req.query.limit;
    const branchId = req.query.branchId ? new ObjectId(req.query.branchId) : undefined;

    const page = reqPage != undefined ? parseInt(reqPage.toString()) : 1;
    const limit = reqLimit != undefined ? parseInt(reqLimit.toString()) : 10;

    const { data, totalItems } = await deliveryService.getAllDeliveries(page, limit, branchId);
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

export const getDelivery = async (req: Request<GetDeliveryRouteParams, {}, {}>, res: Response<GetDeliveryRespDTO>, next: NextFunction) => {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid ID format' });
    }

    const data = await deliveryService.getDelivery(new ObjectId(id));

    res.status(200).json({
      success: true,
      data,
    });
  } catch (err) {
    next(err);
  }
};

export const createDelivery = async (req: Request<{}, {}, CreateDeliveryDTO>, res: Response<CreateDeliveryRespDTO>, next: NextFunction) => {
  try {
    const { branchId, stocksRequested } = req.body;

    if (!(ObjectId.isValid(branchId) && stocksRequested.filter(stockRequestedId => !ObjectId.isValid(stockRequestedId)).length === 0)) {
      return res.status(400).json({ success: false, message: 'Invalid ID format' });
    }
    await deliveryService.createDeliveryOrder(new ObjectId(branchId), stocksRequested.map(stockRequestedId => new ObjectId(stockRequestedId)));

    res.status(201).json({ success: true, message: "New delivery was ordered" });
  } catch (err) {
    next(err);
  }
};

export const updateDelivery = async (req: Request<UpdateDeliverySelectivelyRouteParams, {}, UpdateDeliverySelectivelyDTO>, res: Response<UpdateDeliveryRespDTO>, next: NextFunction) => {
  try {
    let updatedDelivery = req.body;

    const { id } = req.params;
    if (!(ObjectId.isValid(id) && updatedDelivery.stocksReceived.filter(stockReceived => !ObjectId.isValid(stockReceived.stockId)).length === 0)) {
      return res.status(400).json({ success: false, message: 'Invalid ID format' });
    }

    updatedDelivery.stocksReceived = updatedDelivery.stocksReceived.map<StocksReceivedDTO>(stockRequested => ({
      stockId: new ObjectId(stockRequested.stockId),
      amount: parseInt(stockRequested.amount.toString()),
    }));
    const updatedData = await deliveryService.processDeliveryUpdate(new ObjectId(id), updatedDelivery);

    res.status(200).json({ success: true, data: updatedData });
  } catch (err) {
    next(err);
  }
};