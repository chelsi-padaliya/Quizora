import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { searchQuestions } from "@/services/question.service";

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q } = await searchParams;
  const query = q?.trim() ?? "";
  const results = query.length >= 2 ? await searchQuestions(query, 20) : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Search Results</h1>
        <p className="text-muted-foreground">
          {query ? `Results for "${query}"` : "Enter a search term in the navbar"}
        </p>
      </div>

      {results.length === 0 ? (
        <p className="text-muted-foreground">No results found.</p>
      ) : (
        <div className="space-y-3">
          {results.map((q) => (
            <Card key={q.id}>
              <CardHeader className="pb-2">
                <div className="flex gap-2">
                  <Badge variant="secondary">{q.subject?.name || "N/A"}</Badge>
                  <Badge variant="outline">{q.type}</Badge>
                </div>
                <CardTitle className="text-base">{q.question}</CardTitle>
              </CardHeader>
              <CardContent>
                <Link
                  href={q.type === "quiz" ? "/quiz" : "/theory"}
                  className="text-sm text-primary hover:underline"
                >
                  Go to {q.type === "quiz" ? "Quiz" : "Theory"} mode →
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
