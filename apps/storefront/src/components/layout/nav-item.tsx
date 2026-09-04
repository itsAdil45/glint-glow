"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronRight } from "lucide-react";
import { NavCategory } from "@/lib/mega-menu-data";
import { cn } from "@/lib/utils";

const MEGA_MENU_WIDTH = 560;
const SIMPLE_MENU_WIDTH = 256; // w-64

export function NavItem({ category }: { category: NavCategory }) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [alignRight, setAlignRight] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);

  const hasMenu = !!(category.megaMenu || category.simpleMenu);

  if (!hasMenu) {
    return (
      <Link href={category.href} className="text-sm hover:text-accent-ink transition-colors">
        {category.label}
      </Link>
    );
  }

  const menuWidth = category.megaMenu ? MEGA_MENU_WIDTH : SIMPLE_MENU_WIDTH;

  function handleOpen() {
    // Nav items near the right edge (e.g. the last one or two links) would
    // otherwise render a left-anchored menu that overflows the viewport and
    // puts a horizontal scrollbar on the whole page. Anchor to the trigger's
    // right edge instead whenever there isn't room to grow rightward.
    const rect = triggerRef.current?.getBoundingClientRect();
    setAlignRight(!!rect && rect.left + menuWidth > window.innerWidth - 16);
    setOpen(true);
  }

  return (
    <div
      ref={triggerRef}
      className="relative"
      onMouseEnter={handleOpen}
      onMouseLeave={() => {
        setOpen(false);
        setActiveIndex(0);
      }}
    >
      <Link
        href={category.href}
        className="flex items-center gap-1 text-sm hover:text-accent-ink transition-colors py-2"
      >
        {category.label}
        <ChevronDown size={14} className={cn("transition-transform", open && "rotate-180")} />
      </Link>

      {open && category.megaMenu && (
        <div
          className={cn(
            "absolute top-full z-50 flex w-[560px] overflow-hidden rounded-2xl border border-line bg-surface shadow-lg",
            alignRight ? "right-0" : "left-0",
          )}
        >
          <div className="w-44 shrink-0 border-r border-line bg-accent-soft/30 py-2">
            {category.megaMenu.map((sub, i) => (
              <button
                key={sub.label}
                onMouseEnter={() => setActiveIndex(i)}
                className={cn(
                  "flex w-full items-center justify-between px-4 py-2.5 text-left text-sm transition-colors",
                  activeIndex === i
                    ? "bg-surface text-accent-ink font-medium border-l-2 border-accent-ink"
                    : "text-ink-soft hover:bg-surface/60 border-l-2 border-transparent",
                )}
              >
                {sub.label}
                <ChevronRight size={13} />
              </button>
            ))}
          </div>

          <div className="flex-1 p-5">
            {category.megaMenu[activeIndex]?.sections.map((section) => (
              <div key={section.title}>
                <p className="text-[11px] font-medium tracking-wide text-muted uppercase mb-3">
                  {section.title}
                </p>
                <div className="grid grid-cols-2 gap-x-6 gap-y-2.5">
                  {section.links.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="text-sm text-ink-soft hover:text-accent-ink transition-colors"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {open && category.simpleMenu && (
        <div
          className={cn(
            "absolute top-full z-50 w-64 rounded-2xl border border-line bg-surface p-4 shadow-lg",
            alignRight ? "right-0" : "left-0",
          )}
        >
          <div className="grid grid-cols-1 gap-1">
            {category.simpleMenu.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-lg px-3 py-2 text-sm text-ink-soft hover:bg-accent-soft/50 hover:text-accent-ink transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
