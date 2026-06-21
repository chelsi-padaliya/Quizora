"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { PASS_THRESHOLD } from "@/constants";
import { calculateScore } from "@/lib/utils";
import { requireAdmin } from "@/lib/auth-utils";
import type { ActionResult, QuizAnswer, QuizResult } from "@/types";
import { questionSchema, type QuestionInput } from "@/validations";
import { revalidatePath } from "next/cache";
import { getQuizQuestions } from "@/services/question.service";

const QUESTION_PATHS = [
  "/dashboard",
  "/admin/questions",
  "/admin/quiz-questions",
  "/admin/theory-questions",
  "/admin/short-answer-questions",
  "/quiz",
  "/theory",
  "/short-answer",
  "/search",
];

function revalidateQuestionPaths() {
  QUESTION_PATHS.forEach((path) => revalidatePath(path));
}

export async function createQuestion(input: QuestionInput): Promise<ActionResult<{ id: string }>> {
  try {
    await requireAdmin();

    const parsed = questionSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, error: parsed.error.errors[0]?.message ?? "Validation failed" };
    }

    const question = await prisma.question.create({
      data: {
        subjectId: parsed.data.subjectId || null,
        topicId: parsed.data.topicId || null,
        type: parsed.data.type,
        difficulty: parsed.data.difficulty,
        question: parsed.data.question || null,
        optionA: parsed.data.optionA ?? null,
        optionB: parsed.data.optionB ?? null,
        optionC: parsed.data.optionC ?? null,
        optionD: parsed.data.optionD ?? null,
        correctAnswer: parsed.data.correctAnswer ?? null,
        explanation: parsed.data.explanation ?? null,
        answer: parsed.data.answer ?? null,
      },
    });

    revalidateQuestionPaths();

    return { success: true, data: { id: question.id } };
  } catch {
    return { success: false, error: "Failed to create question" };
  }
}

export async function updateQuestion(
  id: string,
  input: QuestionInput
): Promise<ActionResult> {
  try {
    await requireAdmin();

    const parsed = questionSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, error: parsed.error.errors[0]?.message ?? "Validation failed" };
    }

    await prisma.question.update({
      where: { id },
      data: {
        subjectId: parsed.data.subjectId || null,
        topicId: parsed.data.topicId || null,
        type: parsed.data.type,
        difficulty: parsed.data.difficulty,
        question: parsed.data.question || null,
        optionA: parsed.data.optionA ?? null,
        optionB: parsed.data.optionB ?? null,
        optionC: parsed.data.optionC ?? null,
        optionD: parsed.data.optionD ?? null,
        correctAnswer: parsed.data.correctAnswer ?? null,
        explanation: parsed.data.explanation ?? null,
        answer: parsed.data.answer ?? null,
      },
    });

    revalidateQuestionPaths();

    return { success: true };
  } catch {
    return { success: false, error: "Failed to update question" };
  }
}

export async function duplicateQuestion(id: string): Promise<ActionResult<{ id: string }>> {
  try {
    await requireAdmin();

    const original = await prisma.question.findUnique({ where: { id } });
    if (!original) return { success: false, error: "Question not found" };

    const question = await prisma.question.create({
      data: {
        subjectId: original.subjectId,
        topicId: original.topicId,
        type: original.type,
        difficulty: original.difficulty,
        question: original.question ? `${original.question} (Copy)` : null,
        optionA: original.optionA,
        optionB: original.optionB,
        optionC: original.optionC,
        optionD: original.optionD,
        correctAnswer: original.correctAnswer,
        explanation: original.explanation,
        answer: original.answer,
      },
    });

    revalidateQuestionPaths();
    return { success: true, data: { id: question.id } };
  } catch {
    return { success: false, error: "Failed to duplicate question" };
  }
}

export async function deleteQuestion(id: string): Promise<ActionResult> {
  try {
    await requireAdmin();

    await prisma.question.delete({ where: { id } });

    revalidateQuestionPaths();

    return { success: true };
  } catch {
    return { success: false, error: "Failed to delete question" };
  }
}

import type { BulkImportRawRow, BulkImportPreviewRow, BulkImportResult } from "@/lib/bulk-import-utils";

export type { BulkImportRawRow, BulkImportPreviewRow, BulkImportResult };

export interface BulkImportOptions {
  type: "quiz" | "theory" | "short_answer";
  skipDuplicates: boolean;
  updateExisting: boolean;
  dryRun?: boolean;
}

const DIFFICULTY_MAP: Record<string, "beginner" | "intermediate" | "advanced"> = {
  beginner: "beginner",
  intermediate: "intermediate",
  advanced: "advanced",
};

