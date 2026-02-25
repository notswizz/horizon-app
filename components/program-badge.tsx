import clsx from "clsx";
import { PROGRAM_COLORS } from "@/lib/constants";

export function ProgramBadge({ type }: { type: string }) {
  const colors = PROGRAM_COLORS[type] ?? { bg: "bg-gray-500/20", text: "text-gray-400" };

  return (
    <span
      className={clsx(
        "inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold",
        colors.bg,
        colors.text
      )}
    >
      {type || "—"}
    </span>
  );
}
