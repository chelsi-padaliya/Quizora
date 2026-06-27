import { auth } from "@/auth";
import { redirect } from "next/navigation";
import type { Session } from "next-auth";

function hasAdminAccess(user?: Session["user"] | null): boolean {
  const role = user?.role?.toLowerCase();
  const email = user?.email?.toLowerCase();
  const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase();

  return role === "admin" || (!!adminEmail && email === adminEmail);
}

export async function requireSession(): Promise<Session> {
  const session = await auth();
  if (!session?.user) redirect("/login");
  return session;
}

export async function requireAdmin(): Promise<Session> {
  const session = await requireSession();
  if (!hasAdminAccess(session.user)) redirect("/dashboard");
  return session;
}

export function isAdmin(session: Session | null): boolean {
  return hasAdminAccess(session?.user);
}
