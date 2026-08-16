"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { UserProfile } from "@/types";
import { useAuthStore } from "@/store/auth-store";
import { useCartStore } from "@/store/cart-store";
import { logoutUser } from "@/lib/api-auth";

export function AccountMenu({
  user,
  children,
}: {
  user: UserProfile | null;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const logout = useAuthStore((s) => s.logout);
  const loadCart = useCartStore((s) => s.load);
  const router = useRouter();

  const openNow = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setOpen(true);
  };
  const closeSoon = () => {
    timeoutRef.current = setTimeout(() => setOpen(false), 150);
  };

  const handleLogout = async () => {
    await logoutUser();
    logout();
    await loadCart();
    setOpen(false);
    router.push("/");
  };

  return (
    <div className="relative" onMouseEnter={openNow} onMouseLeave={closeSoon}>
      {children}
      {open && (
        <div className="absolute right-0 top-full w-52 border border-line bg-paper py-2 shadow-sm">
          {user ? (
            <>
              <div className="px-4 py-2 text-xs text-muted">Signed in as</div>
              <div className="px-4 pb-2 text-sm font-medium truncate">{user.name}</div>
              <div className="border-t border-line my-1" />
              <MenuLink href="/account">My account</MenuLink>
              <MenuLink href="/account/orders">Orders</MenuLink>
              <MenuLink href="/account/addresses">Addresses</MenuLink>
              <MenuLink href="/account/change-password">Change password</MenuLink>
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-sm hover:bg-accent-soft transition-colors"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <MenuLink href="/login">Log in</MenuLink>
              <MenuLink href="/register">Create account</MenuLink>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function MenuLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="block px-4 py-2 text-sm hover:bg-accent-soft transition-colors">
      {children}
    </Link>
  );
}
