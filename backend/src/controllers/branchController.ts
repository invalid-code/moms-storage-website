import type { Request, Response, NextFunction } from 'express';
import * as branchService from '../services/branchService.js';
import type { GetBranchLowestStockByIdRespDTO, GetBranchLowestStockByIdRouteParams, GetBranchLowestStockByIdRouteQueries, GetBranchStocksByIdRespDTO, GetBranchStocksByIdRouteParams, GetLowestStockOverviewRespDTO, GetSingleStockInBranchRespDTO, GetSingleStockInBranchRouteParams } from '@my-app/types/index.js';
import { ObjectId } from 'mongodb';

export const getBranches = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await branchService.getAllBranches();
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export const getLowestStockOverview = async (req: Request, res: Response<GetLowestStockOverviewRespDTO>, next: NextFunction) => {
  try {
    const data = await branchService.getGlobalLowestStocks();
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export const getBranchStocksById = async (req: Request<GetBranchStocksByIdRouteParams, {}, {}, GetBranchLowestStockByIdRouteQueries>, res: Response<GetBranchStocksByIdRespDTO>, next: NextFunction) => {
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

    const { data, totalItems } = await branchService.getBranchStocks(new ObjectId(id), { page, limit, stockName, stockQuantity });
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

export const getSingleStockInBranch = async (req: Request<GetSingleStockInBranchRouteParams>, res: Response<GetSingleStockInBranchRespDTO>, next: NextFunction) => {
  try {
    const { branchId, stockId } = req.params;
    if (!(ObjectId.isValid(branchId) && ObjectId.isValid(stockId))) {
      return res.status(400).json({ success: false, message: 'Invalid ID format' });
    }

    const result = await branchService.getSpecificBranchStock(new ObjectId(branchId), new ObjectId(stockId));
    if (!result || result.length === 0) {
      return res.status(404).json({ success: false, message: "Branch or specific stock not found." });
    }

    res.status(200).json({ success: true, data: result[0] });
  } catch (err) {
    next(err);
  }
};

export const getBranchLowestStockById = async (req: Request<GetBranchLowestStockByIdRouteParams, {}, {}, GetBranchLowestStockByIdRouteQueries>, res: Response<GetBranchLowestStockByIdRespDTO>, next: NextFunction) => {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid ID format' });
    }

    const reqPage = req.query.page;
    const reqLimit = req.query.limit;

    const page = reqPage != undefined ? parseInt(reqPage.toString()) : 1;
    const limit = reqLimit != undefined ? parseInt(reqLimit.toString()) : 10;

    const { data, totalItems } = await branchService.getBranchLowestStocks(new ObjectId(id), page, limit);
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