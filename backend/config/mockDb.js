import bcrypt from 'bcryptjs';

// Seeded passwords
const salt = bcrypt.genSaltSync(10);
const defaultHashPassword = bcrypt.hashSync('password123', salt);

// Primary storage tables
export const mockDb = {
  users: [
    {
      _id: 'usr_admin_1',
      name: 'Sarah Vance',
      email: 'admin@mentorix.com',
      password: defaultHashPassword,
      role: 'Admin',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
      createdAt: new Date('2026-01-01')
    },
    {
      _id: 'usr_mentor_1',
      name: 'Dr. Evelyn Foster',
      email: 'evelyn@mentorix.com',
      password: defaultHashPassword,
      role: 'Mentor',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150',
      createdAt: new Date('2026-01-10')
    },
    {
      _id: 'usr_mentor_2',
      name: 'Marcus Chen',
      email: 'marcus@mentorix.com',
      password: defaultHashPassword,
      role: 'Mentor',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      createdAt: new Date('2026-01-12')
    },
    {
      _id: 'usr_mentor_3',
      name: 'Aria Rodriguez',
      email: 'aria@mentorix.com',
      password: defaultHashPassword,
      role: 'Mentor',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      createdAt: new Date('2026-01-15')
    },
    {
      _id: 'usr_learner_1',
      name: 'Alex Mercer',
      email: 'alex@mentorix.com',
      password: defaultHashPassword,
      role: 'Learner',
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150',
      createdAt: new Date('2026-02-01')
    }
  ],

  mentors: [
    {
      _id: 'men_1',
      userId: 'usr_mentor_1',
      skills: ['React', 'Node.js', 'System Design', 'MongoDB'],
      expertise: 'Full Stack Development',
      experience: 8,
      bio: 'Ex-Google Staff Engineer passionate about helping career switchers master full stack applications and system engineering.',
      certificates: ['AWS Certified Solutions Architect', 'Google Cloud Fellow'],
      availability: ['Monday 10:00 AM - 12:00 PM', 'Wednesday 2:00 PM - 4:00 PM', 'Friday 4:00 PM - 6:00 PM'],
      rating: 4.9,
      isApproved: true
    },
    {
      _id: 'men_2',
      userId: 'usr_mentor_2',
      skills: ['Python', 'TensorFlow', 'PyTorch', 'Data Structures', 'SQL'],
      expertise: 'Artificial Intelligence & ML',
      experience: 6,
      bio: 'AI Researcher specialized in natural language processing and computer vision models. Let us build intelligence together.',
      certificates: ['DeepLearning.AI Specialized Cert', 'Stanford ML Associate'],
      availability: ['Tuesday 1:00 PM - 3:00 PM', 'Thursday 9:00 AM - 11:00 AM'],
      rating: 4.8,
      isApproved: true
    },
    {
      _id: 'men_3',
      userId: 'usr_mentor_3',
      skills: ['UI/UX Design', 'Figma', 'CSS Grid', 'Typography', 'Prototyping'],
      expertise: 'Product Design & Frontend UX',
      experience: 5,
      bio: 'Creating beautiful, fluid interfaces that delight users. Specialized in glassmorphism, responsive frameworks, and brand systems.',
      certificates: ['NN/g UX Master Certified', 'Google UX Design Professional'],
      availability: ['Wednesday 10:00 AM - 12:00 PM', 'Thursday 3:00 PM - 5:00 PM'],
      rating: 4.7,
      isApproved: false // Pending Admin Approval to demonstrate the approval page!
    }
  ],

  learners: [
    {
      _id: 'lrn_1',
      userId: 'usr_learner_1',
      skills: ['HTML', 'CSS', 'JavaScript'],
      interests: ['React', 'System Design', 'UI/UX Design'],
      careerGoals: ['Become a Senior Frontend Engineer', 'Master System Architecture'],
      bio: 'Enthusiastic developer learning React and database systems to transition from building mock layouts to high-scale platforms.',
      points: 450,
      streak: 5,
      badges: ['First Step', 'Streaker', 'Tech Enthusiast'],
      level: 2
    }
  ],

  mentorshipRequests: [
    {
      _id: 'req_1',
      learnerId: 'usr_learner_1',
      mentorId: 'usr_mentor_1',
      status: 'approved',
      message: 'Hello Evelyin, I am eager to learn system architecture and advanced backend patterns under your guidance!',
      createdAt: new Date('2026-02-15')
    },
    {
      _id: 'req_2',
      learnerId: 'usr_learner_1',
      mentorId: 'usr_mentor_2',
      status: 'pending',
      message: 'Hi Marcus, I want to learn how to integrate machine learning models into React apps.',
      createdAt: new Date('2026-06-01')
    }
  ],

  learningPaths: [
    {
      _id: 'path_1',
      learnerId: 'usr_learner_1',
      title: 'Full-Stack Frontend Master Roadmap',
      progress: 60,
      milestones: [
        { id: 1, name: 'Master CSS Grids & Flexbox Layouts', status: 'completed', difficulty: 'Beginner' },
        { id: 2, name: 'Understand JavaScript Async & ES6 Modules', status: 'completed', difficulty: 'Beginner' },
        { id: 3, name: 'Build React Router Multi-Page Interface', status: 'in-progress', difficulty: 'Intermediate' },
        { id: 4, name: 'Setup Express REST APIs with Token Hashing', status: 'pending', difficulty: 'Intermediate' },
        { id: 5, name: 'Deploy Real-Time Communication via Socket.io', status: 'pending', difficulty: 'Advanced' }
      ],
      dailyTasks: [
        { id: 101, task: 'Complete CSS Flexbox mini-challenge', completed: true },
        { id: 102, task: 'Create custom hook in React project', completed: false },
        { id: 103, task: 'Read 2 pages of documentation on Express routers', completed: false }
      ],
      weeklyGoals: [
        { id: 201, goal: 'Implement user login verification page', completed: true },
        { id: 202, goal: 'Conduct single session with Evelyn', completed: false }
      ],
      createdAt: new Date('2026-02-20')
    }
  ],

  sessions: [
    {
      _id: 'ses_1',
      learnerId: 'usr_learner_1',
      mentorId: 'usr_mentor_1',
      title: 'Intro & Portfolio Engineering Review',
      date: '2026-06-10',
      timeSlot: 'Monday 10:00 AM - 11:00 AM',
      status: 'scheduled',
      meetingLink: 'https://meet.jit.si/mentorix-ev-alex-session',
      notes: 'Please prepare your current project GitHub link.'
    },
    {
      _id: 'ses_2',
      learnerId: 'usr_learner_1',
      mentorId: 'usr_mentor_1',
      title: 'Advanced React Hooks & Performance',
      date: '2026-05-25',
      timeSlot: 'Monday 10:00 AM - 11:00 AM',
      status: 'completed',
      meetingLink: 'https://meet.jit.si/mentorix-ev-alex-session',
      notes: 'Reviewed useCallback, useMemo, and clean refactoring patterns.'
    }
  ],

  messages: [
    {
      _id: 'msg_1',
      senderId: 'usr_mentor_1',
      receiverId: 'usr_learner_1',
      text: 'Welcome to the platform, Alex! Looking forward to our initial mentorship session.',
      attachment: null,
      isRead: true,
      createdAt: new Date('2026-02-15T10:00:00Z')
    },
    {
      _id: 'msg_2',
      senderId: 'usr_learner_1',
      receiverId: 'usr_mentor_1',
      text: 'Thanks Evelyn! I have written a draft outline of my React portfolio. Can we discuss next Monday?',
      attachment: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      isRead: true,
      createdAt: new Date('2026-02-15T10:05:00Z')
    },
    {
      _id: 'msg_3',
      senderId: 'usr_mentor_1',
      receiverId: 'usr_learner_1',
      text: 'Perfect! I received the layout PDF. I will review it before Monday and leave inline marks.',
      attachment: null,
      isRead: false,
      createdAt: new Date('2026-02-15T10:10:00Z')
    }
  ],

  feedbacks: [
    {
      _id: 'fee_1',
      sessionId: 'ses_2',
      mentorId: 'usr_mentor_1',
      learnerId: 'usr_learner_1',
      rating: 5,
      comment: 'Evelyn explained advanced memorization hooks incredibly well! Extremely helpful session.',
      createdAt: new Date('2026-05-25T11:30:00Z')
    }
  ],

  rewards: [
    {
      _id: 'rew_1',
      title: 'First Step',
      description: 'Approved by your first mentor',
      icon: '🏆',
      pointsRequired: 100,
      badgeCode: 'First Step'
    },
    {
      _id: 'rew_2',
      title: 'Streaker',
      description: 'Reach a 5-day session learning streak',
      icon: '🔥',
      pointsRequired: 250,
      badgeCode: 'Streaker'
    },
    {
      _id: 'rew_3',
      title: 'Tech Enthusiast',
      description: 'Acquire 3 technology milestones',
      icon: '🧠',
      pointsRequired: 400,
      badgeCode: 'Tech Enthusiast'
    },
    {
      _id: 'rew_4',
      title: 'Overachiever',
      description: 'Collect 1000 developmental XP points',
      icon: '🚀',
      pointsRequired: 1000,
      badgeCode: 'Overachiever'
    }
  ],

  notifications: [
    {
      _id: 'not_1',
      userId: 'usr_learner_1',
      title: 'Request Approved!',
      message: 'Dr. Evelyn Foster has accepted your mentorship request.',
      type: 'request',
      isRead: false,
      createdAt: new Date('2026-02-15T09:30:00Z')
    },
    {
      _id: 'not_2',
      userId: 'usr_learner_1',
      title: 'Upcoming Session Reminder',
      message: 'Your meeting with Evelyn Foster is scheduled for next Monday.',
      type: 'info',
      isRead: true,
      createdAt: new Date('2026-06-01T12:00:00Z')
    }
  ],

  reports: [
    {
      _id: 'rep_1',
      reporterId: 'usr_learner_1',
      reportedId: 'usr_mentor_2',
      reason: 'Inappropriate spam content',
      description: 'Sent repetitive marketing templates in private chat session.',
      status: 'pending',
      createdAt: new Date('2026-05-28')
    }
  ]
};
