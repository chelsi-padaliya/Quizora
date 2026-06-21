import { Difficulty, QuestionType } from "@prisma/client";

export type { User, Subject, Topic, Question, QuizAttempt } from "@prisma/client";

export interface DashboardStats {
  totalSubjects: number;
  totalQuestions: number;
  totalQuizQuestions: number;
  totalTheoryQuestions: number;
}

export interface RecentActivity {
  id: string;
  type: "quiz_attempt" | "question_created";
  title: string;
  description: string;
  createdAt: Date;
}

export interface QuizQuestion {
  id: string;
  question: string;
  optionA: string | null;
  optionB: string | null;
  optionC: string | null;
  optionD: string | null;
  correctAnswer: string | null;
  explanation: string | null;
  difficulty: Difficulty;
  subject: { id: string; name: string; slug: string } | null;
  topic: { id: string; name: string } | null;
}

export interface TheoryQuestionItem {
  id: string;
  question: string;
  answer: string | null;
  difficulty: Difficulty;
  subject: { id: string; name: string; slug: string } | null;
  topic: { id: string; name: string } | null;
}

export interface QuizAnswer {
  questionId: string;
  selectedAnswer: string | null;
  correctAnswer: string | null;
  isCorrect: boolean;
  skipped: boolean;
}

export interface QuizResult {
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  passed: boolean;
  answers: QuizAnswer[];
  questions: QuizQuestion[];
}

export interface QuestionFormData {
  subjectId: string;
  topicId?: string;
  type: QuestionType;
  difficulty: Difficulty;
  question: string;
  optionA?: string;
  optionB?: string;
  optionC?: string;
  optionD?: string;
  correctAnswer?: string;
  explanation?: string;
  answer?: string;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
}

export interface ActionResult<T = void> {
  success: boolean;
  data?: T;
  error?: string;
}
