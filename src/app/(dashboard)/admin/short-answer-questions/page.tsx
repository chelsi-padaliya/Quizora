import { Suspense } from "react";
import dynamic from "next/dynamic";
import { requireAdmin } from "@/lib/auth-utils";
import {
  fetchAdminQuestions,
  getCachedSubjects,
  getCachedTopics,
} from "@/lib/admin-utils";
import { QuestionTableSkeleton } from "@/components/shared/QuestionTable";

const QuestionManagerClient = dynamic(
  () =>
    import("@/components/admin/QuestionManagerClient").then(
      (m) => m.QuestionManagerClient
    ),
  { loading: () => <QuestionTableSkeleton /> }
);

interface AdminShortAnswerQuestionsPageProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
    subjectId?: string;
    topicId?: string;
    technologyId?: string;
    difficulty?: string;
  }>;
}

export default async function AdminShortAnswerQuestionsPage({
  searchParams,
}: AdminShortAnswerQuestionsPageProps) {
  await requireAdmin();
  const params = await searchParams;

  const [result, subjects, topics] = await Promise.all([
    fetchAdminQuestions({ ...params, type: "short_answer" }),
    getCachedSubjects(),
    getCachedTopics(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Short Answer Question Management</h1>
        <p className="text-muted-foreground">
          Add, edit, delete, duplicate, and bulk import short answer questions
        </p>
      </div>
      <Suspense fallback={<QuestionTableSkeleton />}>
        <QuestionManagerClient
          questions={result.data}
          subjects={subjects}
          topics={topics}
          page={result.page}
          totalPages={result.totalPages}
          total={result.total}
          fixedType="short_answer"
          title="Short Answer Question"
        />
      </Suspense>
    </div>
  );
}
