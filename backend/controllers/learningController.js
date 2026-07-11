import { dbHelper } from '../utils/dbHelper.js';
import { sanitizeText } from '../utils/validate.js';

export const getLearningPath = async (req, res) => {
  try {
    const path = await dbHelper.findOne('LearningPath', { learnerId: req.user.id });
    if (!path) {
      return res.status(404).json({ message: 'No active learning path. Trigger generate to begin.' });
    }
    return res.json(path);
  } catch (error) {
    return res.status(500).json({ message: 'Error retrieving learning path.' });
  }
};

export const generateLearningPath = async (req, res) => {
  const { title, topics } = req.body;
  try {
    const currentPath = await dbHelper.findOne('LearningPath', { learnerId: req.user.id });
    
    const formattedTopics = topics || ['Core Engineering', 'Framework Structures', 'Scaling Integrations'];
    const milestones = formattedTopics.map((topic, i) => ({
      id: i + 1,
      name: `Master ${topic}`,
      status: 'pending',
      difficulty: i === 0 ? 'Beginner' : i === 1 ? 'Intermediate' : 'Advanced'
    }));

    const pathData = {
      learnerId: req.user.id,
      title: title || 'AI Generated Mastery Path',
      progress: 0,
      milestones,
      dailyTasks: [
        { id: 101, task: `Review documentation on ${formattedTopics[0]}`, completed: false },
        { id: 102, task: `Write sample program demonstrating core logic`, completed: false }
      ],
      weeklyGoals: [
        { id: 201, goal: `Complete first 2 milestone tasks`, completed: false }
      ]
    };

    let path;
    if (currentPath) {
      path = await dbHelper.findOneAndUpdate('LearningPath', { learnerId: req.user.id }, pathData);
    } else {
      path = await dbHelper.create('LearningPath', pathData);
    }

    return res.status(201).json({ message: 'AI learning roadmap generated successfully!', path });
  } catch (error) {
    console.error('Generate Path Error:', error);
    return res.status(500).json({ message: 'Error generating learning path.' });
  }
};

export const updateProgress = async (req, res) => {
  const { type, id, completed } = req.body; // type: 'milestone' | 'daily' | 'weekly', id: task/milestone id
  try {
    const path = await dbHelper.findOne('LearningPath', { learnerId: req.user.id });
    if (!path) return res.status(404).json({ message: 'No learning path found.' });

    let pointsAwarded = 0;

    // 1. Update the appropriate array
    if (type === 'milestone') {
      const ms = path.milestones.find(m => m.id === id);
      if (ms) {
        const oldStatus = ms.status;
        ms.status = completed ? 'completed' : 'pending';
        if (oldStatus !== 'completed' && completed) {
          pointsAwarded += 50; // Big points for milestones
        }
      }
    } else if (type === 'daily') {
      const task = path.dailyTasks.find(t => t.id === id);
      if (task) {
        const oldVal = task.completed;
        task.completed = completed;
        if (!oldVal && completed) {
          pointsAwarded += 10;
        }
      }
    } else if (type === 'weekly') {
      const goal = path.weeklyGoals.find(g => g.id === id);
      if (goal) {
        const oldVal = goal.completed;
        goal.completed = completed;
        if (!oldVal && completed) {
          pointsAwarded += 25;
        }
      }
    }

    // 2. Recalculate Path Percentage Progress
    const totalMilestones = path.milestones.length;
    const completedMilestones = path.milestones.filter(m => m.status === 'completed').length;
    path.progress = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;

    await dbHelper.findOneAndUpdate('LearningPath', { learnerId: req.user.id }, path);

    // 3. Apply Gamification XP points, streaks & awards
    if (pointsAwarded > 0) {
      const learner = await dbHelper.findOne('Learner', { userId: req.user.id });
      if (learner) {
        learner.points += pointsAwarded;
        
        // Add random streak bonus just to feel gamified and alive!
        learner.streak += 1;

        // Dynamic Badge Evaluator
        const newBadges = [...learner.badges];
        if (learner.points >= 100 && !newBadges.includes('First Step')) {
          newBadges.push('First Step');
        }
        if (learner.points >= 250 && !newBadges.includes('Streaker')) {
          newBadges.push('Streaker');
        }
        if (learner.points >= 400 && !newBadges.includes('Tech Enthusiast')) {
          newBadges.push('Tech Enthusiast');
        }
        if (learner.points >= 1000 && !newBadges.includes('Overachiever')) {
          newBadges.push('Overachiever');
        }

        learner.badges = newBadges;
        // Level increases every 300 points
        learner.level = Math.max(1, Math.floor(learner.points / 300) + 1);

        await dbHelper.findOneAndUpdate('Learner', { userId: req.user.id }, learner);

        // Notify learner about rewards
        await dbHelper.create('Notification', {
          userId: req.user.id,
          title: `XP Acquired! +${pointsAwarded} XP 🚀`,
          message: `Your points are now ${learner.points}. Keep up the streak!`,
          type: 'info',
          isRead: false
        });
      }
    }

    return res.json({ message: 'Progress recorded successfully!', path });
  } catch (error) {
    console.error('Update Progress Error:', error);
    return res.status(500).json({ message: 'Error recording progress.' });
  }
};

