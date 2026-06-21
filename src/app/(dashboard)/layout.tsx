import { Suspense } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { DashboardSkeleton } from "@/components/dashboard/DashboardSkeleton";

export default function DashboardGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardLayout>
      <Suspense fallback={<DashboardSkeleton />}>{children}</Suspense>
    </DashboardLayout>
  );
}
