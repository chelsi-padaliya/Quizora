import { QuestionTableSkeleton } from "@/components/shared/QuestionTable";

export default function AdminLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="h-8 w-64 animate-pulse rounded bg-muted" />
        <div className="h-4 w-96 animate-pulse rounded bg-muted" />
      </div>
      <QuestionTableSkeleton />
    </div>
  );
}
