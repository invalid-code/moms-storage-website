import type { ObjectId } from "mongodb";
import type { GenericPaginationDTO } from "./common.js";

export interface GetBranchStocksByIdRouteParams {
    id: ObjectId;
}

export interface GetBranchLowestStockByIdRouteParams {
    id: ObjectId;
}

export interface GetSingleStockInBranchRouteParams {
    branchId: ObjectId;
    stockId: ObjectId;
}

export interface GetBranchLowestStockByIdRouteQueries {
    page?: number;
    limit?: number;
    stockName?: string;
    stockQuantity?: number;
}

export interface GetSpecificBranchStockDTO {
    stock_name: string;
    stock_id: ObjectId;
    stock_onhold_amount: number;
}

export interface GetBranchStockDTO {
    "stock-id": ObjectId; 
    "stock-name": string;
    stock_onhold_amount: string;
    percentage: number;
}

export interface GetBranchStocksMetadataDTO {
    total: number; 
}

export interface GetBranchStocksDTO {
    data: GetBranchStockDTO[];
    metadata: GetBranchStocksMetadataDTO[];
}

export interface GetBranchesLowestStockDTO {
    "stock-name": string;
    branch: string;
    "stock-percentage": string;
}

export interface GetBranchLowestStockDTO {
    "stock-name": string;
    stock_onhold_amount: string;
}

export interface GetBranchLowestStocksMetadataDTO {
    total: number;
}

export interface GetBranchesLowestStocksDTO {
    data: GetBranchLowestStockDTO[];
    metadata: GetBranchLowestStocksMetadataDTO[];
}

export interface GetGlobalLowestStocksDTO {
    "stock-name": string;
    branch: string;
    "stock-percentage": string;
}

export interface GetSingleStockInBranchRespDTO {
    success: boolean;
    data?: GetSpecificBranchStockDTO | undefined;
    message?: string;
}

export interface GetBranchStocksByIdRespDTO {
    success: boolean;
    data?: GetBranchStockDTO[];
    pagination?: GenericPaginationDTO;
    message?: string;
}

export interface GetBranchLowestStocksRespDTO {
    success: boolean;
    data?: GetBranchLowestStockDTO[];
    pagination?: GenericPaginationDTO;
    message?: string;
}

export interface GetLowestStockOverviewRespDTO {
    success: boolean;
    data?: GetGlobalLowestStocksDTO[];
}