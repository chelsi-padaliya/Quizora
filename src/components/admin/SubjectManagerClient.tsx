"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Plus } from "lucide-react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { SubjectTable, SubjectTableSkeleton, type SubjectRow } from "@/components/shared/SubjectTable";
import { PaginationControls } from "@/components/shared/PaginationControls";
import { SearchBar } from "@/components/shared/SearchBar";
import { useDebounce } from "@/hooks/use-debounce";
import { deleteSubject } from "@/actions/subject.actions";

const SubjectForm = dynamic(
  () => import("@/components/shared/SubjectForm").then((m) => m.SubjectForm),
  { loading: () => <SubjectTableSkeleton count={1} /> }
);

interface SubjectManagerClientProps {
  subjects: SubjectRow[];
  page: number;
  totalPages: number;
  total: number;
}

export function SubjectManagerClient({
  subjects: initialSubjects,
  page,
  totalPages,
  total,
}: SubjectManagerClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [subjects, setSubjects] = useState(initialSubjects);
  const [createOpen, setCreateOpen] = useState(false);
  const [editSubject, setEditSubject] = useState<SubjectRow | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const debouncedSearch = useDebounce(search, 300);

  const updateParams = useCallback(
    (updates: Record<string, string | undefined>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value) params.set(key, value);
        else params.delete(key);
      });
      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
      });
    },
    [pathname, router, searchParams]
  );

  useEffect(() => {
    setSubjects(initialSubjects);
  }, [initialSubjects]);

  useEffect(() => {
    if (debouncedSearch !== (searchParams.get("search") ?? "")) {
      updateParams({ search: debouncedSearch || undefined, page: "1" });
    }
  }, [debouncedSearch, searchParams, updateParams]);

  const handleDelete = useCallback(
    async (id: string) => {
      setDeletingId(id);
      setSubjects((prev) => prev.filter((s) => s.id !== id));
      const result = await deleteSubject(id);
      if (!result.success) {
        alert(result.error);
        setSubjects(initialSubjects);
      }
      setDeletingId(null);
      startTransition(() => router.refresh());
    },
    [initialSubjects, router]
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search subjects..."
          className="max-w-sm flex-1"
        />
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Subject
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Subject</DialogTitle>
            </DialogHeader>
            <SubjectForm
              onSuccess={() => {
                setCreateOpen(false);
                startTransition(() => router.refresh());
              }}
              onCancel={() => setCreateOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      <p className="text-sm text-muted-foreground">
        {total} subject{total !== 1 ? "s" : ""} found
        {isPending && " · Updating..."}
      </p>

      {isPending && subjects.length === 0 ? (
        <SubjectTableSkeleton />
      ) : (
        <SubjectTable
          subjects={subjects}
          onEdit={setEditSubject}
          onDelete={handleDelete}
          isDeleting={deletingId}
        />
      )}

      <PaginationControls
        page={page}
        totalPages={totalPages}
        onPageChange={(p) => updateParams({ page: String(p) })}
      />

      <Dialog open={!!editSubject} onOpenChange={() => setEditSubject(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Subject</DialogTitle>
          </DialogHeader>
          {editSubject && (
            <SubjectForm
              subject={editSubject}
              onSuccess={() => {
                setEditSubject(null);
                startTransition(() => router.refresh());
              }}
              onCancel={() => setEditSubject(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
