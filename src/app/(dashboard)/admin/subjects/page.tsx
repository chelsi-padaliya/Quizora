import { Suspense } from "react";
import dynamic from "next/dynamic";
import { requireAdmin } from "@/lib/auth-utils";
import { fetchAdminSubjects } from "@/lib/admin-utils";
import { SubjectTableSkeleton } from "@/components/shared/SubjectTable";

const SubjectManagerClient = dynamic(
  () =>
    import("@/components/admin/SubjectManagerClient").then(
      (m) => m.SubjectManagerClient
    ),
  { loading: () => <SubjectTableSkeleton /> }
);

interface AdminSubjectsPageProps {
  searchParams: Promise<{ page?: string; search?: string }>;
}

export default async function AdminSubjectsPage({ searchParams }: AdminSubjectsPageProps) {
  await requireAdmin();
  const params = await searchParams;
  const result = await fetchAdminSubjects(params);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Subject Management</h1>
        <p className="text-muted-foreground">Add, edit, and delete subjects</p>
      </div>
      <Suspense fallback={<SubjectTableSkeleton />}>
        <SubjectManagerClient
          subjects={result.data}
          page={result.page}
          totalPages={result.totalPages}
          total={result.total}
        />
      </Suspense>
    </div>
  );
}
