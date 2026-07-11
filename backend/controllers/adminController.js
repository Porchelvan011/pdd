import { dbHelper } from '../utils/dbHelper.js';

export const getUsers = async (req, res) => {
  try {
    const users = await dbHelper.find('User', {});
    const fullUsers = [];
    for (let u of users) {
      let profile = null;
      if (u.role === 'Learner') {
        profile = await dbHelper.findOne('Learner', { userId: u._id });
      } else if (u.role === 'Mentor') {
        profile = await dbHelper.findOne('Mentor', { userId: u._id });
      }
      const { password, ...safeU } = u;
      fullUsers.push({ ...safeU, profile });
    }
    return res.json(fullUsers);
  } catch (error) {
    return res.status(500).json({ message: 'Error retrieving user list.' });
  }
};

export const approveMentor = async (req, res) => {
  try {
    const mentor = await dbHelper.findOne('Mentor', { userId: req.params.id });
    if (!mentor) return res.status(404).json({ message: 'Mentor profile not found.' });

    const updated = await dbHelper.findOneAndUpdate(
      'Mentor',
      { userId: req.params.id },
      { isApproved: true }
    );

    // Notify Mentor of system approval
    await dbHelper.create('Notification', {
      userId: req.params.id,
      title: 'Profile Approved! 🚀',
      message: 'Congratulations! An administrator has verified and approved your Mentor profile. You are now discoverable!',
      type: 'info',
      isRead: false
    });

    return res.json({ message: 'Mentor profile verified and approved successfully!', mentor: updated });
  } catch (error) {
    return res.status(500).json({ message: 'Error approving mentor.' });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const user = await dbHelper.findById('User', req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    // Remove user doc
    await dbHelper.deleteOne('User', { _id: req.params.id });

    // Clean up profile associations
    if (user.role === 'Learner') {
      await dbHelper.deleteOne('Learner', { userId: req.params.id });
      await dbHelper.deleteOne('LearningPath', { learnerId: req.params.id });
    } else if (user.role === 'Mentor') {
      await dbHelper.deleteOne('Mentor', { userId: req.params.id });
    }

    return res.json({ message: 'Account and associated profiles deleted successfully.' });
  } catch (error) {
    return res.status(500).json({ message: 'Error deleting account.' });
  }
};

export const getReports = async (req, res) => {
  try {
    const list = await dbHelper.find('Report', {});
    const populated = [];
    for (let r of list) {
      const reporter = await dbHelper.findById('User', r.reporterId);
      const reported = await dbHelper.findById('User', r.reportedId);
      populated.push({
        ...r,
        reporterName: reporter ? reporter.name : 'Unknown User',
        reportedName: reported ? reported.name : 'Unknown User'
      });
    }
    return res.json(populated);
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching reports.' });
  }
};

export const updateReportStatus = async (req, res) => {
  const { status } = req.body;
  try {
    const report = await dbHelper.findById('Report', req.params.id);
    if (!report) return res.status(404).json({ message: 'Report incident not found.' });

    const updated = await dbHelper.findOneAndUpdate(
      'Report',
      { _id: req.params.id },
      { status }
    );

    return res.json({ message: 'Report status resolved.', report: updated });
  } catch (error) {
    return res.status(500).json({ message: 'Error updating report.' });
  }
};
