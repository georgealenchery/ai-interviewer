export type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
};

export type InterviewState = {
  messages: Message[];
  question: string;
  isLoading: boolean;
};

// TODO: Add InterviewConfig type to carry SetupDashboard selections to the backend
// export type InterviewConfig = {
//   role: string;
//   questionType: "behavioral" | "technical" | "hybrid";
//   difficulty: number;       // 0–100
//   strictness: number;       // 0–100
//   experienceLevel: number;  // 0–3 (Intern → Senior)
//   interviewer: string;      // "Cassidy" | "Alex" | "Jordan"
// };

// TODO: Add FeedbackResult type to match AnalyticsDashboard display and backend evaluation response
// export type FeedbackResult = {
//   score: number;
//   communication: number;
//   technicalAccuracy: number;
//   problemSolving: number;
//   strengths: string[];
//   improvements: string[];
//   nextSteps: string[];
// };
