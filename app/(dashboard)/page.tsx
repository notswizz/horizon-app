"use client";

import { useStats, useJobs } from "@/lib/hooks";
import { GROUP_PIPELINE, STATUS_COLORS, ACTIVE_GROUPS } from "@/lib/constants";
import { ProgramBadge } from "@/components/program-badge";
import { Skeleton } from "@/components/loading-skeleton";
import { ActivityFeed } from "@/components/activity-feed";
import { useJobDrawer } from "@/components/job-drawer";
import {
  Briefcase,
  DollarSign,
  CalendarCheck,
  Hammer,
  MapPin,
  Users,
  ChevronRight,
  TrendingUp,
  Clock,
  Zap,
} from "lucide-react";
import Link from "next/link";
import clsx from "clsx";

function formatCurrency(n: number) {
  if (n >= 1000000) return `$${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `$${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}k`;
  return `$${n.toLocaleString()}`;
}

function formatRelative(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays < 1) return "today";
  if (diffDays === 1) return "yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function DashboardPage() {
  const { data: stats, isLoading: statsLoading } = useStats();
  const { data: jobs, isLoading: jobsLoading } = useJobs();
  const { openJob } = useJobDrawer();

  const activeJobs = jobs?.filter((j) => ACTIVE_GROUPS.has(j.group)) ?? [];

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Build upcoming entries — each job can appear twice (audit + inspection)
  const upcomingEntries = activeJobs
    .filter((j) => j.status === "Work Scheduled" || j.status === "Audit Scheduled")
    .flatMap((j) => {
      const entries: { job: typeof j; date: string; eventType: string }[] = [];
      if (j.auditDate) {
        const d = new Date(j.auditDate + "T00:00:00");
        if (d >= today) entries.push({ job: j, date: j.auditDate, eventType: j.status === "Audit Scheduled" ? "Audit" : "Work" });
      }
      if (j.inspectionDate) {
        const d = new Date(j.inspectionDate + "T00:00:00");
        if (d >= today) entries.push({ job: j, date: j.inspectionDate, eventType: "Inspection" });
      }
      return entries;
    })
    .sort((a, b) => new Date(a.date + "T00:00:00").getTime() - new Date(b.date + "T00:00:00").getTime());

  const totalPipeline = stats?.groupCounts
    ? Object.values(stats.groupCounts).reduce((a, b) => a + b, 0)
    : 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {statsLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-card rounded-2xl border border-border p-4 space-y-3">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-8 w-16" />
            </div>
          ))
        ) : (
          <>
            <StatCard
              icon={<Briefcase className="w-5 h-5" />}
              label="Active Jobs"
              value={stats?.totalActive ?? 0}
              color="text-blue-400"
              bgColor="bg-blue-500/10"
            />
            <StatCard
              icon={<DollarSign className="w-5 h-5" />}
              label="Pipeline Value"
              value={formatCurrency(stats?.pipelineValue ?? 0)}
              color="text-emerald-400"
              bgColor="bg-emerald-500/10"
            />
            <StatCard
              icon={<CalendarCheck className="w-5 h-5" />}
              label="Ready to Schedule"
              value={stats?.readyToSchedule ?? 0}
              color="text-amber-400"
              bgColor="bg-amber-500/10"
              href="/jobs?status=Rebate+Accepted"
            />
            <StatCard
              icon={<Hammer className="w-5 h-5" />}
              label="This Week"
              value={stats?.thisWeekWork ?? 0}
              color="text-purple-400"
              bgColor="bg-purple-500/10"
              href="/schedule"
            />
          </>
        )}
      </div>

      {/* ── Pipeline + Activity side by side ──────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pipeline Funnel */}
        <section className="bg-card rounded-2xl border border-border overflow-hidden">
          <div className="flex items-center justify-between px-5 pt-4 pb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-muted" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-muted">Pipeline</h2>
            </div>
            {!statsLoading && (
              <span className="text-xs text-muted">{totalPipeline} total</span>
            )}
          </div>
          <div className="px-5 pb-5">
            {statsLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-9 w-full" />
                ))}
              </div>
            ) : (
              <div className="space-y-1.5">
                {GROUP_PIPELINE.map((grp) => {
                  const count = stats?.groupCounts[grp.id] ?? 0;
                  const maxCount = Math.max(
                    ...Object.values(stats?.groupCounts ?? { x: 1 })
                  );
                  const pct = maxCount > 0 ? (count / maxCount) * 100 : 0;
                  return (
                    <Link
                      key={grp.id}
                      href="/jobs"
                      className="flex items-center gap-3 group/row py-1 hover:bg-card-hover rounded-lg px-2 -mx-2 transition-colors"
                    >
                      <div className="flex items-center gap-2 w-36 shrink-0">
                        <span className={clsx("w-2 h-2 rounded-full shrink-0", grp.dot)} />
                        <span className="text-xs text-muted truncate group-hover/row:text-foreground transition-colors">
                          {grp.label}
                        </span>
                      </div>
                      <div className="flex-1 h-7 bg-background rounded-md overflow-hidden">
                        <div
                          className={clsx("h-full rounded-md flex items-center px-2.5 transition-all duration-500", grp.bg)}
                          style={{ width: `${Math.max(pct, count > 0 ? 10 : 0)}%` }}
                        >
                          {count > 0 && (
                            <span className={clsx("text-xs font-bold", grp.text)}>
                              {count}
                            </span>
                          )}
                        </div>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-muted/30 group-hover/row:text-muted transition-colors shrink-0" />
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* Activity Feed */}
        <ActivityFeed collapsible collapsibleOnMobileOnly />
      </div>

      {/* ── Scheduled Work ───────────────────────────────── */}
      <section className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="flex items-center justify-between px-5 pt-4 pb-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-muted" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-muted">Upcoming Work</h2>
          </div>
          <Link
            href="/schedule"
            className="text-xs text-accent font-medium hover:underline flex items-center gap-1"
          >
            View schedule <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
        {jobsLoading ? (
          <div className="px-3 pb-3 space-y-1">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="p-3 space-y-2">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-3.5 w-56" />
              </div>
            ))}
          </div>
        ) : upcomingEntries.length === 0 ? (
          <div className="px-5 pb-6 pt-2 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-card-hover mb-2">
              <CalendarCheck className="w-5 h-5 text-muted" />
            </div>
            <p className="text-sm text-muted">No work scheduled</p>
          </div>
        ) : (
          <div className="px-3 pb-3">
            <div className="space-y-1">
              {upcomingEntries.slice(0, 8).map((entry) => {
                const sc = STATUS_COLORS[entry.job.status];
                const eventColors: Record<string, string> = {
                  Audit: "bg-blue-500/20 text-blue-400",
                  Inspection: "bg-violet-500/20 text-violet-400",
                  Work: "bg-emerald-500/20 text-emerald-400",
                };
                return (
                  <button
                    key={`${entry.job.id}-${entry.eventType}`}
                    type="button"
                    onClick={() => openJob(entry.job.id)}
                    className="flex items-start gap-3 p-3 rounded-xl hover:bg-card-hover transition-colors group w-full text-left"
                  >
                    {/* Date badge */}
                    <div className="shrink-0 w-12 text-center">
                      <div className="text-[10px] uppercase text-muted font-medium leading-none">
                        {new Date(entry.date + "T00:00:00").toLocaleDateString("en-US", { month: "short" })}
                      </div>
                      <div className="text-lg font-bold leading-tight">
                        {new Date(entry.date + "T00:00:00").getDate()}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-sm font-semibold truncate">{entry.job.homeowner}</span>
                        <ProgramBadge type={entry.job.programType} />
                        <span className={clsx(
                          "inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold",
                          eventColors[entry.eventType] || eventColors.Work
                        )}>
                          {entry.eventType}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted">
                        {entry.job.location && (
                          <span className="flex items-center gap-1 truncate">
                            <MapPin className="w-3 h-3 shrink-0" />
                            <span className="truncate">{entry.job.location}</span>
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
                        <p className="text-xs text-muted/70 mt-1 line-clamp-1">{entry.job.workTodo}</p>
                      )}
                    </div>

                    <ChevronRight className="w-4 h-4 text-muted/30 group-hover:text-muted mt-1 shrink-0" />
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </section>

      {/* ── Quick Actions ────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <QuickAction href="/jobs/new" icon={<Zap className="w-5 h-5" />} label="New Job" color="text-accent" />
        <QuickAction href="/jobs" icon={<Briefcase className="w-5 h-5" />} label="All Jobs" color="text-blue-400" />
        <QuickAction href="/crew" icon={<Users className="w-5 h-5" />} label="Crew" color="text-emerald-400" />
        <QuickAction href="/schedule" icon={<CalendarCheck className="w-5 h-5" />} label="Schedule" color="text-purple-400" />
      </div>
    </div>
  );
}

// ── Components ──────────────────────────────────────────

function StatCard({
  icon,
  label,
  value,
  color,
  bgColor,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color: string;
  bgColor: string;
  href?: string;
}) {
  const inner = (
    <>
      <div className={clsx("inline-flex items-center justify-center w-10 h-10 rounded-xl mb-3", bgColor, color)}>
        {icon}
      </div>
      <div className="text-2xl font-bold tracking-tight">{value}</div>
      <div className="text-xs text-muted font-medium mt-0.5">{label}</div>
    </>
  );

  if (href) {
    return (
      <Link href={href} className="bg-card rounded-2xl border border-border p-4 hover:bg-card-hover hover:border-border transition-colors">
        {inner}
      </Link>
    );
  }

  return (
    <div className="bg-card rounded-2xl border border-border p-4">
      {inner}
    </div>
  );
}

function QuickAction({ href, icon, label, color }: { href: string; icon: React.ReactNode; label: string; color: string }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 bg-card rounded-2xl border border-border p-4 hover:bg-card-hover hover:border-border transition-colors group"
    >
      <span className={clsx(color)}>{icon}</span>
      <span className="text-sm font-medium">{label}</span>
      <ChevronRight className="w-4 h-4 text-muted/30 ml-auto group-hover:text-muted transition-colors" />
    </Link>
  );
}
