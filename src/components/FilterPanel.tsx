"use client";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DIFFICULTIES } from "@/constants";
import { cn } from "@/lib/utils";

interface FilterPanelProps {
  subjectId: string;
  onSubjectChange: (value: string) => void;
  difficulty: string;
  onDifficultyChange: (value: string) => void;
  subjects: { id: string; name: string }[];
  className?: string;
}

export function FilterPanel({
  subjectId,
  onSubjectChange,
  difficulty,
  onDifficultyChange,
  subjects,
  className,
}: FilterPanelProps) {
  return (
    <div className={cn("grid gap-4 sm:grid-cols-2", className)}>
      <div className="space-y-2">
        <Label>Subject</Label>
        <Select value={subjectId} onValueChange={onSubjectChange}>
          <SelectTrigger>
            <SelectValue placeholder="All subjects" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Subjects</SelectItem>
            {subjects.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Difficulty</Label>
        <Select value={difficulty} onValueChange={onDifficultyChange}>
          <SelectTrigger>
            <SelectValue placeholder="All difficulties" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Difficulties</SelectItem>
            {DIFFICULTIES.map((d) => (
              <SelectItem key={d.value} value={d.value}>
                {d.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
