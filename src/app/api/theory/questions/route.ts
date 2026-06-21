import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getTheoryQuestions } from "@/services/question.service";
import type { Difficulty } from "@prisma/client";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = request.nextUrl;
  const subjectId = searchParams.get("subjectId") ?? undefined;
  const difficulty = (searchParams.get("difficulty") ?? undefined) as Difficulty | undefined;
  const search = searchParams.get("search") ?? undefined;
  const page = Number(searchParams.get("page") ?? "1");

  const result = await getTheoryQuestions({ subjectId, difficulty, search, page });

  return NextResponse.json(result);
}
