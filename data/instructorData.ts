// ─────────────────────────────────────────────────────────────────
//  Instructor mock data  (replace with real API calls)
// ─────────────────────────────────────────────────────────────────

export type Student = {
  id: string;
  name: string;
  avatar: string;
  email: string;
  joinedAt: string;
  status: "active" | "pending" | "suspended";
  scores: number[];
};

export type PendingRequest = {
  id: string;
  studentName: string;
  studentEmail: string;
  studentAvatar: string;
  requestedAt: string;
  /** admin_approved = instructor can now finalise the add */
  adminStatus: "awaiting_admin" | "admin_approved" | "admin_rejected";
};

export type Batch = {
  id: string;
  name: string;
  subject: string;
  description: string;
  students: Student[];
  pendingRequests: PendingRequest[];
  createdAt: string;
  quizCount: number;
  avgScore: number;
  color: string; // tailwind bg class stem e.g. "amber"
};

export type QuizOption = { id: string; text: string; isCorrect: boolean };
export type QuizQuestion = {
  id: string;
  type: "SINGLE_OPTION" | "MCQ" | "TRUE_FALSE";
  text: string;
  options: QuizOption[];
  points: number;
  explanation: string;
};
export type QuizSection = {
  id: string;
  title: string;
  questions: QuizQuestion[];
};
export type Quiz = {
  id: string;
  title: string;
  subject: string;
  batchId: string | null;
  batchName: string | null;
  status: "draft" | "published" | "closed";
  duration: number;
  sections: QuizSection[];
  createdAt: string;
  publishedAt: string | null;
  deadline: string | null;
  submissionCount: number;
  totalStudents: number;
  avgScore: number | null;
  passRate: number | null;
};

export type Submission = {
  id: string;
  quizId: string;
  studentId: string;
  studentName: string;
  studentAvatar: string;
  submittedAt: string;
  score: number;
  maxScore: number;
  pct: number;
  passed: boolean;
  timeTaken: number;
  answers: {
    questionId: string;
    correct: boolean;
    pointsEarned: number;
    maxPoints: number;
  }[];
};

// ── Students ──────────────────────────────────────────────────────
const STUDENTS: Student[] = [
  {
    id: "s1",
    name: "Arjun Sharma",
    avatar: "AS",
    email: "arjun@mail.com",
    joinedAt: "2025-09-01",
    status: "active",
    scores: [88, 91, 76, 95, 84],
  },
  {
    id: "s2",
    name: "Priya Nair",
    avatar: "PN",
    email: "priya@mail.com",
    joinedAt: "2025-09-01",
    status: "active",
    scores: [72, 68, 79, 65, 70],
  },
  {
    id: "s3",
    name: "Karan Mehta",
    avatar: "KM",
    email: "karan@mail.com",
    joinedAt: "2025-09-02",
    status: "active",
    scores: [95, 98, 92, 97, 96],
  },
  {
    id: "s4",
    name: "Sneha Iyer",
    avatar: "SI",
    email: "sneha@mail.com",
    joinedAt: "2025-09-03",
    status: "active",
    scores: [55, 60, 58, 62, 57],
  },
  {
    id: "s5",
    name: "Rohan Das",
    avatar: "RD",
    email: "rohan@mail.com",
    joinedAt: "2025-09-03",
    status: "active",
    scores: [80, 85, 78, 88, 82],
  },
  {
    id: "s6",
    name: "Isha Kulkarni",
    avatar: "IK",
    email: "isha@mail.com",
    joinedAt: "2025-09-05",
    status: "active",
    scores: [67, 72, 69, 74, 71],
  },
  {
    id: "s7",
    name: "Dev Patel",
    avatar: "DP",
    email: "dev@mail.com",
    joinedAt: "2025-09-06",
    status: "active",
    scores: [91, 88, 94, 90, 93],
  },
  {
    id: "s8",
    name: "Ananya Roy",
    avatar: "AR",
    email: "ananya@mail.com",
    joinedAt: "2025-09-07",
    status: "active",
    scores: [48, 52, 45, 55, 50],
  },
  {
    id: "s9",
    name: "Vikram Singh",
    avatar: "VS",
    email: "vikram@mail.com",
    joinedAt: "2025-09-10",
    status: "suspended",
    scores: [71, 66, 73, 68, 70],
  },
  {
    id: "s10",
    name: "Meera Pillai",
    avatar: "MP",
    email: "meera@mail.com",
    joinedAt: "2025-09-11",
    status: "active",
    scores: [83, 87, 85, 89, 86],
  },
  {
    id: "s11",
    name: "Aditya Gupta",
    avatar: "AG",
    email: "aditya@mail.com",
    joinedAt: "2025-09-12",
    status: "active",
    scores: [76, 80, 74, 82, 78],
  },
  {
    id: "s12",
    name: "Pooja Sharma",
    avatar: "PS",
    email: "pooja@mail.com",
    joinedAt: "2025-09-13",
    status: "active",
    scores: [60, 64, 58, 68, 63],
  },
];

