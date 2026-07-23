"use client";

import { useCallback, useState } from "react";
import { CheckCircle2, Upload, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { bulkImportQuestionsFromRows } from "@/actions/question.actions";
import type { BulkImportResult } from "@/lib/bulk-import-utils";
import {
  type BulkImportQuestionType,
  parseJsonImport,
  validateRequiredColumns,
} from "@/lib/bulk-import-utils";

interface BulkImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  questionType: BulkImportQuestionType;
  onComplete?: () => void;
  trigger?: React.ReactNode;
}

type Step = "upload" | "summary";

function getJsonExample(type: BulkImportQuestionType) {
  if (type === "quiz") {
    return '[\n  {\n    "subject": "JavaScript",\n    "difficulty": "beginner",\n    "question": "What does map() return?",\n    "optionA": "A new array",\n    "optionB": "A string",\n    "optionC": "A boolean",\n    "optionD": "Nothing",\n    "correctAnswer": "A"\n  }\n]';
  }
  if (type === "short_answer") {
    return '[\n  {\n    "subject": "JavaScript",\n    "difficulty": "beginner",\n    "question": "Which method adds an item to an array?",\n    "answer": "push"\n  }\n]';
  }
  return '[\n  {\n    "subject": "JavaScript",\n    "difficulty": "beginner",\n    "question": "What is a variable?",\n    "answer": "A named storage location for a value."\n  }\n]';
}

export function BulkImportDialog({
  open,
  onOpenChange,
  questionType,
  onComplete,
  trigger,
}: BulkImportDialogProps) {
  const [step, setStep] = useState<Step>("upload");
  const [json, setJson] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<BulkImportResult | null>(null);

  const reset = useCallback(() => {
    setStep("upload");
    setJson("");
    setError(null);
    setSummary(null);
  }, []);

  const handleOpenChange = (next: boolean) => {
    if (!next) reset();
    onOpenChange(next);
  };

  const handleJsonUpload = async () => {
    setError(null);

    try {
      const parsed = JSON.parse(json);
      if (!Array.isArray(parsed)) {
        throw new Error("JSON must be an array of question objects");
      }

      const headers = parsed.length > 0 ? Object.keys(parsed[0] as object) : [];
      const validation = validateRequiredColumns(headers, questionType);
      if (!validation.valid) {
        throw new Error(`Missing required fields: ${validation.missing.join(", ")}`);
      }

      const rows = parseJsonImport(json);
      if (rows.length === 0) throw new Error("Enter at least one question");

      setLoading(true);
      const result = await bulkImportQuestionsFromRows(rows, {
        type: questionType,
        skipDuplicates: true,
        updateExisting: false,
      });

      if (!result.success || !result.data) {
        throw new Error(result.error ?? "Import failed");
      }

      setSummary(result.data);
      setStep("summary");
      onComplete?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to import JSON");
    } finally {
      setLoading(false);
    }
  };

  const title = questionType === "quiz" ? "Quiz" : questionType === "short_answer" ? "Short Answer" : "Theory";

  return (
    <>
      {trigger}
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Bulk Import — {title} Questions</DialogTitle>
          </DialogHeader>

          {step === "upload" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="bulk-import-json">JSON questions</Label>
                <Textarea
                  id="bulk-import-json"
                  value={json}
                  onChange={(event) => setJson(event.target.value)}
                  placeholder={getJsonExample(questionType)}
                  rows={14}
                  className="font-mono text-sm"
                  spellCheck={false}
                />
              </div>

              {error && (
                <div className="flex items-start gap-2 rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
                  <XCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <Button onClick={handleJsonUpload} disabled={loading || !json.trim()}>
                <Upload className="mr-2 h-4 w-4" />
                {loading ? "Uploading..." : "Upload JSON"}
              </Button>
            </div>
          )}

          {step === "summary" && summary && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle2 className="h-5 w-5" />
                <span className="font-medium">Import Complete</span>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                <div className="rounded-md border p-3 text-center"><p className="text-2xl font-bold">{summary.total}</p><p className="text-xs text-muted-foreground">Total Processed</p></div>
                <div className="rounded-md border p-3 text-center"><p className="text-2xl font-bold text-green-600">{summary.imported}</p><p className="text-xs text-muted-foreground">Imported</p></div>
                <div className="rounded-md border p-3 text-center"><p className="text-2xl font-bold text-blue-600">{summary.updated}</p><p className="text-xs text-muted-foreground">Updated</p></div>
                <div className="rounded-md border p-3 text-center"><p className="text-2xl font-bold text-amber-600">{summary.duplicates}</p><p className="text-xs text-muted-foreground">Duplicates</p></div>
                <div className="rounded-md border p-3 text-center"><p className="text-2xl font-bold text-muted-foreground">{summary.skipped}</p><p className="text-xs text-muted-foreground">Skipped</p></div>
                <div className="rounded-md border p-3 text-center"><p className="text-2xl font-bold text-destructive">{summary.errors.length}</p><p className="text-xs text-muted-foreground">Errors</p></div>
              </div>

              {summary.errors.length > 0 && (
                <div className="max-h-[200px] overflow-y-auto rounded-md border p-3">
                  <p className="mb-2 text-sm font-medium">Error Details</p>
                  <ul className="space-y-1 text-sm text-destructive">
                    {summary.errors.map((item) => <li key={item.row}>Row {item.row}: {item.message}</li>)}
                  </ul>
                </div>
              )}

              <Button onClick={() => handleOpenChange(false)} className="w-full sm:w-auto">Done</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
