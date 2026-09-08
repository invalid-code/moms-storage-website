import type { MedicineDTO, BranchDTO, DeliveryDTO } from "./models.dto.js";
import type { GenericPaginationDTO, ID, ISODate } from "./common.js";

export interface GetDeliveryRouteParams { id: ID; }
export interface GetDeliveriesRouteQueries { page?: number; limit?: number; branchId?: ID }
export interface UpdateDeliverySelectivelyRouteParams { id: ID; }

export interface CreateDeliveryDTO {
    branchId: ID;
    stocksRequested: ID[];
}

export interface StocksReceivedDTO {
    stockId: ID;
    amount: number;
}

export interface UpdateDeliverySelectivelyDTO {
    delivered: boolean;
    dateDelivered: ISODate;
    stocksReceived: StocksReceivedDTO[];
}

export interface GetDeliveryDTO {
    _id: ID;
    dateRequested: ISODate;
    dateDelivered?: ISODate;
    delivered: boolean;
    branch: ID;
    stocksRequested: MedicineDTO[];
}

export interface GetDeliveriesMetadataDTO {
    totalItems: number;
}

export interface GetDeliveriesDataDTO {
    _id: ID;
    dateRequested: ISODate;
    dateDelivered: ISODate;
    delivered: boolean;
    stocksRequested: ID[];
    branch: ID;
    branchDetails: BranchDTO;
}

export interface GetDeliveriesDTO {
    data: GetDeliveriesDataDTO[];
    metadata: GetDeliveriesMetadataDTO[];
}

export interface CreateDeliveryRespDTO { success: boolean; message: string; }
export interface GetDeliveryRespDTO { success: boolean; data?: GetDeliveryDTO | null | undefined; message?: string; }
export interface GetDeliveriesRespDTO { success: boolean; data: GetDeliveriesDataDTO[]; pagination: GenericPaginationDTO; }
export interface UpdateDeliveryRespDTO { success: boolean; data?: DeliveryDTO | null; message?: string; }