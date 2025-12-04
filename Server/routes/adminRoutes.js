import express from 'express';
import { adminRegister, adminLogin, deactivePlayer, reactivatePlayer, allPlayers, allRounds, activePlayers } from '../controller/admin.js';
import { verifyAdmin } from '../middlewares/verifyAdmin.js';
import { validateLogin } from '../middlewares/playerValidator.js';

const router = express.Router();

router.get('/view-players', verifyAdmin, allPlayers) 
router.get('/ranking-players', verifyAdmin, activePlayers) 
router.get('/view-rounds', verifyAdmin, allRounds) 
router.get('/status-rounds', allRounds) 
router.post('/admin-register', adminRegister);
router.post('/admin-login', validateLogin, adminLogin);
router.put('/deactivate-player/:idPlayer', verifyAdmin, deactivePlayer)
router.put('/reactivate-player/:idPlayer', verifyAdmin, reactivatePlayer) 

export default router;