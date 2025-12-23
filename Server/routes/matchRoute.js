import express from 'express';
import { allMatches, currentMatches, generateFirstRound, generateNextRound, recordMatchResult, updateRoundEndDate } from '../controller/match.js';
import { verifyAdmin } from '../middlewares/verifyAdmin.js';

const router = express.Router();

router.post('/first-round', verifyAdmin, generateFirstRound);
router.post('/result', verifyAdmin, recordMatchResult);
router.post('/next-round', verifyAdmin, generateNextRound);
router.get('/view-matches', allMatches)
router.get('/current-matches', currentMatches)
router.put('/update-round/:id', verifyAdmin, updateRoundEndDate)



export default router;