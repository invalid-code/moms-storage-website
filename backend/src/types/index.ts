import type { ObjectId } from "mongodb";

export interface MedicineDocument {
    _id?: ObjectId;
    name: string;
    count: number;
};

export interface BranchStock {
    stock_id?: ObjectId;
    stock_onhold_amount: number;
};

export interface BranchDocument {
    _id?: ObjectId;
    name: string;
    stocks: BranchStock[];
};

export interface DeliveryDocument {
    _id?: ObjectId;
    dateRequested: Date;
    dateReceived?: Date;
    delivered: boolean;
    branch: ObjectId;
    stocksRequested: ObjectId[];
};

export interface GenericPaginationDTO {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    limit: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
};

export interface CreateDeliveryDTO {
    branchId: ObjectId;
    stocksRequested: ObjectId[];
};

export interface StocksReceivedDTO {
    stockId: ObjectId;
    amount: number;
};

export interface UpdateDeliverySelectivelyDTO {
    delivered: boolean;
    dateDelivered: Date;
    stocksReceived: StocksReceivedDTO[];
};

export interface UpdateDeliverySelectivelyRouteParams {
    id: ObjectId;
};

export interface GetDeliveryRouteParams {
    id: ObjectId;
};

export interface GetDeliveryDTO {
    _id: ObjectId;
    dateRequested: Date;
    dateDelivered?: Date;
    delivered: boolean;
    branch: ObjectId;
    stocksRequested: MedicineDocument[];
};

export interface GetDeliveriesRouteQueries {
    page?: number;
    limit?: number;
};

export interface GetDeliveriesDTO {
    _id: ObjectId;
    name: string;
    stocks: BranchDocument[];
};

export interface GetDeliveriesRespDTO {
    success: boolean;
    data: GetDeliveriesDTO[];
    pagination: GenericPaginationDTO;
};

export interface GetDeliveryRespDTO {
    success: boolean;
    data?: GetDeliveryDTO | undefined | null;
    message?: string;
};

export interface CreateDeliveryRespDTO {
    success: boolean;
    message: string;
};

export interface UpdateDeliveryRespDTO {
    success: boolean;
    data?: DeliveryDocument | null;
    message?: string;
};

export interface GetMedicineRouteParams {
    id: ObjectId;
};

export interface GetMedicinesMetadataDTO {
    totalItems: number;
};

export interface GetMedicinesDTO {
    data: MedicineDocument[];
    metadata: GetMedicinesMetadataDTO[];
};

export interface GetMedicinesQueryParams {
    page?: number;
    limit?: number;
    stockName?: string;
};

export interface GetMedicinesRespDTO {
    success: boolean;
    data: MedicineDocument[];
    pagination: GenericPaginationDTO;
};

export interface GetMedicineRespDTO {
    success: boolean;
    data?: MedicineDocument | undefined | null;
    message?: string;
};

export interface GetBranchLowestStocksMetadataDTO {
    total: number;
};

export interface GetBranchLowestStockDTO {
    "stock-name": string;
    branch: string;
    "stock-percentage": string;
};

export interface GetBranchLowestStocksDTO {
    data: GetBranchLowestStockDTO[];
    metadata: GetBranchLowestStocksMetadataDTO[]
};

export interface GetSpecificBranchStockDTO {
    stock_name: string;
    stock_id: ObjectId;
    stock_onhold_amount: number;
};

export interface GetBranchStocksMetadataDTO {
    total: number; 
};

export interface GetBranchStockDTO {
    "stock-id": ObjectId; 
    "stock-name": string;
    stock_onhold_amount: string;
    percentage: number;
};

export interface GetBranchStocksDTO {
    data: GetBranchStockDTO[];
    metadata: GetBranchStocksMetadataDTO[];
};

export interface GetGlobalLowestStocksDTO {
    "stock-name": string;
    branch: string;
    "stock-percentage": string;
};

export interface GetBranchLowestStockByIdRouteParams {
    id: ObjectId;
};

export interface GetBranchLowestStockByIdRouteQueries {
    page?: number;
    limit?: number;
};

export interface GetBranchLowestStockByIdRespDTO {
    success: boolean;
    data?: GetBranchLowestStockDTO[];
    pagination?: GenericPaginationDTO;
    message?: string;
};

export interface GetSingleStockInBranchRouteParams {
    branchId: ObjectId;
    stockId: ObjectId;
};

export interface GetSingleStockInBranchRespDTO {
    success: boolean;
    data?: GetSpecificBranchStockDTO | undefined;
    message?: string;
};

export interface GetBranchStocksByIdRouteParams {
    id: ObjectId;
};

export interface GetBranchLowestStockByIdRouteQueries {
    page?: number;
    limit?: number;
    stockName?: string;
    stockQuantity?: number;
};

export interface GetBranchStocksByIdRespDTO {
    success: boolean;
    data?: GetBranchStockDTO[];
    pagination?: GenericPaginationDTO;
    message?: string;
};

export interface GetLowestStockOverviewRespDTO {
    success: boolean;
    data?: GetGlobalLowestStocksDTO[];
};

