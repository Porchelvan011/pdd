import express from 'express';
import { authMiddleware, requireRole } from '../middleware/auth.js';
import { register, login, forgotPassword, resetPassword } from '../controllers/authController.js';
import { 
  getProfile, 
  updateProfile, 
  getMentors, 
  getMentorById, 
  sendMentorshipRequest, 
  respondMentorshipRequest,
  getReceivedRequests
} from '../controllers/userController.js';
import { 
  getLearningPath, 
  generateLearningPath, 
  updateProgress, 
  bookSession, 
  getSessions, 
  updateSessionStatus, 
  submitFeedback 
} from '../controllers/learningController.js';
import { 
  getUsers, 
  approveMentor, 
  deleteUser, 
  getReports, 
  updateReportStatus 
} from '../controllers/adminController.js';
import { chatWithAi } from '../controllers/aiController.js';

const router = express.Router();


// ========================
// AUTH PUBLIC ROUTES
// ========================
router.post('/auth/register', register);
router.post('/auth/login', login);
router.post('/auth/forgot-password', forgotPassword);
router.post('/auth/reset-password', resetPassword);

// ========================
// USER & PROFILE ROUTES
// ========================
router.get('/users/profile', authMiddleware, getProfile);
router.put('/users/profile', authMiddleware, updateProfile);

// ========================
// MENTOR DISCOVERY & ACTIONS
// ========================
router.get('/mentors', authMiddleware, getMentors);
router.get('/mentors/:id', authMiddleware, getMentorById);
router.post('/mentors/request', authMiddleware, sendMentorshipRequest);
router.put('/mentors/request/:id', authMiddleware, requireRole(['Mentor']), respondMentorshipRequest);
router.get('/mentors/requests/received', authMiddleware, requireRole(['Mentor']), getReceivedRequests);

// ========================
// PERSONALIZED LEARNING PATH
// ========================
router.get('/learning-path', authMiddleware, getLearningPath);
router.post('/learning-path/generate', authMiddleware, generateLearningPath);
router.put('/progress', authMiddleware, updateProgress);
router.post('/ai/chat', authMiddleware, chatWithAi);


// ========================
// SESSION BOOKING & MEETINGS
// ========================
router.post('/session/book', authMiddleware, bookSession);
router.get('/session/history', authMiddleware, getSessions);
router.put('/session/:id', authMiddleware, updateSessionStatus);

// ========================
// FEEDBACK & RATINGS
// ========================
router.post('/feedback', authMiddleware, submitFeedback);

// ========================
// ADMIN SYSTEM UTILITIES
// ========================
router.get('/admin/users', authMiddleware, requireRole(['Admin']), getUsers);
router.put('/admin/approve-mentor/:id', authMiddleware, requireRole(['Admin']), approveMentor);
router.delete('/admin/user/:id', authMiddleware, requireRole(['Admin']), deleteUser);
router.get('/admin/reports', authMiddleware, requireRole(['Admin']), getReports);
router.put('/admin/reports/:id', authMiddleware, requireRole(['Admin']), updateReportStatus);

export default router;
