"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, ChevronLeft, ChevronRight, Send, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { submitQuiz } from "@/actions/question.actions";
import { QUESTION_LIMITS } from "@/constants";
import { FilterPanel } from "@/components/FilterPanel";
import { cn } from "@/lib/utils";
import type { QuizQuestion } from "@/types";

interface QuizPlayerProps {
  subjects: { id: string; name: string; slug: string; technology?: { id: string; name: string } }[];
  topics: { id: string; name: string; subjectId: string }[];
  initialQuestions?: QuizQuestion[];
  initialSubjectId?: string;
}

export function QuizPlayer({ subjects, topics, initialQuestions, initialSubjectId }: QuizPlayerProps) {
  const router = useRouter();
  const [phase, setPhase] = useState<"config" | "quiz" | "submitting">(
    initialQuestions?.length ? "quiz" : "config"
  );
  const [subjectId, setSubjectId] = useState(initialSubjectId ?? "all");
  const [technologyId, setTechnologyId] = useState("all");
  const [topicId, setTopicId] = useState("all");
  const [limit, setLimit] = useState<string>("10");
  const [questions, setQuestions] = useState<QuizQuestion[]>(initialQuestions ?? []);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<
    Record<string, { selected: string | null; skipped: boolean }>
  >({});
  const [loading, setLoading] = useState(false);

  const currentQuestion = questions[currentIndex];
  const progress = questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0;

  const handleSubmit = useCallback(async () => {
    setPhase("submitting");
    const result = await submitQuiz({
      subjectId: subjectId !== "all" ? subjectId : undefined,
      answers,
      questionIds: questions.map((q) => q.id),
    });

    if (result.success && result.data) {
      sessionStorage.setItem("quizResult", JSON.stringify(result.data));
      router.push("/quiz/results");
    } else {
      alert(result.error ?? "Failed to submit quiz");
      setPhase("quiz");
    }
  }, [answers, questions, router, subjectId]);

  useEffect(() => {
    if (subjectId === "all") {
      setTopicId("all");
      return;
    }
    if (topicId === "all") return;
    const selectedTopic = topics.find((topic) => topic.id === topicId);
    if (selectedTopic && selectedTopic.subjectId !== subjectId) {
      setTopicId("all");
    }
  }, [subjectId, topicId, topics]);

  const startQuiz = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (subjectId !== "all") params.set("subjectId", subjectId);
      if (topicId !== "all") params.set("topicId", topicId);
      params.set("limit", limit);

      const res = await fetch(`/api/quiz/questions?${params.toString()}`);
      const data = await res.json();

      if (!data.questions?.length) {
        alert("No questions found for the selected filters.");
        return;
      }

      setQuestions(data.questions);
      setAnswers({});
      setCurrentIndex(0);
      setPhase("quiz");
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (value: string) => {
    if (!currentQuestion) return;
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: { selected: value, skipped: false },
    }));
  };

  if (phase === "config") {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Quiz Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <FilterPanel
            subjectId={subjectId}
            onSubjectChange={(value) => { setSubjectId(value); setTopicId("all"); }}
            technologyId={technologyId}
            onTechnologyChange={(value) => { setTechnologyId(value); setSubjectId("all"); setTopicId("all"); }}
            topicId={topicId}
            onTopicChange={setTopicId}
            subjects={subjects}
            topics={topics}
          />
          <div className="max-w-sm space-y-2">
            <div className="space-y-2">
              <Label>Question Limit</Label>
              <Select value={limit} onValueChange={setLimit}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {QUESTION_LIMITS.map((l) => (
                    <SelectItem key={String(l)} value={String(l)}>
                      {l === "all" ? "All" : l}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button onClick={startQuiz} disabled={loading} className="w-full sm:w-auto">
            {loading ? "Loading..." : "Start Quiz"}
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (phase === "submitting" || !currentQuestion) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Submitting quiz...</p>
      </div>
    );
  }

  const options = [
    { key: "A", value: currentQuestion.optionA },
    { key: "B", value: currentQuestion.optionB },
    { key: "C", value: currentQuestion.optionC },
    { key: "D", value: currentQuestion.optionD },
  ].filter((o) => o.value);
  const selectedAnswer = answers[currentQuestion.id]?.selected ?? "";
  const correctAnswer = currentQuestion.correctAnswer?.trim().toUpperCase() ?? "";
  const hasAnswered = selectedAnswer.length > 0;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-sm text-muted-foreground">
          Question {currentIndex + 1} of {questions.length}
        </span>
      </div>
      <Progress value={progress} />

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <span>{currentQuestion.subject?.name || "General"}</span>
            <span>•</span>
            <span className="capitalize">{currentQuestion.difficulty}</span>
          </div>
          <CardTitle className="text-lg leading-relaxed">{currentQuestion.question}</CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={selectedAnswer}
            onValueChange={handleAnswer}
            className="space-y-3"
          >
            {options.map((option) => {
              const optionKey = option.key.toUpperCase();
              const isCorrectOption = hasAnswered && optionKey === correctAnswer;
              const isWrongSelection =
                hasAnswered && selectedAnswer.toUpperCase() === optionKey && optionKey !== correctAnswer;

              return (
                <label
                  key={option.key}
                  className={cn(
                    "flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors sm:items-center sm:p-4",
                    !isCorrectOption && !isWrongSelection && "hover:bg-accent",
                    selectedAnswer === option.key && !isCorrectOption && !isWrongSelection && "border-primary bg-accent",
                    isCorrectOption &&
                      "border-green-500 bg-green-50 text-green-900 hover:bg-green-50 dark:border-green-500/70 dark:bg-green-950/30 dark:text-green-100",
                    isWrongSelection &&
                      "border-red-500 bg-red-50 text-red-900 hover:bg-red-50 dark:border-red-500/70 dark:bg-red-950/30 dark:text-red-100"
                  )}
                >
                  <RadioGroupItem
                    value={option.key}
                    className={cn(
                      "mt-0.5 sm:mt-0",
                      isCorrectOption && "border-green-600 text-green-600",
                      isWrongSelection && "border-red-600 text-red-600"
                    )}
                  />
                  <span className="min-w-0 flex-1 break-words">
                    <span className="font-medium">{option.key}.</span> {option.value}
                  </span>
                  {isCorrectOption && (
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-green-600" aria-label="Correct answer" />
                  )}
                  {isWrongSelection && (
                    <XCircle className="h-5 w-5 shrink-0 text-red-600" aria-label="Wrong answer" />
                  )}
                </label>
              );
            })}
          </RadioGroup>
        </CardContent>
      </Card>

      <div className="flex gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <Button
          variant="outline"
          onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
          disabled={currentIndex === 0}
          className="h-9 flex-1 sm:h-10 sm:flex-none"
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          Previous
        </Button>
        <div className="flex flex-1 gap-3 sm:flex-none">
          {currentIndex < questions.length - 1 ? (
            <Button
              onClick={() => setCurrentIndex((i) => i + 1)}
              className="h-9 flex-1 sm:h-10 sm:flex-none"
            >
              Next
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} className="h-9 flex-1 sm:h-10 sm:flex-none">
              <Send className="mr-1 h-4 w-4" />
              Submit Quiz
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
