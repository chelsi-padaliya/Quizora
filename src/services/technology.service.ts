import { ITEMS_PER_PAGE } from "@/constants";
import { prisma } from "@/lib/prisma";

export async function getTechnologiesPaginated(params: { page?: number; search?: string; limit?: number } = {}) {
  const page = params.page ?? 1;
  const limit = params.limit ?? ITEMS_PER_PAGE;
  const where = params.search ? { OR: [{ name: { contains: params.search, mode: "insensitive" as const } }, { slug: { contains: params.search, mode: "insensitive" as const } }] } : {};
  const [data, total] = await Promise.all([
    prisma.technology.findMany({ where, skip: (page - 1) * limit, take: limit, orderBy: { name: "asc" }, include: { _count: { select: { subjects: true } } } }),
    prisma.technology.count({ where }),
  ]);
  return { data, total, page, totalPages: Math.ceil(total / limit) };
}
