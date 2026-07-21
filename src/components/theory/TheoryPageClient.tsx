"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FilterPanel } from "@/components/FilterPanel";
import { SearchBar } from "@/components/SearchBar";
import { Pagination } from "@/components/Pagination";
import { TheoryCard } from "@/components/theory/TheoryCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useDebounce } from "@/hooks/use-debounce";
import type { TheoryQuestionItem } from "@/types";

interface TheoryPageClientProps {
  subjects: { id: string; name: string; slug: string; technology?: { id: string; name: string } }[];
  topics: { id: string; name: string; subjectId: string }[];
}

export function TheoryPageClient({ subjects, topics }: TheoryPageClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [questions, setQuestions] = useState<TheoryQuestionItem[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState(searchParams.get("search") ?? "");

  const page = Number(searchParams.get("page") ?? "1");
  const subjectId = searchParams.get("subjectId") ?? "all";
  const difficulty = searchParams.get("difficulty") ?? "all";
  const technologyId = searchParams.get("technologyId") ?? "all";
  const topicId = searchParams.get("topicId") ?? "all";
  const filteredTopics = subjectId === "all" ? [] : topics.filter((topic) => topic.subjectId === subjectId);
  const debouncedSearch = useDebounce(searchInput, 300);

  const updateParams = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value && value !== "all") {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      });
      if (!updates.page) params.delete("page");
      router.push(`/theory?${params.toString()}`);
    },
    [router, searchParams]
  );

  useEffect(() => {
    if (debouncedSearch !== (searchParams.get("search") ?? "")) {
      updateParams({ search: debouncedSearch, page: "1" });
    }
  }, [debouncedSearch, searchParams, updateParams]);

  const fetchQuestions = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      if (subjectId !== "all") params.set("subjectId", subjectId);
      if (topicId !== "all") params.set("topicId", topicId);
      if (difficulty !== "all") params.set("difficulty", difficulty);
      const search = searchParams.get("search");
      if (search) params.set("search", search);

      const res = await fetch(`/api/theory/questions?${params.toString()}`);
      const data = await res.json();
      setQuestions(data.data ?? []);
      setTotalPages(data.totalPages ?? 1);
    } finally {
      setLoading(false);
    }
  }, [page, subjectId, topicId, difficulty, searchParams]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  return (
    <div className="space-y-6">
      <SearchBar
        value={searchInput}
        onChange={setSearchInput}
        placeholder="Search theory questions..."
      />

      <FilterPanel
        subjectId={subjectId}
        onSubjectChange={(v) => updateParams({ subjectId: v, topicId: "all", page: "1" })}
        technologyId={technologyId}
        onTechnologyChange={(v) => updateParams({ technologyId: v, subjectId: "all", topicId: "all", page: "1" })}
        difficulty={difficulty}
        onDifficultyChange={(v) => updateParams({ difficulty: v, page: "1" })}
        subjects={subjects}
      />
      <div className="max-w-sm space-y-2"><Label>Topic</Label><Select value={topicId} onValueChange={(value) => updateParams({ topicId: value, page: "1" })} disabled={subjectId === "all"}><SelectTrigger><SelectValue placeholder={subjectId === "all" ? "Select a subject first" : "All topics"} /></SelectTrigger><SelectContent><SelectItem value="all">All Topics</SelectItem>{filteredTopics.map((topic) => <SelectItem key={topic.id} value={topic.id}>{topic.name}</SelectItem>)}</SelectContent></Select></div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : (
        <TheoryCard questions={questions} />
      )}

      <Pagination
        page={page}
        totalPages={totalPages}
        onPageChange={(p) => updateParams({ page: String(p) })}
      />
    </div>
  );
}
