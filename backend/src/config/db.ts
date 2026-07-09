import { MongoClient, ServerApiVersion } from 'mongodb';

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
    console.log("🍃 Connected to MongoDB successfully");
  } catch (error) {
    throw new Error(`Couldn't connect to mongodb database: ${error}`);
  }
};

const medicineDb = client.db("medicine");
export const medicineCollection = medicineDb.collection("medicine");
export const branchCollection = medicineDb.collection("branches");
export const deliveryCollection = medicineDb.collection("deliveries");