function normalizeDifficulty(value: string): "beginner" | "intermediate" | "advanced" | null {
  return DIFFICULTY_MAP[value.trim().toLowerCase()] ?? null;
}

async function buildImportLookups() {
  const [subjects, topics] = await Promise.all([
    prisma.subject.findMany({ select: { id: true, name: true } }),
    prisma.topic.findMany({ select: { id: true, name: true, subjectId: true } }),
  ]);

  const subjectMap = new Map<string, string>();
  subjects.forEach((s) => subjectMap.set(s.name.toLowerCase(), s.id));

  const topicMap = new Map<string, string>();
  topics.forEach((t) => topicMap.set(`${t.subjectId}:${t.name.toLowerCase()}`, t.id));

  return { subjectMap, topicMap };
}

function resolveRowToInput(
  row: BulkImportRawRow,
  rowIndex: number,
  type: "quiz" | "theory" | "short_answer",
  subjectMap: Map<string, string>,
  topicMap: Map<string, string>
): { input?: QuestionInput; error?: string } {
  const subjectName = row.subject?.trim();
  if (!subjectName) return { error: "Subject is required" };

  const subjectId = subjectMap.get(subjectName.toLowerCase());
  if (!subjectId) return { error: `Subject "${subjectName}" not found` };

  const difficulty = normalizeDifficulty(row.difficulty);
  if (!difficulty) return { error: `Invalid difficulty "${row.difficulty}"` };

  const questionText = row.question?.trim();
  if (!questionText || questionText.length < 5) {
    return { error: "Question must be at least 5 characters" };
  }

  let topicId: string | undefined;
  if (row.topic?.trim()) {
    topicId = topicMap.get(`${subjectId}:${row.topic.trim().toLowerCase()}`);
  }

  const input: QuestionInput = {
    subjectId,
    topicId,
    type,
    difficulty,
    question: questionText,
    optionA: row.optionA,
    optionB: row.optionB,
    optionC: row.optionC,
    optionD: row.optionD,
    correctAnswer: row.correctAnswer?.toUpperCase(),
    explanation: row.explanation,
    answer: row.answer,
  };

  const parsed = questionSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Validation failed" };
  }

  return { input: parsed.data };
}

export async function previewBulkImport(
  rows: BulkImportRawRow[],
  type: "quiz" | "theory" | "short_answer"
): Promise<ActionResult<{ preview: BulkImportPreviewRow[]; duplicateCount: number }>> {
  try {
    await requireAdmin();

    const { subjectMap, topicMap } = await buildImportLookups();
    const existingQuestions = await prisma.question.findMany({
      where: { type },
      select: { id: true, subjectId: true, question: true },
    });

    const duplicateSet = new Set(
      existingQuestions.map((q) => `${q.subjectId}:${(q.question || "").trim().toLowerCase()}`)
    );

    let duplicateCount = 0;
    const preview: BulkImportPreviewRow[] = rows.map((row, index) => {
      const { input, error } = resolveRowToInput(row, index + 1, type, subjectMap, topicMap);
      let isDuplicate = false;

      if (input) {
        const key = `${input.subjectId}:${(input.question || "").trim().toLowerCase()}`;
        isDuplicate = duplicateSet.has(key);
        if (isDuplicate) duplicateCount++;
      }

      return {
        ...row,
        rowIndex: index + 1,
        isDuplicate,
        error,
      };
    });

    return { success: true, data: { preview, duplicateCount } };
  } catch {
    return { success: false, error: "Failed to preview import" };
  }
}

