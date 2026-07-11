import { dbHelper } from '../utils/dbHelper.js';

// Calculate semantic matching score between a learner and a mentor
const calculateBestFitScore = (learner, mentor) => {
  if (!learner || !mentor) return 50; // Neutral fallback

  let score = 0;
  
  // 1. Skill & Interest overlaps (50 points maximum)
  const overlap = learner.interests.filter(skill => 
    mentor.skills.some(mSkill => mSkill.toLowerCase() === skill.toLowerCase())
  );
  const matchRatio = mentor.skills.length > 0 ? overlap.length / Math.max(learner.interests.length, 1) : 0;
  score += Math.min(matchRatio * 50, 50);

  // 2. Expertise keyword intersection (20 points maximum)
  const expertiseWord = mentor.expertise.toLowerCase();
  const goalsOverlap = learner.careerGoals.some(goal => goal.toLowerCase().includes(expertiseWord)) ||
                       learner.bio.toLowerCase().includes(expertiseWord);
  if (goalsOverlap) score += 20;

  // 3. Experience bonus (15 points maximum)
  // Max out experience bonus at 10 years
  score += Math.min((mentor.experience / 10) * 15, 15);

  // 4. Rating bonus (15 points maximum)
  score += ((mentor.rating || 5) / 5) * 15;

  return Math.round(score);
};

