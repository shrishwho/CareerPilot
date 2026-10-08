import {
  generateInterviewQuestions,
  evaluateAnswer,
  generateFinalReport,
  generateColdEmail,
} from '../services/geminiService.js';
import { User } from '../models/User.js';
import { JobApplication } from '../models/JobApplication.js';

// @desc    Generate interview questions
// @route   POST /api/ai/questions
// @access  Private
export const generateQuestionsHandler = async (req, res) => {
  try {
    const { role, interviewType, numQuestions, jobDescription } = req.body;

    const questions = await generateInterviewQuestions({
      role,
      interviewType,
      numQuestions: Number(numQuestions) || 5,
      jobDescription,
    });

    res.json({
      success: true,
      questions,
    });
  } catch (error) {
    console.error('[AI Questions Error]:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Evaluate a single answer
// @route   POST /api/ai/evaluate
// @access  Private
export const evaluateAnswerHandler = async (req, res) => {
  try {
    const { question, answer, role, interviewType, jobDescription } = req.body;

    if (!question) {
      return res.status(400).json({ success: false, message: 'Question is required' });
    }

    const evaluation = await evaluateAnswer({
      question,
      answer: answer || '',
      role,
      interviewType,
      jobDescription,
    });

    res.json({
      success: true,
      evaluation,
    });
  } catch (error) {
    console.error('[AI Evaluate Error]:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Generate final interview report
// @route   POST /api/ai/final-report
// @access  Private
export const generateFinalReportHandler = async (req, res) => {
  try {
    const { role, interviewType, jobDescription, questionsAndAnswers } = req.body;

    const report = await generateFinalReport({
      role,
      interviewType,
      jobDescription,
      questionsAndAnswers: questionsAndAnswers || [],
    });

    res.json({
      success: true,
      report,
    });
  } catch (error) {
    console.error('[AI Final Report Error]:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Generate personalized cold email
// @route   POST /api/ai/cold-email
// @access  Private
export const generateColdEmailHandler = async (req, res) => {
  try {
    const { applicationId, applicationData, customProfile } = req.body;

    let userProfile = customProfile;
    if (!userProfile) {
      userProfile = await User.findById(req.user._id).select('-password');
    }

    let application = applicationData;
    if (!application && applicationId) {
      application = await JobApplication.findOne({
        _id: applicationId,
        userId: req.user._id,
      });
    }

    const email = await generateColdEmail({
      userProfile: userProfile || {},
      application: application || {},
    });

    res.json({
      success: true,
      email,
    });
  } catch (error) {
    console.error('[AI Cold Email Error]:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
