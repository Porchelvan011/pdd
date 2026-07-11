import mongoose from 'mongoose';

// User Schema
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['Learner', 'Mentor', 'Admin'], required: true },
  avatar: { type: String, default: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150' },
  createdAt: { type: Date, default: Date.now }
});

// Mentor Profile Schema
const MentorSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  skills: [{ type: String }],
  expertise: { type: String, required: true },
  experience: { type: Number, required: true },
  bio: { type: String, default: '' },
  certificates: [{ type: String }],
  availability: [{ type: String }],
  rating: { type: Number, default: 5.0 },
  isApproved: { type: Boolean, default: false }
});

// Learner Profile Schema
const LearnerSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  skills: [{ type: String }],
  interests: [{ type: String }],
  careerGoals: [{ type: String }],
  bio: { type: String, default: '' },
  points: { type: Number, default: 0 },
  streak: { type: Number, default: 0 },
  badges: [{ type: String }],
  level: { type: Number, default: 1 }
});

// Mentorship Requests Schema
const MentorshipRequestSchema = new mongoose.Schema({
  learnerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  mentorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  message: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

// Learning Path / Milestones Schema
const LearningPathSchema = new mongoose.Schema({
  learnerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  progress: { type: Number, default: 0 },
  milestones: [{
    id: { type: Number },
    name: { type: String, required: true },
    status: { type: String, enum: ['pending', 'in-progress', 'completed'], default: 'pending' },
    difficulty: { type: String, default: 'Intermediate' }
  }],
  dailyTasks: [{
    id: { type: Number },
    task: { type: String, required: true },
    completed: { type: Boolean, default: false }
  }],
  weeklyGoals: [{
    id: { type: Number },
    goal: { type: String, required: true },
    completed: { type: Boolean, default: false }
  }],
  createdAt: { type: Date, default: Date.now }
});

// Session Booking Schema
const SessionSchema = new mongoose.Schema({
  learnerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  mentorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  date: { type: String, required: true },
  timeSlot: { type: String, required: true },
  status: { type: String, enum: ['scheduled', 'completed', 'cancelled'], default: 'scheduled' },
  meetingLink: { type: String, default: '' },
  notes: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

// Direct Messages Schema
const MessageSchema = new mongoose.Schema({
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String, required: true },
  attachment: { type: String, default: null },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

// Ratings & Reviews Feedback Schema
const FeedbackSchema = new mongoose.Schema({
  sessionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Session', required: true },
  mentorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  learnerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

// In-app Notifications Schema
const NotificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, enum: ['info', 'request', 'alert'], default: 'info' },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

// User Abuse & Behavior Reports Schema
const ReportSchema = new mongoose.Schema({
  reporterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reportedId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reason: { type: String, required: true },
  description: { type: String, required: true },
  status: { type: String, enum: ['pending', 'resolved'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

// Expose models safely checking if they were compiled already (to avoid errors in server hot-reload)
export const User = mongoose.models.User || mongoose.model('User', UserSchema);
export const Mentor = mongoose.models.Mentor || mongoose.model('Mentor', MentorSchema);
export const Learner = mongoose.models.Learner || mongoose.model('Learner', LearnerSchema);
export const MentorshipRequest = mongoose.models.MentorshipRequest || mongoose.model('MentorshipRequest', MentorshipRequestSchema);
export const LearningPath = mongoose.models.LearningPath || mongoose.model('LearningPath', LearningPathSchema);
export const Session = mongoose.models.Session || mongoose.model('Session', SessionSchema);
export const Message = mongoose.models.Message || mongoose.model('Message', MessageSchema);
export const Feedback = mongoose.models.Feedback || mongoose.model('Feedback', FeedbackSchema);
export const Notification = mongoose.models.Notification || mongoose.model('Notification', NotificationSchema);
export const Report = mongoose.models.Report || mongoose.model('Report', ReportSchema);
