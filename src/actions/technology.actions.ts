"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-utils";
import { slugify } from "@/lib/utils";
import type { ActionResult } from "@/types";
import { technologySchema, type TechnologyInput } from "@/validations";
import { revalidatePath } from "next/cache";

const refresh = () => ["/admin/subjects", "/admin/topics", "/admin/questions", "/admin/quiz-questions", "/admin/theory-questions", "/admin/short-answer-questions"].forEach((path) => revalidatePath(path));

export async function createTechnology(input: TechnologyInput): Promise<ActionResult<{ id: string }>> {
  try {
    await requireAdmin();
    const parsed = technologySchema.safeParse(input);
    if (!parsed.success) return { success: false, error: parsed.error.errors[0]?.message ?? "Validation failed" };
    const technology = await prisma.technology.create({ data: { name: parsed.data.name, slug: parsed.data.slug || slugify(parsed.data.name) } });
    refresh();
    return { success: true, data: { id: technology.id } };
  } catch { return { success: false, error: "Failed to create technology" }; }
}

export async function deleteTechnology(id: string): Promise<ActionResult> {
  try { await requireAdmin(); await prisma.technology.delete({ where: { id } }); refresh(); return { success: true }; }
  catch { return { success: false, error: "Failed to delete technology. Remove its subjects first." }; }
}

export async function updateTechnology(id: string, input: TechnologyInput): Promise<ActionResult> {
  try {
    await requireAdmin();
    const parsed = technologySchema.safeParse(input);
    if (!parsed.success) return { success: false, error: parsed.error.errors[0]?.message ?? "Validation failed" };
    await prisma.technology.update({ where: { id }, data: { name: parsed.data.name, slug: parsed.data.slug || slugify(parsed.data.name) } });
    refresh(); return { success: true };
  } catch { return { success: false, error: "Failed to update technology" }; }
}
