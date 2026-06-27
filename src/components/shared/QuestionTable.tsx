"use client";

import { memo, useCallback } from "react";
import { Copy, Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { DeleteDialog } from "@/components/shared/DeleteDialog";
import type { Question } from "@/types";

export type QuestionRow = Question & {
  subject: { id: string; name: string } | null;
  topic: { id: string; name: string } | null;
};

interface QuestionTableProps {
  questions: QuestionRow[];
  onEdit: (question: QuestionRow) => void;
  onDelete: (id: string) => void;
  onDuplicate?: (id: string) => void;
  isDeleting?: string | null;
  showType?: boolean;
  startIndex?: number;
}

function QuestionTableComponent({
  questions,
  onEdit,
  onDelete,
  onDuplicate,
  isDeleting,
  showType = true,
  startIndex = 0,
}: QuestionTableProps) {
  const handleEdit = useCallback((q: QuestionRow) => () => onEdit(q), [onEdit]);
  const handleDelete = useCallback((id: string) => () => onDelete(id), [onDelete]);
  const handleDuplicate = useCallback(
    (id: string) => () => onDuplicate?.(id),
    [onDuplicate]
  );

  if (questions.length === 0) {
    return <p className="py-8 text-center text-muted-foreground">No questions found.</p>;
  }

  return (
    <div className="space-y-3">
      {questions.map((q, index) => (
        <Card key={q.id}>
          <CardHeader className="pb-2">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
              <div className="flex min-w-0 flex-1 items-start gap-3">
                <div className="flex h-8 min-w-8 items-center justify-center rounded-md bg-secondary px-2 text-sm font-semibold text-secondary-foreground">
                  #{startIndex + index + 1}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="mb-2 flex flex-wrap gap-2">
                    <Badge variant="secondary">{q.subject?.name || "N/A"}</Badge>
                    {q.topic && <Badge variant="outline">{q.topic.name}</Badge>}
                    {showType && <Badge variant="outline">{q.type}</Badge>}
                    <Badge variant="outline" className="capitalize">
                      {q.difficulty}
                    </Badge>
                  </div>
                  <CardTitle className="text-base font-medium">{q.question}</CardTitle>
                </div>
              </div>
              <div className="flex shrink-0 self-end gap-1 sm:self-start">
                {onDuplicate && (
                  <Button variant="ghost" size="icon" onClick={handleDuplicate(q.id)}>
                    <Copy className="h-4 w-4" />
                  </Button>
                )}
                <Button variant="ghost" size="icon" onClick={handleEdit(q)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <DeleteDialog
                  title="Delete question?"
                  onConfirm={handleDelete(q.id)}
                  disabled={isDeleting === q.id}
                />
              </div>
            </div>
          </CardHeader>
        </Card>
      ))}
    </div>
  );
}

export const QuestionTable = memo(QuestionTableComponent);

export function QuizTable(props: Omit<QuestionTableProps, "showType">) {
  return <QuestionTable {...props} showType={false} />;
}

export function QuestionTableSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i}>
          <CardHeader>
            <div className="flex gap-2 mb-2">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-5 w-16" />
            </div>
            <Skeleton className="h-5 w-full" />
          </CardHeader>
        </Card>
      ))}
    </div>
  );
}
