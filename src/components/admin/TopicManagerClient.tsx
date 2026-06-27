"use client";

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
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
import { TopicTable, TopicTableSkeleton, type TopicRow } from "@/components/shared/TopicTable";
import { PaginationControls } from "@/components/shared/PaginationControls";
import { SearchBar } from "@/components/shared/SearchBar";
import { FilterDropdown } from "@/components/shared/FilterDropdown";
import { useDebounce } from "@/hooks/use-debounce";
import { deleteTopic } from "@/actions/topic.actions";

const TopicForm = dynamic(
  () => import("@/components/shared/TopicForm").then((m) => m.TopicForm),
  { loading: () => <TopicTableSkeleton count={1} /> }
);

interface TopicManagerClientProps {
  topics: TopicRow[];
  subjects: { id: string; name: string }[];
  page: number;
  totalPages: number;
  total: number;
}

export function TopicManagerClient({
  topics: initialTopics,
  subjects,
  page,
  totalPages,
  total,
}: TopicManagerClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [topics, setTopics] = useState(initialTopics);
  const [createOpen, setCreateOpen] = useState(false);
  const [editTopic, setEditTopic] = useState<TopicRow | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const debouncedSearch = useDebounce(search, 300);

  const subjectFilter = searchParams.get("subjectId") ?? undefined;

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
    setTopics(initialTopics);
  }, [initialTopics]);

  useEffect(() => {
    if (debouncedSearch !== (searchParams.get("search") ?? "")) {
      updateParams({ search: debouncedSearch || undefined, page: "1" });
    }
  }, [debouncedSearch, searchParams, updateParams]);

  const subjectOptions = useMemo(
    () => subjects.map((s) => ({ value: s.id, label: s.name })),
    [subjects]
  );

  const handleDelete = useCallback(
    async (id: string) => {
      setDeletingId(id);
      setTopics((prev) => prev.filter((t) => t.id !== id));
      const result = await deleteTopic(id);
      if (!result.success) {
        alert(result.error);
        setTopics(initialTopics);
      }
      setDeletingId(null);
      startTransition(() => router.refresh());
    },
    [initialTopics, router]
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:flex-wrap">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search topics..."
            className="w-full min-w-0 flex-1 sm:min-w-[200px]"
          />
          <FilterDropdown
            value={subjectFilter}
            onChange={(v) => updateParams({ subjectId: v, page: "1" })}
            options={subjectOptions}
            placeholder="Subject"
            allLabel="All Subjects"
          />
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              Add Topic
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Topic</DialogTitle>
            </DialogHeader>
            <TopicForm
              subjects={subjects}
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
        {total} topic{total !== 1 ? "s" : ""} found
        {isPending && " · Updating..."}
      </p>

      {isPending && topics.length === 0 ? (
        <TopicTableSkeleton />
      ) : (
        <TopicTable
          topics={topics}
          onEdit={setEditTopic}
          onDelete={handleDelete}
          isDeleting={deletingId}
        />
      )}

      <PaginationControls
        page={page}
        totalPages={totalPages}
        onPageChange={(p) => updateParams({ page: String(p) })}
      />

      <Dialog open={!!editTopic} onOpenChange={() => setEditTopic(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Topic</DialogTitle>
          </DialogHeader>
          {editTopic && (
            <TopicForm
              subjects={subjects}
              topic={editTopic}
              onSuccess={() => {
                setEditTopic(null);
                startTransition(() => router.refresh());
              }}
              onCancel={() => setEditTopic(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
