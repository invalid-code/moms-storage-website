import type { ObjectId } from "mongodb";

export interface MedicineDocument {
    _id?: ObjectId;
    name: string;
    count: number;
}

export interface BranchStock {
    stock_id?: ObjectId;
    stock_onhold_amount: number;
}

export interface BranchDocument {
    _id?: ObjectId;
    name: string;
    stocks: BranchStock[];
}

export interface DeliveryDocument {
    _id?: ObjectId;
    dateRequested: Date;
    dateReceived?: Date;
    delivered: boolean;
    branch: ObjectId;
    stocksRequested: ObjectId[];
}