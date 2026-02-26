"use client";

import { useState, useMemo } from "react";
import { useJobs, useSubItems } from "@/lib/hooks";
import { ACTIVE_GROUPS, SUB_GROUPS } from "@/lib/constants";
import { StatusPill } from "@/components/status-pill";
import { ProgramBadge } from "@/components/program-badge";
import { CardSkeleton } from "@/components/loading-skeleton";
import { useJobDrawer } from "@/components/job-drawer";
import { useSubDrawer } from "@/components/sub-drawer";
import type { Job, SubItem } from "@/lib/monday";
import {
  ChevronLeft,
  ChevronRight,
  MapPin,
  Users,
  CalendarDays,
} from "lucide-react";

interface CalendarEntry {
  job?: Job;
  sub?: SubItem;
  date: string;
  label: "Audit" | "Inspection" | "Work" | "Sub";
}

function getWeekDates(offset: number) {
  const now = new Date();
  const start = new Date(now);
  start.setDate(now.getDate() - now.getDay() + offset * 7);
  start.setHours(0, 0, 0, 0);

  const days: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    days.push(d);
  }
  return days;
}

function formatDate(d: Date) {
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatDayName(d: Date) {
  return d.toLocaleDateString("en-US", { weekday: "short" });
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function isToday(d: Date) {
  return isSameDay(d, new Date());
}

function getEntryLabel(job: Job, dateField: "audit" | "inspection"): CalendarEntry["label"] {
  if (dateField === "inspection") return "Inspection";
  return job.status === "Audit Scheduled" ? "Audit" : "Work";
}

const LABEL_COLORS: Record<CalendarEntry["label"], string> = {
  Audit: "bg-blue-500/20 text-blue-400",
  Inspection: "bg-violet-500/20 text-violet-400",
  Work: "bg-emerald-500/20 text-emerald-400",
  Sub: "bg-amber-500/20 text-amber-400",
};

export default function SchedulePage() {
  const { data: jobs, isLoading } = useJobs();
  const { data: subItems, isLoading: subLoading } = useSubItems();
  const { openJob } = useJobDrawer();
  const { openSub } = useSubDrawer();
  const [weekOffset, setWeekOffset] = useState(0);
  const weekDays = useMemo(() => getWeekDates(weekOffset), [weekOffset]);

  // Build calendar entries — jobs + sub items
  const entries = useMemo(() => {
    const result: CalendarEntry[] = [];

    // Job entries
    if (jobs) {
      for (const job of jobs) {
        if (!ACTIVE_GROUPS.has(job.group)) continue;
        if (job.status !== "Work Scheduled" && job.status !== "Audit Scheduled") continue;

        if (job.auditDate) {
          result.push({ job, date: job.auditDate, label: getEntryLabel(job, "audit") });
        }
        if (job.inspectionDate) {
          result.push({ job, date: job.inspectionDate, label: getEntryLabel(job, "inspection") });
        }
      }
    }

    // Sub item entries
    if (subItems) {
      for (const sub of subItems) {
        if (sub.group === SUB_GROUPS.COMPLETED || sub.group === SUB_GROUPS.CANCELLED) continue;
        if (sub.scheduledDate) {
          result.push({ sub, date: sub.scheduledDate, label: "Sub" });
        }
      }
    }

    return result;
  }, [jobs, subItems]);

  function getEntriesForDay(day: Date): CalendarEntry[] {
    return entries.filter((e) => {
      const entryDate = new Date(e.date + "T00:00:00");
      return isSameDay(entryDate, day);
    });
  }

  // Unscheduled: jobs with relevant status but no audit date AND no inspection date
  const unscheduledJobs = useMemo(() => {
    if (!jobs) return [];
    return jobs.filter(
      (j) =>
        ACTIVE_GROUPS.has(j.group) &&
        (j.status === "Work Scheduled" || j.status === "Audit Scheduled") &&
        !j.auditDate &&
        !j.inspectionDate
    );
  }, [jobs]);

  const weekLabel = `${formatDate(weekDays[0])} — ${formatDate(weekDays[6])}`;

  return (
    <div className="space-y-4 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold flex items-center gap-2">
          <CalendarDays className="w-5 h-5" />
          Schedule
        </h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setWeekOffset((p) => p - 1)}
            className="p-2 rounded-lg hover:bg-card-hover transition-colors text-muted hover:text-foreground"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => setWeekOffset(0)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-card-hover transition-colors"
          >
            Today
          </button>
          <button
            onClick={() => setWeekOffset((p) => p + 1)}
            className="p-2 rounded-lg hover:bg-card-hover transition-colors text-muted hover:text-foreground"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <p className="text-sm text-muted">{weekLabel}</p>

      {isLoading || subLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {weekDays.map((day) => {
            const dayEntries = getEntriesForDay(day);
            const today = isToday(day);

            return (
              <div
                key={day.toISOString()}
                className={`bg-card rounded-2xl border ${
                  today ? "border-accent" : "border-border"
                } overflow-hidden`}
              >
                <div
                  className={`px-4 py-2.5 flex items-center justify-between ${
                    today ? "bg-accent-muted" : "bg-card-hover/50"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-sm font-semibold ${
                        today ? "text-accent" : ""
                      }`}
                    >
                      {formatDayName(day)}
                    </span>
                    <span className="text-sm text-muted">
                      {formatDate(day)}
                    </span>
                    {today && (
                      <span className="text-xs bg-accent text-white px-1.5 py-0.5 rounded-md font-medium">
                        Today
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-muted">
                    {dayEntries.length} item{dayEntries.length !== 1 ? "s" : ""}
                  </span>
                </div>

                {dayEntries.length === 0 ? (
                  <div className="px-4 py-3 text-xs text-muted">
                    No jobs scheduled
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {dayEntries.map((entry) =>
                      entry.job ? (
                        <button
                          key={`job-${entry.job.id}-${entry.label}`}
                          type="button"
                          onClick={() => openJob(entry.job!.id)}
                          className="flex items-center justify-between px-4 py-3 hover:bg-card-hover transition-colors w-full text-left"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className="text-sm font-medium truncate">
                                {entry.job.homeowner}
                              </span>
                              <ProgramBadge type={entry.job.programType} />
                              <StatusPill status={entry.job.status} />
                              <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${LABEL_COLORS[entry.label]}`}>
                                {entry.label}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-muted">
                              {entry.job.location && (
                                <span className="flex items-center gap-1 truncate">
                                  <MapPin className="w-3 h-3 shrink-0" />
                                  {entry.job.location}
                                </span>
                              )}
                              {entry.job.assignedCrewNames.length > 0 && (
                                <span className="flex items-center gap-1 shrink-0">
                                  <Users className="w-3 h-3" />
                                  {entry.job.assignedCrewNames.join(", ")}
                                </span>
                              )}
                            </div>
                            {entry.job.workTodo && (
                              <p className="text-xs text-muted mt-0.5 line-clamp-1">
                                {entry.job.workTodo}
                              </p>
                            )}
                          </div>
                          <ChevronRight className="w-4 h-4 text-muted shrink-0 ml-2" />
                        </button>
                      ) : entry.sub ? (
                        <button
                          key={`sub-${entry.sub.id}`}
                          type="button"
                          onClick={() => openSub(entry.sub!.id)}
                          className="flex items-center justify-between px-4 py-3 hover:bg-card-hover transition-colors w-full text-left"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className="text-sm font-medium truncate">
                                {entry.sub.name}
                              </span>
                              <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${LABEL_COLORS.Sub}`}>
                                {entry.sub.workType || "Sub"}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-muted">
                              {entry.sub.address && (
                                <span className="flex items-center gap-1 truncate">
                                  <MapPin className="w-3 h-3 shrink-0" />
                                  {entry.sub.address}
                                </span>
                              )}
                            </div>
                            {entry.sub.scope && (
                              <p className="text-xs text-muted mt-0.5 line-clamp-1">
                                {entry.sub.scope}
                              </p>
                            )}
                          </div>
                          <ChevronRight className="w-4 h-4 text-muted shrink-0 ml-2" />
                        </button>
                      ) : null
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {/* Unscheduled */}
          {unscheduledJobs.length > 0 && (
            <div className="bg-card rounded-2xl border border-border border-dashed overflow-hidden mt-4">
              <div className="px-4 py-2.5 bg-card-hover/50 flex items-center justify-between">
                <span className="text-sm font-semibold text-muted">
                  No Date Set
                </span>
                <span className="text-xs text-muted">
                  {unscheduledJobs.length} job
                  {unscheduledJobs.length !== 1 ? "s" : ""}
                </span>
              </div>
              <div className="divide-y divide-border">
                {unscheduledJobs.map((job) => (
                  <button
                    key={job.id}
                    type="button"
                    onClick={() => openJob(job.id)}
                    className="flex items-center justify-between px-4 py-3 hover:bg-card-hover transition-colors w-full text-left"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-sm font-medium truncate">
                        {job.homeowner}
                      </span>
                      <ProgramBadge type={job.programType} />
                      <StatusPill status={job.status} />
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
