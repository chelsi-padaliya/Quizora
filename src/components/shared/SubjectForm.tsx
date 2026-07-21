"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createSubject, updateSubject } from "@/actions/subject.actions";
import { subjectSchema, type SubjectInput } from "@/validations";
import { slugify } from "@/lib/utils";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface SubjectFormProps {
  subject?: { id: string; name: string; slug: string; technologyId: string };
  technologies: { id: string; name: string }[];
  defaultTechnologyId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function SubjectForm({ subject, technologies, defaultTechnologyId, onSuccess, onCancel }: SubjectFormProps) {
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<SubjectInput>({
    resolver: zodResolver(subjectSchema),
    defaultValues: subject
      ? { name: subject.name, slug: subject.slug, technologyId: subject.technologyId }
      : { name: "", slug: "", technologyId: defaultTechnologyId ?? "" },
  });

  const name = watch("name");

  const onSubmit = async (data: SubjectInput) => {
    setError(null);
    const payload = { ...data, slug: data.slug || slugify(data.name) };
    const result = subject
      ? await updateSubject(subject.id, payload)
      : await createSubject(payload);

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
      <div className="space-y-2">
        <Label>Technology</Label>
        <Select value={watch("technologyId")} onValueChange={(value) => setValue("technologyId", value)}>
          <SelectTrigger><SelectValue placeholder="Select technology" /></SelectTrigger>
          <SelectContent>{technologies.map((technology) => <SelectItem key={technology.id} value={technology.id}>{technology.name}</SelectItem>)}</SelectContent>
        </Select>
        {errors.technologyId && <p className="text-sm text-destructive">{errors.technologyId.message}</p>}
      </div>
      <div className="space-y-2">
        <Label>Name</Label>
        <Input {...register("name")} placeholder="JavaScript" />
        {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
      </div>
      <div className="space-y-2">
        <Label>Slug (optional)</Label>
        <Input
          {...register("slug")}
          placeholder={name ? slugify(name) : "javascript"}
        />
        {errors.slug && <p className="text-sm text-destructive">{errors.slug.message}</p>}
      </div>
      <div className="flex gap-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : subject ? (
            "Update Subject"
          ) : (
            "Create Subject"
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
