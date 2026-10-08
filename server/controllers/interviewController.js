import { Interview } from '../models/Interview.js';

// @desc    Save a completed interview
// @route   POST /api/interviews
// @access  Private
export const createInterview = async (req, res) => {
  try {
    const {
      role,
      interviewType,
      jobDescription,
      questions,
      answers,
      scores,
      finalReport,
    } = req.body;

    if (!role || !questions || !answers) {
      return res.status(400).json({
        success: false,
        message: 'Role, questions, and answers are required',
      });
    }

    const interview = await Interview.create({
      userId: req.user._id,
      role,
      interviewType: interviewType || 'Mixed',
      jobDescription: jobDescription || '',
      questions: questions || [],
      answers: answers || [],
      scores: scores || {
        overall: finalReport?.overallScore || 0,
        technical: finalReport?.technicalScore || 0,
        communication: finalReport?.communicationScore || 0,
        confidence: finalReport?.confidenceScore || 0,
      },
      finalReport: finalReport || {},
    });

    res.status(201).json({
      success: true,
      interview,
    });
  } catch (error) {
    console.error('[Create Interview Error]:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all interviews for logged in user
// @route   GET /api/interviews
// @access  Private
export const getInterviews = async (req, res) => {
  try {
    const interviews = await Interview.find({ userId: req.user._id })
      .select('-questions -answers') // light preview
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: interviews.length,
      interviews,
    });
  } catch (error) {
    console.error('[Get Interviews Error]:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single interview details
// @route   GET /api/interviews/:id
// @access  Private
export const getInterviewById = async (req, res) => {
  try {
    const interview = await Interview.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!interview) {
      return res.status(404).json({ success: false, message: 'Interview not found' });
    }

    res.json({
      success: true,
      interview,
    });
  } catch (error) {
    console.error('[Get Interview By Id Error]:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
