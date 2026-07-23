"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
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
  subjects: { id: string; name: string; technology?: { id: string; name: string } }[];
  topics: { id: string; name: string; subjectId: string }[];
  question?: Question & { subject: { id: string; name: string } | null; topic: { id: string; name: string } | null };
  fixedType?: "quiz" | "theory" | "short_answer";
  defaultSubjectId?: string;
  defaultDifficulty?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function QuestionForm({
  subjects,
  topics,
  question,
  fixedType,
  defaultSubjectId,
  defaultDifficulty,
  onSuccess,
  onCancel,
}: QuestionFormProps) {
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
          subjectId: question.subjectId ?? undefined,
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
          difficulty: (defaultDifficulty ?? "beginner") as "beginner" | "intermediate" | "advanced",
          subjectId: defaultSubjectId,
        },
  });

  const subjectId = watch("subjectId") ?? "";
  const [technologyId, setTechnologyId] = useState(() => subjects.find((s) => s.id === (question?.subjectId ?? defaultSubjectId))?.technology?.id ?? "");
  const questionType = fixedType ?? watch("type");
  const filteredSubjects = technologyId ? subjects.filter((s) => s.technology?.id === technologyId) : [];
  const filteredTopics = topics.filter((t) => t.subjectId === subjectId);
  const technologies = Array.from(new Map(subjects.filter((s) => s.technology).map((s) => [s.technology!.id, s.technology!])).values());


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
          <Label>Technology</Label>
          <Select value={technologyId} onValueChange={(v) => { setTechnologyId(v); setValue("subjectId", undefined); setValue("topicId", undefined); }}>
            <SelectTrigger><SelectValue placeholder="Select technology" /></SelectTrigger>
            <SelectContent>{technologies.map((t) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Subject</Label>
          <Select
            value={subjectId}
            onValueChange={(v) => { setValue("subjectId", v); setValue("topicId", undefined); }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select subject" />
            </SelectTrigger>
            <SelectContent>
              {filteredSubjects.map((s) => (
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

      {technologyId && subjectId && (
        <div className="space-y-2">
          <Label>Topic (optional)</Label>
          <Select
            value={watch("topicId") ?? ""}
            onValueChange={(v) => setValue("topicId", v || undefined)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select topic" />
            </SelectTrigger>
            <SelectContent>
              {filteredTopics.map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  {t.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

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
            <RadioGroup
              value={watch("correctAnswer") ?? ""}
              onValueChange={(v) =>
                setValue("correctAnswer", v, { shouldDirty: true, shouldValidate: true })
              }
              className="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap"
            >
              {["A", "B", "C", "D"].map((opt) => (
                <Label
                  key={opt}
                  htmlFor={`correct-answer-${opt}`}
                  className="flex h-11 min-w-24 cursor-pointer items-center gap-2 rounded-md border border-input px-3 text-sm font-medium hover:bg-accent hover:text-accent-foreground has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/10"
                >
                  <RadioGroupItem id={`correct-answer-${opt}`} value={opt} />
                  Option {opt}
                </Label>
              ))}
            </RadioGroup>
            {errors.correctAnswer && (
              <p className="text-sm text-destructive">{errors.correctAnswer.message}</p>
            )}
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

      {questionType === "short_answer" && (
        <>
          <div className="space-y-2">
            <Label>Correct Answer</Label>
            <Textarea {...register("answer")} rows={3} placeholder="e.g. Read Data" />
            {errors.answer && (
              <p className="text-sm text-destructive">{errors.answer.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label>Explanation</Label>
            <Textarea {...register("explanation")} rows={2} />
          </div>
        </>
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
