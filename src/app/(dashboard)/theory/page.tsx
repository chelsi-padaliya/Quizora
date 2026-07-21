import { Suspense } from "react";
import { TheoryPageClient } from "@/components/theory/TheoryPageClient";
import { Skeleton } from "@/components/ui/skeleton";
import { getSubjects, getTopics } from "@/services/question.service";

export default async function TheoryPage() {
  const [subjects, topics] = await Promise.all([getSubjects(), getTopics()]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Theory Questions</h1>
        <p className="text-muted-foreground">
          Study interview theory questions with expandable answers
        </p>
      </div>
      <Suspense fallback={<Skeleton className="h-64 w-full" />}>
        <TheoryPageClient subjects={subjects} topics={topics} />
      </Suspense>
    </div>
  );
}
