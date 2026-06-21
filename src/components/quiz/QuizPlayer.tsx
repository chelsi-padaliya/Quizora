"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Clock, SkipForward, ChevronLeft, ChevronRight, Send } from "lucide-react";
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
import { Switch } from "@/components/ui/switch";
import { submitQuiz } from "@/actions/question.actions";
import { QUESTION_LIMITS } from "@/constants";
import { FilterPanel } from "@/components/FilterPanel";
import type { QuizQuestion } from "@/types";

interface QuizPlayerProps {
  subjects: { id: string; name: string; slug: string }[];
  initialQuestions?: QuizQuestion[];
  initialSubjectId?: string;
}

export function QuizPlayer({ subjects, initialQuestions, initialSubjectId }: QuizPlayerProps) {
  const router = useRouter();
  const [phase, setPhase] = useState<"config" | "quiz" | "submitting">(
    initialQuestions?.length ? "quiz" : "config"
  );
  const [subjectId, setSubjectId] = useState(initialSubjectId ?? "all");
  const [difficulty, setDifficulty] = useState<string>("all");
  const [limit, setLimit] = useState<string>("10");
  const [timerEnabled, setTimerEnabled] = useState(false);
  const [timerMinutes, setTimerMinutes] = useState(30);
  const [questions, setQuestions] = useState<QuizQuestion[]>(initialQuestions ?? []);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<
    Record<string, { selected: string | null; skipped: boolean }>
  >({});
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
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
    if (!timerEnabled || timeLeft === null || phase !== "quiz") return;
    if (timeLeft <= 0) {
      void handleSubmit();
      return;
    }
    const timer = setInterval(() => setTimeLeft((t) => (t !== null ? t - 1 : null)), 1000);
    return () => clearInterval(timer);
  }, [timerEnabled, timeLeft, phase, handleSubmit]);

  const startQuiz = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (subjectId !== "all") params.set("subjectId", subjectId);
      if (difficulty !== "all") params.set("difficulty", difficulty);
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
      if (timerEnabled) setTimeLeft(timerMinutes * 60);
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

  const handleSkip = () => {
    if (!currentQuestion) return;
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: { selected: null, skipped: true },
    }));
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((i) => i + 1);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
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
            onSubjectChange={setSubjectId}
            difficulty={difficulty}
            onDifficultyChange={setDifficulty}
            subjects={subjects}
          />
          <div className="grid gap-4 sm:grid-cols-2">
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
            <div className="space-y-2">
              <Label>Timer (optional)</Label>
              <div className="flex items-center gap-4">
                <Switch checked={timerEnabled} onCheckedChange={setTimerEnabled} />
                {timerEnabled && (
                  <Select
                    value={String(timerMinutes)}
                    onValueChange={(v) => setTimerMinutes(Number(v))}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[15, 30, 45, 60, 90].map((m) => (
                        <SelectItem key={m} value={String(m)}>
                          {m} min
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          Question {currentIndex + 1} of {questions.length}
        </span>
        {timerEnabled && timeLeft !== null && (
          <span className="flex items-center gap-1 text-sm font-medium">
            <Clock className="h-4 w-4" />
            {formatTime(timeLeft)}
          </span>
        )}
      </div>
      <Progress value={progress} />

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{currentQuestion.subject?.name || "General"}</span>
            <span>•</span>
            <span className="capitalize">{currentQuestion.difficulty}</span>
          </div>
          <CardTitle className="text-lg leading-relaxed">{currentQuestion.question}</CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={answers[currentQuestion.id]?.selected ?? ""}
            onValueChange={handleAnswer}
            className="space-y-3"
          >
            {options.map((option) => (
              <label
                key={option.key}
                className="flex cursor-pointer items-center gap-3 rounded-lg border p-4 transition-colors hover:bg-accent"
              >
                <RadioGroupItem value={option.key} />
                <span>
                  <span className="font-medium">{option.key}.</span> {option.value}
                </span>
              </label>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <Button
          variant="outline"
          onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
          disabled={currentIndex === 0}
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          Previous
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleSkip}>
            <SkipForward className="mr-1 h-4 w-4" />
            Skip
          </Button>
          {currentIndex < questions.length - 1 ? (
            <Button onClick={() => setCurrentIndex((i) => i + 1)}>
              Next
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleSubmit}>
              <Send className="mr-1 h-4 w-4" />
              Submit Quiz
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
