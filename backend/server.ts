import app from './src/app.js';
import { connectDB } from './src/config/db.js';
import { logger } from './src/utils/logger.js';

const PORT: number = Number(process.env.PORT) || 5000;

const startServer = async () => {
  try {
    await connectDB();
    
    app.listen(PORT, () => {
      logger.info(`TypeScript API running at http://localhost:${PORT}`);
    });
  } catch (error) {
    logger.error("Failed to launch server environment", { error: error instanceof Error ? error.message : String(error) });
    process.exit(1);
  }
};

startServer();