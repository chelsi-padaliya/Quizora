import { Suspense } from "react";
import dynamic from "next/dynamic";
import { requireAdmin } from "@/lib/auth-utils";
import { fetchAdminTopics, getCachedSubjects } from "@/lib/admin-utils";
import { getTechnologies } from "@/services/question.service";
import { TopicTableSkeleton } from "@/components/shared/TopicTable";

const TopicManagerClient = dynamic(
  () =>
    import("@/components/admin/TopicManagerClient").then((m) => m.TopicManagerClient),
  { loading: () => <TopicTableSkeleton /> }
);

interface AdminTopicsPageProps {
  searchParams: Promise<{ page?: string; search?: string; subjectId?: string; technologyId?: string }>;
}

export default async function AdminTopicsPage({ searchParams }: AdminTopicsPageProps) {
  await requireAdmin();
  const params = await searchParams;

  const [result, subjects, technologies] = await Promise.all([
    fetchAdminTopics(params),
    getCachedSubjects(),
    getTechnologies(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Topic Management</h1>
        <p className="text-muted-foreground">Add, edit, and delete topics</p>
      </div>
      <Suspense fallback={<TopicTableSkeleton />}>
        <TopicManagerClient
          topics={result.data}
          subjects={subjects.filter((subject) => !params.technologyId || subject.technology?.id === params.technologyId)}
          technologies={technologies}
          page={result.page}
          totalPages={result.totalPages}
          total={result.total}
        />
      </Suspense>
    </div>
  );
}
