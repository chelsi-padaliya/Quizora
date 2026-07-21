import { Suspense } from "react";
import dynamic from "next/dynamic";
import { requireAdmin } from "@/lib/auth-utils";
import { fetchAdminSubjects } from "@/lib/admin-utils";
import { getTechnologies } from "@/services/question.service";
import { SubjectTableSkeleton } from "@/components/shared/SubjectTable";

const SubjectManagerClient = dynamic(
  () =>
    import("@/components/admin/SubjectManagerClient").then(
      (m) => m.SubjectManagerClient
    ),
  { loading: () => <SubjectTableSkeleton /> }
);

interface AdminSubjectsPageProps {
  searchParams: Promise<{ page?: string; search?: string; technologyId?: string }>;
}

export default async function AdminSubjectsPage({ searchParams }: AdminSubjectsPageProps) {
  await requireAdmin();
  const params = await searchParams;
  const [result, technologies] = await Promise.all([fetchAdminSubjects(params), getTechnologies()]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Subject Management</h1>
        <p className="text-muted-foreground">Manage subjects within a technology</p>
      </div>
      <Suspense fallback={<SubjectTableSkeleton />}>
        <SubjectManagerClient
          subjects={result.data}
          technologies={technologies}
          page={result.page}
          totalPages={result.totalPages}
          total={result.total}
        />
      </Suspense>
    </div>
  );
}
