// Central mock data file for demo consistency across all pages

export const demoStudent = {
  id: 'demo-student-1',
  name: 'Emma Thompson',
  avatar: undefined,
  email: 'emma.thompson@student.edu',
  school: 'Lincoln High School',
  grade: '12th Grade',
  gpa: 3.8,
  satScore: 1450,
  actScore: undefined,
  overallProgress: 85,
  status: 'on-track' as const,
  lastActivity: '2 hours ago',
  targetSchools: ['Stanford', 'UC Berkeley', 'UCLA'],
  extracurriculars: ['Debate Team Captain', 'Volunteer Tutor'],
};

export const demoCounselor = {
  id: 'demo-counselor-1',
  name: 'Ms. Johnson',
  email: 'johnson@primrose.edu',
  avatar: undefined,
};

export const demoParent = {
  id: 'demo-parent-1',
  name: 'Sarah Thompson',
  email: 'sarah.thompson@email.com',
  childName: demoStudent.name,
};

export const demoStudents = [
  {
    ...demoStudent,
    completionPercentage: 85,
    essaysSubmitted: 4,
    totalEssays: 5,
    recommendationsRequested: 3,
    recommendationsSubmitted: 2,
    upcomingDeadlines: 2,
    tasks: [
      { id: '1', task: 'Submit final essay draft', dueDate: '2024-01-15', completed: false }
    ],
    meetingNotes: [
      { date: '2024-01-10', summary: 'Discussed essay themes and target schools' }
    ]
  },
  {
    id: 'demo-student-2',
    name: 'Marcus Johnson',
    avatar: undefined,
    gpa: 3.6,
    actScore: 32,
    completionPercentage: 60,
    essaysSubmitted: 2,
    totalEssays: 5,
    recommendationsRequested: 2,
    recommendationsSubmitted: 1,
    upcomingDeadlines: 4,
    status: 'needs-attention' as const,
    lastActivity: '1 day ago',
    targetSchools: ['MIT', 'Georgia Tech', 'Carnegie Mellon'],
    extracurriculars: ['Robotics Club', 'Math Olympiad'],
    tasks: [
      { id: '2', task: 'Complete Common App essays', dueDate: '2024-01-12', completed: false },
      { id: '3', task: 'Request teacher recommendations', dueDate: '2024-01-10', completed: true }
    ],
    meetingNotes: [
      { date: '2024-01-08', summary: 'Need to focus on essay completion and timeline management' }
    ]
  },
  {
    id: 'demo-student-3',
    name: 'Sophia Chen',
    avatar: undefined,
    gpa: 3.9,
    satScore: 1520,
    completionPercentage: 95,
    essaysSubmitted: 5,
    totalEssays: 5,
    recommendationsRequested: 3,
    recommendationsSubmitted: 3,
    upcomingDeadlines: 1,
    status: 'on-track' as const,
    lastActivity: '3 hours ago',
    targetSchools: ['Johns Hopkins', 'Duke', 'Northwestern'],
    extracurriculars: ['Pre-Med Club President', 'Hospital Volunteer'],
    tasks: [],
    meetingNotes: [
      { date: '2024-01-12', summary: 'All applications on track, preparing for interviews' }
    ]
  }
];

export const demoEssays = [
  {
    id: 'essay-1',
    title: 'Common App Personal Statement',
    studentName: 'Emma Thompson',
    studentId: 'demo-student-1',
    prompt: 'Some students have a background, identity, interest, or talent...',
    wordCount: 520,
    targetWords: 650,
    status: 'in-review' as const,
    aiScore: 78,
    lastUpdated: '2 hours ago',
    dueDate: '2024-01-15',
    essayType: 'common-app' as const,
    content: 'Growing up in a bilingual household, I often found myself serving as a bridge between two worlds...',
    feedback: ['Strong opening hook', 'Consider adding more specific examples'],
    versions: 3,
    urgent: false
  },
  {
    id: 'essay-2',
    title: 'Harvard Supplemental Essay',
    studentName: 'Marcus Johnson',
    studentId: 'demo-student-2',
    prompt: 'Briefly describe an intellectual experience...',
    wordCount: 450,
    targetWords: 500,
    status: 'submitted' as const,
    aiScore: 92,
    lastUpdated: '1 day ago',
    dueDate: '2024-01-20',
    essayType: 'supplemental' as const,
    content: 'The moment I discovered machine learning algorithms could predict stock market trends...',
    feedback: ['Excellent technical explanation', 'Great conclusion'],
    versions: 4,
    urgent: false
  }
];

export const demoApplications = [
  {
    id: 'app-1',
    studentName: 'Emma Thompson',
    studentId: 'demo-student-1',
    schoolName: 'Stanford University',
    program: 'Computer Science',
    applicationType: 'early-action' as const,
    deadline: '2024-01-15',
    requiredEssays: 3,
    completedEssays: 2,
    recommendationsRequested: 2,
    recommendationsSubmitted: 2,
    applicationStatus: 'in-progress' as const,
    completionPercentage: 85,
    urgent: false,
    aiScoreAvg: 82
  },
  {
    id: 'app-2',
    studentName: 'Marcus Johnson',
    studentId: 'demo-student-2',
    schoolName: 'MIT',
    program: 'Electrical Engineering',
    applicationType: 'early-action' as const,
    deadline: '2024-01-12',
    requiredEssays: 2,
    completedEssays: 1,
    recommendationsRequested: 3,
    recommendationsSubmitted: 1,
    applicationStatus: 'in-progress' as const,
    completionPercentage: 45,
    urgent: true,
    aiScoreAvg: 75
  }
];

export const demoConversations = [
  {
    id: 'conv-1',
    studentId: 'demo-student-1',
    studentName: 'Emma Thompson',
    parentName: 'Sarah Thompson',
    participants: ['Emma Thompson', 'Sarah Thompson'],
    lastMessage: "Thanks for the essay feedback! I'll work on the conclusion.",
    lastMessageTime: '2 hours ago',
    unreadCount: 0,
    status: 'active' as const,
    tags: ['essays', 'feedback']
  },
  {
    id: 'conv-2',
    studentId: 'demo-student-2',
    studentName: 'Marcus Johnson',
    parentName: 'Robert Johnson',
    participants: ['Marcus Johnson', 'Robert Johnson'],
    lastMessage: 'When is the next meeting scheduled?',
    lastMessageTime: '1 day ago',
    unreadCount: 2,
    status: 'urgent' as const,
    tags: ['deadlines', 'urgent']
  }
];

export const demoRecommendations = [
  {
    id: 'rec-1',
    studentId: 'demo-student-1',
    studentName: 'Emma Thompson',
    refereeName: 'Dr. Sarah Mitchell',
    refereeRole: 'AP Physics Teacher',
    status: 'sent' as const,
    createdAt: '2024-01-15'
  },
  {
    id: 'rec-2',
    studentId: 'demo-student-1',
    studentName: 'Emma Thompson',
    refereeName: 'Mr. David Chen',
    refereeRole: 'Mathematics Department Head',
    status: 'in_progress' as const,
    createdAt: '2024-01-18'
  }
];
