import { Router } from 'express';
import { getDeliveries, getBranchDeliveries, getDelivery, createDelivery, updateDelivery } from '../controllers/deliveryController.js';

const router = Router();

router.route('/')
  .get(getDeliveries)
  .post(createDelivery);

router.route('/:id')
  .get(getDelivery)
  .patch(updateDelivery);

router.route('/branch/:id')
  .get(getBranchDeliveries);

export default router;