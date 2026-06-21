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

interface AdminQuestionsPageProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
    subjectId?: string;
    difficulty?: string;
  }>;
}

export default async function AdminQuestionsPage({ searchParams }: AdminQuestionsPageProps) {
  await requireAdmin();
  const params = await searchParams;

  const [result, subjects, topics] = await Promise.all([
    fetchAdminQuestions(params),
    getCachedSubjects(),
    getCachedTopics(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Question Management</h1>
        <p className="text-muted-foreground">Create, update, delete, and import questions</p>
      </div>
      <Suspense fallback={<QuestionTableSkeleton />}>
        <QuestionManagerClient
          questions={result.data}
          subjects={subjects}
          topics={topics}
          page={result.page}
          totalPages={result.totalPages}
          total={result.total}
          title="Question"
        />
      </Suspense>
    </div>
  );
}