export const bookSession = async (req, res) => {
  const { mentorId, title, date, timeSlot, notes } = req.body;
  try {
    if (!mentorId || !title || !date || !timeSlot) {
      return res.status(400).json({ message: 'Please provide mentorId, title, date, and timeSlot.' });
    }

    const session = await dbHelper.create('Session', {
      learnerId: req.user.id,
      mentorId,
      title,
      date,
      timeSlot,
      status: 'scheduled',
      meetingLink: `https://meet.jit.si/mentorix-${Math.random().toString(36).substring(7)}`,
      notes: notes || ''
    });

    // Notify Mentor
    await dbHelper.create('Notification', {
      userId: mentorId,
      title: 'New Session Scheduled',
      message: `${req.user.name} has scheduled a session: "${title}"`,
      type: 'info',
      isRead: false
    });

    return res.status(201).json({ message: 'Session booked successfully!', session });
  } catch (error) {
    return res.status(500).json({ message: 'Error scheduling session.' });
  }
};

export const getSessions = async (req, res) => {
  try {
    const query = req.user.role === 'Learner' 
      ? { learnerId: req.user.id } 
      : { mentorId: req.user.id };

    const sessionsList = await dbHelper.find('Session', query);
    
    // Populate session names
    for (let s of sessionsList) {
      const counterpartId = req.user.role === 'Learner' ? s.mentorId : s.learnerId;
      const peer = await dbHelper.findById('User', counterpartId);
      if (peer) {
        s.peerName = peer.name;
        s.peerAvatar = peer.avatar;
        s.peerRole = peer.role;
      }
    }

    return res.json(sessionsList);
  } catch (error) {
    return res.status(500).json({ message: 'Error retrieving sessions.' });
  }
};

export const updateSessionStatus = async (req, res) => {
  const { status } = req.body; // 'completed' | 'cancelled'
  try {
    const session = await dbHelper.findById('Session', req.params.id);
    if (!session) return res.status(404).json({ message: 'Session slot not found.' });

    const updated = await dbHelper.findOneAndUpdate(
      'Session',
      { _id: req.params.id },
      { status }
    );

    const peerNotifyId = req.user.role === 'Learner' ? session.mentorId : session.learnerId;
    await dbHelper.create('Notification', {
      userId: peerNotifyId,
      title: 'Session Status Changed',
      message: `The scheduled meeting "${session.title}" was marked as ${status}.`,
      type: 'info',
      isRead: false
    });

    return res.json({ message: `Session status marked as ${status}!`, session: updated });
  } catch (error) {
    return res.status(500).json({ message: 'Error updating session status.' });
  }
};

export const submitFeedback = async (req, res) => {
  const { sessionId, rating, comment } = req.body;
  try {
    if (!sessionId || !rating) {
      return res.status(400).json({ message: 'Session identity and star rating are required.' });
    }

    const session = await dbHelper.findById('Session', sessionId);
    if (!session) return res.status(404).json({ message: 'Session reference not found.' });

    // Prevent duplicate feedbacks
    const existing = await dbHelper.findOne('Feedback', { sessionId });
    if (existing) {
      return res.status(400).json({ message: 'Feedback review already submitted for this session.' });
    }

    const feedback = await dbHelper.create('Feedback', {
      sessionId,
      mentorId: session.mentorId,
      learnerId: req.user.id,
      rating: Number(rating),
      comment: sanitizeText(comment) || ''
    });

    // Re-calculate mentor average rating
    const mentorFeedback = await dbHelper.find('Feedback', { mentorId: session.mentorId });
    const avgRating = mentorFeedback.reduce((acc, cur) => acc + cur.rating, 0) / mentorFeedback.length;
    
    await dbHelper.findOneAndUpdate(
      'Mentor', 
      { userId: session.mentorId }, 
      { rating: Math.round(avgRating * 10) / 10 }
    );

    // Notify mentor of review
    await dbHelper.create('Notification', {
      userId: session.mentorId,
      title: 'New Star Rating Review Received! ⭐️',
      message: `A learner rated your session: ${rating}/5. Read comments in feedback dashboard.`,
      type: 'info',
      isRead: false
    });

    return res.status(201).json({ message: 'Star rating feedback recorded successfully!', feedback });
  } catch (error) {
    console.error('Feedback Error:', error);
    return res.status(500).json({ message: 'Error registering feedback review.' });
  }
};
