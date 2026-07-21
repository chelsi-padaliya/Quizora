"use client";

import { memo, useCallback } from "react";
import { Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { DeleteDialog } from "@/components/shared/DeleteDialog";

export type SubjectRow = {
  id: string;
  name: string;
  slug: string;
  technologyId: string;
  technology: { id: string; name: string };
  _count?: { questions: number; topics: number };
};

interface SubjectTableProps {
  subjects: SubjectRow[];
  onEdit: (subject: SubjectRow) => void;
  onDelete: (id: string) => void;
  isDeleting?: string | null;
}

function SubjectTableComponent({ subjects, onEdit, onDelete, isDeleting }: SubjectTableProps) {
  const handleEdit = useCallback((s: SubjectRow) => () => onEdit(s), [onEdit]);
  const handleDelete = useCallback((id: string) => () => onDelete(id), [onDelete]);

  if (subjects.length === 0) {
    return <p className="py-8 text-center text-muted-foreground">No subjects found.</p>;
  }

  return (
    <div className="space-y-3">
      {subjects.map((s) => (
        <Card key={s.id}>
          <CardHeader className="pb-2">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
              <div className="min-w-0 flex-1">
                <div className="mb-2 flex flex-wrap gap-2">
                  <Badge variant="secondary">{s.technology.name}</Badge>
                  <Badge variant="outline">{s.slug}</Badge>
                  {s._count && (
                    <>
                      <Badge variant="outline">{s._count.topics} topics</Badge>
                      <Badge variant="outline">{s._count.questions} questions</Badge>
                    </>
                  )}
                </div>
                <CardTitle className="text-base font-medium">{s.name}</CardTitle>
              </div>
              <div className="flex self-end gap-1 sm:self-start">
                <Button variant="ghost" size="icon" onClick={handleEdit(s)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <DeleteDialog
                  title="Delete subject?"
                  description="This will fail if the subject has related questions or topics."
                  onConfirm={handleDelete(s.id)}
                  disabled={isDeleting === s.id}
                />
              </div>
            </div>
          </CardHeader>
        </Card>
      ))}
    </div>
  );
}

export const SubjectTable = memo(SubjectTableComponent);

export function SubjectTableSkeleton({ count = 5 }: { count?: number }) {
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