export const getProfile = async (req, res) => {
  try {
    const user = await dbHelper.findById('User', req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    let profile = null;
    if (user.role === 'Learner') {
      profile = await dbHelper.findOne('Learner', { userId: user._id });
    } else if (user.role === 'Mentor') {
      profile = await dbHelper.findOne('Mentor', { userId: user._id });
    }

    return res.json({ ...user, profile });
  } catch (error) {
    return res.status(500).json({ message: 'Error retrieving profile.' });
  }
};

export const updateProfile = async (req, res) => {
  const { bio, skills, interests, careerGoals, expertise, experience, availability } = req.body;
  try {
    const user = await dbHelper.findById('User', req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    let updatedProfile = null;
    if (user.role === 'Learner') {
      updatedProfile = await dbHelper.findOneAndUpdate(
        'Learner',
        { userId: user._id },
        { bio, skills, interests, careerGoals }
      );
    } else if (user.role === 'Mentor') {
      updatedProfile = await dbHelper.findOneAndUpdate(
        'Mentor',
        { userId: user._id },
        { bio, skills, expertise, experience: Number(experience), availability }
      );
    }

    return res.json({ message: 'Profile updated successfully!', profile: updatedProfile });
  } catch (error) {
    return res.status(500).json({ message: 'Error updating profile.' });
  }
};

export const getMentors = async (req, res) => {
  try {
    const mentorsList = await dbHelper.find('Mentor', {});
    
    // Attempt to retrieve user profiles for these mentors
    const populatedMentors = [];
    for (let m of mentorsList) {
      const u = await dbHelper.findById('User', m.userId);
      if (u) {
        populatedMentors.push({ ...m, user: u });
      }
    }

    // If requester is a Learner, inject AI Best Fit Score!
    if (req.user && req.user.role === 'Learner') {
      const learner = await dbHelper.findOne('Learner', { userId: req.user.id });
      populatedMentors.forEach(m => {
        m.bestFitScore = calculateBestFitScore(learner, m);
      });
      // Sort in descending order of matching quality
      populatedMentors.sort((a, b) => b.bestFitScore - a.bestFitScore);
    } else {
      populatedMentors.forEach(m => {
        m.bestFitScore = 80; // Baseline default
      });
    }

    return res.json(populatedMentors);
  } catch (error) {
    console.error('Error fetching mentors:', error);
    return res.status(500).json({ message: 'Error retrieving mentors.' });
  }
};

export const getMentorById = async (req, res) => {
  try {
    const mentor = await dbHelper.findOne('Mentor', { _id: req.params.id });
    if (!mentor) return res.status(404).json({ message: 'Mentor profile not found.' });

    const user = await dbHelper.findById('User', mentor.userId);
    const feedback = await dbHelper.find('Feedback', { mentorId: mentor.userId });

    // Populate feedback with learner names
    for (let f of feedback) {
      const lUser = await dbHelper.findById('User', f.learnerId);
      if (lUser) {
        f.learnerName = lUser.name;
        f.learnerAvatar = lUser.avatar;
      }
    }

    let bestFitScore = 85;
    if (req.user && req.user.role === 'Learner') {
      const learner = await dbHelper.findOne('Learner', { userId: req.user.id });
      bestFitScore = calculateBestFitScore(learner, mentor);
    }

    return res.json({ ...mentor, user, feedback, bestFitScore });
  } catch (error) {
    return res.status(500).json({ message: 'Error retrieving mentor details.' });
  }
};

export const sendMentorshipRequest = async (req, res) => {
  const { mentorId, message } = req.body;
  try {
    if (!mentorId) return res.status(400).json({ message: 'Please specify a mentor.' });

    const mentorUser = await dbHelper.findById('User', mentorId);
    if (!mentorUser || mentorUser.role !== 'Mentor') {
      return res.status(400).json({ message: 'Target user is not a valid mentor.' });
    }

    const existingRequest = await dbHelper.findOne('MentorshipRequest', {
      learnerId: req.user.id,
      mentorId,
      status: 'pending'
    });

    if (existingRequest) {
      return res.status(400).json({ message: 'You already have a pending request with this mentor.' });
    }

    const newRequest = await dbHelper.create('MentorshipRequest', {
      learnerId: req.user.id,
      mentorId,
      status: 'pending',
      message: message || `Hi! I would love to connect and learn from you.`
    });

    // Notify Mentor
    await dbHelper.create('Notification', {
      userId: mentorId,
      title: 'New Mentorship Request',
      message: `${req.user.name} has requested you as their mentor.`,
      type: 'request',
      isRead: false
    });

    return res.status(201).json({ message: 'Mentorship request submitted successfully!', request: newRequest });
  } catch (error) {
    console.error('Request Mentorship Error:', error);
    return res.status(500).json({ message: 'Error submitting request.' });
  }
};

export const respondMentorshipRequest = async (req, res) => {
  const { status } = req.body; // 'approved' or 'rejected'
  try {
    const request = await dbHelper.findById('MentorshipRequest', req.params.id);
    if (!request) return res.status(404).json({ message: 'Mentorship request not found.' });

    if (request.mentorId.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: 'Unauthorized. You are not the mentor for this request.' });
    }

    const updated = await dbHelper.findOneAndUpdate(
      'MentorshipRequest',
      { _id: req.params.id },
      { status }
    );

    // Notify student
    await dbHelper.create('Notification', {
      userId: request.learnerId,
      title: status === 'approved' ? 'Request Accepted! 🎉' : 'Mentorship Request Update',
      message: status === 'approved' 
        ? `Congratulations! ${req.user.name} has accepted your mentorship request.` 
        : `Your mentorship request with ${req.user.name} was not accepted.`,
      type: 'request',
      isRead: false
    });

    return res.json({ message: `Request successfully ${status}!`, request: updated });
  } catch (error) {
    return res.status(500).json({ message: 'Error responding to request.' });
  }
};

export const getReceivedRequests = async (req, res) => {
  try {
    // Mentors only
    const list = await dbHelper.find('MentorshipRequest', { mentorId: req.user.id });
    const populated = [];
    for (let r of list) {
      const learnerUser = await dbHelper.findById('User', r.learnerId);
      if (learnerUser) {
        const lDetails = await dbHelper.findOne('Learner', { userId: r.learnerId });
        populated.push({
          ...r,
          learner: {
            ...learnerUser,
            profile: lDetails
          }
        });
      }
    }
    return res.json(populated);
  } catch (error) {
    return res.status(500).json({ message: 'Error retrieving requests.' });
  }
};
