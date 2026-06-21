import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getQuizQuestions } from "@/services/question.service";
import { Difficulty } from "@prisma/client";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = request.nextUrl;
  const subjectId = searchParams.get("subjectId") ?? undefined;
  const difficulty = searchParams.get("difficulty") as Difficulty | null;
  const limitParam = searchParams.get("limit") ?? "10";
  const limit = limitParam === "all" ? "all" : Number(limitParam);
  const typeParam = searchParams.get("type");
  const type = typeParam === "short_answer" ? "short_answer" : "quiz";

  const questions = await getQuizQuestions({
    subjectId,
    difficulty: difficulty ?? undefined,
    limit: limit as number | "all",
    type,
  });

  return NextResponse.json({ questions });
}
