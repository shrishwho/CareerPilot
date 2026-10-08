import express from 'express';
import {
  generateQuestionsHandler,
  evaluateAnswerHandler,
  generateFinalReportHandler,
  generateColdEmailHandler,
} from '../controllers/aiController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.post('/questions', generateQuestionsHandler);
router.post('/evaluate', evaluateAnswerHandler);
router.post('/final-report', generateFinalReportHandler);
router.post('/cold-email', generateColdEmailHandler);

export default router;