// ── Batches ───────────────────────────────────────────────────────
export const mockBatches: Batch[] = [
  {
    id: "b1",
    name: "CSE-2026-A",
    subject: "Java & Spring Boot",
    description: "Full-stack Java cohort for 2026 graduating batch, Section A.",
    students: STUDENTS.slice(0, 6),
    pendingRequests: [
      {
        id: "pr1",
        studentName: "Nikhil Joshi",
        studentEmail: "nikhil@mail.com",
        studentAvatar: "NJ",
        requestedAt: "2026-02-20",
        adminStatus: "admin_approved",
      },
      {
        id: "pr2",
        studentName: "Tara Mishra",
        studentEmail: "tara@mail.com",
        studentAvatar: "TM",
        requestedAt: "2026-02-21",
        adminStatus: "awaiting_admin",
      },
      {
        id: "pr3",
        studentName: "Siddharth Rao",
        studentEmail: "sid@mail.com",
        studentAvatar: "SR",
        requestedAt: "2026-02-22",
        adminStatus: "admin_rejected",
      },
    ],
    createdAt: "2025-08-15",
    quizCount: 5,
    avgScore: 78,
    color: "amber",
  },
  {
    id: "b2",
    name: "CSE-2026-B",
    subject: "DBMS & OS",
    description: "Database and Operating Systems cohort, Section B.",
    students: STUDENTS.slice(6, 12),
    pendingRequests: [
      {
        id: "pr4",
        studentName: "Deepa Nair",
        studentEmail: "deepa@mail.com",
        studentAvatar: "DN",
        requestedAt: "2026-02-18",
        adminStatus: "admin_approved",
      },
    ],
    createdAt: "2025-08-20",
    quizCount: 3,
    avgScore: 71,
    color: "blue",
  },
  {
    id: "b3",
    name: "MBA-2026",
    subject: "IT Fundamentals",
    description: "IT fundamentals for MBA students, evening batch.",
    students: STUDENTS.slice(2, 8),
    pendingRequests: [],
    createdAt: "2025-09-01",
    quizCount: 2,
    avgScore: 66,
    color: "violet",
  },
];

