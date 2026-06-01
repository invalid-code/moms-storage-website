import express, { type Request, type Response, type Application } from 'express';
import cors from 'cors';
import { MongoClient, ObjectId, ServerApiVersion } from 'mongodb';

const app: Application = express();
const PORT: number = Number(process.env.PORT) || 5000;

const uri = process.env.MONGO_DB_CONN_STR;
if (uri === undefined) {
    throw new Error("Mongo db connection string not set");
}
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    },
});

// Middleware
app.use(cors({
    origin: 'http://localhost:5173', // Your Vue app URL
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Define a strict Interface for our data structure
interface Item {
    name: string;
    count: number;
}

try {
    await client.connect()
} catch (error) {
    throw new Error(`Couldn't connect to mongodb database: ${error}`,);
}

const medicineDb = client.db("medicine");
const medicineCollection = medicineDb.collection<Item>("medicine");

// Routes
app.get('/api/item', async (req: Request, res: Response) => {
    const allMedicineRecords = await medicineCollection.find({}).toArray();
    res.json(allMedicineRecords);
});

app.get('/', async (req: Request, res: Response) => {
    res.json("hello");
});

app.post('/api/item', async (req: Request<{}, {}, Item>, res: Response) => {
    const newItem = req.body;
    const insertedItemRes = await medicineCollection.insertOne(newItem);
    res.json(insertedItemRes);
});

app.put('/api/item/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        if (!id || typeof id !== 'string') {
            return res.status(400).json({ error: "Invalid or missing ID parameter" });
        }
        const { name, count }: Item = req.body;

        // 1. Simple validation guard clause
        if (!name || typeof count !== 'number') {
            return res.status(400).json({ error: "Missing or invalid fields. 'name' and 'count' are required." });
        }

        // 2. Update the document in MongoDB
        // { new: true } returns the modified document rather than the original
        // { runValidators: true } ensures the updates match your schema rules
        const updatedItem = await medicineCollection.findOneAndUpdate(
            { _id: new ObjectId(id) },       // 1. Filter criteria
            { $set: { name, count } },       // 2. The update using the $set operator
            { returnDocument: 'after' }      // 3. This is the native equivalent of { new: true }
        );

        // 3. Handle case where the ID wasn't found
        if (!updatedItem) {
            return res.status(404).json({ error: "Item not found" });
        }

        // 4. Success response
        return res.json(updatedItem);

    } catch (error) {
        console.error("Error updating item:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

// Start listening
app.listen(PORT, () => {
    console.log(`🚀 TypeScript API running at http://localhost:${PORT}`);
});