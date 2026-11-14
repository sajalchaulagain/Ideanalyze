import { ChevronLeft, ChevronRight } from "lucide-react";
import Button from "../Button";

export default function AdminPagination({
  page,
  pages,
  total,
  onPageChange,
  disabled = false,
  noun = "items",
}) {
  const safePages = Math.max(1, pages || 1);
  const safeTotal = Math.max(0, total || 0);

  return (
    <div className="flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-xs text-fg-subtle">
        Page <span className="font-semibold text-fg">{page}</span> of{" "}
        {safePages} · {safeTotal} {noun}
      </p>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page - 1)}
          disabled={disabled || page <= 1}
        >
          <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page + 1)}
          disabled={disabled || page >= safePages}
        >
          Next
          <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
}