// ── Quizzes ───────────────────────────────────────────────────────
export const mockQuizzes: Quiz[] = [
  {
    id: "q1",
    title: "Java Basics Test",
    subject: "Java",
    batchId: "b1",
    batchName: "CSE-2026-A",
    status: "closed",
    duration: 30,
    sections: [],
    createdAt: "2026-01-10",
    publishedAt: "2026-01-15",
    deadline: "2026-01-20",
    submissionCount: 6,
    totalStudents: 6,
    avgScore: 78,
    passRate: 83,
  },
  {
    id: "q2",
    title: "Spring Boot Fundamentals",
    subject: "Java",
    batchId: "b1",
    batchName: "CSE-2026-A",
    status: "closed",
    duration: 45,
    sections: [],
    createdAt: "2026-01-25",
    publishedAt: "2026-01-28",
    deadline: "2026-02-03",
    submissionCount: 5,
    totalStudents: 6,
    avgScore: 85,
    passRate: 100,
  },
  {
    id: "q3",
    title: "DBMS Mid Term",
    subject: "DBMS",
    batchId: "b2",
    batchName: "CSE-2026-B",
    status: "published",
    duration: 60,
    sections: [],
    createdAt: "2026-02-01",
    publishedAt: "2026-02-05",
    deadline: "2026-02-28",
    submissionCount: 4,
    totalStudents: 6,
    avgScore: 69,
    passRate: 75,
  },
  {
    id: "q4",
    title: "OS Processes & Scheduling",
    subject: "OS",
    batchId: "b2",
    batchName: "CSE-2026-B",
    status: "draft",
    duration: 45,
    sections: [],
    createdAt: "2026-02-10",
    publishedAt: null,
    deadline: null,
    submissionCount: 0,
    totalStudents: 6,
    avgScore: null,
    passRate: null,
  },
  {
    id: "q5",
    title: "Advanced OOP Concepts",
    subject: "Java",
    batchId: "b1",
    batchName: "CSE-2026-A",
    status: "published",
    duration: 40,
    sections: [],
    createdAt: "2026-02-14",
    publishedAt: "2026-02-16",
    deadline: "2026-03-01",
    submissionCount: 3,
    totalStudents: 6,
    avgScore: 88,
    passRate: 100,
  },
  {
    id: "q6",
    title: "IT Fundamentals Quiz 1",
    subject: "IT",
    batchId: "b3",
    batchName: "MBA-2026",
    status: "draft",
    duration: 20,
    sections: [],
    createdAt: "2026-02-20",
    publishedAt: null,
    deadline: null,
    submissionCount: 0,
    totalStudents: 6,
    avgScore: null,
    passRate: null,
  },
];

