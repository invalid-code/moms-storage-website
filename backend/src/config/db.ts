import { MongoClient, ServerApiVersion } from 'mongodb';
import type { BranchDocument, DeliveryDocument, MedicineDocument, SaleDocument } from '../types/models.js';
import { logger } from '../utils/logger.js';

const uri = process.env.MONGO_DB_CONN_STR;
if (!uri) {
  throw new Error("Mongo db connection string not set");
}

export const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

export const connectDB = async () => {
  try {
    await client.connect();
    logger.info("Connected to MongoDB successfully");
  } catch (error) {
    throw new Error(`Couldn't connect to mongodb database: ${error}`);
  }
};

const medicineDb = client.db("medicine");
export const medicineCollection = medicineDb.collection<MedicineDocument>("medicine");
export const branchCollection = medicineDb.collection<BranchDocument>("branches");
export const deliveryCollection = medicineDb.collection<DeliveryDocument>("deliveries");
export const saleCollection = medicineDb.collection<SaleDocument>("sales");