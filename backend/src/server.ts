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
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

interface Item {
  name: string;
  count: number;
}

interface Branch {
  name: string;
}

interface Delivery {
  dateRequested: Date;
  dateDelivered: Date;
  delivered: boolean;
  requestedStocks: string[];
  branch: string
}

try {
  await client.connect()
} catch (error) {
  throw new Error(`Couldn't connect to mongodb database: ${error}`,);
}

const medicineDb = client.db("medicine");
const medicineCollection = medicineDb.collection<Item>("medicine");
const branchCollection = medicineDb.collection<Branch>("branches");
const deliveryCollection = medicineDb.collection<Delivery>("deliveries");


// Routes
app.get('/api/item', async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const stockName = req.query.stockName as string;

    const matchStage: any = {};

    if (stockName) {
      matchStage.name = { $regex: stockName, $options: 'i' };
    }

    const aggregationResult = await medicineCollection.aggregate([
      { $match: matchStage },
      {
        $facet: {
          metadata: [{ $count: 'totalItems' }],
          data: [
            { $skip: skip },
            { $limit: limit }
          ]
        }
      }
    ]).toArray();

    const data = aggregationResult[0]?.data || [];
    const totalItems = aggregationResult[0]?.metadata[0]?.totalItems || 0;

    const totalPages = Math.ceil(totalItems / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    res.status(200).json({
      success: true,
      data,
      pagination: {
        totalItems,
        totalPages,
        currentPage: page,
        limit,
        hasNextPage,
        hasPrevPage
      }
    });

  } catch (err) {
    if (err instanceof Error) {
      res.status(500).json({ success: false, message: err.message });
    } else {
      res.status(500).json({ success: false, message: `An unexpected error occurred: ${err}` });
    }
  }
});

app.get('/api/item/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid ID format',
      });
    }

    const data = await medicineCollection.findOne({ _id: new ObjectId(id) });

    res.status(200).json({
      success: true,
      data,
    });

  } catch (err) {
    if (err instanceof Error) {
      res.status(500).json({ success: false, message: err.message });
    } else {
      res.status(500).json({ success: false, message: `An unexpected error occurred: ${err}` });
    }
  }
});


