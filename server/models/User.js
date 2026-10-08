import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { isMemoryDb } from '../config/db.js';

// Mongoose Schema
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6 },
    skills: { type: [String], default: [] },
    education: { type: String, default: '' },
    targetRole: { type: String, default: 'Full Stack Developer' },
    aboutMe: { type: String, default: '' },
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const MongooseUser = mongoose.model('User', userSchema);

// In-Memory User Store Fallback
const memoryUsers = [];

class MemoryUserDoc {
  constructor(data) {
    this._id = data._id || `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.name = data.name;
    this.email = data.email?.toLowerCase();
    this.password = data.password;
    this.skills = Array.isArray(data.skills) ? data.skills : [];
    this.education = data.education || '';
    this.targetRole = data.targetRole || 'Full Stack Developer';
    this.aboutMe = data.aboutMe || '';
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  async matchPassword(enteredPassword) {
    if (this.password.startsWith('$2')) {
      return await bcrypt.compare(enteredPassword, this.password);
    }
    return enteredPassword === this.password;
  }

  async save() {
    this.updatedAt = new Date();
    const idx = memoryUsers.findIndex((u) => u._id.toString() === this._id.toString());
    if (idx !== -1) {
      memoryUsers[idx] = this;
    } else {
      memoryUsers.push(this);
    }
    return this;
  }
}

// Seed Demo User in memory
(async () => {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash('demopass123', salt);
  memoryUsers.push(
    new MemoryUserDoc({
      _id: 'user_demo_123456789',
      name: 'Alex Johnson',
      email: 'demo@careerpilot.ai',
      password: hashedPassword,
      skills: ['React', 'TypeScript', 'Node.js', 'Express', 'MongoDB', 'Tailwind CSS', 'GraphQL'],
      education: 'B.S. in Computer Science',
      targetRole: 'Full Stack Developer',
      aboutMe: 'Passionate developer building high-performance web applications and scalable backend architectures.',
    })
  );
})();

const MemoryUser = {
  async findOne(filter) {
    if (filter.email) {
      const u = memoryUsers.find((user) => user.email.toLowerCase() === filter.email.toLowerCase());
      return u ? new MemoryUserDoc(u) : null;
    }
    if (filter._id) {
      const u = memoryUsers.find((user) => user._id.toString() === filter._id.toString());
      return u ? new MemoryUserDoc(u) : null;
    }
    return null;
  },

  findById(id) {
    const findUser = () => {
      const u = memoryUsers.find((user) => user._id.toString() === id.toString());
      return u ? u : null;
    };
    const query = {
      async select() {
        return findUser();
      },
      then(resolve, reject) {
        return Promise.resolve(findUser()).then(resolve, reject);
      },
    };
    return query;
  },

  async create(data) {
    let finalPassword = data.password;
    if (!finalPassword.startsWith('$2')) {
      const salt = await bcrypt.genSalt(10);
      finalPassword = await bcrypt.hash(finalPassword, salt);
    }
    const doc = new MemoryUserDoc({ ...data, password: finalPassword });
    memoryUsers.push(doc);
    return doc;
  },
};

export const User = new Proxy(MongooseUser, {
  get(target, prop) {
    if (isMemoryDb && prop in MemoryUser) {
      return MemoryUser[prop];
    }
    return target[prop];
  },
});
