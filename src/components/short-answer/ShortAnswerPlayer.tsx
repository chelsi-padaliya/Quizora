"use client";

import { useState } from "react";
import { CheckCircle2, XCircle, ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { QUESTION_LIMITS } from "@/constants";
import { FilterPanel } from "@/components/FilterPanel";
import type { QuizQuestion } from "@/types";

interface ShortAnswerPlayerProps {
  subjects: { id: string; name: string; slug: string }[];
  initialSubjectId?: string;
}

type AnswerState = "unanswered" | "correct" | "incorrect";

interface QuestionAnswer {
  userAnswer: string;
  state: AnswerState;
}

export function ShortAnswerPlayer({ subjects, initialSubjectId }: ShortAnswerPlayerProps) {
  const [phase, setPhase] = useState<"config" | "playing" | "done">("config");
  const [subjectId, setSubjectId] = useState(initialSubjectId ?? "all");
  const [difficulty, setDifficulty] = useState("all");
  const [limit, setLimit] = useState("10");
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, QuestionAnswer>>({});
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);

  const currentQuestion = questions[currentIndex];
  const currentAnswer = currentQuestion ? answers[currentQuestion.id] : undefined;
  const progress = questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0;

  const startSession = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (subjectId !== "all") params.set("subjectId", subjectId);
      if (difficulty !== "all") params.set("difficulty", difficulty);
      params.set("limit", limit);
      params.set("type", "short_answer");

      const res = await fetch(`/api/quiz/questions?${params.toString()}`);
      const data = await res.json();

      if (!data.questions?.length) {
        alert("No short answer questions found for the selected filters.");
        return;
      }

      setQuestions(data.questions);
      setAnswers({});
      setCurrentIndex(0);
      setInputValue("");
      setPhase("playing");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAnswer = () => {
    if (!currentQuestion || !inputValue.trim()) return;

    const normalize = (s: string) => s.trim().toLowerCase().replace(/\s+/g, " ");
    const isCorrect = normalize(inputValue) === normalize(currentQuestion.answer ?? "");

    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: { userAnswer: inputValue, state: isCorrect ? "correct" : "incorrect" },
    }));
  };

  const goToNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((i) => i + 1);
      setInputValue(answers[questions[currentIndex + 1]?.id]?.userAnswer ?? "");
    } else {
      setPhase("done");
    }
  };

  const goToPrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
      setInputValue(answers[questions[currentIndex - 1]?.id]?.userAnswer ?? "");
    }
  };

  const handleReset = () => {
    setPhase("config");
    setQuestions([]);
    setAnswers({});
    setInputValue("");
    setCurrentIndex(0);
  };

  if (phase === "config") {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Short Answer Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <FilterPanel
            subjectId={subjectId}
            onSubjectChange={setSubjectId}
            difficulty={difficulty}
            onDifficultyChange={setDifficulty}
            subjects={subjects}
          />
          <div className="space-y-2">
            <Label>Question Limit</Label>
            <Select value={limit} onValueChange={setLimit}>
              <SelectTrigger className="w-full sm:w-40">
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
          <Button onClick={startSession} disabled={loading} className="w-full sm:w-auto">
            {loading ? "Loading..." : "Start Session"}
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (phase === "done") {
    const correct = Object.values(answers).filter((a) => a.state === "correct").length;
    const total = questions.length;
    const score = Math.round((correct / total) * 100);

    return (
      <Card>
        <CardHeader>
          <CardTitle>Session Complete</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <p className="text-5xl font-bold">{score}%</p>
            <p className="mt-1 text-muted-foreground">
              {correct} of {total} correct
            </p>
          </div>

          <div className="space-y-3">
            {questions.map((q, i) => {
              const ans = answers[q.id];
              return (
                <div key={q.id} className="rounded-lg border p-3 text-sm">
                  <p className="font-medium">
                    {i + 1}. {q.question}
                  </p>
                  <div className="mt-2 flex items-start gap-2">
                    {ans?.state === "correct" ? (
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
                    ) : (
                      <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                    )}
                    <div>
                      <p className="text-muted-foreground">
                        Your answer: <span className="font-medium text-foreground">{ans?.userAnswer || "—"}</span>
                      </p>
                      {ans?.state !== "correct" && (
                        <p className="text-green-700 dark:text-green-400">
                          Correct: <span className="font-medium">{q.answer}</span>
                        </p>
                      )}
                      {q.explanation && (
                        <p className="mt-1 text-xs text-muted-foreground">{q.explanation}</p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <Button onClick={handleReset} variant="outline">
            <RotateCcw className="mr-2 h-4 w-4" />
            Start New Session
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!currentQuestion) return null;

  const isAnswered = !!currentAnswer;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-sm text-muted-foreground">
          Question {currentIndex + 1} of {questions.length}
        </span>
        <span className="text-sm text-muted-foreground">
          {Object.values(answers).filter((a) => a.state === "correct").length} correct ·{" "}
          {Object.values(answers).filter((a) => a.state === "incorrect").length} incorrect
        </span>
      </div>
      <Progress value={progress} />

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <span>{currentQuestion.subject?.name || "General"}</span>
            <span>•</span>
            <span className="capitalize">{currentQuestion.difficulty}</span>
            {currentQuestion.topic && (
              <>
                <span>•</span>
                <span>{currentQuestion.topic.name}</span>
              </>
            )}
          </div>
          <CardTitle className="text-lg leading-relaxed">{currentQuestion.question}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="short-answer-input">Your Answer</Label>
            <Textarea
              id="short-answer-input"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Type your answer here..."
              rows={3}
              disabled={isAnswered}
              className={
                isAnswered
                  ? currentAnswer.state === "correct"
                    ? "border-green-500 bg-green-50 dark:bg-green-950/20"
                    : "border-destructive bg-destructive/5"
                  : ""
              }
            />
          </div>

          {!isAnswered ? (
            <Button onClick={handleSubmitAnswer} disabled={!inputValue.trim()} className="w-full sm:w-auto">
              Submit Answer
            </Button>
          ) : (
            <div className="space-y-3">
              <div
                className={`flex items-start gap-3 rounded-lg p-3 ${
                  currentAnswer.state === "correct"
                    ? "bg-green-50 text-green-800 dark:bg-green-950/30 dark:text-green-300"
                    : "bg-destructive/10 text-destructive"
                }`}
              >
                {currentAnswer.state === "correct" ? (
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
                ) : (
                  <XCircle className="mt-0.5 h-5 w-5 shrink-0" />
                )}
                <div className="space-y-1 text-sm">
                  <p className="font-semibold">
                    {currentAnswer.state === "correct" ? "Correct!" : "Incorrect"}
                  </p>
                  {currentAnswer.state !== "correct" && (
                    <p>
                      Correct answer: <span className="font-medium">{currentQuestion.answer}</span>
                    </p>
                  )}
                  {currentQuestion.explanation && (
                    <p className="text-muted-foreground">{currentQuestion.explanation}</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <Button variant="outline" onClick={goToPrev} disabled={currentIndex === 0} className="w-full sm:w-auto">
          <ChevronLeft className="mr-1 h-4 w-4" />
          Previous
        </Button>
        <Button onClick={goToNext} disabled={!isAnswered} className="w-full sm:w-auto">
          {currentIndex < questions.length - 1 ? (
            <>
              Next
              <ChevronRight className="ml-1 h-4 w-4" />
            </>
          ) : (
            "See Results"
          )}
        </Button>
      </div>
    </div>
  );
}
