import express, { type Request, type Response, type Application } from 'express';
import cors from 'cors';
import { MongoClient, ServerApiVersion } from 'mongodb';

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
// interface Project {
//     id: number;
//     name: string;
//     status: 'Planning' | 'In Progress' | 'Completed';
// }

// // Strictly-typed in-memory store
// let projects: Project[] = [
//     { id: 1, name: "B2B Music App", status: "In Progress" },
//     { id: 2, name: "Library Admin Tool", status: "Completed" }
// ];

// Routes
app.get('/api', (req: Request, res: Response) => {
    res.json("hello");
});
// Typed GET handler
// app.get('/api/projects', (req: Request, res: Response) => {
//     res.json(projects);
// });

// Typed POST handler (enforcing structure on req.body)
// app.post('/api/projects', (req: Request<{}, {}, Omit<Project, 'id'>>, res: Response) => {
//     const { name, status } = req.body;

//     if (!name) {
//         return res.status(400).json({ error: "Project name is required" });
//     }

//     const newProject: Project = {
//         id: projects.length + 1,
//         name,
//         status: status || 'Planning'
//     };

//     projects.push(newProject);
//     res.status(201).json(newProject);
// });

// Start listening
app.listen(PORT, () => {
    console.log(`🚀 TypeScript API running at http://localhost:${PORT}`);
});