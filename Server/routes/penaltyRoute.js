import express from 'express';
import { verifyAdmin } from '../middlewares/verifyAdmin.js';
import { addPenalty, addSuspension, getPenalties, removeSuspension } from '../controller/penalty.js';

const router = express.Router();

router.get('/penalties/:idPlayer', verifyAdmin, getPenalties)
router.post('/add-penalty/:idPlayer', verifyAdmin, addPenalty); 
router.put('/suspend-player/:idPlayer', verifyAdmin, addSuspension);
router.put('/unsuspend-player/:idPlayer', verifyAdmin, removeSuspension);

export default router