import express from 'express';
import {
  createInterview,
  getInterviews,
  getInterviewById,
} from '../controllers/interviewController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getInterviews)
  .post(createInterview);

router.route('/:id')
  .get(getInterviewById);

export default router;
