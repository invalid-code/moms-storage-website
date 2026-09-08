import type { MedicineDTO } from "./models.dto.js";
import type { GenericPaginationDTO, ID } from "./common.js";

export interface GetMedicineRouteParams {
    id: ID;
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
    data: MedicineDTO[];
    metadata: GetMedicinesMetadataDTO[];
}

export interface GetMedicineRespDTO {
    success: boolean;
    data?: MedicineDTO | undefined | null;
    message?: string;
}

export interface GetMedicinesRespDTO {
    success: boolean;
    data: MedicineDTO[];
    pagination: GenericPaginationDTO;
}