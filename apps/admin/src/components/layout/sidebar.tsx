"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Package, FolderTree, ShoppingCart, Images, GalleryHorizontal, MessageSquareText, LibraryBig, Inbox, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";
import { logoutAdmin } from "@/lib/api-auth";

const NAV = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/products", label: "Products", icon: Package },
  { href: "/categories", label: "Categories", icon: FolderTree },
  { href: "/hero-slides", label: "Hero Slides", icon: Images },
  { href: "/banners", label: "Banners", icon: GalleryHorizontal },
  { href: "/media", label: "Media Library", icon: LibraryBig },
  { href: "/orders", label: "Orders", icon: ShoppingCart },
  { href: "/reviews", label: "Reviews", icon: MessageSquareText },
  { href: "/contact-messages", label: "Contact Messages", icon: Inbox },
];

export function Sidebar() {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const router = useRouter();

  async function handleLogout() {
    await logoutAdmin();
    logout();
    router.push("/login");
  }

  return (
    <aside className="w-60 shrink-0 border-r border-line bg-surface flex flex-col h-screen sticky top-0">
      <div className="h-16 flex items-center px-5 border-b border-line">
        <span className="font-semibold tracking-tight">Store Admin</span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV.map((item) => {
          const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors",
                active ? "bg-accent-soft text-accent-ink font-medium" : "text-muted hover:bg-accent-soft/60 hover:text-ink",
              )}
            >
              <Icon size={17} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-line p-3">
        <div className="px-3 py-2 text-xs text-muted truncate">{user?.email}</div>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm text-muted hover:bg-accent-soft/60 hover:text-ink transition-colors"
        >
          <LogOut size={17} />
          Log out
        </button>
      </div>
    </aside>
  );
}
