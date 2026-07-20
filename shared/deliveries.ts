import type { ObjectId } from "mongodb";
import type { MedicineDocument, BranchDocument, DeliveryDocument } from "./models.js";
import type { GenericPaginationDTO } from "./common.js";

export interface GetDeliveryRouteParams { id: ObjectId; }
export interface GetDeliveriesRouteQueries { page?: number; limit?: number; branchId?: ObjectId }
export interface UpdateDeliverySelectivelyRouteParams { id: ObjectId; }

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

export interface GetDeliveriesMetadataDTO {
    totalItems: number;
}

export interface GetDeliveriesDataDTO {
    _id: ObjectId;
    dateRequested: Date;
    dateDelivered: Date;
    delivered: boolean;
    stocksRequested: ObjectId[];
    branch: ObjectId;
    branchDetails: BranchDocument;
}

export interface GetDeliveriesDTO {
    data: GetDeliveriesDataDTO[];
    metadata: GetDeliveriesMetadataDTO[];
}

export interface CreateDeliveryRespDTO { success: boolean; message: string; }
export interface GetDeliveryRespDTO { success: boolean; data?: GetDeliveryDTO | null | undefined; message?: string; }
export interface GetDeliveriesRespDTO { success: boolean; data: GetDeliveriesDTO[]; pagination: GenericPaginationDTO; }
export interface UpdateDeliveryRespDTO { success: boolean; data?: DeliveryDocument | null; message?: string; }