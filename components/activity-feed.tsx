"use client";

import { useActivity } from "@/lib/hooks";
import type { ActivityEvent } from "@/lib/monday";
import { STATUS_COLORS, JOBS_BOARD_ID } from "@/lib/constants";
import { Skeleton } from "@/components/loading-skeleton";
import {
  ClipboardCheck,
  Pencil,
  Sparkles,
  ArrowRightLeft,
  Users,
  ChevronDown,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import clsx from "clsx";
import { useState } from "react";
import { useJobDrawer } from "@/components/job-drawer";

const TYPE_ICONS: Record<ActivityEvent["type"], typeof ClipboardCheck> = {
  status: ClipboardCheck,
  edit: Pencil,
  new: Sparkles,
  move: ArrowRightLeft,
  crew: Users,
};

const TYPE_COLORS: Record<ActivityEvent["type"], string> = {
  status: "text-blue-400 bg-blue-500/10",
  edit: "text-amber-400 bg-amber-500/10",
  new: "text-emerald-400 bg-emerald-500/10",
  move: "text-purple-400 bg-purple-500/10",
  crew: "text-cyan-400 bg-cyan-500/10",
};

function formatRelativeTime(timestamp: string) {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function StatusPillInline({ status }: { status: string }) {
  const colors = STATUS_COLORS[status] ?? {
    bg: "bg-gray-500/20",
    text: "text-gray-400",
    dot: "bg-gray-400",
  };
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium",
        colors.bg,
        colors.text
      )}
    >
      <span className={clsx("w-1.5 h-1.5 rounded-full", colors.dot)} />
      {status}
    </span>
  );
}

function JobLink({ jobId, children }: { jobId: string; children: React.ReactNode }) {
  const { openJob } = useJobDrawer();
  return (
    <button
      type="button"
      onClick={() => openJob(jobId)}
      className="font-medium hover:text-accent transition-colors"
    >
      {children}
    </button>
  );
}

function ActivityEntry({ event }: { event: ActivityEvent }) {
  const Icon = TYPE_ICONS[event.type];
  const colorClass = TYPE_COLORS[event.type];

  return (
    <div className="flex gap-3 py-2.5 animate-in fade-in slide-in-from-top-1 duration-300">
      <div
        className={clsx(
          "shrink-0 w-7 h-7 rounded-lg flex items-center justify-center mt-0.5",
          colorClass
        )}
      >
        <Icon className="w-3.5 h-3.5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs leading-relaxed">
          {event.type === "status" ? (
            <>
              <JobLink jobId={event.jobId}>{event.jobName}</JobLink>
              {" "}
              {event.statusFrom && (
                <>
                  <StatusPillInline status={event.statusFrom} />
                  <span className="text-muted mx-1">→</span>
                </>
              )}
              {event.statusTo && <StatusPillInline status={event.statusTo} />}
            </>
          ) : (
            <>
              {event.type === "new" ? (
                <>
                  New job{" "}
                  <JobLink jobId={event.jobId}>{event.jobName}</JobLink>
                  {" "}created
                </>
              ) : (
                <span>
                  {event.description.includes(event.jobName) ? (
                    <>
                      {event.description.split(event.jobName)[0]}
                      <JobLink jobId={event.jobId}>{event.jobName}</JobLink>
                      {event.description.split(event.jobName).slice(1).join(event.jobName)}
                    </>
                  ) : (
                    event.description
                  )}
                </span>
              )}
            </>
          )}
        </p>
        <span className="text-[10px] text-muted mt-0.5 block">
          {formatRelativeTime(event.timestamp)}
        </span>
      </div>
    </div>
  );
}

export function ActivityFeed({
  collapsible = false,
  collapsibleOnMobileOnly = false,
}: {
  collapsible?: boolean;
  collapsibleOnMobileOnly?: boolean;
}) {
  const { data: events, isLoading } = useActivity();
  const [expanded, setExpanded] = useState(!collapsible);

  // On mobile: collapsible if either prop is true. On desktop: only if collapsible (not collapsibleOnMobileOnly).
  const isMobileCollapsible = collapsible || collapsibleOnMobileOnly;

  return (
    <section className="bg-card rounded-2xl border border-border overflow-hidden flex flex-col">
      <button
        type="button"
        onClick={() => {
          if (collapsible) setExpanded(!expanded);
          // collapsibleOnMobileOnly: handled via CSS, but toggle still works for mobile users
          if (collapsibleOnMobileOnly) setExpanded(!expanded);
        }}
        className={clsx(
          "flex items-center justify-between w-full px-5 pt-4 pb-3 text-left",
          isMobileCollapsible && "cursor-pointer lg:cursor-default hover:bg-card-hover lg:hover:bg-transparent transition-colors"
        )}
      >
        <div className="flex items-center gap-2">
          <ClipboardCheck className="w-4 h-4 text-muted" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-muted">
            Activity
          </h2>
        </div>
        {isMobileCollapsible && (
          <ChevronDown
            className={clsx(
              "w-4 h-4 text-muted transition-transform duration-200",
              collapsibleOnMobileOnly ? "lg:hidden" : "",
              !expanded && "-rotate-90"
            )}
          />
        )}
      </button>

      <div className={clsx(
        "px-5 pb-4 flex-1 min-h-0",
        !expanded && (collapsibleOnMobileOnly ? "hidden lg:block" : "hidden")
      )}>
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex gap-3">
                <Skeleton className="w-7 h-7 rounded-lg shrink-0" />
                <div className="space-y-1.5 flex-1">
                  <Skeleton className="h-3.5 w-full" />
                  <Skeleton className="h-2.5 w-16" />
                </div>
              </div>
            ))}
          </div>
        ) : !events || events.length === 0 ? (
          <p className="text-sm text-muted text-center py-4">
            No recent activity
          </p>
        ) : (
          <>
            <div className="max-h-64 overflow-y-auto divide-y divide-border/50 overscroll-contain">
              {events.map((event) => (
                <ActivityEntry key={event.id} event={event} />
              ))}
            </div>
            <div className="pt-3 border-t border-border/50 mt-1">
              <a
                href={`https://monday.com/boards/${JOBS_BOARD_ID}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-muted hover:text-accent transition-colors flex items-center gap-1"
              >
                View all in Monday.com
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
