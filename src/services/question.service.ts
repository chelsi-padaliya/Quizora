import { ITEMS_PER_PAGE } from "@/constants";
import { prisma } from "@/lib/prisma";
import { shuffleArray } from "@/lib/utils";
import type {
  DashboardStats,
  PaginatedResult,
  QuizQuestion,
  RecentActivity,
  TheoryQuestionItem,
} from "@/types";
import { Difficulty, Prisma, QuestionType } from "@prisma/client";

export async function getDashboardStats(): Promise<DashboardStats> {
  const [totalSubjects, totalQuestions, totalQuizQuestions, totalTheoryQuestions, totalShortAnswerQuestions] =
    await Promise.all([
      prisma.subject.count(),
      prisma.question.count(),
      prisma.question.count({ where: { type: "quiz" } }),
      prisma.question.count({ where: { type: "theory" } }),
      prisma.question.count({ where: { type: "short_answer" } }),
    ]);

  return { totalSubjects, totalQuestions, totalQuizQuestions, totalTheoryQuestions, totalShortAnswerQuestions };
}

export async function getRecentActivity(limit = 10): Promise<RecentActivity[]> {
  const [attempts, questions] = await Promise.all([
    prisma.quizAttempt.findMany({
      take: limit,
      orderBy: { createdAt: "desc" },
      include: { subject: true },
    }),
    prisma.question.findMany({
      take: limit,
      orderBy: { createdAt: "desc" },
      include: { subject: true },
    }),
  ]);

  const activities: RecentActivity[] = [
    ...attempts.map((a) => ({
      id: a.id,
      type: "quiz_attempt" as const,
      title: `Quiz completed${a.subject ? ` - ${a.subject.name}` : ""}`,
      description: `Score: ${a.score}% (${a.correctAnswers}/${a.totalQuestions} correct)`,
      createdAt: a.createdAt,
    })),
    ...questions.map((q) => ({
      id: q.id,
      type: "question_created" as const,
      title: `New ${q.type} question added`,
      description: `${q.subject?.name || "General"}: ${q.question?.slice(0, 80) || ""}...`,
      createdAt: q.createdAt,
    })),
  ];

  return activities
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, limit);
}

export async function getSubjects() {
  return prisma.subject.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: { select: { questions: true } },
    },
  });
}

export async function getSubjectBySlug(slug: string) {
  return prisma.subject.findUnique({
    where: { slug },
    include: {
      topics: { orderBy: { name: "asc" } },
      _count: { select: { questions: true } },
    },
  });
}

export async function getTopicsBySubject(subjectId: string) {
  return prisma.topic.findMany({
    where: { subjectId },
    orderBy: { name: "asc" },
  });
}

export async function getTopics() {
  return prisma.topic.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, subjectId: true },
  });
}

export async function getQuizQuestions(params: {
  subjectId?: string;
  topicId?: string;
  difficulty?: Difficulty;
  limit?: number | "all";
  type?: "quiz" | "short_answer";
}): Promise<QuizQuestion[]> {
  const where: Prisma.QuestionWhereInput = {
    type: params.type ?? "quiz",
    ...(params.subjectId && { subjectId: params.subjectId }),
    ...(params.topicId && { topicId: params.topicId }),
    ...(params.difficulty && { difficulty: params.difficulty }),
  };

  if (params.limit && params.limit !== "all") {
    const allIds = await prisma.question.findMany({
      where,
      select: { id: true },
    });

    if (allIds.length === 0) return [];

    const shuffledIds = shuffleArray(allIds.map((q) => q.id));
    const targetIds = shuffledIds.slice(0, params.limit);

    const questions = await prisma.question.findMany({
      where: { id: { in: targetIds } },
      include: {
        subject: { select: { id: true, name: true, slug: true } },
        topic: { select: { id: true, name: true } },
      },
    });

    return shuffleArray(questions) as unknown as QuizQuestion[];
  }

  const questions = await prisma.question.findMany({
    where,
    include: {
      subject: { select: { id: true, name: true, slug: true } },
      topic: { select: { id: true, name: true } },
    },
  });

  return shuffleArray(questions) as unknown as QuizQuestion[];
}

export async function getTheoryQuestions(params: {
  subjectId?: string;
  difficulty?: Difficulty;
  search?: string;
  page?: number;
  limit?: number;
}): Promise<PaginatedResult<TheoryQuestionItem>> {
  const page = params.page ?? 1;
  const limit = params.limit ?? ITEMS_PER_PAGE;
  const skip = (page - 1) * limit;

  const where: Prisma.QuestionWhereInput = {
    type: "theory",
    ...(params.subjectId && { subjectId: params.subjectId }),
    ...(params.difficulty && { difficulty: params.difficulty }),
    ...(params.search && {
      OR: [
        { question: { contains: params.search, mode: "insensitive" } },
        { answer: { contains: params.search, mode: "insensitive" } },
      ],
    }),
  };

  const [data, total] = await Promise.all([
    prisma.question.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        subject: { select: { id: true, name: true, slug: true } },
        topic: { select: { id: true, name: true } },
      },
    }),
    prisma.question.count({ where }),
  ]);

  return {
    data: data as unknown as TheoryQuestionItem[],
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getQuestions(params: {
  subjectId?: string;
  type?: QuestionType;
  difficulty?: Difficulty;
  search?: string;
  page?: number;
  limit?: number;
}) {
  const page = params.page ?? 1;
  const limit = params.limit ?? ITEMS_PER_PAGE;
  const skip = (page - 1) * limit;

  const where: Prisma.QuestionWhereInput = {
    ...(params.subjectId && { subjectId: params.subjectId }),
    ...(params.type && { type: params.type }),
    ...(params.difficulty && { difficulty: params.difficulty }),
    ...(params.search && {
      OR: [
        { question: { contains: params.search, mode: "insensitive" } },
        { answer: { contains: params.search, mode: "insensitive" } },
      ],
    }),
  };

  const [data, total] = await Promise.all([
    prisma.question.findMany({
      where,
      skip,
      take: limit,
      orderBy: [{ createdAt: "asc" }, { id: "asc" }],
      include: {
        subject: true,
        topic: true,
      },
    }),
    prisma.question.count({ where }),
  ]);

  return { data, total, page, totalPages: Math.ceil(total / limit) };
}

export async function getQuestionById(id: string) {
  return prisma.question.findUnique({
    where: { id },
    include: { subject: true, topic: true },
  });
}

export async function searchQuestions(query: string, limit = 10) {
  return prisma.question.findMany({
    where: {
      OR: [
        { question: { contains: query, mode: "insensitive" } },
        { answer: { contains: query, mode: "insensitive" } },
        { explanation: { contains: query, mode: "insensitive" } },
      ],
    },
    take: limit,
    include: { subject: true },
  });
}

export async function getSubjectQuestionCounts() {
  return prisma.subject.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: {
        select: {
          questions: true,
        },
      },
    },
  });
}