app.put('/api/item/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: "Invalid or missing ID parameter" });
    }
    const { name, count }: Item = req.body;

    if (!name || typeof count !== 'number') {
      return res.status(400).json({ error: "Missing or invalid fields. 'name' and 'count' are required." });
    }

    const updatedItem = await medicineCollection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: { name, count } },
      { returnDocument: 'after' }
    );

    if (!updatedItem) {
      return res.status(404).json({ error: "Item not found" });
    }

    return res.json(updatedItem);

  } catch (error) {
    console.error("Error updating item:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

app.get('/api/branch', async (req: Request, res: Response) => {
  const allBranchRecords = await branchCollection.find({}).toArray();
  res.json(allBranchRecords);
});

app.get('/api/branch/lowest-stock', async (req: Request, res: Response) => {
  try {
    const data = await branchCollection.aggregate([
      { $unwind: "$stocks" },
      {
        $lookup: {
          from: "medicine",
          localField: "stocks.stock_id",
          foreignField: "_id",
          as: "medicine_info"
        }
      },
      { $unwind: "$medicine_info" },
      {
        $project: {
          _id: 0,
          stock_name: "$medicine_info.name",
          branch: "$name",
          stock_onhold_amount: "$stocks.stock_onhold_amount",
          percentage: {
            $cond: {
              if: { $eq: ["$medicine_info.count", 0] },
              then: 0,
              else: {
                $multiply: [
                  { $divide: ["$stocks.stock_onhold_amount", "$medicine_info.count"] },
                  100
                ]
              }
            }
          }
        }
      },
      {
        $match: {
          percentage: { $lt: 30 }
        }
      },
      {
        $sort: {
          stock_name: 1,
          stock_onhold_amount: 1
        }
      },
      {
        $group: {
          _id: "$stock_name",
          lowestBranch: { $first: "$branch" },
          lowestPercentage: { $first: "$percentage" }
        }
      },
      {
        $sort: {
          lowestPercentage: 1
        }
      },
      {
        $limit: 3
      },
      {
        $project: {
          _id: 0,
          "stock-name": "$_id",
          "branch": "$lowestBranch",
          "stock-percentage": {
            $concat: [{ $toString: { $round: ["$lowestPercentage", 2] } }, "%"]
          }
        }
      }
    ]).toArray();

    res.status(200).json({
      success: true,
      data,
    });
  } catch (err) {
    if (err instanceof Error) {
      res.status(500).json({ success: false, message: err.message });
    } else {
      res.status(500).json({ success: false, message: `An unexpected error occurred: ${err}` });
    }
  }
});

app.get('/api/branch/:id', async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const { id } = req.params;

    const stockName = req.query.stockName as string;
    const stockQuantity = req.query.stockQuantity ? parseFloat(req.query.stockQuantity as string) : undefined;

    const skip = (page - 1) * limit;

    const filterMatch: any = {};
    if (stockName) {
      filterMatch["stock_name"] = { $regex: stockName, $options: 'i' };
    }

    const percentageMatch: any[] = [];
    if (stockQuantity !== undefined) {
      percentageMatch.push({
        $match: {
          percentage: { $lte: stockQuantity }
        }
      });
    }

    const pipeline: any[] = [
      {
        $match: {
          _id: new ObjectId(id as string)
        }
      },
      { $unwind: "$stocks" },
      {
        $lookup: {
          from: "medicine",
          localField: "stocks.stock_id",
          foreignField: "_id",
          as: "medicine_info"
        }
      },
      { $unwind: "$medicine_info" },
      {
        $project: {
          _id: 0,
          stock_name: "$medicine_info.name",
          stock_onhold_amount: "$stocks.stock_onhold_amount",
          percentage: {
            $cond: {
              if: { $gt: ["$medicine_info.count", 0] },
              then: {
                $multiply: [
                  { $divide: ["$stocks.stock_onhold_amount", "$medicine_info.count"] },
                  100
                ]
              },
              else: 0
            }
          }
        }
      },
      ...(Object.keys(filterMatch).length > 0 ? [{ $match: filterMatch }] : []),
      ...percentageMatch,
      {
        $facet: {
          metadata: [{ $count: "total" }],
          data: [
            { $skip: skip },
            { $limit: limit },
            {
              $project: {
                _id: 0,
                "stock-name": "$stock_name",
                stock_onhold_amount: "$stock_onhold_amount",
                percentage: { $round: ["$percentage", 2] }
              }
            }
          ]
        }
      }
    ];

    const aggregationResult = await branchCollection.aggregate(pipeline).toArray();
    const facetResult = aggregationResult[0];
    const data = facetResult?.data || [];
    const totalItems = facetResult?.metadata[0]?.total || 0;

    const totalPages = Math.ceil(totalItems / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    res.status(200).json({
      success: true,
      data,
      pagination: {
        totalItems,
        totalPages,
        currentPage: page,
        limit,
        hasNextPage,
        hasPrevPage
      }
    });
  } catch (err) {
    if (err instanceof Error) {
      res.status(500).json({ success: false, message: err.message });
    } else {
      res.status(500).json({ success: false, message: `An unexpected error occurred: ${err}` });
    }
  }
});

app.get('/api/branch/:branchId/stock/:stockId', async (req: Request, res: Response) => {
  try {
    const { branchId, stockId } = req.params;

    const pipeline: any[] = [
      {
        $match: {
          _id: new ObjectId(branchId as string)
        }
      },
      { $unwind: "$stocks" },
      {
        $match: {
          "stocks.stock_id": new ObjectId(stockId as string)
        }
      },
      {
        $lookup: {
          from: "medicine",
          localField: "stocks.stock_id",
          foreignField: "_id",
          as: "medicine_info"
        }
      },
      { $unwind: "$medicine_info" },
      {
        $project: {
          _id: 0,
          stock_name: "$medicine_info.name",
          stock_id: "$stocks.stock_id",
          stock_onhold_amount: "$stocks.stock_onhold_amount"
        }
      }
    ];

    const result = await branchCollection.aggregate(pipeline).toArray();

    if (!result || result.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Branch or specific stock not found."
      });
    }

    const data = result[0];

    res.status(200).json({
      success: true,
      data,
    });
  } catch (err) {
    if (err instanceof Error) {
      res.status(500).json({ success: false, message: err.message });
    } else {
      res.status(500).json({ success: false, message: `An unexpected error occurred: ${err}` });
    }
  }
});

