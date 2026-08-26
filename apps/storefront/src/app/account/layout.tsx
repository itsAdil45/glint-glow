"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/account", label: "Profile" },
  { href: "/account/addresses", label: "Addresses" },
  { href: "/account/orders", label: "Orders" },
  { href: "/account/reviews", label: "My Reviews" },
  { href: "/account/change-password", label: "Change password" },
];

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user);
  const isHydrating = useAuthStore((s) => s.isHydrating);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isHydrating && !user) {
      router.push(`/login?redirect=${pathname}`);
    }
  }, [isHydrating, user, router, pathname]);

  if (!user) return null;

  return (
    <div className="container-page py-10">
      <h1 className="font-display text-3xl mb-8">My account</h1>
      <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr] gap-12">
        <nav className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "px-3 py-2 text-sm whitespace-nowrap",
                pathname === item.href ? "bg-accent-soft text-ink font-medium" : "text-muted hover:text-ink",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div>{children}</div>
      </div>
    </div>
  );
}
