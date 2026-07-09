import { Router } from 'express';
import { getDeliveries, getDelivery, createDelivery, updateDelivery } from '../controllers/deliveryController.js';

const router = Router();

router.route('/')
  .get(getDeliveries)
  .post(createDelivery);

router.route('/:id')
  .get(getDelivery)
  .patch(updateDelivery);

export default router;