app.get('/api/branch/:id/lowest-stock', async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const { id } = req.params;

    const skip = (page - 1) * limit;

    const pipeline = [
      {
        $match: {
          _id: new ObjectId(id as string)
        }
      },
      { $unwind: "$stocks" },
      {
        $lookup: {
          from: "medicine",
          localField: "stocks.stock_id",
          foreignField: "_id",
          as: "medicine_info"
        }
      },
      { $unwind: "$medicine_info" },
      {
        $project: {
          _id: 0,
          stock_name: "$medicine_info.name",
          stock_onhold_amount: "$stocks.stock_onhold_amount",
          percentage: {
            $cond: {
              if: { $eq: ["$medicine_info.count", 0] },
              then: 0,
              else: {
                $multiply: [
                  { $divide: ["$stocks.stock_onhold_amount", "$medicine_info.count"] },
                  100
                ]
              }
            }
          }
        }
      },
      {
        $match: {
          percentage: { $lt: 30 }
        }
      },
      {
        $sort: {
          percentage: 1
        }
      },
      {
        $facet: {
          metadata: [{ $count: "total" }],
          data: [
            { $skip: skip },
            { $limit: limit },
            {
              $project: {
                _id: 0,
                "stock-name": "$stock_name",
                stock_onhold_amount: "$stock_onhold_amount",
              }
            }
          ]
        }
      }
    ];

    const aggregationResult = await branchCollection.aggregate(pipeline).toArray();
    const facetResult = aggregationResult[0];
    const data = facetResult?.data || [];
    const totalItems = facetResult?.metadata[0]?.total || 0;

    const totalPages = Math.ceil(totalItems / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    res.status(200).json({
      success: true,
      data,
      pagination: {
        totalItems,
        totalPages,
        currentPage: page,
        limit,
        hasNextPage,
        hasPrevPage
      }
    });
  } catch (err) {
    if (err instanceof Error) {
      res.status(500).json({ success: false, message: err.message });
    } else {
      res.status(500).json({ success: false, message: `An unexpected error occurred: ${err}` });
    }
  }
});

app.get('/api/delivery', async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const pipeline = [
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit },
      {
        $lookup: {
          from: "branches",
          localField: "branch",
          foreignField: "_id",
          as: "branchDetails"
        }
      },
      {
        $unwind: {
          path: "$branchDetails",
          preserveNullAndEmptyArrays: true
        }
      }
    ];

    const [data, totalItems] = await Promise.all([
      deliveryCollection.aggregate(pipeline).toArray(),
      deliveryCollection.countDocuments()
    ]);

    const totalPages = Math.ceil(totalItems / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    res.status(200).json({
      success: true,
      data,
      pagination: {
        totalItems,
        totalPages,
        currentPage: page,
        limit,
        hasNextPage,
        hasPrevPage
      }
    });
  } catch (err) {
    if (err instanceof Error) {
      res.status(500).json({ success: false, message: err.message });
    } else {
      res.status(500).json({ success: false, message: `An unexpected error occurred: ${err}` });
    }
  }
});

app.get('/api/delivery/:branchId', async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const { branchId } = req.params;

    const skip = (page - 1) * limit;

    const branchObjectId = new ObjectId(branchId);

    const filter = { branch: branchObjectId };

    const pipeline = [
      { $match: filter },
      { $skip: skip },
      { $limit: limit },
      {
        $lookup: {
          from: "branches",
          localField: "branch",
          foreignField: "_id",
          as: "branchDetails"
        }
      },
      {
        $unwind: {
          path: "$branchDetails",
          preserveNullAndEmptyArrays: true
        }
      }
    ];

    const [data, totalItems] = await Promise.all([
      deliveryCollection.aggregate(pipeline).toArray(),
      deliveryCollection.countDocuments(filter)
    ]);

    const totalPages = Math.ceil(totalItems / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    res.status(200).json({
      success: true,
      data,
      pagination: {
        totalItems,
        totalPages,
        currentPage: page,
        limit,
        hasNextPage,
        hasPrevPage
      }
    });
  } catch (err) {
    if (err instanceof Error) {
      res.status(500).json({ success: false, message: err.message });
    } else {
      res.status(500).json({ success: false, message: `An unexpected error occurred: ${err}` });
    }
  }
});

app.post('/api/delivery', async (req: Request, res: Response) => {
  const { branchId, stocksRequested } = req.body;

  const newDelivery = {
    dateRequested: new Date(),
    delivered: false,
    stocksRequested: stocksRequested.map((stockRequested) => new ObjectId(stockRequested)),
    branch: new ObjectId(branchId)
  };
  let status = await deliveryCollection.insertOne(newDelivery);
  if (!status.acknowledged) {
    res.status(500).json({
      message: "Delivery couldn't be ordered"
    });
  }
  res.status(201).json({
    message: "New delivery was ordered",
  });
});

app.listen(PORT, () => {
  console.log(`🚀 TypeScript API running at http://localhost:${PORT}`);
});