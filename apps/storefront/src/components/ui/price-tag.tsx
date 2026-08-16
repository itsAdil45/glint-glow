import { cn } from "@/lib/utils";
import { formatPrice } from "@/lib/utils";

export function PriceTag({
  amount,
  compareAt,
  className,
  size = "md",
}: {
  amount: number;
  compareAt?: number;
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const sizeClass = size === "lg" ? "text-2xl" : size === "sm" ? "text-xs" : "text-sm";
  return (
    <span className={cn("inline-flex items-baseline gap-2", className)}>
      <span className={cn("price-tag", sizeClass)}>{formatPrice(amount)}</span>
      {compareAt && compareAt > amount && (
        <span className="price-tag price-tag--muted text-xs line-through">
          {formatPrice(compareAt)}
        </span>
      )}
    </span>
  );
}
