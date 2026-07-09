import express, { type Application } from 'express';
import cors from 'cors';
import itemRoutes from './routes/itemRoutes';
import branchRoutes from './routes/branchRoutes';
import deliveryRoutes from './routes/deliveryRoutes';
import { errorHandler } from './middlewares/errorHandler';

const app: Application = express();

app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Main App API Routes Mount
app.use('/api/item', itemRoutes);
app.use('/api/branch', branchRoutes);
app.use('/api/delivery', deliveryRoutes);

// Catch-all Global Error Handler
app.use(errorHandler);

export default app;