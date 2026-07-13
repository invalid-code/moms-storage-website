import { Router } from 'express';
import { getDeliveriesController, getDeliveryController, createDeliveryController, updateDeliveryController } from '../controllers/deliveryController.js';

const router = Router();

router.route('/')
  .get(getDeliveriesController)
  .post(createDeliveryController);

router.route('/:id')
  .get(getDeliveryController)
  .patch(updateDeliveryController);

export default router;