import { Router } from 'express';
import { getItems, getItem } from '../controllers/itemController';

const router = Router();

router.get('/', getItems);
router.get('/:id', getItem);

export default router;