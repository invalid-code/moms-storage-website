import type { ObjectId } from "mongodb";
import type { MedicineDocument } from "./models.js";
import type { GenericPaginationDTO } from "./common.js";

export interface GetMedicineRouteParams {
    id: ObjectId;
}

export interface GetMedicinesQueryParams {
    page?: number;
    limit?: number;
    stockName?: string;
}

export interface GetMedicinesMetadataDTO {
    totalItems: number;
}

export interface GetMedicinesDTO {
    data: MedicineDocument[];
    metadata: GetMedicinesMetadataDTO[];
}

export interface GetMedicineRespDTO {
    success: boolean;
    data?: MedicineDocument | undefined | null;
    message?: string;
}

export interface GetMedicinesRespDTO {
    success: boolean;
    data: MedicineDocument[];
    pagination: GenericPaginationDTO;
}