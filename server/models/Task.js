import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  budget: {
    type: Number,
    required: true,
  },
  deadline: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ['open', 'in_progress', 'completed', 'cancelled'],
    default: 'open',
  },
  creatorId: {
    type: String,
    required: true,
  },
  selectedApplicantId: {
    type: String,
    default: null,
  },
  applicants: [{
    userId: String,
    bid: Number,
    commitment: String,
    message: String,
    score: {
      type: Number,
      default: 0,
    },
    appliedAt: {
      type: Date,
      default: Date.now,
    },
  }],
  updates: [{
    userId: String,
    message: String,
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now,
    },
  }],
  commitment: {
    type: String,
    enum: ['flexible', 'part-time', 'full-time'],
    default: 'flexible',
  },
  minTrustScore: {
    type: Number,
    default: 0,
  },
  urgent: {
    type: Boolean,
    default: false,
  },
  approved: {
    type: Boolean,
    default: false,
  },
  cancelled: {
    type: Boolean,
    default: false,
  },
  completedAt: {
    type: Date,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model('Task', taskSchema);
