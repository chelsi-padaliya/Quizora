import { cache } from "react";
import { Difficulty, QuestionType } from "@prisma/client";
import { getQuestions, getSubjects } from "@/services/question.service";
import { getSubjectsPaginated } from "@/services/subject.service";
import { getTopicsPaginated } from "@/services/topic.service";
import { prisma } from "@/lib/prisma";
import { ITEMS_PER_PAGE } from "@/constants";

export const getCachedSubjects = cache(() => getSubjects());

export const getCachedTopics = cache(() =>
  prisma.topic.findMany({ orderBy: { name: "asc" } })
);

export function parsePageParam(page?: string): number {
  const n = Number(page ?? "1");
  return Number.isFinite(n) && n > 0 ? n : 1;
}

export async function fetchAdminQuestions(params: {
  page?: string;
  search?: string;
  subjectId?: string;
  difficulty?: string;
  type?: QuestionType;
}) {
  const page = parsePageParam(params.page);

  return getQuestions({
    page,
    limit: ITEMS_PER_PAGE,
    type: params.type,
    search: params.search,
    subjectId: params.subjectId,
    difficulty: params.difficulty as Difficulty | undefined,
  });
}

export async function fetchAdminSubjects(params: { page?: string; search?: string }) {
  return getSubjectsPaginated({
    page: parsePageParam(params.page),
    search: params.search,
  });
}

export async function fetchAdminTopics(params: {
  page?: string;
  search?: string;
  subjectId?: string;
}) {
  return getTopicsPaginated({
    page: parsePageParam(params.page),
    search: params.search,
    subjectId: params.subjectId,
  });
}
