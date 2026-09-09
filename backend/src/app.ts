import express, { type Application } from 'express';
import cors from 'cors';
import itemRoutes from './routes/medicineRoutes.js';
import branchRoutes from './routes/branchRoutes.js';
import deliveryRoutes from './routes/deliveryRoutes.js';
import saleRoutes from './routes/saleRoutes.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { requestLogger } from './middlewares/requestLogger.js';

const app: Application = express();

app.use(cors({
  origin: process.env.FRONTEND_ORIGIN || 'http://localhost:5173',
  methods: ['GET', 'POST', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(requestLogger);

// Liveness probe for container orchestration (no DB access).
app.get('/api/health', (_req, res) => {
  res.status(200).json({ success: true });
});

// Main App API Routes Mount
app.use('/api/item', itemRoutes);
app.use('/api/branch', branchRoutes);
app.use('/api/delivery', deliveryRoutes);
app.use('/api/sale', saleRoutes);

// Catch-all Global Error Handler
app.use(errorHandler);

export default app;