import type { BranchDTO } from "./models.dto.js";
import type { GenericPaginationDTO, ID, ISODate } from "./common.js";

export interface GetSaleRouteParams { id: ID; }
export interface GetSalesRouteQueries { page?: number; limit?: number; branchId?: ID }
export interface VoidSaleRouteParams { id: ID; }

export interface CreateSaleItemDTO {
    stockId: ID;
    quantity: number;
}

export interface CreateSaleDTO {
    branchId: ID;
    items: CreateSaleItemDTO[];
}

export interface SaleItemDTO {
    stock_id: ID;
    quantity: number;
    unitPrice: number;
    stock_name?: string;
}

export interface SaleDTO {
    _id?: ID;
    branch: ID;
    items: SaleItemDTO[];
    total: number;
    dateSold: ISODate;
    voided: boolean;
    dateVoided?: ISODate;
}

export interface GetSaleDTO {
    _id: ID;
    branch: ID;
    branchDetails?: BranchDTO;
    items: SaleItemDTO[];
    total: number;
    dateSold: ISODate;
    voided: boolean;
    dateVoided?: ISODate;
}

export interface GetSalesMetadataDTO {
    totalItems: number;
}

export interface GetSalesDTO {
    data: GetSaleDTO[];
    metadata: GetSalesMetadataDTO[];
}

export interface CreateSaleRespDTO { success: boolean; data?: SaleDTO | null; message?: string; }
export interface GetSaleRespDTO { success: boolean; data?: GetSaleDTO | null | undefined; message?: string; }
export interface GetSalesRespDTO { success: boolean; data: GetSaleDTO[]; pagination: GenericPaginationDTO; }
export interface VoidSaleRespDTO { success: boolean; data?: SaleDTO | null; message?: string; }
