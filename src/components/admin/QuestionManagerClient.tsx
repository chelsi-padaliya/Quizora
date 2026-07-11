"use client";

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Plus, Upload } from "lucide-react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { QuestionTable, QuestionTableSkeleton, type QuestionRow } from "@/components/shared/QuestionTable";
import { PaginationControls } from "@/components/shared/PaginationControls";
import { SearchBar } from "@/components/shared/SearchBar";
import { FilterDropdown } from "@/components/shared/FilterDropdown";
import { DIFFICULTIES, ITEMS_PER_PAGE } from "@/constants";
import { useDebounce } from "@/hooks/use-debounce";
import {
  deleteQuestion,
  duplicateQuestion,
} from "@/actions/question.actions";
import { BulkImportDialog } from "@/components/shared/BulkImportDialog";

const QuestionForm = dynamic(
  () => import("@/components/forms/QuestionForm").then((m) => m.QuestionForm),
  { loading: () => <QuestionTableSkeleton count={1} /> }
);

const QuizForm = dynamic(
  () => import("@/components/shared/QuizForm").then((m) => m.QuizForm),
  { loading: () => <QuestionTableSkeleton count={1} /> }
);

const TheoryForm = dynamic(
  () => import("@/components/shared/TheoryForm").then((m) => m.TheoryForm),
  { loading: () => <QuestionTableSkeleton count={1} /> }
);

const ShortAnswerForm = dynamic(
  () => import("@/components/forms/ShortAnswerForm").then((m) => m.ShortAnswerForm),
  { loading: () => <QuestionTableSkeleton count={1} /> }
);

interface QuestionManagerClientProps {
  questions: QuestionRow[];
  subjects: { id: string; name: string }[];
  topics: { id: string; name: string; subjectId: string }[];
  page: number;
  totalPages: number;
  total: number;
  fixedType?: "quiz" | "theory" | "short_answer";
  title?: string;
  showBulkImport?: boolean;
  showDuplicate?: boolean;
}

export function QuestionManagerClient({
  questions: initialQuestions,
  subjects,
  topics,
  page,
  totalPages,
  total,
  fixedType,
  title = "Question",
  showBulkImport = true,
  showDuplicate = true,
}: QuestionManagerClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [questions, setQuestions] = useState(initialQuestions);
  const [createOpen, setCreateOpen] = useState(false);
  const [editQuestion, setEditQuestion] = useState<QuestionRow | null>(null);
  const [importOpen, setImportOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const debouncedSearch = useDebounce(search, 300);

  const subjectFilter = searchParams.get("subjectId") ?? undefined;
  const difficultyFilter = searchParams.get("difficulty") ?? undefined;

  const updateParams = useCallback(
    (updates: Record<string, string | undefined>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value) params.set(key, value);
        else params.delete(key);
      });
      if (!updates.page) params.set("page", "1");
      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
      });
    },
    [pathname, router, searchParams]
  );

  useEffect(() => {
    setQuestions(initialQuestions);
  }, [initialQuestions]);

  useEffect(() => {
    if (debouncedSearch !== (searchParams.get("search") ?? "")) {
      updateParams({ search: debouncedSearch || undefined, page: "1" });
    }
  }, [debouncedSearch, searchParams, updateParams]);

  const FormComponent =
    fixedType === "quiz" ? QuizForm : fixedType === "theory" ? TheoryForm : fixedType === "short_answer" ? ShortAnswerForm : QuestionForm;

  const handleDelete = useCallback(
    async (id: string) => {
      setDeletingId(id);
      setQuestions((prev) => prev.filter((q) => q.id !== id));
      const result = await deleteQuestion(id);
      if (!result.success) {
        setQuestions(initialQuestions);
      }
      setDeletingId(null);
      startTransition(() => router.refresh());
    },
    [initialQuestions, router]
  );

  const handleDuplicate = useCallback(
    async (id: string) => {
      const result = await duplicateQuestion(id);
      if (result.success) {
        startTransition(() => router.refresh());
      }
    },
    [router]
  );

  const subjectOptions = useMemo(
    () => subjects.map((s) => ({ value: s.id, label: s.name })),
    [subjects]
  );

  const difficultyOptions = useMemo(
    () => DIFFICULTIES.map((d) => ({ value: d.value, label: d.label })),
    []
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:flex-wrap">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search questions..."
            className="w-full min-w-0 flex-1 sm:min-w-[200px]"
          />
          <FilterDropdown
            value={subjectFilter}
            onChange={(v) => updateParams({ subjectId: v, page: "1" })}
            options={subjectOptions}
            placeholder="Subject"
            allLabel="All Subjects"
          />
          <FilterDropdown
            value={difficultyFilter}
            onChange={(v) => updateParams({ difficulty: v, page: "1" })}
            options={difficultyOptions}
            placeholder="Difficulty"
            allLabel="All Levels"
          />
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto">
                <Plus className="mr-2 h-4 w-4" />
                Add {title}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create {title}</DialogTitle>
              </DialogHeader>
              <FormComponent
                subjects={subjects}
                topics={topics}
                defaultSubjectId={subjectFilter}
                defaultDifficulty={difficultyFilter}
                onSuccess={() => {
                  setCreateOpen(false);
                  startTransition(() => router.refresh());
                }}
                onCancel={() => setCreateOpen(false)}
              />
            </DialogContent>
          </Dialog>
          {showBulkImport && fixedType && (
            <BulkImportDialog
              open={importOpen}
              onOpenChange={setImportOpen}
              questionType={fixedType}
              onComplete={() => startTransition(() => router.refresh())}
              trigger={
                <Button variant="outline" onClick={() => setImportOpen(true)} className="w-full sm:w-auto">
                  <Upload className="mr-2 h-4 w-4" />
                  Import Excel / CSV
                </Button>
              }
            />
          )}
        </div>
      </div>

      <p className="text-sm text-muted-foreground">
        {total} question{total !== 1 ? "s" : ""} found
        {isPending && " · Updating..."}
      </p>

      {isPending && questions.length === 0 ? (
        <QuestionTableSkeleton />
      ) : (
        <QuestionTable
          questions={questions}
          onEdit={setEditQuestion}
          onDelete={handleDelete}
          onDuplicate={showDuplicate ? handleDuplicate : undefined}
          isDeleting={deletingId}
          showType={!fixedType}
          startIndex={(page - 1) * ITEMS_PER_PAGE}
        />
      )}

      <PaginationControls
        page={page}
        totalPages={totalPages}
        onPageChange={(p) => updateParams({ page: String(p) })}
      />

      <Dialog open={!!editQuestion} onOpenChange={() => setEditQuestion(null)}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit {title}</DialogTitle>
          </DialogHeader>
          {editQuestion && (
            <FormComponent
              subjects={subjects}
              topics={topics}
              question={editQuestion}
              onSuccess={() => {
                setEditQuestion(null);
                startTransition(() => router.refresh());
              }}
              onCancel={() => setEditQuestion(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
