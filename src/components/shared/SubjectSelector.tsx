"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface SubjectSelectorProps {
  subjects: { id: string; name: string }[];
  value?: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  className?: string;
  error?: string;
}

export function SubjectSelector({
  subjects,
  value,
  onChange,
  label = "Subject",
  placeholder = "Select subject",
  className,
  error,
}: SubjectSelectorProps) {
  return (
    <div className={cn("space-y-2", className)}>
      {label && <Label>{label}</Label>}
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {subjects.map((s) => (
            <SelectItem key={s.id} value={s.id}>
              {s.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
