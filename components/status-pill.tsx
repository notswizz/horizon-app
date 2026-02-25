import clsx from "clsx";
import { STATUS_COLORS } from "@/lib/constants";

export function StatusPill({ status, size = "sm" }: { status: string; size?: "sm" | "md" }) {
  const colors = STATUS_COLORS[status] ?? { bg: "bg-gray-500/20", text: "text-gray-400" };

  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full font-medium whitespace-nowrap",
        colors.bg,
        colors.text,
        size === "sm" ? "px-2.5 py-0.5 text-xs" : "px-3 py-1 text-sm"
      )}
    >
      {status || "No Status"}
    </span>
  );
}
