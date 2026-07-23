import * as XLSX from "xlsx";

export type BulkImportQuestionType = "quiz" | "theory" | "short_answer";

export const QUIZ_IMPORT_COLUMNS = [
  "subject",
  "topic",
  "difficulty",
  "question",
  "optionA",
  "optionB",
  "optionC",
  "optionD",
  "correctAnswer",
  "explanation",
] as const;

export const THEORY_IMPORT_COLUMNS = [
  "subject",
  "topic",
  "difficulty",
  "question",
  "answer",
] as const;

export const SHORT_ANSWER_IMPORT_COLUMNS = [
  "subject",
  "topic",
  "difficulty",
  "question",
  "answer",
  "explanation",
] as const;

export type QuizImportColumn = (typeof QUIZ_IMPORT_COLUMNS)[number];
export type TheoryImportColumn = (typeof THEORY_IMPORT_COLUMNS)[number];
export type ShortAnswerImportColumn = (typeof SHORT_ANSWER_IMPORT_COLUMNS)[number];

export interface BulkImportRawRow {
  subject: string;
  topic?: string;
  difficulty: string;
  question: string;
  optionA?: string;
  optionB?: string;
  optionC?: string;
  optionD?: string;
  correctAnswer?: string;
  explanation?: string;
  answer?: string;
}

export interface BulkImportPreviewRow extends BulkImportRawRow {
  rowIndex: number;
  isDuplicate?: boolean;
  error?: string;
}

export interface BulkImportResult {
  total: number;
  imported: number;
  updated: number;
  skipped: number;
  duplicates: number;
  errors: { row: number; message: string }[];
  details: {
    total: BulkImportResultRow[];
    imported: BulkImportResultRow[];
    updated: BulkImportResultRow[];
    duplicates: BulkImportResultRow[];
    skipped: BulkImportResultRow[];
    errors: BulkImportResultRow[];
  };
}

export interface BulkImportResultRow {
  row: number;
  subject: string;
  question: string;
  message?: string;
}

const QUIZ_SAMPLE_ROW: BulkImportRawRow = {
  subject: "JavaScript",
  topic: "Array",
  difficulty: "Beginner",
  question: "What is map()?",
  optionA: "Transforms array",
  optionB: "Filters array",
  optionC: "Deletes array",
  optionD: "Sorts array",
  correctAnswer: "A",
  explanation: "map transforms every item",
};

const THEORY_SAMPLE_ROW: BulkImportRawRow = {
  subject: "System Design",
  topic: "Scaling",
  difficulty: "Advanced",
  question: "What is horizontal scaling?",
  answer: "Adding more servers to handle traffic.",
};

const SHORT_ANSWER_SAMPLE_ROW: BulkImportRawRow = {
  subject: "API",
  topic: "HTTP Methods",
  difficulty: "Beginner",
  question: "What is GET used for?",
  answer: "Read Data",
  explanation: "GET is used to retrieve/read data.",
};

function getColumns(type: BulkImportQuestionType) {
  if (type === "quiz") return QUIZ_IMPORT_COLUMNS;
  if (type === "short_answer") return SHORT_ANSWER_IMPORT_COLUMNS;
  return THEORY_IMPORT_COLUMNS;
}

function getSampleRow(type: BulkImportQuestionType): BulkImportRawRow {
  if (type === "quiz") return QUIZ_SAMPLE_ROW;
  if (type === "short_answer") return SHORT_ANSWER_SAMPLE_ROW;
  return THEORY_SAMPLE_ROW;
}

function normalizeKey(key: string): string {
  return key.trim().replace(/^\ufeff/, "");
}

function objectToRawRow(obj: Record<string, unknown>): BulkImportRawRow {
  const get = (key: string) => {
    const val = obj[key] ?? obj[key.toLowerCase()];
    return val != null ? String(val).trim() : "";
  };

  return {
    subject: get("subject"),
    topic: get("topic") || undefined,
    difficulty: get("difficulty"),
    question: get("question"),
    optionA: get("optionA") || undefined,
    optionB: get("optionB") || undefined,
    optionC: get("optionC") || undefined,
    optionD: get("optionD") || undefined,
    correctAnswer: get("correctAnswer") || undefined,
    explanation: get("explanation") || undefined,
    answer: get("answer") || undefined,
  };
}

