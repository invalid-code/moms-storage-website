import type { ObjectId } from "mongodb";

export interface MedicineDocument {
    _id?: ObjectId;
    name: string;
    count: number;
    price: number;
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
    dateDelivered?: Date;
    delivered: boolean;
    branch: ObjectId;
    stocksRequested: ObjectId[];
}

export interface SaleItem {
    stock_id: ObjectId;
    quantity: number;
    unitPrice: number;
}

export interface SaleDocument {
    _id?: ObjectId;
    branch: ObjectId;
    items: SaleItem[];
    total: number;
    dateSold: Date;
    voided: boolean;
    dateVoided?: Date;
}