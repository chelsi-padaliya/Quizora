import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface QuestionCardProps {
  question: string;
  subject: string;
  type: string;
  difficulty: string;
  className?: string;
  children?: React.ReactNode;
}

export function QuestionCard({
  question,
  subject,
  type,
  difficulty,
  className,
  children,
}: QuestionCardProps) {
  return (
    <Card className={cn(className)}>
      <CardHeader className="pb-2">
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">{subject}</Badge>
          <Badge variant="outline">{type}</Badge>
          <Badge variant="outline" className="capitalize">{difficulty}</Badge>
        </div>
        <CardTitle className="break-words text-base font-medium">{question}</CardTitle>
      </CardHeader>
      {children && <CardContent>{children}</CardContent>}
    </Card>
  );
}
