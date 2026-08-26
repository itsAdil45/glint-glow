import { cn } from "@/lib/utils";
import { OrderStatus, ReviewStatus } from "@/types";

const STATUS_STYLES: Record<OrderStatus, string> = {
  pending: "bg-warn-soft text-warn",
  confirmed: "bg-accent-soft text-accent-ink",
  processing: "bg-accent-soft text-accent-ink",
  shipped: "bg-accent-soft text-accent-ink",
  delivered: "bg-accent text-white",
  cancelled: "bg-danger-soft text-danger",
};

export function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize",
        STATUS_STYLES[status],
      )}
    >
      {status}
    </span>
  );
}

const REVIEW_STATUS_STYLES: Record<ReviewStatus, string> = {
  pending: "bg-warn-soft text-warn",
  approved: "bg-accent text-white",
  rejected: "bg-danger-soft text-danger",
};

export function ReviewStatusBadge({ status }: { status: ReviewStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize",
        REVIEW_STATUS_STYLES[status],
      )}
    >
      {status}
    </span>
  );
}

export function Badge({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={cn("inline-flex items-center rounded-full bg-accent-soft px-2.5 py-0.5 text-xs font-medium text-accent-ink", className)}>
      {children}
    </span>
  );
}
