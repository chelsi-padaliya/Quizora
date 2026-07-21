import { Suspense } from "react";
import { requireAdmin } from "@/lib/auth-utils";
import { getTechnologiesPaginated } from "@/services/technology.service";
import { TechnologyManager } from "@/components/admin/TechnologyManager";

export default async function TechnologiesPage({ searchParams }: { searchParams: Promise<{ page?: string; search?: string }> }) {
  await requireAdmin();
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const result = await getTechnologiesPaginated({ page, search: params.search });
  return <div className="space-y-6"><div><h1 className="text-2xl font-bold tracking-tight">Technology Management</h1><p className="text-muted-foreground">Add, edit, and delete technologies</p></div><Suspense fallback={null}><TechnologyManager technologies={result.data} page={result.page} total={result.total} totalPages={result.totalPages} /></Suspense></div>;
}
