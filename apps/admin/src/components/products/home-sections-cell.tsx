"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Product } from "@/types";

export type HomeSectionField =
  | "isFragrance"
  | "isSkinCare"
  | "isMakeupAccessory"
  | "isMakeup"
  | "isLingerie";

export const HOME_SECTION_OPTIONS: { field: HomeSectionField; label: string }[] = [
  { field: "isFragrance", label: "Fragrances" },
  { field: "isSkinCare", label: "Skin Care" },
  { field: "isMakeupAccessory", label: "Makeup Accessories" },
  { field: "isMakeup", label: "Makeup" },
  { field: "isLingerie", label: "Lingerie" },
];

const MENU_WIDTH = 208;

// Renders as a small "N sections" button; the checklist itself is rendered
// into a portal on <body> (fixed-positioned under the button) so it isn't
// clipped by the products table's `overflow-hidden` rounded-corner wrapper,
// and doesn't force every row to grow to fit however many chips are active.
export function HomeSectionsCell({
  product,
  isOpen,
  onOpenChange,
  onToggleField,
  disabled,
}: {
  product: Product;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onToggleField: (field: HomeSectionField) => void;
  disabled: boolean;
}) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);

  useLayoutEffect(() => {
    if (!isOpen || !buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    setCoords({ top: rect.bottom + 6, left: Math.max(8, rect.right - MENU_WIDTH) });
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    function handlePointerDown(e: MouseEvent) {
      const target = e.target as Node;
      if (buttonRef.current?.contains(target) || menuRef.current?.contains(target)) return;
      onOpenChange(false);
    }
    function handleClose() {
      onOpenChange(false);
    }

    document.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("scroll", handleClose, true);
    window.addEventListener("resize", handleClose);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("scroll", handleClose, true);
      window.removeEventListener("resize", handleClose);
    };
  }, [isOpen, onOpenChange]);

  const active = HOME_SECTION_OPTIONS.filter((o) => product[o.field]);

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => onOpenChange(!isOpen)}
        disabled={disabled}
        title={active.length ? active.map((o) => o.label).join(", ") : "No home sections selected"}
        className={cn(
          "inline-flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border transition-colors disabled:opacity-50",
          active.length > 0
            ? "border-ink text-ink"
            : "border-line text-muted hover:border-ink hover:text-ink",
        )}
      >
        {active.length === 0 ? "No sections" : `${active.length} section${active.length !== 1 ? "s" : ""}`}
        <ChevronDown size={13} className={cn("transition-transform", isOpen && "rotate-180")} />
      </button>

      {isOpen &&
        coords &&
        createPortal(
          <div
            ref={menuRef}
            style={{ position: "fixed", top: coords.top, left: coords.left, width: MENU_WIDTH }}
            className="z-50 rounded-lg border border-line bg-surface shadow-lg py-1.5"
          >
            {HOME_SECTION_OPTIONS.map(({ field, label }) => {
              const checked = Boolean(product[field]);
              return (
                <label
                  key={field}
                  className="flex items-center gap-2.5 px-3 py-1.5 text-sm hover:bg-bg cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => onToggleField(field)}
                    disabled={disabled}
                  />
                  {label}
                </label>
              );
            })}
          </div>,
          document.body,
        )}
    </>
  );
}
