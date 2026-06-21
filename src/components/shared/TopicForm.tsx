"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createTopic, updateTopic } from "@/actions/topic.actions";
import { SubjectSelector } from "@/components/shared/SubjectSelector";
import { topicSchema, type TopicInput } from "@/validations";
import { useState } from "react";

interface TopicFormProps {
  subjects: { id: string; name: string }[];
  topic?: { id: string; name: string; subjectId: string };
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function TopicForm({ subjects, topic, onSuccess, onCancel }: TopicFormProps) {
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<TopicInput>({
    resolver: zodResolver(topicSchema),
    defaultValues: topic
      ? { subjectId: topic.subjectId, name: topic.name }
      : { subjectId: "", name: "" },
  });

  const subjectId = watch("subjectId");

  const onSubmit = async (data: TopicInput) => {
    setError(null);
    const result = topic
      ? await updateTopic(topic.id, data)
      : await createTopic(data);

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
      <SubjectSelector
        subjects={subjects}
        value={subjectId}
        onChange={(v) => setValue("subjectId", v)}
        error={errors.subjectId?.message}
      />
      <div className="space-y-2">
        <Label>Topic Name</Label>
        <Input {...register("name")} placeholder="Closures" />
        {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
      </div>
      <div className="flex gap-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : topic ? (
            "Update Topic"
          ) : (
            "Create Topic"
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
