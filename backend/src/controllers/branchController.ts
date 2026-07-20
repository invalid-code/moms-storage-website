import type { Request, Response, NextFunction } from 'express';
import * as branchService from '../services/branchService.js';
import type { GetBranchLowestStocksRouteParams, GetBranchLowestStocksRouteQueries, GetBranchLowestStocksRespDTO, GetBranchStocksRespDTO, GetBranchStocksRouteParameters, GetBranchesLowestStocksRespDTO, GetBranchStockRespDTO, GetBranchStockRouteParams, GetBranchesRespDTO } from '@my-app/types/index.js';
import { ObjectId } from 'mongodb';

export const getBranchesController = async (req: Request, res: Response<GetBranchesRespDTO>, next: NextFunction) => {
  try {
    const data = await branchService.getBranchesService();
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export const getBranchesLowestStocksController = async (req: Request, res: Response<GetBranchesLowestStocksRespDTO>, next: NextFunction) => {
  try {
    const data = await branchService.getBranchesLowestStocksService();
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export const getBranchStocksController = async (req: Request<GetBranchStocksRouteParameters, {}, {}, GetBranchLowestStocksRouteQueries>, res: Response<GetBranchStocksRespDTO>, next: NextFunction) => {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid ID format' });
    }
        
    const reqPage = req.query.page;
    const reqLimit = req.query.limit;

    const page = reqPage != undefined ? parseInt(reqPage.toString()) : 1;
    const limit = reqLimit != undefined ? parseInt(reqLimit.toString()) : 10;

    const stockName = req.query.stockName || "";
    const stockQuantity = req.query.stockQuantity ? parseFloat(req.query.stockQuantity.toString()) : 100;

    const { data, totalItems } = await branchService.getBranchStocksService(new ObjectId(id), { page, limit, stockName, stockQuantity });
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

export const getBranchStockController = async (req: Request<GetBranchStockRouteParams>, res: Response<GetBranchStockRespDTO>, next: NextFunction) => {
  try {
    const { branchId, stockId } = req.params;
    if (!(ObjectId.isValid(branchId) && ObjectId.isValid(stockId))) {
      return res.status(400).json({ success: false, message: 'Invalid ID format' });
    }

    const result = await branchService.getBranchStockService(new ObjectId(branchId), new ObjectId(stockId));
    if (!result || result.length === 0) {
      return res.status(404).json({ success: false, message: "Branch or specific stock not found." });
    }

    res.status(200).json({ success: true, data: result[0] });
  } catch (err) {
    next(err);
  }
};

export const getBranchLowestStocksController = async (req: Request<GetBranchLowestStocksRouteParams, {}, {}, GetBranchLowestStocksRouteQueries>, res: Response<GetBranchLowestStocksRespDTO>, next: NextFunction) => {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid ID format' });
    }

    const reqPage = req.query.page;
    const reqLimit = req.query.limit;

    const page = reqPage != undefined ? parseInt(reqPage.toString()) : 1;
    const limit = reqLimit != undefined ? parseInt(reqLimit.toString()) : 10;

    const { data, totalItems } = await branchService.getBranchLowestStocksService(new ObjectId(id), page, limit);
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