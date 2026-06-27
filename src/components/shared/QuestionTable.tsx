"use client";

import { memo, useCallback } from "react";
import { Copy, Pencil, Trash2 } from "lucide-react";
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
        <Card key={q.id} className="overflow-hidden">
          <CardHeader className="p-4 sm:p-6">
            <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
              <div className="flex min-w-0 flex-1 items-start gap-2.5 sm:gap-4">
                <div className="w-8 shrink-0 pt-0.5 text-sm font-semibold tabular-nums text-muted-foreground sm:w-10 sm:text-base">
                  {startIndex + index + 1}.
                </div>
                <div className="min-w-0 flex-1">
                  <div className="mb-2 flex min-w-0 flex-wrap gap-1.5 sm:gap-2">
                    <Badge variant="secondary" className="max-w-full truncate px-2 py-0 text-[11px] sm:text-xs">
                      {q.subject?.name || "N/A"}
                    </Badge>
                    {q.topic && (
                      <Badge variant="outline" className="max-w-full truncate px-2 py-0 text-[11px] sm:text-xs">
                        {q.topic.name}
                      </Badge>
                    )}
                    {showType && (
                      <Badge variant="outline" className="max-w-full truncate px-2 py-0 text-[11px] sm:text-xs">
                        {q.type}
                      </Badge>
                    )}
                    <Badge variant="outline" className="max-w-full truncate px-2 py-0 text-[11px] capitalize sm:text-xs">
                      {q.difficulty}
                    </Badge>
                  </div>
                  <CardTitle className="break-words text-sm font-medium leading-snug sm:text-base sm:leading-snug">
                    {q.question}
                  </CardTitle>
                </div>
              </div>
              <div className="flex shrink-0 justify-end gap-1 sm:self-start">
                {onDuplicate && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 sm:h-9 sm:w-9"
                    onClick={handleDuplicate(q.id)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 sm:h-9 sm:w-9"
                  onClick={handleEdit(q)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <DeleteDialog
                  title="Delete question?"
                  onConfirm={handleDelete(q.id)}
                  disabled={isDeleting === q.id}
                  trigger={
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 sm:h-9 sm:w-9"
                      disabled={isDeleting === q.id}
                    >
                      <span className="sr-only">Delete question</span>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  }
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
