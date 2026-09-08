import { Router } from 'express';
import { getSalesController, getSaleController, createSaleController, voidSaleController } from '../controllers/saleController.js';

const router = Router();

router.route('/')
  .get(getSalesController)
  .post(createSaleController);

router.route('/:id')
  .get(getSaleController);

router.route('/:id/void')
  .patch(voidSaleController);

export default router;
