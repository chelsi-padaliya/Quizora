"use client";

import { CheckCircle2, XCircle, Trophy, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { PASS_THRESHOLD } from "@/constants";
import type { QuizResult } from "@/types";
import { cn } from "@/lib/utils";

interface ResultCardProps {
  result: QuizResult;
  showReview?: boolean;
}

export function ResultCard({ result, showReview = true }: ResultCardProps) {
  const { score, totalQuestions, correctAnswers, wrongAnswers, passed, answers, questions } =
    result;

  return (
    <div className="space-y-6">
      <Card className={cn(passed ? "border-green-200" : "border-red-200")}>
        <CardHeader className="text-center">
          <div className="mx-auto mb-2">
            {passed ? (
              <Trophy className="h-12 w-12 text-green-500" />
            ) : (
              <AlertCircle className="h-12 w-12 text-red-500" />
            )}
          </div>
          <CardTitle className="text-2xl">
            {passed ? "Congratulations! You Passed" : "Keep Practicing!"}
          </CardTitle>
          <p className="text-muted-foreground">
            Pass threshold: {PASS_THRESHOLD}%
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <p className="text-4xl font-bold">{score}%</p>
            <Progress value={score} className="mt-2" />
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-semibold">{totalQuestions}</p>
              <p className="text-sm text-muted-foreground">Total</p>
            </div>
            <div>
              <p className="text-2xl font-semibold text-green-600">{correctAnswers}</p>
              <p className="text-sm text-muted-foreground">Correct</p>
            </div>
            <div>
              <p className="text-2xl font-semibold text-red-600">{wrongAnswers}</p>
              <p className="text-sm text-muted-foreground">Wrong</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {showReview && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Review Answers</h3>
          {questions.map((q, index) => {
            const answer = answers.find((a) => a.questionId === q.id);
            const isCorrect = answer?.isCorrect;
            const skipped = answer?.skipped;

            return (
              <Card key={q.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-2">
                    {skipped ? (
                      <AlertCircle className="mt-0.5 h-5 w-5 text-yellow-500" />
                    ) : isCorrect ? (
                      <CheckCircle2 className="mt-0.5 h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="mt-0.5 h-5 w-5 text-red-500" />
                    )}
                    <div className="flex-1">
                      <p className="font-medium">
                        {index + 1}. {q.question}
                      </p>
                      <div className="mt-2 space-y-1 text-sm">
                        <p>
                          Your answer:{" "}
                          <span className={cn(isCorrect ? "text-green-600" : "text-red-600")}>
                            {skipped ? "Skipped" : answer?.selectedAnswer ?? "Not answered"}
                          </span>
                        </p>
                        {!isCorrect && (
                          <p>
                            Correct answer:{" "}
                            <span className="font-medium text-green-600">{q.correctAnswer}</span>
                          </p>
                        )}
                        {q.explanation && (
                          <p className="mt-2 rounded-md bg-muted p-2 text-muted-foreground">
                            {q.explanation}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
