import type { Request, Response, NextFunction } from 'express';
import * as branchService from '../services/branchService';

export const getBranches = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await branchService.getAllBranches();
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export const getLowestStockOverview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await branchService.getGlobalLowestStock();
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export const getBranchStocksById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const stockName = req.query.stockName as string;
    const stockQuantity = req.query.stockQuantity ? parseFloat(req.query.stockQuantity as string) : undefined;

    const { data, totalItems } = await branchService.getBranchStocks(id, { page, limit, stockName, stockQuantity });
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

export const getSingleStockInBranch = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { branchId, stockId } = req.params;
    const result = await branchService.getSpecificBranchStock(branchId, stockId);

    if (!result || result.length === 0) {
      return res.status(404).json({ success: false, message: "Branch or specific stock not found." });
    }

    res.status(200).json({ success: true, data: result[0] });
  } catch (err) {
    next(err);
  }
};

export const getBranchLowestStockById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const { data, totalItems } = await branchService.getBranchLowestStock(id, page, limit);
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