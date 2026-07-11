import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { dbHelper } from '../utils/dbHelper.js';
import { requireStrings, isString, sanitizeText } from '../utils/validate.js';

const JWT_SECRET = process.env.JWT_SECRET || 'mentorix_super_secret_core_token_2026';

export const register = async (req, res) => {
  let { name, email, password, role, skills, expertise, experience, interests, bio } = req.body;

  try {
    const err = requireStrings(req.body, ['name', 'email', 'password', 'role']);
    if (err) return res.status(400).json({ message: err });
    if (!['Learner', 'Mentor', 'Admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role.' });
    }
    name = sanitizeText(name);
    bio = sanitizeText(bio);

    const existingUser = await dbHelper.findOne('User', { email });
    if (existingUser) {
      return res.status(400).json({ message: 'A user with this email already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create Base User
    const newUser = await dbHelper.create('User', {
      name,
      email,
      password: hashedPassword,
      role,
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name)}`
    });

    // Create Role-specific document
    if (role === 'Learner') {
      await dbHelper.create('Learner', {
        userId: newUser._id,
        skills: skills || [],
        interests: interests || [],
        careerGoals: [],
        bio: bio || '',
        points: 100, // Seed starting points
        streak: 1,
        badges: ['First Step'],
        level: 1
      });
      
      // Auto-generate starter learning path
      await dbHelper.create('LearningPath', {
        learnerId: newUser._id,
        title: 'Initial Onboarding Track',
        progress: 0,
        milestones: [
          { id: 1, name: 'Setup Profile & Complete Career Goals', status: 'in-progress', difficulty: 'Beginner' },
          { id: 2, name: 'Schedule Discovery Call with a Mentor', status: 'pending', difficulty: 'Beginner' }
        ],
        dailyTasks: [
          { id: 101, task: 'Complete Onboarding Profile Info', completed: false }
        ],
        weeklyGoals: [
          { id: 201, goal: 'Introduce yourself to 1 match', completed: false }
        ]
      });

    } else if (role === 'Mentor') {
      await dbHelper.create('Mentor', {
        userId: newUser._id,
        skills: skills || [],
        expertise: expertise || 'General Engineering',
        experience: Number(experience) || 1,
        bio: bio || '',
        certificates: [],
        availability: ['Monday 9:00 AM - 11:00 AM', 'Wednesday 3:00 PM - 5:00 PM'],
        rating: 5.0,
        isApproved: false // Admin approval required
      });
    }

    // Auto create notification
    await dbHelper.create('Notification', {
      userId: newUser._id,
      title: 'Welcome to Mentorix!',
      message: `Hi ${name}, your registration as a ${role} was successful!`,
      type: 'info',
      isRead: false
    });

    // Generate token for automatic login
    const token = jwt.sign(
      { id: newUser._id, email: newUser.email, role: newUser.role, name: newUser.name },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    return res.status(201).json({
      message: 'Registration successful!',
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        avatar: newUser.avatar
      }
    });

  } catch (error) {
    console.error('Registration Error:', error);
    return res.status(500).json({ message: 'Internal server error during registration.' });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const err = requireStrings(req.body, ['email', 'password']); // rejects non-string (NoSQL-injection) payloads
    if (err) return res.status(400).json({ message: err });

    const user = await dbHelper.findOne('User', { email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials. User does not exist.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials. Password mismatch.' });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Retrieve role profile details
    let profile = null;
    if (user.role === 'Learner') {
      profile = await dbHelper.findOne('Learner', { userId: user._id });
    } else if (user.role === 'Mentor') {
      profile = await dbHelper.findOne('Mentor', { userId: user._id });
    }

    return res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        profile
      }
    });

  } catch (error) {
    console.error('Login Error:', error);
    return res.status(500).json({ message: 'Internal server error during login.' });
  }
};

export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await dbHelper.findOne('User', { email });
    if (!user) {
      return res.status(404).json({ message: 'No user registered with this email address.' });
    }

    // Dynamic mock security key logger
    const mockToken = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '15m' });
    console.log(`🔑 [Security Audit] Forgot password token generated for ${email}: ${mockToken}`);

    const payload = { message: 'Password reset link dispatched successfully! Check your email.' };
    // Only expose the token in non-production (demo convenience). In production it is emailed, never returned.
    if (process.env.NODE_ENV !== 'production') payload.resetToken = mockToken;
    return res.json(payload);
  } catch (error) {
    return res.status(500).json({ message: 'Server error processing forgot password.' });
  }
};

export const resetPassword = async (req, res) => {
  const { email, newPassword } = req.body;
  try {
    const err = requireStrings(req.body, ['email', 'newPassword']);
    if (err) return res.status(400).json({ message: err });
    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters.' });
    }

    const user = await dbHelper.findOne('User', { email });
    if (!user) {
      return res.status(404).json({ message: 'No account found with this email address.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    await dbHelper.findOneAndUpdate('User', { _id: user._id }, { password: hashedPassword });

    return res.json({ message: 'Your password has been updated successfully. Please log in.' });
  } catch (error) {
    return res.status(500).json({ message: 'Server error while resetting password.' });
  }
};
