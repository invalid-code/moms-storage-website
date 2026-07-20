import { Router } from 'express';
import { getMedicinesController, getMedicineController } from '../controllers/medicineController.js';

const router = Router();

router.get('/', getMedicinesController);
router.get('/:id', getMedicineController);

export default router;