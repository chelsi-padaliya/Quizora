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

interface TopicSelectorProps {
  topics: { id: string; name: string; subjectId: string }[];
  subjectId?: string;
  value?: string;
  onChange: (value: string | undefined) => void;
  label?: string;
  className?: string;
}

export function TopicSelector({
  topics,
  subjectId,
  value,
  onChange,
  label = "Topic (optional)",
  className,
}: TopicSelectorProps) {
  const filtered = subjectId ? topics.filter((t) => t.subjectId === subjectId) : topics;

  return (
    <div className={cn("space-y-2", className)}>
      {label && <Label>{label}</Label>}
      <Select
        value={value ?? "none"}
        onValueChange={(v) => onChange(v === "none" ? undefined : v)}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select topic" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">None</SelectItem>
          {filtered.map((t) => (
            <SelectItem key={t.id} value={t.id}>
              {t.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
