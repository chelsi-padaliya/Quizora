import { BookOpen, Brain, FolderOpen, LayoutDashboard, ListChecks, Tag, PenLine } from "lucide-react";
import { ROUTES } from "@/constants";

export const MAIN_NAV_ITEMS = [
  { href: ROUTES.dashboard, label: "Dashboard", icon: LayoutDashboard },
  { href: ROUTES.quiz, label: "Quiz Mode", icon: Brain },
  { href: ROUTES.theory, label: "Theory Mode", icon: BookOpen },
  { href: ROUTES.shortAnswer, label: "Short Answer", icon: PenLine },
] as const;

export const ADMIN_NAV_ITEMS = [
  { href: ROUTES.subjects, label: "Manage Subjects", icon: FolderOpen },
  { href: ROUTES.topics, label: "Manage Topics", icon: Tag },
  { href: ROUTES.quizQuestions, label: "Manage Quiz Questions", icon: Brain },
  { href: ROUTES.theoryQuestions, label: "Manage Theory Questions", icon: ListChecks },
  { href: ROUTES.shortAnswerQuestions, label: "Manage Short Answer", icon: PenLine },
] as const;
