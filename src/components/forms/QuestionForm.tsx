"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createQuestion, updateQuestion } from "@/actions/question.actions";
import { DIFFICULTIES } from "@/constants";
import { questionSchema, type QuestionInput } from "@/validations";
import type { Question } from "@/types";

interface QuestionFormProps {
  subjects: { id: string; name: string }[];
  topics: { id: string; name: string; subjectId: string }[];
  question?: Question & { subject: { id: string; name: string }; topic: { id: string; name: string } | null };
  fixedType?: "quiz" | "theory";
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function QuestionForm({
  subjects,
  topics,
  question,
  fixedType,
  onSuccess,
  onCancel,
}: QuestionFormProps) {
  const [filteredTopics, setFilteredTopics] = useState(topics);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<QuestionInput>({
    resolver: zodResolver(questionSchema),
    defaultValues: question
      ? {
          subjectId: question.subjectId,
          topicId: question.topicId ?? undefined,
          type: question.type,
          difficulty: question.difficulty,
          question: question.question,
          optionA: question.optionA ?? undefined,
          optionB: question.optionB ?? undefined,
          optionC: question.optionC ?? undefined,
          optionD: question.optionD ?? undefined,
          correctAnswer: question.correctAnswer ?? undefined,
          explanation: question.explanation ?? undefined,
          answer: question.answer ?? undefined,
        }
      : {
          type: fixedType ?? "quiz",
          difficulty: "beginner",
        },
  });

  const subjectId = watch("subjectId");
  const questionType = fixedType ?? watch("type");

  useEffect(() => {
    if (subjectId) {
      setFilteredTopics(topics.filter((t) => t.subjectId === subjectId));
    }
  }, [subjectId, topics]);

  const onSubmit = async (data: QuestionInput) => {
    setError(null);
    const payload = fixedType ? { ...data, type: fixedType } : data;
    const result = question
      ? await updateQuestion(question.id, payload)
      : await createQuestion(payload);

    if (result.success) {
      onSuccess?.();
    } else {
      setError(result.error ?? "Something went wrong");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Subject</Label>
          <Select
            value={subjectId}
            onValueChange={(v) => setValue("subjectId", v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select subject" />
            </SelectTrigger>
            <SelectContent>
              {subjects.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.subjectId && (
            <p className="text-sm text-destructive">{errors.subjectId.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Difficulty</Label>
          <Select
            value={watch("difficulty")}
            onValueChange={(v) =>
              setValue("difficulty", v as "beginner" | "intermediate" | "advanced")
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DIFFICULTIES.map((d) => (
                <SelectItem key={d.value} value={d.value}>
                  {d.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Question</Label>
        <Textarea {...register("question")} rows={3} />
        {errors.question && (
          <p className="text-sm text-destructive">{errors.question.message}</p>
        )}
      </div>

      {questionType === "quiz" && (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            {(["optionA", "optionB", "optionC", "optionD"] as const).map((field, i) => (
              <div key={field} className="space-y-2">
                <Label>Option {String.fromCharCode(65 + i)}</Label>
                <Input {...register(field)} />
              </div>
            ))}
          </div>
          <div className="space-y-2">
            <Label>Correct Answer</Label>
            <Select
              value={watch("correctAnswer") ?? ""}
              onValueChange={(v) => setValue("correctAnswer", v)}
            >
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                {["A", "B", "C", "D"].map((opt) => (
                  <SelectItem key={opt} value={opt}>
                    {opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Explanation</Label>
            <Textarea {...register("explanation")} rows={2} />
          </div>
        </>
      )}

      {questionType === "theory" && (
        <div className="space-y-2">
          <Label>Answer</Label>
          <Textarea {...register("answer")} rows={4} />
          {errors.answer && (
            <p className="text-sm text-destructive">{errors.answer.message}</p>
          )}
        </div>
      )}

      <div className="flex gap-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : question ? (
            "Update Question"
          ) : (
            "Create Question"
          )}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
