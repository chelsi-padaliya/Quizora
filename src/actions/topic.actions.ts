"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-utils";
import { slugify } from "@/lib/utils";
import type { ActionResult } from "@/types";
import { topicSchema, type TopicInput } from "@/validations";
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

export async function createTopic(input: TopicInput): Promise<ActionResult<{ id: string }>> {
  try {
    await requireAdmin();
    const parsed = topicSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, error: parsed.error.errors[0]?.message ?? "Validation failed" };
    }

    const topic = await prisma.topic.create({
      data: { subjectId: parsed.data.subjectId, name: parsed.data.name, slug: slugify(parsed.data.name) },
    });

    revalidateAdmin();
    return { success: true, data: { id: topic.id } };
  } catch {
    return { success: false, error: "Failed to create topic" };
  }
}

export async function updateTopic(id: string, input: TopicInput): Promise<ActionResult> {
  try {
    await requireAdmin();
    const parsed = topicSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, error: parsed.error.errors[0]?.message ?? "Validation failed" };
    }

    await prisma.topic.update({
      where: { id },
      data: { subjectId: parsed.data.subjectId, name: parsed.data.name, slug: slugify(parsed.data.name) },
    });

    revalidateAdmin();
    return { success: true };
  } catch {
    return { success: false, error: "Failed to update topic" };
  }
}

export async function deleteTopic(id: string): Promise<ActionResult> {
  try {
    await requireAdmin();
    await prisma.topic.delete({ where: { id } });
    revalidateAdmin();
    return { success: true };
  } catch {
    return { success: false, error: "Failed to delete topic" };
  }
}
