import mongoose from 'mongoose';
import { isMemoryDb } from '../config/db.js';

const questionAnswerSchema = new mongoose.Schema({
  questionId: { type: Number, required: true },
  question: { type: String, required: true },
  answer: { type: String, default: '' },
  score: { type: Number, default: 0 },
  relevance: { type: String, default: '' },
  technicalCorrectness: { type: String, default: '' },
  communication: { type: String, default: '' },
  completeness: { type: String, default: '' },
  feedback: { type: String, default: '' },
  improvementSuggestion: { type: String, default: '' },
});

const interviewSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    role: { type: String, required: true },
    interviewType: {
      type: String,
      enum: ['HR / Behavioral', 'Technical', 'Mixed'],
      default: 'Mixed',
    },
    jobDescription: { type: String, default: '' },
    questions: [
      {
        id: { type: Number, required: true },
        question: { type: String, required: true },
        type: { type: String, default: 'Technical' },
        expectedKeyPoints: { type: [String], default: [] },
      },
    ],
    answers: [questionAnswerSchema],
    scores: {
      overall: { type: Number, default: 0 },
      technical: { type: Number, default: 0 },
      communication: { type: Number, default: 0 },
      confidence: { type: Number, default: 0 },
    },
    finalReport: {
      overallScore: { type: Number, default: 0 },
      technicalScore: { type: Number, default: 0 },
      communicationScore: { type: Number, default: 0 },
      confidenceScore: { type: Number, default: 0 },
      strongAreas: { type: [String], default: [] },
      weakAreas: { type: [String], default: [] },
      improvementSuggestions: { type: [String], default: [] },
      recommendedTopics: { type: [String], default: [] },
      summary: { type: String, default: '' },
    },
  },
  { timestamps: true }
);

const MongooseInterview = mongoose.model('Interview', interviewSchema);

// In-Memory Store Fallback
const memoryInterviews = [];

class MemoryInterviewDoc {
  constructor(data) {
    this._id = data._id || `int_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.userId = data.userId ? data.userId.toString() : 'user_demo_123456789';
    this.role = data.role;
    this.interviewType = data.interviewType || 'Mixed';
    this.jobDescription = data.jobDescription || '';
    this.questions = data.questions || [];
    this.answers = data.answers || [];
    this.scores = data.scores || { overall: 85, technical: 88, communication: 82, confidence: 85 };
    this.finalReport = data.finalReport || {};
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }
}

// Seed Initial Sample Completed Mock Session
const seedSampleInterviews = () => {
  memoryInterviews.push(
    new MemoryInterviewDoc({
      _id: 'int_seed_1',
      userId: 'user_demo_123456789',
      role: 'Full Stack Developer',
      interviewType: 'Mixed',
      questions: [
        { id: 1, question: 'Explain how the Virtual DOM works in React and how reconciliation diffs state updates.', type: 'Technical' },
        { id: 2, question: 'Tell me about a challenging backend outage or bug you resolved.', type: 'HR / Behavioral' },
      ],
      answers: [
        {
          questionId: 1,
          question: 'Explain how the Virtual DOM works in React and how reconciliation diffs state updates.',
          answer: 'The Virtual DOM is an in-memory representation of the real DOM. React creates lightweight fiber nodes and compares the new tree with the previous tree using heuristic O(n) diffing, batching updates to the actual browser DOM to minimize reflows and repaints.',
          score: 9,
          relevance: 'Highly relevant and thorough',
          technicalCorrectness: 'Excellent accuracy',
          communication: 'Clear and structured',
          completeness: 'Covered Fiber and reconciliation diffing',
          feedback: 'Great response demonstrating strong understanding of React internals.',
          improvementSuggestion: 'Could mention keys and list reconciliation optimization.',
        },
      ],
      scores: {
        overall: 88,
        technical: 90,
        communication: 85,
        confidence: 88,
      },
      finalReport: {
        overallScore: 88,
        technicalScore: 90,
        communicationScore: 85,
        confidenceScore: 88,
        strongAreas: ['Strong grasp of frontend rendering architecture', 'Clear verbal articulation'],
        weakAreas: ['Can expand further on quantitative metrics in behavioral questions'],
        improvementSuggestions: ['Use STAR framework on all project challenge stories'],
        recommendedTopics: ['React 19 Server Components', 'Distributed Caching Strategies'],
        summary: 'Candidate demonstrates strong technical fluency and problem-solving maturity.',
      },
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    })
  );
};

seedSampleInterviews();

const MemoryInterview = {
  find(filter = {}) {
    const query = {
      select() {
        return this;
      },
      sort() {
        const uId = filter.userId ? filter.userId.toString() : '';
        const items = memoryInterviews
          .filter((i) => !uId || i.userId.toString() === uId)
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        return Promise.resolve(items.map((i) => new MemoryInterviewDoc(i)));
      },
    };
    return query;
  },

  async findOne(filter) {
    const uId = filter.userId ? filter.userId.toString() : '';
    const id = filter._id ? filter._id.toString() : '';
    const item = memoryInterviews.find(
      (i) => (!id || i._id.toString() === id) && (!uId || i.userId.toString() === uId)
    );
    return item ? new MemoryInterviewDoc(item) : null;
  },

  async create(data) {
    const doc = new MemoryInterviewDoc(data);
    memoryInterviews.push(doc);
    return doc;
  },
};

export const Interview = new Proxy(MongooseInterview, {
  get(target, prop) {
    if (isMemoryDb && prop in MemoryInterview) {
      return MemoryInterview[prop];
    }
    return target[prop];
  },
});
