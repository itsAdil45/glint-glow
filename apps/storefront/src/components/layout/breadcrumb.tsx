import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export function Breadcrumb({ items, className }: { items: BreadcrumbItem[]; className?: string }) {
  return (
    <nav aria-label="Breadcrumb" className={cn("flex items-center flex-wrap gap-1.5 text-xs", className)}>
      {items.map((item, i) => {
        const isLast = i === items.length - 1;
        return (
          <span key={item.label} className="flex items-center gap-1.5">
            {i > 0 && <ChevronRight size={12} className="text-muted" />}
            {item.href && !isLast ? (
              <Link href={item.href} className="text-muted hover:text-accent-ink transition-colors">
                {item.label}
              </Link>
            ) : (
              <span className={isLast ? "text-ink font-medium" : "text-muted"}>{item.label}</span>
            )}
          </span>
        );
      })}
    </nav>
  );
}
