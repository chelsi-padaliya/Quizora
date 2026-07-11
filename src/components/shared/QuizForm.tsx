"use client";

import { QuestionForm } from "@/components/forms/QuestionForm";
import type { Question } from "@/types";

interface QuizFormProps {
  subjects: { id: string; name: string }[];
  topics: { id: string; name: string; subjectId: string }[];
  question?: Question & {
    subject: { id: string; name: string } | null;
    topic: { id: string; name: string } | null;
  };
  defaultSubjectId?: string;
  defaultDifficulty?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function QuizForm({ question, ...props }: QuizFormProps) {
  return <QuestionForm {...props} question={question} fixedType="quiz" />;
}

export function TheoryForm({ question, ...props }: QuizFormProps) {
  return <QuestionForm {...props} question={question} fixedType="theory" />;
}
