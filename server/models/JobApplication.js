import mongoose from 'mongoose';
import { isMemoryDb } from '../config/db.js';

const jobApplicationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    company: { type: String, required: true, trim: true },
    jobTitle: { type: String, required: true, trim: true },
    jobUrl: { type: String, default: '', trim: true },
    location: { type: String, default: 'Remote', trim: true },
    jobType: {
      type: String,
      enum: ['Full-time', 'Part-time', 'Contract', 'Internship', 'Freelance'],
      default: 'Full-time',
    },
    salary: { type: String, default: '', trim: true },
    applicationDate: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ['Wishlist', 'Applied', 'Interview', 'Offer', 'Rejected'],
      default: 'Applied',
      index: true,
    },
    notes: { type: String, default: '' },
    followUpDate: { type: Date, default: null },
    contactPerson: { type: String, default: '', trim: true },
    contactEmail: { type: String, default: '', trim: true },
  },
  { timestamps: true }
);

const MongooseJobApplication = mongoose.model('JobApplication', jobApplicationSchema);

// In-Memory Fallback Store
const memoryApplications = [];

class MemoryJobApplicationDoc {
  constructor(data) {
    this._id = data._id || `app_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.userId = data.userId ? data.userId.toString() : 'user_demo_123456789';
    this.company = data.company;
    this.jobTitle = data.jobTitle;
    this.jobUrl = data.jobUrl || '';
    this.location = data.location || 'Remote';
    this.jobType = data.jobType || 'Full-time';
    this.salary = data.salary || '';
    this.applicationDate = data.applicationDate ? new Date(data.applicationDate) : new Date();
    this.status = data.status || 'Applied';
    this.notes = data.notes || '';
    this.followUpDate = data.followUpDate ? new Date(data.followUpDate) : null;
    this.contactPerson = data.contactPerson || '';
    this.contactEmail = data.contactEmail || '';
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  async save() {
    this.updatedAt = new Date();
    const idx = memoryApplications.findIndex((a) => a._id.toString() === this._id.toString());
    if (idx !== -1) {
      memoryApplications[idx] = this;
    } else {
      memoryApplications.push(this);
    }
    return this;
  }
}

// Seed Initial Realistic Sample Applications
const seedSampleApps = () => {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 2);

  const overdueDate = new Date(today);
  overdueDate.setDate(today.getDate() - 1);

  const initialApps = [
    {
      _id: 'app_seed_1',
      userId: 'user_demo_123456789',
      company: 'Stripe',
      jobTitle: 'Senior Full Stack Engineer',
      jobUrl: 'https://stripe.com/jobs',
      location: 'Remote (US/Global)',
      jobType: 'Full-time',
      salary: '$160,000 - $190,000',
      status: 'Interview',
      applicationDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      followUpDate: tomorrow,
      contactPerson: 'David Chen',
      contactEmail: 'david.chen@stripe.com',
      notes: 'Passed initial recruiter screening. Technical architectural round scheduled for next Tuesday.',
    },
    {
      _id: 'app_seed_2',
      userId: 'user_demo_123456789',
      company: 'Vercel',
      jobTitle: 'Frontend Platform Engineer',
      jobUrl: 'https://vercel.com/careers',
      location: 'Remote',
      jobType: 'Full-time',
      salary: '$150,000 - $175,000',
      status: 'Offer',
      applicationDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      followUpDate: null,
      contactPerson: 'Elena Rostova',
      contactEmail: 'elena@vercel.com',
      notes: 'Received written offer package! Reviewing benefits and equity vest schedule.',
    },
    {
      _id: 'app_seed_3',
      userId: 'user_demo_123456789',
      company: 'Datadog',
      jobTitle: 'Software Engineer - Distributed Systems',
      jobUrl: 'https://datadoghq.com/careers',
      location: 'New York, NY (Hybrid)',
      jobType: 'Full-time',
      salary: '$145,000 - $170,000',
      status: 'Applied',
      applicationDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      followUpDate: overdueDate,
      contactPerson: 'Marcus Vance',
      contactEmail: 'marcus.v@datadoghq.com',
      notes: 'Applied via employee referral. Need to follow up with hiring manager.',
    },
    {
      _id: 'app_seed_4',
      userId: 'user_demo_123456789',
      company: 'Linear',
      jobTitle: 'Product Engineer',
      jobUrl: 'https://linear.app/careers',
      location: 'Remote',
      jobType: 'Full-time',
      salary: '$155,000 - $185,000',
      status: 'Wishlist',
      applicationDate: new Date(),
      followUpDate: null,
      contactPerson: 'Karri Saarinen',
      contactEmail: '',
      notes: 'Targeting next quarter hiring batch. Preparing tailored portfolio sample.',
    },
  ];

  initialApps.forEach((app) => memoryApplications.push(new MemoryJobApplicationDoc(app)));
};

seedSampleApps();

const MemoryJobApplication = {
  find(filter = {}) {
    const query = {
      sort() {
        const uId = filter.userId ? filter.userId.toString() : '';
        const items = memoryApplications
          .filter((a) => !uId || a.userId.toString() === uId)
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        return Promise.resolve(items.map((i) => new MemoryJobApplicationDoc(i)));
      },
    };
    return query;
  },

  async findOne(filter) {
    const uId = filter.userId ? filter.userId.toString() : '';
    const id = filter._id ? filter._id.toString() : '';
    const item = memoryApplications.find(
      (a) => (!id || a._id.toString() === id) && (!uId || a.userId.toString() === uId)
    );
    return item ? new MemoryJobApplicationDoc(item) : null;
  },

  async create(data) {
    const doc = new MemoryJobApplicationDoc(data);
    memoryApplications.push(doc);
    return doc;
  },

  async findOneAndDelete(filter) {
    const uId = filter.userId ? filter.userId.toString() : '';
    const id = filter._id ? filter._id.toString() : '';
    const idx = memoryApplications.findIndex(
      (a) => (!id || a._id.toString() === id) && (!uId || a.userId.toString() === uId)
    );
    if (idx !== -1) {
      const removed = memoryApplications.splice(idx, 1)[0];
      return new MemoryJobApplicationDoc(removed);
    }
    return null;
  },
};

export const JobApplication = new Proxy(MongooseJobApplication, {
  get(target, prop) {
    if (isMemoryDb && prop in MemoryJobApplication) {
      return MemoryJobApplication[prop];
    }
    return target[prop];
  },
});
