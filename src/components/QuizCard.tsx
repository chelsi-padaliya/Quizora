import Link from "next/link";
import { Brain, Clock, Filter } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface QuizCardProps {
  title?: string;
  description?: string;
}

export function QuizCard({
  title = "Start Quiz",
  description = "Test your knowledge with multiple choice questions",
}: QuizCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          <CardTitle>{title}</CardTitle>
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Filter className="h-3.5 w-3.5" /> Filter by subject & difficulty
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" /> Optional timer
          </span>
        </div>
        <Button asChild>
          <Link href="/quiz">Start Quiz</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
