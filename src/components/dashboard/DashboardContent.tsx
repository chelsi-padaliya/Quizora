import { Brain, BookOpen, FolderOpen, HelpCircle, PenLine } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QuizCard } from "@/components/QuizCard";
import { SubjectCard } from "@/components/SubjectCard";
import { formatDate } from "@/lib/utils";
import {
  getDashboardStats,
  getRecentActivity,
  getSubjectQuestionCounts,
} from "@/services/question.service";

export async function DashboardContent() {
  const [stats, activity, subjects] = await Promise.all([
    getDashboardStats(),
    getRecentActivity(8),
    getSubjectQuestionCounts(),
  ]);

  const statCards = [
    { title: "Total Subjects", value: stats.totalSubjects, icon: FolderOpen },
    { title: "Total Questions", value: stats.totalQuestions, icon: HelpCircle },
    { title: "Quiz Questions", value: stats.totalQuizQuestions, icon: Brain },
    { title: "Theory Questions", value: stats.totalTheoryQuestions, icon: BookOpen },
    { title: "Short Answer", value: stats.totalShortAnswerQuestions, icon: PenLine },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to Quizora
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{stat.value}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <QuizCard />
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {activity.length === 0 ? (
              <p className="text-sm text-muted-foreground">No recent activity yet.</p>
            ) : (
              <div className="space-y-4">
                {activity.map((item) => (
                  <div key={item.id} className="flex items-start justify-between border-b pb-3 last:border-0">
                    <div>
                      <p className="text-sm font-medium">{item.title}</p>
                      <p className="text-xs text-muted-foreground">{item.description}</p>
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatDate(item.createdAt)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="mb-4 text-lg font-semibold">Subjects</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {subjects.map((subject) => (
            <SubjectCard
              key={subject.id}
              name={subject.name}
              slug={subject.slug}
              questionCount={subject._count.questions}
              href={`/subjects/${subject.slug}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
