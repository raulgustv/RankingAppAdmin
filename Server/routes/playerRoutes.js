import express from 'express';
import { createPlayer } from '../controller/ranking.js';
import { validatePlayer } from '../middlewares/playerValidator.js';
import { verifyAdmin } from '../middlewares/verifyAdmin.js';

const router = express.Router();

router.post('/new-player', verifyAdmin, validatePlayer, createPlayer)
//router.get('/first-round', verifyAdmin, generateFirstRound)

export default router;