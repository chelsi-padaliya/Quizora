import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const questionSchema = z.object({
  subjectId: z.string().optional().nullable(),
  topicId: z.string().optional().nullable(),
  type: z.enum(["quiz", "theory"]),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]).default("beginner"),
  question: z.string().optional().nullable(),
  optionA: z.string().optional().nullable(),
  optionB: z.string().optional().nullable(),
  optionC: z.string().optional().nullable(),
  optionD: z.string().optional().nullable(),
  correctAnswer: z.string().optional().nullable(),
  explanation: z.string().optional().nullable(),
  answer: z.string().optional().nullable(),
});

export const bulkImportSchema = z.object({
  questions: z.array(questionSchema).min(1, "At least one question is required"),
});

export const quizConfigSchema = z.object({
  subjectId: z.string().optional(),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]).optional(),
  limit: z.union([z.literal(10), z.literal(20), z.literal(50), z.literal(100), z.literal("all")]),
  timerEnabled: z.boolean().default(false),
  timerMinutes: z.number().min(1).max(180).optional(),
});

export const subjectSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  slug: z
    .string()
    .optional()
    .transform((val) => (val === "" ? undefined : val))
    .pipe(
      z
        .string()
        .min(2, "Slug must be at least 2 characters")
        .regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers, and hyphens")
        .optional()
    ),
});

export const topicSchema = z.object({
  subjectId: z.string().min(1, "Subject is required"),
  name: z.string().min(2, "Name must be at least 2 characters"),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type QuestionInput = z.infer<typeof questionSchema>;
export type QuizConfigInput = z.infer<typeof quizConfigSchema>;
export type SubjectInput = z.infer<typeof subjectSchema>;
export type TopicInput = z.infer<typeof topicSchema>;
