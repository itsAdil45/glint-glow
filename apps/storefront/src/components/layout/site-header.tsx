"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Search, ShoppingBag, User, Menu, X } from "lucide-react";
import { useAuthStore } from "@/store/auth-store";
import { useCartStore } from "@/store/cart-store";
import { AccountMenu } from "./account-menu";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Shop" },
  { href: "/category/new-arrivals", label: "New" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader() {
  const user = useAuthStore((s) => s.user);
  const itemCount = useCartStore((s) => s.itemCount);
  const loadCart = useCartStore((s) => s.load);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    loadCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/95 backdrop-blur">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <button
          className="lg:hidden"
          aria-label="Toggle menu"
          onClick={() => setMobileOpen((v) => !v)}
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        <Link href="/" className="font-display text-2xl tracking-tight shrink-0">
          Store
        </Link>

        <nav className="hidden lg:flex items-center gap-7 text-sm">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-accent-ink transition-colors">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          <button
            aria-label="Search"
            className="h-10 w-10 rounded-full flex items-center justify-center hover:bg-accent-soft transition-colors"
            onClick={() => setSearchOpen((v) => !v)}
          >
            <Search size={19} />
          </button>

          <AccountMenu user={user}>
            <span className="h-10 w-10 rounded-full flex items-center justify-center hover:bg-accent-soft transition-colors cursor-pointer">
              <User size={19} />
            </span>
          </AccountMenu>

          <Link
            href="/cart"
            aria-label="Cart"
            className="relative h-10 w-10 rounded-full flex items-center justify-center hover:bg-accent-soft transition-colors"
          >
            <ShoppingBag size={19} />
            {itemCount > 0 && (
              <span className="absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent-ink px-1 text-[10px] font-medium text-paper">
                {itemCount}
              </span>
            )}
          </Link>
        </div>
      </div>

      {searchOpen && (
        <div className="border-t border-line bg-paper">
          <div className="container-page py-3">
            <form action="/products" className="flex items-center gap-2">
              <input
                name="search"
                autoFocus
                placeholder="Search products…"
                className="h-11 w-full rounded-full border border-line bg-surface px-4 text-sm outline-none focus:border-accent-ink"
              />
              <button type="submit" className="h-11 px-5 rounded-full bg-ink text-paper text-sm shrink-0">
                Search
              </button>
            </form>
          </div>
        </div>
      )}

      <nav
        className={cn(
          "lg:hidden border-t border-line overflow-hidden transition-[max-height] duration-200",
          mobileOpen ? "max-h-72" : "max-h-0",
        )}
      >
        <div className="container-page py-3 flex flex-col gap-3">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm py-1"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}
