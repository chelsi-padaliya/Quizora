"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ResultCard } from "@/components/quiz/ResultCard";
import type { QuizResult } from "@/types";

export function QuizResultsContent() {
  const [result, setResult] = useState<QuizResult | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem("quizResult");
    if (stored) {
      setResult(JSON.parse(stored));
    }
  }, []);

  if (!result) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">No quiz results found.</p>
        <Button asChild>
          <Link href="/quiz">Take a Quiz</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <ResultCard result={result} />
      <div className="flex flex-col gap-2 sm:flex-row sm:gap-4">
        <Button asChild className="w-full sm:w-auto">
          <Link href="/quiz">Take Another Quiz</Link>
        </Button>
        <Button variant="outline" asChild className="w-full sm:w-auto">
          <Link href="/dashboard">Back to Dashboard</Link>
        </Button>
      </div>
    </div>
  );
}
