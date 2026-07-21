import { ITEMS_PER_PAGE } from "@/constants";
import { prisma } from "@/lib/prisma";
import type { PaginatedResult } from "@/types";

export async function getSubjectsPaginated(params: {
  technologyId?: string;
  search?: string;
  page?: number;
  limit?: number;
} = {}) {
  const page = params.page ?? 1;
  const limit = params.limit ?? ITEMS_PER_PAGE;
  const skip = (page - 1) * limit;

  const where: { technologyId?: string; OR?: { name?: { contains: string; mode: "insensitive" }; slug?: { contains: string; mode: "insensitive" } }[] } = params.search
    ? {
        OR: [
          { name: { contains: params.search, mode: "insensitive" as const } },
          { slug: { contains: params.search, mode: "insensitive" as const } },
        ],
      }
    : {};
  if (params.technologyId) Object.assign(where, { technologyId: params.technologyId });

  const [data, total] = await Promise.all([
    prisma.subject.findMany({
      where,
      skip,
      take: limit,
      orderBy: { name: "asc" },
      include: {
        technology: { select: { id: true, name: true } },
        _count: { select: { questions: true, topics: true } },
      },
    }),
    prisma.subject.count({ where }),
  ]);

  return {
    data,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  } satisfies PaginatedResult<(typeof data)[0]>;
}

export async function getSubjectById(id: string) {
  return prisma.subject.findUnique({
    where: { id },
    include: {
      topics: { orderBy: { name: "asc" } },
      _count: { select: { questions: true, topics: true } },
    },
  });
}
