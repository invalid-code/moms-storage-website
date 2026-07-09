import { Router } from 'express';
import { 
  getBranches, 
  getLowestStockOverview, 
  getBranchStocksById, 
  getSingleStockInBranch, 
  getBranchLowestStockById 
} from '../controllers/branchController';

const router = Router();

router.get('/', getBranches);
router.get('/lowest-stock', getLowestStockOverview);
router.get('/:id', getBranchStocksById);
router.get('/:id/lowest-stock', getBranchLowestStockById);
router.get('/:branchId/stock/:stockId', getSingleStockInBranch);

export default router;