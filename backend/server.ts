import app from './src/app.js';
import { connectDB } from './src/config/db.js';

const PORT: number = Number(process.env.PORT) || 5000;

const startServer = async () => {
  try {
    await connectDB();
    
    app.listen(PORT, () => {
      console.log(`🚀 TypeScript API running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("❌ Failed to launch server environment:", error);
    process.exit(1);
  }
};

startServer();