export async function bulkImportQuestionsFromRows(
  rows: BulkImportRawRow[],
  options: BulkImportOptions
): Promise<ActionResult<BulkImportResult>> {
  try {
    await requireAdmin();

    const { subjectMap, topicMap } = await buildImportLookups();
    const existingQuestions = await prisma.question.findMany({
      where: { type: options.type },
      select: { id: true, subjectId: true, question: true },
    });

    const duplicateMap = new Map<string, string>();
    existingQuestions.forEach((q) => {
      duplicateMap.set(`${q.subjectId}:${(q.question || "").trim().toLowerCase()}`, q.id);
    });

    const result: BulkImportResult = {
      total: rows.length,
      imported: 0,
      updated: 0,
      skipped: 0,
      duplicates: 0,
      errors: [],
    };

    for (let i = 0; i < rows.length; i++) {
      const rowIndex = i + 1;
      const row = rows[i];
      const { input, error } = resolveRowToInput(
        row,
        rowIndex,
        options.type,
        subjectMap,
        topicMap
      );

      if (error || !input) {
        result.skipped++;
        result.errors.push({ row: rowIndex, message: error ?? "Invalid row" });
        continue;
      }

      const dupKey = `${input.subjectId}:${(input.question || "").trim().toLowerCase()}`;
      const existingId = duplicateMap.get(dupKey);

      if (existingId && existingId !== "new") {
        result.duplicates++;
        if (options.updateExisting) {
          if (!options.dryRun) {
            await prisma.question.update({
              where: { id: existingId },
              data: {
                topicId: input.topicId || null,
                difficulty: input.difficulty,
                question: input.question,
                optionA: input.optionA ?? null,
                optionB: input.optionB ?? null,
                optionC: input.optionC ?? null,
                optionD: input.optionD ?? null,
                correctAnswer: input.correctAnswer ?? null,
                explanation: input.explanation ?? null,
                answer: input.answer ?? null,
              },
            });
          }
          result.updated++;
          continue;
        }
        if (options.skipDuplicates) {
          result.skipped++;
          continue;
        }
      }

      if (!options.dryRun) {
        await prisma.question.create({
          data: {
            subjectId: input.subjectId,
            topicId: input.topicId || null,
            type: input.type,
            difficulty: input.difficulty,
            question: input.question,
            optionA: input.optionA ?? null,
            optionB: input.optionB ?? null,
            optionC: input.optionC ?? null,
            optionD: input.optionD ?? null,
            correctAnswer: input.correctAnswer ?? null,
            explanation: input.explanation ?? null,
            answer: input.answer ?? null,
          },
        });
        duplicateMap.set(dupKey, "new");
      }
      result.imported++;
    }

    if (!options.dryRun) {
      revalidateQuestionPaths();
    }

    return { success: true, data: result };
  } catch {
    return { success: false, error: "Failed to import questions" };
  }
}

export async function bulkImportQuestions(
  questions: QuestionInput[]
): Promise<ActionResult<{ imported: number; skipped: number }>> {
  try {
    await requireAdmin();

    let imported = 0;
    let skipped = 0;
    for (const q of questions) {
      const parsed = questionSchema.safeParse(q);
      if (!parsed.success) {
        skipped++;
        continue;
      }

      await prisma.question.create({
        data: {
          subjectId: parsed.data.subjectId || null,
          topicId: parsed.data.topicId || null,
          type: parsed.data.type,
          difficulty: parsed.data.difficulty,
          question: parsed.data.question || null,
          optionA: parsed.data.optionA ?? null,
          optionB: parsed.data.optionB ?? null,
          optionC: parsed.data.optionC ?? null,
          optionD: parsed.data.optionD ?? null,
          correctAnswer: parsed.data.correctAnswer ?? null,
          explanation: parsed.data.explanation ?? null,
          answer: parsed.data.answer ?? null,
        },
      });
      imported++;
    }

    revalidateQuestionPaths();

    return { success: true, data: { imported, skipped } };
  } catch {
    return { success: false, error: "Failed to import questions" };
  }
}

export async function submitQuiz(params: {
  subjectId?: string;
  answers: Record<string, { selected: string | null; skipped: boolean }>;
  questionIds: string[];
}): Promise<ActionResult<QuizResult>> {
  try {
    const session = await auth();
    if (!session?.user) return { success: false, error: "Unauthorized" };

    const questions = await getQuizQuestions({
      subjectId: params.subjectId,
      limit: "all",
    });

    const quizQuestions = questions.filter((q) => params.questionIds.includes(q.id));

    const results: QuizAnswer[] = quizQuestions.map((q) => {
      const userAnswer = params.answers[q.id];
      const selected = userAnswer?.selected ?? null;
      const skipped = userAnswer?.skipped ?? false;
      const isCorrect = !skipped && selected === q.correctAnswer;

      return {
        questionId: q.id,
        selectedAnswer: selected,
        correctAnswer: q.correctAnswer,
        isCorrect,
        skipped,
      };
    });

    const correctAnswers = results.filter((r) => r.isCorrect).length;
    const wrongAnswers = results.filter((r) => !r.isCorrect && !r.skipped).length;
    const totalQuestions = results.length;
    const score = calculateScore(correctAnswers, totalQuestions);

    await prisma.quizAttempt.create({
      data: {
        userId: session.user.id,
        subjectId: params.subjectId ?? null,
        score,
        totalQuestions,
        correctAnswers,
        wrongAnswers,
        answers: results as unknown as Prisma.InputJsonValue,
      },
    });

    revalidatePath("/dashboard");

    return {
      success: true,
      data: {
        score,
        totalQuestions,
        correctAnswers,
        wrongAnswers,
        passed: score >= PASS_THRESHOLD,
        answers: results,
        questions: quizQuestions,
      },
    };
  } catch {
    return { success: false, error: "Failed to submit quiz" };
  }
}

export async function logoutAction() {
  const { signOut } = await import("@/auth");
  await signOut({ redirectTo: "/login" });
}
