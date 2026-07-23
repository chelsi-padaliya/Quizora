"use client";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface FilterPanelProps {
  subjectId: string;
  onSubjectChange: (value: string) => void;
  technologyId: string;
  onTechnologyChange: (value: string) => void;
  topicId: string;
  onTopicChange: (value: string) => void;
  subjects: { id: string; name: string; technology?: { id: string; name: string } }[];
  topics: { id: string; name: string; subjectId: string }[];
  className?: string;
}

export function FilterPanel({
  subjectId,
  onSubjectChange,
  technologyId,
  onTechnologyChange,
  topicId,
  onTopicChange,
  subjects,
  topics,
  className,
}: FilterPanelProps) {
  const technologies = Array.from(new Map(subjects.filter((subject) => subject.technology).map((subject) => [subject.technology!.id, subject.technology!])).values());
  const availableSubjects = technologyId && technologyId !== "all" ? subjects.filter((subject) => subject.technology?.id === technologyId) : subjects;
  const availableTopics = subjectId !== "all" ? topics.filter((topic) => topic.subjectId === subjectId) : [];

  return (
    <div className={cn("grid gap-4 sm:grid-cols-2 lg:grid-cols-3", className)}>
      <div className="space-y-2">
        <Label>Technology</Label>
        <Select value={technologyId} onValueChange={onTechnologyChange}>
          <SelectTrigger><SelectValue placeholder="All technologies" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Technologies</SelectItem>
            {technologies.map((technology) => <SelectItem key={technology.id} value={technology.id}>{technology.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Subject</Label>
        <Select value={subjectId} onValueChange={onSubjectChange}>
          <SelectTrigger>
            <SelectValue placeholder="All subjects" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Subjects</SelectItem>
            {availableSubjects.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Topic</Label>
        <Select value={topicId} onValueChange={onTopicChange} disabled={subjectId === "all"}>
          <SelectTrigger><SelectValue placeholder={subjectId === "all" ? "Select a subject first" : "All topics"} /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Topics</SelectItem>
            {availableTopics.map((topic) => <SelectItem key={topic.id} value={topic.id}>{topic.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
