import { auth } from "@/auth";
import { redirect } from "next/navigation";
import type { Session } from "next-auth";

export async function requireSession(): Promise<Session> {
  const session = await auth();
  if (!session?.user) redirect("/login");
  return session;
}

export async function requireAdmin(): Promise<Session> {
  const session = await requireSession();
  if (session.user.role !== "admin") redirect("/dashboard");
  return session;
}

export function isAdmin(session: Session | null): boolean {
  return session?.user?.role === "admin";
}
