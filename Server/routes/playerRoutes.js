import express from 'express';
import { createPlayer, loginPlayer, playerProfile, updatePassword } from '../controller/ranking.js';
import { validatePlayer } from '../middlewares/playerValidator.js';
import { verifyAdmin, verifyPlayer } from '../middlewares/verifyAdmin.js';

const router = express.Router();

router.post('/new-player', verifyAdmin, validatePlayer, createPlayer)
router.post('/login-player', loginPlayer)
router.get('/view-profile', verifyPlayer, playerProfile )
router.post('/update-password', verifyPlayer, updatePassword )


export default router;