import { ShortAnswerPlayer } from "@/components/short-answer/ShortAnswerPlayer";
import { getSubjects } from "@/services/question.service";

interface ShortAnswerPageProps {
  searchParams: Promise<{ subjectId?: string }>;
}

export default async function ShortAnswerPage({ searchParams }: ShortAnswerPageProps) {
  const params = await searchParams;
  const subjects = await getSubjects();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Short Answer Mode</h1>
        <p className="text-muted-foreground">
          Type your answer and check it against the correct answer
        </p>
      </div>
      <ShortAnswerPlayer subjects={subjects} initialSubjectId={params.subjectId} />
    </div>
  );
}
