import { ITEMS_PER_PAGE } from "@/constants";
import { prisma } from "@/lib/prisma";
import type { PaginatedResult } from "@/types";

export async function getTopicsPaginated(params: {
  subjectId?: string;
  search?: string;
  page?: number;
  limit?: number;
} = {}) {
  const page = params.page ?? 1;
  const limit = params.limit ?? ITEMS_PER_PAGE;
  const skip = (page - 1) * limit;

  const where = {
    ...(params.subjectId && { subjectId: params.subjectId }),
    ...(params.search && {
      OR: [{ name: { contains: params.search, mode: "insensitive" as const } }],
    }),
  };

  const [data, total] = await Promise.all([
    prisma.topic.findMany({
      where,
      skip,
      take: limit,
      orderBy: { name: "asc" },
      include: {
        subject: { select: { id: true, name: true } },
        _count: { select: { questions: true } },
      },
    }),
    prisma.topic.count({ where }),
  ]);

  return {
    data,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  } satisfies PaginatedResult<(typeof data)[0]>;
}

export async function getTopicById(id: string) {
  return prisma.topic.findUnique({
    where: { id },
    include: {
      subject: { select: { id: true, name: true } },
      _count: { select: { questions: true } },
    },
  });
}
