"use client";

import { memo, useCallback } from "react";
import { Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { DeleteDialog } from "@/components/shared/DeleteDialog";

export type TopicRow = {
  id: string;
  name: string;
  subjectId: string;
  subject: { id: string; name: string };
  _count?: { questions: number };
};

interface TopicTableProps {
  topics: TopicRow[];
  onEdit: (topic: TopicRow) => void;
  onDelete: (id: string) => void;
  isDeleting?: string | null;
}

function TopicTableComponent({ topics, onEdit, onDelete, isDeleting }: TopicTableProps) {
  const handleEdit = useCallback((t: TopicRow) => () => onEdit(t), [onEdit]);
  const handleDelete = useCallback((id: string) => () => onDelete(id), [onDelete]);

  if (topics.length === 0) {
    return <p className="py-8 text-center text-muted-foreground">No topics found.</p>;
  }

  return (
    <div className="space-y-3">
      {topics.map((t) => (
        <Card key={t.id}>
          <CardHeader className="pb-2">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
              <div className="min-w-0 flex-1">
                <div className="mb-2 flex flex-wrap gap-2">
                  <Badge variant="secondary">{t.subject.name}</Badge>
                  {t._count && (
                    <Badge variant="outline">{t._count.questions} questions</Badge>
                  )}
                </div>
                <CardTitle className="text-base font-medium">{t.name}</CardTitle>
              </div>
              <div className="flex self-end gap-1 sm:self-start">
                <Button variant="ghost" size="icon" onClick={handleEdit(t)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <DeleteDialog
                  title="Delete topic?"
                  onConfirm={handleDelete(t.id)}
                  disabled={isDeleting === t.id}
                />
              </div>
            </div>
          </CardHeader>
        </Card>
      ))}
    </div>
  );
}

export const TopicTable = memo(TopicTableComponent);

export function TopicTableSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className="h-5 w-32 mb-2" />
            <Skeleton className="h-5 w-full" />
          </CardHeader>
        </Card>
      ))}
    </div>
  );
}