function isEmptyRow(row: BulkImportRawRow): boolean {
  return !row.subject && !row.question && !row.difficulty;
}

export function validateRequiredColumns(
  headers: string[],
  type: BulkImportQuestionType
): { valid: boolean; missing: string[] } {
  const required =
    type === "quiz"
      ? ["subject", "difficulty", "question", "optionA", "optionB", "optionC", "optionD", "correctAnswer"]
      : ["subject", "difficulty", "question", "answer"];

  const normalized = headers.map((h) => normalizeKey(h).toLowerCase());
  const missing = required.filter((col) => !normalized.includes(col.toLowerCase()));
  return { valid: missing.length === 0, missing };
}

export function parseJsonImport(json: string): BulkImportRawRow[] {
  const parsed = JSON.parse(json);
  if (!Array.isArray(parsed)) throw new Error("JSON must be an array of question objects");

  return parsed
    .map((item) => objectToRawRow(item as Record<string, unknown>))
    .filter((row) => !isEmptyRow(row));
}

export function parseCsvImport(csv: string): { rows: BulkImportRawRow[]; headers: string[] } {
  const workbook = XLSX.read(csv, { type: "string" });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  if (!sheet) throw new Error("CSV file is empty");

  const data = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" });
  const headers = data.length > 0 ? Object.keys(data[0]) : [];

  const rows = data
    .map((item) => objectToRawRow(item))
    .filter((row) => !isEmptyRow(row));

  return { rows, headers };
}

export function parseExcelImport(buffer: ArrayBuffer): { rows: BulkImportRawRow[]; headers: string[] } {
  const workbook = XLSX.read(buffer, { type: "array" });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  if (!sheet) throw new Error("Excel file is empty");

  const data = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" });
  const headers = data.length > 0 ? Object.keys(data[0]) : [];

  const rows = data
    .map((item) => objectToRawRow(item))
    .filter((row) => !isEmptyRow(row));

  return { rows, headers };
}

export function generateSampleCsv(type: BulkImportQuestionType): string {
  const columns = getColumns(type);
  const sample = getSampleRow(type);
  const header = columns.join(",");
  const values = columns.map((col) => {
    const val = sample[col as keyof BulkImportRawRow] ?? "";
    return val.includes(",") ? `"${val}"` : val;
  });
  return `${header}\n${values.join(",")}`;
}

export function generateSampleExcel(type: BulkImportQuestionType): ArrayBuffer {
  const columns = getColumns(type);
  const sample = getSampleRow(type);
  const row: Record<string, string> = {};
  columns.forEach((col) => {
    row[col] = String(sample[col as keyof BulkImportRawRow] ?? "");
  });

  const worksheet = XLSX.utils.json_to_sheet([row], { header: [...columns] });
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Sample");
  return XLSX.write(workbook, { type: "array", bookType: "xlsx" }) as ArrayBuffer;
}

export function downloadFile(content: string | ArrayBuffer, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function getFormatDescription(type: BulkImportQuestionType): string {
  if (type === "quiz") {
    return "Columns: subject, topic, difficulty, question, optionA, optionB, optionC, optionD, correctAnswer, explanation";
  }
  if (type === "short_answer") {
    return "Columns: subject, topic, difficulty, question, answer, explanation";
  }
  return "Columns: subject, topic, difficulty, question, answer";
}

export function getFormatExample(type: BulkImportQuestionType): string {
  if (type === "quiz") {
    return "subject,topic,difficulty,question,optionA,optionB,optionC,optionD,correctAnswer,explanation\nJavaScript,Array,Beginner,What is map()?,Transforms array,Filters array,Deletes array,Sorts array,A,map transforms every item";
  }
  if (type === "short_answer") {
    return "subject,topic,difficulty,question,answer,explanation\nAPI,HTTP Methods,Beginner,What is GET used for?,Read Data,GET is used to retrieve/read data.";
  }
  return "subject,topic,difficulty,question,answer\nSystem Design,Scaling,Advanced,What is horizontal scaling?,Adding more servers to handle traffic.";
}
