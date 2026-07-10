import { Router } from 'express';
import { getMedicines, getMedicine } from '../controllers/medicineController.js';

const router = Router();

router.get('/', getMedicines);
router.get('/:id', getMedicine);

export default router;