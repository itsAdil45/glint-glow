"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { Sidebar } from "./sidebar";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user);
  const isHydrating = useAuthStore((s) => s.isHydrating);
  const router = useRouter();

  useEffect(() => {
    if (!isHydrating && !user) {
      router.push("/login");
    }
  }, [isHydrating, user, router]);

  if (isHydrating) {
    return <div className="flex h-screen items-center justify-center text-sm text-muted">Loading…</div>;
  }
  if (!user) return null;

  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 min-w-0">{children}</main>
    </div>
  );
}
