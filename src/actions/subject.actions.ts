"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-utils";
import { slugify } from "@/lib/utils";
import type { ActionResult } from "@/types";
import { subjectSchema, type SubjectInput } from "@/validations";
import { revalidatePath } from "next/cache";

const ADMIN_PATHS = [
  "/admin/subjects",
  "/admin/topics",
  "/admin/questions",
  "/admin/quiz-questions",
  "/admin/theory-questions",
  "/dashboard",
];

function revalidateAdmin() {
  ADMIN_PATHS.forEach((path) => revalidatePath(path));
}

async function getSubjectConflict(name: string, slug: string, excludeId?: string) {
  const subject = await prisma.subject.findFirst({
    where: {
      ...(excludeId ? { id: { not: excludeId } } : {}),
      OR: [
        { name: { equals: name, mode: "insensitive" } },
        { slug },
      ],
    },
    select: { name: true, slug: true },
  });

  if (!subject) return null;
  return subject.slug === slug
    ? `The slug "${slug}" is already in use. Use a different slug or edit the existing subject.`
    : `The subject "${subject.name}" already exists. Edit it to change its technology instead.`;
}

export async function createSubject(input: SubjectInput): Promise<ActionResult<{ id: string }>> {
  try {
    await requireAdmin();
    const parsed = subjectSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, error: parsed.error.errors[0]?.message ?? "Validation failed" };
    }

    const slug = parsed.data.slug ?? slugify(parsed.data.name);
    const conflict = await getSubjectConflict(parsed.data.name, slug);
    if (conflict) return { success: false, error: conflict };
    const subject = await prisma.subject.create({
      data: { name: parsed.data.name, slug, technologyId: parsed.data.technologyId },
    });

    revalidateAdmin();
    return { success: true, data: { id: subject.id } };
  } catch {
    return { success: false, error: "Failed to create subject" };
  }
}

export async function updateSubject(id: string, input: SubjectInput): Promise<ActionResult> {
  try {
    await requireAdmin();
    const parsed = subjectSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, error: parsed.error.errors[0]?.message ?? "Validation failed" };
    }

    const slug = parsed.data.slug ?? slugify(parsed.data.name);
    const conflict = await getSubjectConflict(parsed.data.name, slug, id);
    if (conflict) return { success: false, error: conflict };
    await prisma.subject.update({
      where: { id },
      data: { name: parsed.data.name, slug, technologyId: parsed.data.technologyId },
    });

    revalidateAdmin();
    return { success: true };
  } catch {
    return { success: false, error: "Failed to update subject" };
  }
}

export async function deleteSubject(id: string): Promise<ActionResult> {
  try {
    await requireAdmin();
    await prisma.subject.delete({ where: { id } });
    revalidateAdmin();
    return { success: true };
  } catch {
    return { success: false, error: "Failed to delete subject. Remove related questions first." };
  }
}
