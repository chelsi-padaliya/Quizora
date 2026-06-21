"use client";

import { QuestionForm } from "@/components/forms/QuestionForm";
import type { Question } from "@/types";

interface ShortAnswerFormProps {
  subjects: { id: string; name: string }[];
  topics: { id: string; name: string; subjectId: string }[];
  question?: Question & {
    subject: { id: string; name: string } | null;
    topic: { id: string; name: string } | null;
  };
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function ShortAnswerForm({ question, ...props }: ShortAnswerFormProps) {
  return <QuestionForm {...props} question={question} fixedType="short_answer" />;
}
