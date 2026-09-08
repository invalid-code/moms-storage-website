export type ID = string;
export type ISODate = string;

export interface GenericPaginationDTO {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    limit: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
}