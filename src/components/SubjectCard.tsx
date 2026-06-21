import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface SubjectCardProps {
  name: string;
  slug: string;
  questionCount: number;
  href: string;
  className?: string;
}

export function SubjectCard({ name, slug, questionCount, href, className }: SubjectCardProps) {
  return (
    <Link href={href}>
      <Card className={cn("transition-shadow hover:shadow-md", className)}>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">{name}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{questionCount} questions</p>
          <p className="mt-1 text-xs text-muted-foreground">{slug}</p>
        </CardContent>
      </Card>
    </Link>
  );
}
