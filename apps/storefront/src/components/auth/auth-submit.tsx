import { ArrowRight, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

// Primary action for the auth forms: label on the left, arrow chip on the right.
export function AuthSubmit({
  loading,
  loadingText,
  children,
}: {
  loading?: boolean;
  loadingText: string;
  children: React.ReactNode;
}) {
  return (
    <Button
      type="submit"
      size="lg"
      disabled={loading}
      className="group h-14 w-full justify-between pl-8 pr-2"
    >
      <span>{loading ? loadingText : children}</span>
      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-ink text-paper transition-transform group-hover:translate-x-0.5">
        {loading ? <LoaderCircle size={18} className="animate-spin" /> : <ArrowRight size={18} />}
      </span>
    </Button>
  );
}
