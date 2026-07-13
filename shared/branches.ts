import type { ObjectId } from "mongodb";
import type { GenericPaginationDTO } from "./common.js";

export interface GetBranchStocksRouteParameters {
    id: ObjectId;
}

export interface GetBranchLowestStocksRouteParams {
    id: ObjectId;
}

export interface GetBranchStockRouteParams {
    branchId: ObjectId;
    stockId: ObjectId;
}

export interface GetBranchLowestStocksRouteQueries {
    page?: number;
    limit?: number;
    stockName?: string;
    stockQuantity?: number;
}

export interface GetBranchStockDTO {
    stock_name: string;
    stock_id: ObjectId;
    stock_onhold_amount: number;
}

export interface GetBranchStockItemDTO {
    "stock-id": ObjectId; 
    "stock-name": string;
    stock_onhold_amount: number;
    percentage: number;
}

export interface GetBranchStocksMetadataDTO {
    total: number; 
}

export interface GetBranchStocksDTO {
    data: GetBranchStockItemDTO[];
    metadata: GetBranchStocksMetadataDTO[];
}

export interface GetBranchesLowestStockDTO {
    "stock-name": string;
    branch: string;
    "stock-percentage": string;
}

export interface GetBranchLowestStocksItemDTO {
    "stock-name": string;
    stock_onhold_amount: string;
}

export interface GetBranchLowestStocksMetadataDTO {
    total: number;
}

export interface GetBranchLowestStocksDTO {
    data: GetBranchLowestStocksItemDTO[];
    metadata: GetBranchLowestStocksMetadataDTO[];
}

export interface GetBranchesLowestStocksDTO {
    "stock-name": string;
    branch: string;
    "stock-percentage": string;
}

export interface GetBranchStockRespDTO {
    success: boolean;
    data?: GetBranchStockDTO | undefined;
    message?: string;
}

export interface GetBranchStocksRespDTO {
    success: boolean;
    data?: GetBranchStockItemDTO[];
    pagination?: GenericPaginationDTO;
    message?: string;
}

export interface GetBranchLowestStocksRespDTO {
    success: boolean;
    data?: GetBranchLowestStocksItemDTO[];
    pagination?: GenericPaginationDTO;
    message?: string;
}

export interface GetBranchesLowestStocksRespDTO {
    success: boolean;
    data?: GetBranchesLowestStocksDTO[];
}