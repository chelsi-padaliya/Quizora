"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { TheoryQuestionItem } from "@/types";

interface TheoryCardProps {
  questions: TheoryQuestionItem[];
}

function DifficultyBadge({ difficulty }: { difficulty: string }) {
  const colors: Record<string, string> = {
    beginner: "bg-green-100 text-green-800",
    intermediate: "bg-yellow-100 text-yellow-800",
    advanced: "bg-red-100 text-red-800",
  };
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${colors[difficulty] ?? ""}`}>
      {difficulty}
    </span>
  );
}

export function TheoryCard({ questions }: TheoryCardProps) {
  if (questions.length === 0) {
    return (
      <p className="py-8 text-center text-muted-foreground">No theory questions found.</p>
    );
  }

  return (
    <Accordion type="single" collapsible className="w-full space-y-2">
      {questions.map((q, index) => (
        <AccordionItem key={q.id} value={q.id} className="rounded-lg border px-4">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex flex-1 flex-col items-start gap-2 text-left sm:flex-row sm:items-center">
              <span className="font-medium">
                {index + 1}. {q.question}
              </span>
              <div className="flex gap-2">
                <DifficultyBadge difficulty={q.difficulty} />
                <span className="rounded-full bg-muted px-2 py-0.5 text-xs">{q.subject?.name || "General"}</span>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="rounded-md bg-muted/50 p-4 text-sm leading-relaxed">
              {q.answer ?? "No answer provided."}
            </div>
            {q.topic && (
              <p className="mt-2 text-xs text-muted-foreground">Topic: {q.topic.name}</p>
            )}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
