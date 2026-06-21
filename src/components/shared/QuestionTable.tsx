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
}

function QuestionTableComponent({
  questions,
  onEdit,
  onDelete,
  onDuplicate,
  isDeleting,
  showType = true,
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
      {questions.map((q) => (
        <Card key={q.id}>
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
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
              <div className="flex shrink-0 gap-1">
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
