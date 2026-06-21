"use client";

import { useState } from "react";
import { Plus, Upload, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { QuestionForm } from "@/components/forms/QuestionForm";
import { Pagination } from "@/components/Pagination";
import { deleteQuestion, bulkImportQuestions } from "@/actions/question.actions";
import { useRouter } from "next/navigation";
import type { Question } from "@/types";

interface AdminQuestionsClientProps {
  questions: (Question & {
    subject: { id: string; name: string } | null;
    topic: { id: string; name: string } | null;
  })[];
  subjects: { id: string; name: string }[];
  topics: { id: string; name: string; subjectId: string }[];
  page: number;
  totalPages: number;
}

export function AdminQuestionsClient({
  questions,
  subjects,
  topics,
  page,
  totalPages,
}: AdminQuestionsClientProps) {
  const router = useRouter();
  const [createOpen, setCreateOpen] = useState(false);
  const [editQuestion, setEditQuestion] = useState<
    AdminQuestionsClientProps["questions"][0] | null
  >(null);
  const [importOpen, setImportOpen] = useState(false);
  const [importJson, setImportJson] = useState("");
  const [importError, setImportError] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    await deleteQuestion(id);
    router.refresh();
  };

  const handleImport = async () => {
    setImportError(null);
    try {
      const parsed = JSON.parse(importJson);
      if (!Array.isArray(parsed)) throw new Error("JSON must be an array");

      const result = await bulkImportQuestions(parsed);
      if (result.success && result.data) {
        setImportOpen(false);
        setImportJson("");
        alert(`Imported ${result.data.imported} questions. Skipped ${result.data.skipped} invalid rows.`);
        router.refresh();
      } else {
        setImportError(result.error ?? "Import failed");
      }
    } catch (e) {
      setImportError(e instanceof Error ? e.message : "Invalid JSON");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Question
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Question</DialogTitle>
            </DialogHeader>
            <QuestionForm
              subjects={subjects}
              topics={topics}
              onSuccess={() => {
                setCreateOpen(false);
                router.refresh();
              }}
              onCancel={() => setCreateOpen(false)}
            />
          </DialogContent>
        </Dialog>

        <Dialog open={importOpen} onOpenChange={setImportOpen}>
          <DialogTrigger asChild>
            <Button variant="outline">
              <Upload className="mr-2 h-4 w-4" />
              Bulk Import
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Bulk Import Questions</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-muted-foreground">
              Paste a JSON array of question objects matching the question schema.
            </p>
            <textarea
              className="min-h-[200px] w-full rounded-md border p-3 font-mono text-sm"
              value={importJson}
              onChange={(e) => setImportJson(e.target.value)}
              placeholder='[{"subjectId": "...", "type": "quiz", ...}]'
            />
            {importError && (
              <p className="text-sm text-destructive">{importError}</p>
            )}
            <Button onClick={handleImport}>Import</Button>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-3">
        {questions.length === 0 ? (
          <p className="py-8 text-center text-muted-foreground">No questions yet.</p>
        ) : (
          questions.map((q) => (
            <Card key={q.id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="mb-2 flex flex-wrap gap-2">
                      <Badge variant="secondary">{q.subject?.name || "N/A"}</Badge>
                      <Badge variant="outline">{q.type}</Badge>
                      <Badge variant="outline" className="capitalize">
                        {q.difficulty}
                      </Badge>
                    </div>
                    <CardTitle className="text-base font-medium">{q.question}</CardTitle>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => setEditQuestion(q)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete question?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(q.id)}>
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))
        )}
      </div>

      <Pagination
        page={page}
        totalPages={totalPages}
        onPageChange={(p) => router.push(`/admin/questions?page=${p}`)}
      />

      <Dialog open={!!editQuestion} onOpenChange={() => setEditQuestion(null)}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Question</DialogTitle>
          </DialogHeader>
          {editQuestion && (
            <QuestionForm
              subjects={subjects}
              topics={topics}
              question={editQuestion}
              onSuccess={() => {
                setEditQuestion(null);
                router.refresh();
              }}
              onCancel={() => setEditQuestion(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
