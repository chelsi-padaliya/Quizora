export const APP_NAME = "Quizora";
export const APP_DESCRIPTION =
  "Personal interview preparation platform for backend, JavaScript, React, and system design practice.";

export const SUBJECTS = [
  { name: "JavaScript", slug: "javascript" },
  { name: "React", slug: "react" },
  { name: "Node.js", slug: "nodejs" },
  { name: "Express.js", slug: "expressjs" },
  { name: "MongoDB", slug: "mongodb" },
  { name: "SQL", slug: "sql" },
  { name: "PostgreSQL", slug: "postgresql" },
  { name: "Redis", slug: "redis" },
  { name: "JWT", slug: "jwt" },
  { name: "API", slug: "api" },
  { name: "Git", slug: "git" },
  { name: "Laravel", slug: "laravel" },
  { name: "PHP", slug: "php" },
  { name: "System Design", slug: "system-design" },
] as const;

export const DIFFICULTIES = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
] as const;

export const QUESTION_LIMITS = [10, 20, 50, 100, "all"] as const;

export const PASS_THRESHOLD = 60;

export const ITEMS_PER_PAGE = 10;

export const ROUTES = {
  login: "/login",
  dashboard: "/dashboard",
  quiz: "/quiz",
  theory: "/theory",
  questions: "/admin/questions",
  quizQuestions: "/admin/quiz-questions",
  theoryQuestions: "/admin/theory-questions",
  subjects: "/admin/subjects",
  topics: "/admin/topics",
  quizResults: "/quiz/results",
  shortAnswer: "/short-answer",
  shortAnswerQuestions: "/admin/short-answer-questions",
} as const;
