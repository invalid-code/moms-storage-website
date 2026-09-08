import type { ID, ISODate } from "./common.js";

export interface MedicineDTO {
    _id?: ID;
    name: string;
    count: number;
    price: number;
}

export interface BranchStock {
    stock_id?: ID;
    stock_onhold_amount: number;
}

export interface BranchDTO {
    _id?: ID;
    name: string;
    stocks: BranchStock[];
}

export interface DeliveryDTO {
    _id?: ID;
    dateRequested: ISODate;
    dateDelivered?: ISODate;
    delivered: boolean;
    branch: ID;
    stocksRequested: ID[];
}