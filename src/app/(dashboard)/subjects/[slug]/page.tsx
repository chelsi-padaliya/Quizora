import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getSubjectBySlug } from "@/services/question.service";
import { Brain, BookOpen } from "lucide-react";
import { prisma } from "@/lib/prisma";

interface SubjectPageProps {
  params: Promise<{ slug: string }>;
}

export default async function SubjectPage({ params }: SubjectPageProps) {
  const { slug } = await params;
  const subject = await getSubjectBySlug(slug);

  if (!subject) notFound();

  const [quizCount, theoryCount] = await Promise.all([
    prisma.question.count({ where: { subjectId: subject.id, type: "quiz" } }),
    prisma.question.count({ where: { subjectId: subject.id, type: "theory" } }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{subject.name}</h1>
        <p className="text-muted-foreground">
          {subject._count.questions} total questions • {subject.topics.length} topics
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Quiz Mode
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-muted-foreground">
              {quizCount} multiple choice questions available
            </p>
            <Button asChild>
              <Link href={`/quiz?subjectId=${subject.id}`}>Start Quiz</Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Theory Mode
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-muted-foreground">
              {theoryCount} theory questions available
            </p>
            <Button asChild variant="outline">
              <Link href={`/theory?subjectId=${subject.id}`}>Study Theory</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {subject.topics.length > 0 && (
        <div>
          <h2 className="mb-3 text-lg font-semibold">Topics</h2>
          <div className="flex flex-wrap gap-2">
            {subject.topics.map((topic) => (
              <span
                key={topic.id}
                className="rounded-full bg-muted px-3 py-1 text-sm"
              >
                {topic.name}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
