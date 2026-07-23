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
  const [selectedDetail, setSelectedDetail] = useState<keyof BulkImportResult["details"] | null>(null);

  const reset = useCallback(() => {
    setStep("upload");
    setJson("");
    setError(null);
    setSummary(null);
    setSelectedDetail(null);
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
  const detailTitle = selectedDetail ? selectedDetail[0].toUpperCase() + selectedDetail.slice(1) : "";

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
                {[
                  ["total", summary.total, "", "Total Processed"],
                  ["imported", summary.imported, "text-green-600", "Imported"],
                  ["updated", summary.updated, "text-blue-600", "Updated"],
                  ["duplicates", summary.duplicates, "text-amber-600", "Duplicates"],
                  ["skipped", summary.skipped, "text-muted-foreground", "Skipped"],
                  ["errors", summary.errors.length, "text-destructive", "Errors"],
                ].map(([key, count, color, label]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setSelectedDetail(key as keyof BulkImportResult["details"])}
                    className="rounded-md border p-3 text-center transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <p className={`text-2xl font-bold ${color}`}>{count}</p>
                    <p className="text-xs text-muted-foreground">{label}</p>
                  </button>
                ))}
              </div>

              {selectedDetail && (
                <div className="max-h-[200px] overflow-y-auto rounded-md border p-3">
                  <p className="mb-2 text-sm font-medium">{detailTitle} Questions</p>
                  {summary.details[selectedDetail].length > 0 ? (
                    <ul className="space-y-2 text-sm">
                      {summary.details[selectedDetail].map((item) => (
                        <li key={`${item.row}-${item.question}`}>
                          <span className="font-medium">Row {item.row}: {item.question || "Untitled question"}</span>
                          <span className="text-muted-foreground"> · {item.subject || "No subject"}</span>
                          {item.message && <p className="text-destructive">{item.message}</p>}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground">No questions in this group.</p>
                  )}
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
