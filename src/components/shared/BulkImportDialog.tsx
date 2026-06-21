"use client";

import { useCallback, useRef, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  FileText,
  Upload,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  previewBulkImport,
  bulkImportQuestionsFromRows,
} from "@/actions/question.actions";
import type { BulkImportPreviewRow, BulkImportResult } from "@/lib/bulk-import-utils";
import {
  type BulkImportQuestionType,
  type BulkImportRawRow,
  downloadFile,
  generateSampleCsv,
  generateSampleExcel,
  getFormatDescription,
  getFormatExample,
  parseCsvImport,
  parseExcelImport,
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

type Step = "upload" | "preview" | "summary";

export function BulkImportDialog({
  open,
  onOpenChange,
  questionType,
  onComplete,
  trigger,
}: BulkImportDialogProps) {
  const csvInputRef = useRef<HTMLInputElement>(null);
  const excelInputRef = useRef<HTMLInputElement>(null);
  const jsonInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<Step>("upload");
  const [rows, setRows] = useState<BulkImportRawRow[]>([]);
  const [preview, setPreview] = useState<BulkImportPreviewRow[]>([]);
  const [duplicateCount, setDuplicateCount] = useState(0);
  const [skipDuplicates, setSkipDuplicates] = useState(true);
  const [updateExisting, setUpdateExisting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [columnError, setColumnError] = useState<string | null>(null);
  const [summary, setSummary] = useState<BulkImportResult | null>(null);

  const reset = useCallback(() => {
    setStep("upload");
    setRows([]);
    setPreview([]);
    setDuplicateCount(0);
    setSkipDuplicates(true);
    setUpdateExisting(false);
    setError(null);
    setColumnError(null);
    setSummary(null);
  }, []);

  const handleOpenChange = (next: boolean) => {
    if (!next) reset();
    onOpenChange(next);
  };

  const handleDownloadCsv = () => {
    const csv = generateSampleCsv(questionType);
    downloadFile(csv, `${questionType}-questions-sample.csv`, "text/csv");
  };

  const handleDownloadExcel = () => {
    const buffer = generateSampleExcel(questionType);
    downloadFile(buffer, `${questionType}-questions-sample.xlsx`, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  };

  const processRows = async (parsedRows: BulkImportRawRow[], headers: string[]) => {
    setColumnError(null);
    setError(null);

    const validation = validateRequiredColumns(headers, questionType);
    if (!validation.valid) {
      setColumnError(`Missing required columns: ${validation.missing.join(", ")}`);
      return;
    }

    if (parsedRows.length === 0) {
      setError("No valid records found in the file");
      return;
    }

    setRows(parsedRows);
    setLoading(true);

    const result = await previewBulkImport(parsedRows, questionType);
    setLoading(false);

    if (!result.success || !result.data) {
      setError(result.error ?? "Failed to preview import");
      return;
    }

    setPreview(result.data.preview);
    setDuplicateCount(result.data.duplicateCount);
    setStep("preview");
  };

  const handleCsvUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const { rows: parsedRows, headers } = parseCsvImport(text);
      await processRows(parsedRows, headers);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to parse CSV");
    }
    e.target.value = "";
  };

  const handleExcelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const buffer = await file.arrayBuffer();
      const { rows: parsedRows, headers } = parseExcelImport(buffer);
      await processRows(parsedRows, headers);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to parse Excel");
    }
    e.target.value = "";
  };

  const handleJsonUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      if (!Array.isArray(parsed)) throw new Error("JSON must be an array of question objects");
      const headers = parsed.length > 0 ? Object.keys(parsed[0] as object) : [];
      const parsedRows = parseJsonImport(text);
      await processRows(parsedRows, headers);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to parse JSON");
    }
    e.target.value = "";
  };

  const handleImport = async () => {
    setLoading(true);
    setError(null);

    const result = await bulkImportQuestionsFromRows(rows, {
      type: questionType,
      skipDuplicates,
      updateExisting,
    });

    setLoading(false);

    if (!result.success || !result.data) {
      setError(result.error ?? "Import failed");
      return;
    }

    setSummary(result.data);
    setStep("summary");
    onComplete?.();
  };

  const validCount = preview.filter((r) => !r.error).length;
  const errorCount = preview.filter((r) => r.error).length;

  return (
    <>
      {trigger}
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Bulk Import Format — {questionType === "quiz" ? "Quiz" : questionType === "short_answer" ? "Short Answer" : "Theory"} Questions
            </DialogTitle>
          </DialogHeader>

          {step === "upload" && (
            <div className="space-y-4">
              <div className="rounded-md border bg-muted/30 p-3">
                <p className="text-sm text-muted-foreground">{getFormatDescription(questionType)}</p>
                <pre className="mt-2 overflow-x-auto text-xs text-muted-foreground">
                  {getFormatExample(questionType)}
                </pre>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">Download Sample</p>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" onClick={handleDownloadCsv}>
                    <Download className="mr-2 h-4 w-4" />
                    Download Sample CSV
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleDownloadExcel}>
                    <Download className="mr-2 h-4 w-4" />
                    Download Sample Excel
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">Upload File</p>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => csvInputRef.current?.click()}
                    disabled={loading}
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    Upload CSV
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => excelInputRef.current?.click()}
                    disabled={loading}
                  >
                    <FileSpreadsheet className="mr-2 h-4 w-4" />
                    Upload Excel
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => jsonInputRef.current?.click()}
                    disabled={loading}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Upload JSON
                  </Button>
                </div>
                <input ref={csvInputRef} type="file" accept=".csv,text/csv" className="hidden" onChange={handleCsvUpload} />
                <input ref={excelInputRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={handleExcelUpload} />
                <input ref={jsonInputRef} type="file" accept=".json,application/json" className="hidden" onChange={handleJsonUpload} />
              </div>

              {columnError && (
                <div className="flex items-start gap-2 rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
                  <XCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{columnError}</span>
                </div>
              )}
              {error && (
                <div className="flex items-start gap-2 rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
                  <XCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
              {loading && <p className="text-sm text-muted-foreground">Processing file...</p>}
            </div>
          )}

          {step === "preview" && (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">{rows.length} total records</Badge>
                <Badge variant="outline">{validCount} valid</Badge>
                {errorCount > 0 && <Badge variant="destructive">{errorCount} errors</Badge>}
                {duplicateCount > 0 && (
                  <Badge variant="outline" className="border-amber-500 text-amber-600">
                    <AlertTriangle className="mr-1 h-3 w-3" />
                    {duplicateCount} duplicate{duplicateCount !== 1 ? "s" : ""}
                  </Badge>
                )}
              </div>

              {duplicateCount > 0 && (
                <div className="flex items-start gap-2 rounded-md border border-amber-500/50 bg-amber-500/10 p-3 text-sm">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                  <span>
                    {duplicateCount} question{duplicateCount !== 1 ? "s" : ""} already exist in the database.
                    Enable options below to skip or update them.
                  </span>
                </div>
              )}

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="flex items-center gap-2">
                  <Switch
                    id="skip-duplicates"
                    checked={skipDuplicates}
                    onCheckedChange={setSkipDuplicates}
                    disabled={updateExisting}
                  />
                  <Label htmlFor="skip-duplicates" className="text-sm">
                    Skip duplicate questions
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    id="update-existing"
                    checked={updateExisting}
                    onCheckedChange={(checked) => {
                      setUpdateExisting(checked);
                      if (checked) setSkipDuplicates(false);
                    }}
                  />
                  <Label htmlFor="update-existing" className="text-sm">
                    Bulk update existing questions
                  </Label>
                </div>
              </div>

              <div className="max-h-[300px] overflow-y-auto rounded-md border">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-muted">
                    <tr>
                      <th className="px-3 py-2 text-left font-medium">#</th>
                      <th className="px-3 py-2 text-left font-medium">Subject</th>
                      <th className="px-3 py-2 text-left font-medium">Question</th>
                      <th className="px-3 py-2 text-left font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {preview.map((row) => (
                      <tr key={row.rowIndex} className="border-t">
                        <td className="px-3 py-2 text-muted-foreground">{row.rowIndex}</td>
                        <td className="px-3 py-2">{row.subject}</td>
                        <td className="max-w-[200px] truncate px-3 py-2">{row.question}</td>
                        <td className="px-3 py-2">
                          {row.error ? (
                            <span className="text-destructive">{row.error}</span>
                          ) : row.isDuplicate ? (
                            <span className="text-amber-600">Duplicate</span>
                          ) : (
                            <span className="text-green-600">Ready</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {error && (
                <div className="flex items-start gap-2 rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
                  <XCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep("upload")} disabled={loading}>
                  Back
                </Button>
                <Button onClick={handleImport} disabled={loading || validCount === 0}>
                  <Upload className="mr-2 h-4 w-4" />
                  {loading ? "Importing..." : `Import ${validCount} Question${validCount !== 1 ? "s" : ""}`}
                </Button>
              </div>
            </div>
          )}

          {step === "summary" && summary && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle2 className="h-5 w-5" />
                <span className="font-medium">Import Complete</span>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                <div className="rounded-md border p-3 text-center">
                  <p className="text-2xl font-bold">{summary.total}</p>
                  <p className="text-xs text-muted-foreground">Total Processed</p>
                </div>
                <div className="rounded-md border p-3 text-center">
                  <p className="text-2xl font-bold text-green-600">{summary.imported}</p>
                  <p className="text-xs text-muted-foreground">Imported</p>
                </div>
                <div className="rounded-md border p-3 text-center">
                  <p className="text-2xl font-bold text-blue-600">{summary.updated}</p>
                  <p className="text-xs text-muted-foreground">Updated</p>
                </div>
                <div className="rounded-md border p-3 text-center">
                  <p className="text-2xl font-bold text-amber-600">{summary.duplicates}</p>
                  <p className="text-xs text-muted-foreground">Duplicates</p>
                </div>
                <div className="rounded-md border p-3 text-center">
                  <p className="text-2xl font-bold text-muted-foreground">{summary.skipped}</p>
                  <p className="text-xs text-muted-foreground">Skipped</p>
                </div>
                <div className="rounded-md border p-3 text-center">
                  <p className="text-2xl font-bold text-destructive">{summary.errors.length}</p>
                  <p className="text-xs text-muted-foreground">Errors</p>
                </div>
              </div>

              {summary.errors.length > 0 && (
                <div className="max-h-[200px] overflow-y-auto rounded-md border p-3">
                  <p className="mb-2 text-sm font-medium">Error Details</p>
                  <ul className="space-y-1 text-sm text-destructive">
                    {summary.errors.map((err) => (
                      <li key={err.row}>
                        Row {err.row}: {err.message}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <Button onClick={() => handleOpenChange(false)}>Done</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
