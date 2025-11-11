import express from 'express';
import { createPlayer, deactivePlayer, reactivatePlayer } from '../controller/ranking.js';
import { validatePlayer } from '../middlewares/playerValidator.js';
import { verifyAdmin } from '../middlewares/verifyAdmin.js';

const router = express.Router();

router.post('/new-player', verifyAdmin, validatePlayer, createPlayer)
router.put('/deactivate-player', verifyAdmin, deactivePlayer)
router.put('/reactivate-player', verifyAdmin, reactivatePlayer)
//router.get('/first-round', verifyAdmin, generateFirstRound)

export default router;