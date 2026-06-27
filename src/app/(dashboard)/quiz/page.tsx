import { QuizPlayer } from "@/components/quiz/QuizPlayer";
import { getSubjects, getTopics } from "@/services/question.service";

interface QuizPageProps {
  searchParams: Promise<{ subjectId?: string }>;
}

export default async function QuizPage({ searchParams }: QuizPageProps) {
  const params = await searchParams;
  const [subjects, topics] = await Promise.all([getSubjects(), getTopics()]);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Quiz Mode</h1>
        <p className="text-muted-foreground">
          Test your knowledge with multiple choice questions
        </p>
      </div>
      <QuizPlayer subjects={subjects} topics={topics} initialSubjectId={params.subjectId} />
    </div>
  );
}
