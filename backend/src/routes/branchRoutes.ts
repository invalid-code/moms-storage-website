import { Router } from 'express';
import { 
  getBranchesController,
  getBranchStocksController,
  getBranchLowestStocksController,
  getBranchStockController,
  getBranchesLowestStocksController,
} from '../controllers/branchController.js';

const router = Router();

router.get('/', getBranchesController);
router.get('/lowest-stock', getBranchesLowestStocksController);
router.get('/:id', getBranchStocksController);
router.get('/:id/lowest-stock', getBranchLowestStocksController);
router.get('/:branchId/stock/:stockId', getBranchStockController);

export default router;