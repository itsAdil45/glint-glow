"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Search, ShoppingBag, User, Menu, X, ChevronDown, ChevronRight } from "lucide-react";
import { useAuthStore } from "@/store/auth-store";
import { useCartStore } from "@/store/cart-store";
import { AccountMenu } from "./account-menu";
import { TopBar } from "./top-bar";
import { NavItem } from "./nav-item";
import { SearchPopover } from "./search-popover";
import { fetchMegaMenu, NavCategory } from "@/lib/mega-menu-data";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const user = useAuthStore((s) => s.user);
  const itemCount = useCartStore((s) => s.itemCount);
  const loadCart = useCartStore((s) => s.load);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [nav, setNav] = useState<NavCategory[]>([]);
  const [expandedMobile, setExpandedMobile] = useState<string | null>(null);

  useEffect(() => {
    loadCart();
    fetchMegaMenu().then(setNav);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-paper/95 backdrop-blur border-b border-line">
      <TopBar />

      <div className="container-page flex h-20 items-center justify-between gap-4">
        <button className="lg:hidden" aria-label="Toggle menu" onClick={() => setMobileOpen((v) => !v)}>
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        <Link href="/" className="font-display text-2xl tracking-tight shrink-0">
          GLOWN
        </Link>

        <nav className="hidden lg:flex items-center gap-7">
          {nav.map((category) => (
            <NavItem key={category.label} category={category} />
          ))}
        </nav>

        <div className="flex items-center gap-1">
          <div className="relative">
            <button
              aria-label="Search"
              className="h-10 w-10 rounded-full flex items-center justify-center hover:bg-accent-soft transition-colors"
              onClick={() => setSearchOpen((v) => !v)}
            >
              <Search size={19} />
            </button>
            {searchOpen && <SearchPopover onClose={() => setSearchOpen(false)} />}
          </div>

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

      {/* Mobile nav — flat list; subcategories expand inline rather than flyout */}
      <nav
        className={cn(
          "lg:hidden border-t border-line overflow-y-auto transition-[max-height] duration-200",
          mobileOpen ? "max-h-[70vh]" : "max-h-0",
        )}
      >
        <div className="container-page py-3 flex flex-col">
          {nav.map((category) => {
            const items = category.megaMenu
              ? category.megaMenu.map((s) => ({ label: s.label, href: s.href }))
              : category.simpleMenu;
            const isExpanded = expandedMobile === category.label;

            return (
              <div key={category.label} className="border-b border-line last:border-0">
                <div className="flex items-center justify-between py-2.5">
                  <Link href={category.href} className="text-sm" onClick={() => setMobileOpen(false)}>
                    {category.label}
                  </Link>
                  {items && items.length > 0 && (
                    <button
                      aria-label={`Toggle ${category.label} submenu`}
                      onClick={() => setExpandedMobile(isExpanded ? null : category.label)}
                      className="p-1"
                    >
                      <ChevronDown
                        size={16}
                        className={cn("transition-transform", isExpanded && "rotate-180")}
                      />
                    </button>
                  )}
                </div>
                {items && isExpanded && (
                  <div className="pb-2.5 pl-3 flex flex-col gap-2">
                    {items.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center gap-1.5 text-sm text-ink-soft"
                      >
                        <ChevronRight size={12} />
                        {item.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </nav>
    </header>
  );
}
