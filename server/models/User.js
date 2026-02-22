import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  university: {
    type: String,
    default: '',
  },
  bio: {
    type: String,
    default: '',
  },
  avatar: {
    type: String,
    default: '',
  },
  avatarColor: {
    type: String,
    default: '#ff6b35',
  },
  skills: [{
    name: String,
    rating: {
      type: Number,
      default: 3.0,
    },
  }],
  links: [{
    type: {
      type: String,
    },
    url: String,
  }],
  rating: {
    type: Number,
    default: 0,
  },
  totalTasks: {
    type: Number,
    default: 0,
  },
  completedTasks: {
    type: Number,
    default: 0,
  },
  failedTasks: {
    type: Number,
    default: 0,
  },
  totalEarned: {
    type: Number,
    default: 0,
  },
  trustScore: {
    type: Number,
    default: 70,
  },
  penalties: {
    type: Number,
    default: 0,
  },
  redMarks: {
    type: Number,
    default: 0,
  },
  bannedUntil: {
    type: Date,
    default: null,
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model('User', userSchema);