// ── Submissions ───────────────────────────────────────────────────
export const mockSubmissions: Submission[] = [
  {
    id: "sub1",
    quizId: "q1",
    studentId: "s1",
    studentName: "Arjun Sharma",
    studentAvatar: "AS",
    submittedAt: "2026-01-19T09:14:00Z",
    score: 16,
    maxScore: 20,
    pct: 80,
    passed: true,
    timeTaken: 24,
    answers: [],
  },
  {
    id: "sub2",
    quizId: "q1",
    studentId: "s2",
    studentName: "Priya Nair",
    studentAvatar: "PN",
    submittedAt: "2026-01-19T10:02:00Z",
    score: 12,
    maxScore: 20,
    pct: 60,
    passed: true,
    timeTaken: 29,
    answers: [],
  },
  {
    id: "sub3",
    quizId: "q1",
    studentId: "s3",
    studentName: "Karan Mehta",
    studentAvatar: "KM",
    submittedAt: "2026-01-18T14:33:00Z",
    score: 19,
    maxScore: 20,
    pct: 95,
    passed: true,
    timeTaken: 18,
    answers: [],
  },
  {
    id: "sub4",
    quizId: "q1",
    studentId: "s4",
    studentName: "Sneha Iyer",
    studentAvatar: "SI",
    submittedAt: "2026-01-20T11:20:00Z",
    score: 9,
    maxScore: 20,
    pct: 45,
    passed: false,
    timeTaken: 30,
    answers: [],
  },
  {
    id: "sub5",
    quizId: "q1",
    studentId: "s5",
    studentName: "Rohan Das",
    studentAvatar: "RD",
    submittedAt: "2026-01-19T16:45:00Z",
    score: 15,
    maxScore: 20,
    pct: 75,
    passed: true,
    timeTaken: 27,
    answers: [],
  },
  {
    id: "sub6",
    quizId: "q1",
    studentId: "s6",
    studentName: "Isha Kulkarni",
    studentAvatar: "IK",
    submittedAt: "2026-01-20T09:05:00Z",
    score: 13,
    maxScore: 20,
    pct: 65,
    passed: true,
    timeTaken: 28,
    answers: [],
  },
  {
    id: "sub7",
    quizId: "q2",
    studentId: "s1",
    studentName: "Arjun Sharma",
    studentAvatar: "AS",
    submittedAt: "2026-02-02T10:10:00Z",
    score: 36,
    maxScore: 40,
    pct: 90,
    passed: true,
    timeTaken: 38,
    answers: [],
  },
  {
    id: "sub8",
    quizId: "q2",
    studentId: "s2",
    studentName: "Priya Nair",
    studentAvatar: "PN",
    submittedAt: "2026-02-02T11:44:00Z",
    score: 32,
    maxScore: 40,
    pct: 80,
    passed: true,
    timeTaken: 44,
    answers: [],
  },
  {
    id: "sub9",
    quizId: "q2",
    studentId: "s3",
    studentName: "Karan Mehta",
    studentAvatar: "KM",
    submittedAt: "2026-02-01T15:22:00Z",
    score: 40,
    maxScore: 40,
    pct: 100,
    passed: true,
    timeTaken: 31,
    answers: [],
  },
  {
    id: "sub10",
    quizId: "q2",
    studentId: "s5",
    studentName: "Rohan Das",
    studentAvatar: "RD",
    submittedAt: "2026-02-03T08:50:00Z",
    score: 34,
    maxScore: 40,
    pct: 85,
    passed: true,
    timeTaken: 41,
    answers: [],
  },
  {
    id: "sub11",
    quizId: "q2",
    studentId: "s6",
    studentName: "Isha Kulkarni",
    studentAvatar: "IK",
    submittedAt: "2026-02-03T09:30:00Z",
    score: 30,
    maxScore: 40,
    pct: 75,
    passed: true,
    timeTaken: 43,
    answers: [],
  },
  {
    id: "sub12",
    quizId: "q3",
    studentId: "s7",
    studentName: "Dev Patel",
    studentAvatar: "DP",
    submittedAt: "2026-02-12T14:00:00Z",
    score: 42,
    maxScore: 60,
    pct: 70,
    passed: true,
    timeTaken: 55,
    answers: [],
  },
  {
    id: "sub13",
    quizId: "q3",
    studentId: "s8",
    studentName: "Ananya Roy",
    studentAvatar: "AR",
    submittedAt: "2026-02-13T11:11:00Z",
    score: 24,
    maxScore: 60,
    pct: 40,
    passed: false,
    timeTaken: 60,
    answers: [],
  },
  {
    id: "sub14",
    quizId: "q3",
    studentId: "s10",
    studentName: "Meera Pillai",
    studentAvatar: "MP",
    submittedAt: "2026-02-13T15:40:00Z",
    score: 48,
    maxScore: 60,
    pct: 80,
    passed: true,
    timeTaken: 50,
    answers: [],
  },
  {
    id: "sub15",
    quizId: "q3",
    studentId: "s11",
    studentName: "Aditya Gupta",
    studentAvatar: "AG",
    submittedAt: "2026-02-14T09:00:00Z",
    score: 39,
    maxScore: 60,
    pct: 65,
    passed: true,
    timeTaken: 58,
    answers: [],
  },
  {
    id: "sub16",
    quizId: "q5",
    studentId: "s1",
    studentName: "Arjun Sharma",
    studentAvatar: "AS",
    submittedAt: "2026-02-20T10:00:00Z",
    score: 36,
    maxScore: 40,
    pct: 90,
    passed: true,
    timeTaken: 33,
    answers: [],
  },
  {
    id: "sub17",
    quizId: "q5",
    studentId: "s3",
    studentName: "Karan Mehta",
    studentAvatar: "KM",
    submittedAt: "2026-02-20T11:30:00Z",
    score: 38,
    maxScore: 40,
    pct: 95,
    passed: true,
    timeTaken: 28,
    answers: [],
  },
  {
    id: "sub18",
    quizId: "q5",
    studentId: "s7",
    studentName: "Dev Patel",
    studentAvatar: "DP",
    submittedAt: "2026-02-21T14:10:00Z",
    score: 32,
    maxScore: 40,
    pct: 80,
    passed: true,
    timeTaken: 38,
    answers: [],
  },
];
