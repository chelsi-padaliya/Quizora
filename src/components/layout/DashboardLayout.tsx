import { auth } from "@/auth";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { isAdmin } from "@/lib/auth-utils";

export async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  return (
    <DashboardShell user={session?.user} isAdmin={isAdmin(session)}>
      {children}
    </DashboardShell>
  );
}
