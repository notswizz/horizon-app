"use client";

import { useState } from "react";
import { useJob, useJobs } from "@/lib/hooks";
import { ALL_STATUSES, JOB_COLUMNS, STATUS_COLORS } from "@/lib/constants";
import { ProgramBadge } from "@/components/program-badge";
import { EditableField, EditableStatus } from "@/components/editable-field";
import { Skeleton } from "@/components/loading-skeleton";
import {
  Phone,
  Mail,
  MapPin,
  ExternalLink,
  Camera,
  FileText,
  ChevronRight,
  DollarSign,
  Users,
  Calendar,
  Hash,
  ClipboardCheck,
  Wrench,
  ArrowRightLeft,
} from "lucide-react";
import clsx from "clsx";

const PROGRAM_OPTIONS = ["HER", "HEAR", "GHEFA", "IRA"] as const;
const INVOICE_OPTIONS = ["Not Sent", "Sent", "Paid"] as const;
const YES_NO_OPTIONS = ["Yes", "No"] as const;
const INSPECTION_OPTIONS = ["Not Scheduled", "Pending", "Passed", "Failed"] as const;

export function JobDetailContent({
  jobId,
  onNavigateJob,
}: {
  jobId: string;
  onNavigateJob?: (id: string) => void;
}) {
  const { data: job, isLoading } = useJob(jobId);
  const { data: allJobs } = useJobs();

  const relatedJobs =
    allJobs?.filter(
      (j) =>
        j.id !== jobId &&
        job &&
        (j.homeowner === job.homeowner || j.name === job.name) &&
        j.homeowner !== ""
    ) ?? [];

  if (isLoading) {
    return <DetailSkeleton />;
  }

  if (!job) {
    return (
      <div className="text-center py-20">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-card-hover mb-4">
          <FileText className="w-7 h-7 text-muted" />
        </div>
        <p className="text-base font-medium">Job not found</p>
      </div>
    );
  }

  const statusColor = STATUS_COLORS[job.status] ?? {
    bg: "bg-gray-500/20", text: "text-gray-400", dot: "bg-gray-400", border: "border-gray-500/30",
  };

  const mapsUrl = job.location
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(job.location)}`
    : null;

  return (
    <div className="space-y-5">
      {/* ── Hero Header ──────────────────────────────────── */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        {/* Status color bar */}
        <div className={clsx("h-1.5 w-full", statusColor.dot)} />

        <div className="p-5 md:p-6">
          {/* Top row: name + status */}
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="min-w-0 flex-1">
              <EditableField
                jobId={job.id}
                columnId={JOB_COLUMNS.HOMEOWNER}
                value={job.homeowner || job.name}
                className="[&_p]:text-2xl [&_p]:font-bold [&_p]:tracking-tight"
              />
              <div className="flex items-center gap-2.5 mt-1.5 px-4">
                <EditableStatus
                  jobId={job.id}
                  columnId={JOB_COLUMNS.PROGRAM_TYPE}
                  value={job.programType}
                  options={PROGRAM_OPTIONS}
                  renderValue={(val) => <ProgramBadge type={val} />}
                />
                <span className="text-xs text-muted">
                  Updated {formatRelativeDate(job.updatedAt)}
                </span>
              </div>
            </div>
            <EditableStatus
              jobId={job.id}
              columnId={JOB_COLUMNS.STATUS}
              value={job.status}
              options={ALL_STATUSES}
              renderValue={(val) => {
                const sc = STATUS_COLORS[val] ?? { bg: "bg-gray-500/20", text: "text-gray-400", dot: "bg-gray-400" };
                return (
                  <span className={clsx("inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold", sc.bg, sc.text)}>
                    <span className={clsx("w-2 h-2 rounded-full", sc.dot)} />
                    {val || "No Status"}
                  </span>
                );
              }}
            />
          </div>

          {/* Contact actions */}
          <div className="flex flex-wrap gap-2 mb-4">
            {job.phone && (
              <a
                href={`tel:${job.phone}`}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-background border border-border text-sm font-medium hover:border-accent hover:text-accent transition-colors"
              >
                <Phone className="w-4 h-4" />
                {job.phone}
              </a>
            )}
            {job.email && (
              <a
                href={`mailto:${job.email}`}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-background border border-border text-sm font-medium hover:border-accent hover:text-accent transition-colors"
              >
                <Mail className="w-4 h-4" />
                <span className="truncate max-w-[180px]">{job.email}</span>
              </a>
            )}
            {mapsUrl && (
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-background border border-border text-sm font-medium hover:border-accent hover:text-accent transition-colors"
              >
                <MapPin className="w-4 h-4" />
                <span className="truncate max-w-[220px]">{job.location}</span>
              </a>
            )}
          </div>

          {/* External link buttons */}
          <div className="flex gap-2">
            {job.companyCamLink ? (
              <a
                href={job.companyCamLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500/10 text-blue-400 text-sm font-medium hover:bg-blue-500/20 transition-colors"
              >
                <Camera className="w-4 h-4" />
                CompanyCam
                <ExternalLink className="w-3.5 h-3.5 opacity-50" />
              </a>
            ) : (
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-card-hover text-muted/40 text-sm font-medium cursor-default">
                <Camera className="w-4 h-4" />
                CompanyCam
              </span>
            )}
            {job.snuggProLink ? (
              <a
                href={job.snuggProLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 text-emerald-400 text-sm font-medium hover:bg-emerald-500/20 transition-colors"
              >
                <FileText className="w-4 h-4" />
                SnuggPro
                <ExternalLink className="w-3.5 h-3.5 opacity-50" />
              </a>
            ) : (
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-card-hover text-muted/40 text-sm font-medium cursor-default">
                <FileText className="w-4 h-4" />
                SnuggPro
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── Notes (tabbed) ────────────────────────────────── */}
      <NotesSection job={job} />

      {/* ── Related Jobs ─────────────────────────────────── */}
      {relatedJobs.length > 0 && (
        <div className="bg-accent-muted/50 rounded-2xl border border-accent/20 p-4">
          <div className="flex items-center gap-2 mb-3">
            <ArrowRightLeft className="w-4 h-4 text-accent" />
            <span className="text-sm font-semibold text-accent">Related Jobs</span>
          </div>
          <div className="space-y-2">
            {relatedJobs.map((rj) => {
              const rsc = STATUS_COLORS[rj.status] ?? { dot: "bg-gray-400", text: "text-gray-400" };
              return (
                <button
                  key={rj.id}
                  type="button"
                  onClick={() => onNavigateJob?.(rj.id)}
                  className="flex items-center justify-between w-full p-3 rounded-xl bg-card border border-border hover:border-accent/30 transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <ProgramBadge type={rj.programType} />
                    <div className="flex items-center gap-1.5">
                      <span className={clsx("w-2 h-2 rounded-full", rsc.dot)} />
                      <span className={clsx("text-sm font-medium", rsc.text)}>{rj.status}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted">
                    {rj.rebateAmount != null && (
                      <span className="font-semibold text-foreground">${rj.rebateAmount.toLocaleString()}</span>
                    )}
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Overview Grid ────────────────────────────────── */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="flex items-center gap-2 px-5 pt-4 pb-2">
          <Hash className="w-4 h-4 text-muted" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-muted">Details</h2>
        </div>
        <div className="px-5 pb-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted font-medium flex items-center gap-1.5 mb-1">
                <Calendar className="w-3.5 h-3.5" /> Audit Date
              </label>
              <EditableField
                jobId={job.id}
                columnId={JOB_COLUMNS.AUDIT_DATE}
                value={job.auditDate}
                type="date"
                className="[&_p]:text-sm [&>div]:py-1.5 [&>div]:px-2 [&>div]:min-h-0"
              />
            </div>
            <div>
              <label className="text-xs text-muted font-medium flex items-center gap-1.5 mb-1">
                <Calendar className="w-3.5 h-3.5" /> Inspection Date
              </label>
              <EditableField
                jobId={job.id}
                columnId={JOB_COLUMNS.INSPECTION_DATE}
                value={job.inspectionDate}
                type="date"
                className="[&_p]:text-sm [&>div]:py-1.5 [&>div]:px-2 [&>div]:min-h-0"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted font-medium flex items-center gap-1.5 mb-1">
                <Hash className="w-3.5 h-3.5" /> Project ID
              </label>
              <p className="text-sm font-medium px-2 py-1.5">{job.projectId || <span className="text-muted/50 italic">None</span>}</p>
            </div>
            <div>
              <label className="text-xs text-muted font-medium flex items-center gap-1.5 mb-1">
                <Users className="w-3.5 h-3.5" /> Assigned Crew
              </label>
              <p className="text-sm font-medium px-2 py-1.5">
                {job.assignedCrewNames.length > 0 ? job.assignedCrewNames.join(", ") : <span className="text-muted/50 italic">None</span>}
              </p>
            </div>
            <div>
              <label className="text-xs text-muted font-medium flex items-center gap-1.5 mb-1">
                <ClipboardCheck className="w-3.5 h-3.5" /> Inspection Status
              </label>
              <EditableStatus
                jobId={job.id}
                columnId={JOB_COLUMNS.INSPECTION_STATUS}
                value={job.inspectionStatus}
                options={INSPECTION_OPTIONS}
                renderValue={(val) => {
                  const colors: Record<string, string> = {
                    "Passed": "text-green-400",
                    "Failed": "text-red-400",
                    "Pending": "text-amber-400",
                    "Not Scheduled": "text-muted",
                  };
                  return (
                    <span className={clsx("text-sm font-medium px-2 py-1.5 rounded-lg hover:bg-card-hover cursor-pointer inline-block transition-colors", colors[val] || "text-muted/50 italic")}>
                      {val || "Click to set..."}
                    </span>
                  );
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Work Scope ───────────────────────────────────── */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="flex items-center gap-2 px-5 pt-4 pb-2">
          <Wrench className="w-4 h-4 text-muted" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-muted">Work Scope</h2>
        </div>
        <div className="px-5 pb-4 space-y-3">
          <EditableField
            jobId={job.id}
            columnId={JOB_COLUMNS.WORK_TODO}
            value={job.workTodo}
            label="Work To-Do"
            multiline
          />
          <div>
            <label className="text-xs text-muted font-medium mb-1 block">Work Complete</label>
            <EditableStatus
              jobId={job.id}
              columnId={JOB_COLUMNS.WORK_COMPLETE}
              value={job.workComplete}
              options={YES_NO_OPTIONS}
              renderValue={(val) => (
                <span className={clsx(
                  "text-sm font-medium px-3 py-1.5 rounded-lg hover:bg-card-hover cursor-pointer inline-block transition-colors",
                  val === "Yes" ? "text-green-400" : val === "No" ? "text-red-400" : "text-muted/50 italic"
                )}>
                  {val || "Click to set..."}
                </span>
              )}
            />
          </div>
        </div>
      </div>

      {/* ── Financials ───────────────────────────────────── */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="flex items-center gap-2 px-5 pt-4 pb-3">
          <DollarSign className="w-4 h-4 text-muted" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-muted">Financials</h2>
        </div>
        <div className="px-5 pb-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-muted font-medium">Requested $</label>
              <EditableField
                jobId={job.id}
                columnId={JOB_COLUMNS.REBATE_AMOUNT}
                value={job.rebateAmount != null ? String(job.rebateAmount) : ""}
                className="[&_p]:text-xl [&_p]:font-bold [&>div]:py-1.5 [&>div]:px-2 [&>div]:min-h-0"
              />
            </div>
            <div>
              <label className="text-xs text-muted font-medium">Approved $</label>
              <EditableField
                jobId={job.id}
                columnId={JOB_COLUMNS.APPROVED_AMOUNT}
                value={job.approvedAmount != null ? String(job.approvedAmount) : ""}
                className="[&_p]:text-xl [&_p]:font-bold [&>div]:py-1.5 [&>div]:px-2 [&>div]:min-h-0"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-border/50">
            <div>
              <label className="text-xs text-muted font-medium">Invoice Status</label>
              <EditableStatus
                jobId={job.id}
                columnId={JOB_COLUMNS.INVOICE_STATUS}
                value={job.invoiceStatus}
                options={INVOICE_OPTIONS}
                renderValue={(val) => {
                  const colors: Record<string, string> = {
                    "Paid": "text-green-400",
                    "Sent": "text-blue-400",
                    "Not Sent": "text-muted",
                  };
                  return (
                    <span className={clsx("text-sm font-medium px-2 py-1.5 rounded-lg hover:bg-card-hover cursor-pointer inline-block transition-colors", colors[val] || "text-muted/50 italic")}>
                      {val || "Click to set..."}
                    </span>
                  );
                }}
              />
            </div>
            <div>
              <label className="text-xs text-muted font-medium">GEFA Paid</label>
              <EditableStatus
                jobId={job.id}
                columnId={JOB_COLUMNS.GEFA_PAID}
                value={job.gefaPaid}
                options={YES_NO_OPTIONS}
                renderValue={(val) => (
                  <span className={clsx(
                    "text-sm font-medium px-2 py-1.5 rounded-lg hover:bg-card-hover cursor-pointer inline-block transition-colors",
                    val === "Yes" ? "text-green-400" : val === "No" ? "text-red-400" : "text-muted/50 italic"
                  )}>
                    {val || "Click to set..."}
                  </span>
                )}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Sub-components ──────────────────────────────────────

type NoteTabKey = "next" | "process" | "inspection" | "appliance";

const NOTE_TAB_DEFS: { key: NoteTabKey; label: string; columnId: string }[] = [
  { key: "next", label: "Next Steps", columnId: JOB_COLUMNS.NEXT_STEPS },
  { key: "process", label: "Process", columnId: JOB_COLUMNS.PROCESS_NOTES },
  { key: "inspection", label: "Inspection", columnId: JOB_COLUMNS.INSPECTION_NOTES },
  { key: "appliance", label: "Appliance", columnId: JOB_COLUMNS.APPLIANCE_NOTES },
];

function NotesSection({ job }: {
  job: {
    id: string;
    nextSteps: string;
    processNotes: string;
    inspectionNotes: string;
    applianceNotes: string;
  };
}) {
  const [tab, setTab] = useState<NoteTabKey>("next");

  const noteValues: Record<NoteTabKey, string> = {
    next: job.nextSteps,
    process: job.processNotes,
    inspection: job.inspectionNotes,
    appliance: job.applianceNotes,
  };

  const activeTabDef = NOTE_TAB_DEFS.find((t) => t.key === tab)!;

  return (
    <div className="bg-card rounded-2xl border border-border overflow-hidden">
      {/* Tab bar */}
      <div className="flex border-b border-border">
        {NOTE_TAB_DEFS.map((t) => {
          const hasContent = !!noteValues[t.key];
          const isActive = tab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={clsx(
                "flex-1 py-3 text-xs font-semibold uppercase tracking-wider transition-colors relative",
                isActive
                  ? "text-accent"
                  : hasContent
                  ? "text-muted hover:text-foreground"
                  : "text-muted/30 hover:text-muted/60"
              )}
            >
              <span className="flex items-center justify-center gap-1.5">
                {t.label}
                {!isActive && hasContent && (
                  <span className="w-1.5 h-1.5 bg-accent/50 rounded-full" />
                )}
              </span>
              {isActive && (
                <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-accent rounded-full" />
              )}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="p-5">
        <EditableField
          key={activeTabDef.key}
          jobId={job.id}
          columnId={activeTabDef.columnId}
          value={noteValues[tab]}
          multiline
        />
      </div>
    </div>
  );
}

function formatRelativeDate(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHr / 24);

  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function DetailSkeleton() {
  return (
    <div className="space-y-5">
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <Skeleton className="h-1.5 w-full rounded-none" />
        <div className="p-5 space-y-4">
          <div className="flex justify-between">
            <div className="space-y-2">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
            <Skeleton className="h-9 w-36 rounded-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-8 w-56" />
            <Skeleton className="h-8 w-72" />
          </div>
        </div>
      </div>
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="flex border-b border-border p-1">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="flex-1 h-8 mx-1 rounded-lg" />
          ))}
        </div>
        <div className="p-5 space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
      <div className="bg-card rounded-2xl border border-border p-5 space-y-3">
        <Skeleton className="h-4 w-28" />
        <div className="grid grid-cols-2 gap-3">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    </div>
  );
}
