import type { ObjectId } from "mongodb";
import type { MedicineDocument, BranchDocument, DeliveryDocument } from "./models.js";
import type { GenericPaginationDTO } from "./common.js";

export interface GetDeliveryRouteParams { id: ObjectId; }
export interface GetDeliveriesRouteQueries { page?: number; limit?: number; }
export interface UpdateDeliverySelectivelyRouteParams { id: ObjectId; }
export interface GetBranchDeliveriesRouteParams { id: ObjectId; }
export interface GetBranchDeliveriesRouteQueries { page?: number; limit?: number; }

export interface CreateDeliveryDTO {
    branchId: ObjectId;
    stocksRequested: ObjectId[];
}

export interface StocksReceivedDTO {
    stockId: ObjectId;
    amount: number;
}

export interface UpdateDeliverySelectivelyDTO {
    delivered: boolean;
    dateDelivered: Date;
    stocksReceived: StocksReceivedDTO[];
}

export interface GetDeliveryDTO {
    _id: ObjectId;
    dateRequested: Date;
    dateDelivered?: Date;
    delivered: boolean;
    branch: ObjectId;
    stocksRequested: MedicineDocument[];
}

export interface GetDeliveriesDTO {
    _id: ObjectId;
    name: string;
    stocks: BranchDocument[];
}

export interface CreateDeliveryRespDTO { success: boolean; message: string; }
export interface GetDeliveryRespDTO { success: boolean; data?: GetDeliveryDTO | null | undefined; message?: string; }
export interface GetDeliveriesRespDTO { success: boolean; data: GetDeliveriesDTO[]; pagination: GenericPaginationDTO; }
export interface UpdateDeliveryRespDTO { success: boolean; data?: DeliveryDocument | null; message?: string; }
export interface GetBranchDeliveriesRespDTO { success: boolean; data?: DeliveryDocument[]; message?: string; pagination?: GenericPaginationDTO; }