import type { Request, Response, NextFunction } from 'express';
import { ObjectId } from 'mongodb';
import * as saleService from '../services/saleService.js';
import type {
  CreateSaleDTO,
  CreateSaleItemDTO,
  CreateSaleRespDTO,
  GetSaleRespDTO,
  GetSaleRouteParams,
  GetSalesRespDTO,
  GetSalesRouteQueries,
  VoidSaleRespDTO,
  VoidSaleRouteParams,
} from '@my-app/types/index.js';

const mapSaleError = (err: unknown, res: Response, next: NextFunction) => {
  if (err instanceof Error) {
    if (/not found/i.test(err.message)) {
      return res.status(404).json({ success: false, message: err.message });
    }
    if (/already voided|insufficient stock|price not set|invalid price/i.test(err.message)) {
      return res.status(409).json({ success: false, message: err.message });
    }
  }
  next(err);
};

const isValidSaleItem = (item: CreateSaleItemDTO) =>
  ObjectId.isValid(item.stockId) &&
  Number.isInteger(item.quantity) &&
  item.quantity > 0 &&
  (item.unitPrice === undefined || (typeof item.unitPrice === 'number' && Number.isFinite(item.unitPrice) && item.unitPrice >= 0));

export const getSalesController = async (
  req: Request<{}, {}, {}, GetSalesRouteQueries>,
  res: Response<GetSalesRespDTO>,
  next: NextFunction,
) => {
  try {
    const reqPage = req.query.page;
    const reqLimit = req.query.limit;
    const branchId = req.query.branchId ? new ObjectId(req.query.branchId) : undefined;

    const page = reqPage != undefined ? parseInt(reqPage.toString()) : 1;
    const limit = reqLimit != undefined ? parseInt(reqLimit.toString()) : 10;

    const { data, totalItems } = await saleService.getSalesService(page, limit, branchId);
    const totalPages = Math.ceil(totalItems / limit);

    res.status(200).json({
      success: true,
      data,
      pagination: { totalItems, totalPages, currentPage: page, limit, hasNextPage: page < totalPages, hasPrevPage: page > 1 },
    });
  } catch (err) {
    next(err);
  }
};

export const getSaleController = async (
  req: Request<GetSaleRouteParams, {}, {}>,
  res: Response<GetSaleRespDTO>,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid ID format' });
    }

    const data = await saleService.getSaleService(new ObjectId(id));

    res.status(200).json({
      success: true,
      data,
    });
  } catch (err) {
    next(err);
  }
};

export const createSaleController = async (
  req: Request<{}, {}, CreateSaleDTO>,
  res: Response<CreateSaleRespDTO>,
  next: NextFunction,
) => {
  try {
    const { branchId, items } = req.body;

    if (
      !ObjectId.isValid(branchId) ||
      !Array.isArray(items) ||
      items.length === 0 ||
      items.filter(item => !isValidSaleItem(item)).length > 0
    ) {
      return res.status(400).json({ success: false, message: 'Invalid sale format' });
    }

    const data = await saleService.createSaleService(
      new ObjectId(branchId),
      items.map(item => ({ stockId: new ObjectId(item.stockId), quantity: item.quantity, ...(item.unitPrice !== undefined ? { unitPrice: item.unitPrice } : {}) })),
    );

    res.status(201).json({ success: true, data });
  } catch (err) {
    mapSaleError(err, res, next);
  }
};

export const voidSaleController = async (
  req: Request<VoidSaleRouteParams, {}, {}>,
  res: Response<VoidSaleRespDTO>,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid ID format' });
    }

    const data = await saleService.voidSaleService(new ObjectId(id));

    res.status(200).json({ success: true, data });
  } catch (err) {
    mapSaleError(err, res, next);
  }
};
