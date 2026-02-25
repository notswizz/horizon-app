"use client";

import { Suspense, useState, useMemo } from "react";
import { useJobs, useCrew } from "@/lib/hooks";
import { ALL_STATUSES, GROUPS, ACTIVE_GROUPS, STATUS_COLORS } from "@/lib/constants";
import { ProgramBadge } from "@/components/program-badge";
import { JobsGridSkeleton } from "@/components/loading-skeleton";
import {
  Search,
  SlidersHorizontal,
  X,
  MapPin,
  DollarSign,
  Users,
  Plus,
  Camera,
  FileText,
  ArrowUpRight,
  ArrowDownUp,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useJobDrawer } from "@/components/job-drawer";
import clsx from "clsx";

const PROGRAM_TYPES = ["HER", "HEAR", "GHEFA", "IRA"];

type NoteTab = "next" | "process" | "inspection" | "appliance";

const NOTE_TABS: { key: NoteTab; label: string; shortLabel: string }[] = [
  { key: "next", label: "Next Steps", shortLabel: "Next" },
  { key: "process", label: "Process", shortLabel: "Proc" },
  { key: "inspection", label: "Inspection", shortLabel: "Insp" },
  { key: "appliance", label: "Appliance", shortLabel: "Appl" },
];

export default function JobsPage() {
  return (
    <Suspense fallback={<JobsGridSkeleton />}>
      <JobsContent />
    </Suspense>
  );
}

function JobsContent() {
  const searchParams = useSearchParams();
  const initialStatus = searchParams.get("status");

  const { data: jobs, isLoading } = useJobs();
  const { data: crew } = useCrew();
  const [search, setSearch] = useState("");
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>(
    initialStatus ? [initialStatus] : []
  );
  const [selectedProgram, setSelectedProgram] = useState<string>("");
  const [selectedCrew, setSelectedCrew] = useState<string>("");
  const [showFilters, setShowFilters] = useState(!!initialStatus);
  const [showGroup, setShowGroup] = useState<"active" | "completed" | "cancelled" | "all">("active");
  const [sortBy, setSortBy] = useState<"updated" | "created">("updated");

  const filtered = useMemo(() => {
    if (!jobs) return [];

    const result = jobs.filter((job) => {
      if (showGroup === "active" && !ACTIVE_GROUPS.has(job.group)) return false;
      if (showGroup === "completed" && job.group !== GROUPS.COMPLETED) return false;
      if (showGroup === "cancelled" && job.group !== GROUPS.CANCELLED) return false;

      if (search) {
        const q = search.toLowerCase();
        const match =
          job.homeowner.toLowerCase().includes(q) ||
          job.name.toLowerCase().includes(q) ||
          job.location.toLowerCase().includes(q) ||
          job.projectId.toLowerCase().includes(q);
        if (!match) return false;
      }

      if (selectedStatuses.length > 0 && !selectedStatuses.includes(job.status)) return false;
      if (selectedProgram && job.programType !== selectedProgram) return false;
      if (selectedCrew && !job.assignedCrewIds.includes(selectedCrew)) return false;

      return true;
    });

    result.sort((a, b) => {
      if (sortBy === "updated") {
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      }
      // "created" — Monday item IDs are sequential, higher = newer
      return Number(b.id) - Number(a.id);
    });

    return result;
  }, [jobs, search, selectedStatuses, selectedProgram, selectedCrew, showGroup, sortBy]);

  function toggleStatus(status: string) {
    setSelectedStatuses((prev) =>
      prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]
    );
  }

  function clearFilters() {
    setSearch("");
    setSelectedStatuses([]);
    setSelectedProgram("");
    setSelectedCrew("");
  }

  const hasFilters = search || selectedStatuses.length > 0 || selectedProgram || selectedCrew;

  return (
    <div className="space-y-4">
      {/* Page header with New Job button */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold">Jobs</h1>
          <p className="text-xs text-muted mt-0.5">
            {isLoading ? "Loading..." : `${filtered.length} job${filtered.length !== 1 ? "s" : ""}`}
          </p>
        </div>
        <Link
          href="/jobs/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent text-white text-sm font-semibold hover:bg-accent-hover active:scale-[0.97] transition-all shadow-lg shadow-accent/20"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span className="hidden sm:inline">New Job</span>
        </Link>
      </div>

      {/* Search & Filter Bar */}
      <div className="space-y-3">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input
              type="text"
              placeholder="Search name, address, ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-card border border-border text-foreground placeholder:text-muted focus:border-accent focus:ring-1 focus:ring-accent outline-none text-sm transition-colors"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <button
            onClick={() => setSortBy(sortBy === "updated" ? "created" : "updated")}
            className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-card border border-border text-xs font-medium text-muted hover:text-foreground transition-colors shrink-0"
          >
            <ArrowDownUp className="w-4 h-4" />
            <span className="hidden sm:inline">{sortBy === "updated" ? "Last Updated" : "Created"}</span>
          </button>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={clsx(
              "p-2.5 rounded-xl border transition-colors relative",
              showFilters || hasFilters
                ? "bg-accent-muted border-accent text-accent"
                : "bg-card border-border text-muted hover:text-foreground"
            )}
          >
            <SlidersHorizontal className="w-5 h-5" />
            {hasFilters && !showFilters && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-accent rounded-full" />
            )}
          </button>
        </div>

        {/* Group tabs */}
        <div className="flex gap-1 bg-card rounded-xl p-1 border border-border">
          {(["active", "completed", "cancelled", "all"] as const).map((group) => (
            <button
              key={group}
              onClick={() => setShowGroup(group)}
              className={clsx(
                "flex-1 py-2 px-3 rounded-lg text-xs font-medium capitalize transition-colors",
                showGroup === group
                  ? "bg-accent-muted text-accent"
                  : "text-muted hover:text-foreground"
              )}
            >
              {group}
            </button>
          ))}
        </div>

        {/* Expanded filters */}
        {showFilters && (
          <div className="bg-card rounded-2xl border border-border p-4 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted uppercase tracking-wider">
                Filters
              </span>
              {hasFilters && (
                <button
                  onClick={clearFilters}
                  className="text-xs text-accent flex items-center gap-1 hover:underline"
                >
                  <X className="w-3 h-3" /> Clear all
                </button>
              )}
            </div>

            <div>
              <label className="text-xs text-muted mb-2 block">Status</label>
              <div className="flex flex-wrap gap-1.5">
                {ALL_STATUSES.map((status) => {
                  const colors = STATUS_COLORS[status];
                  const selected = selectedStatuses.includes(status);
                  return (
                    <button
                      key={status}
                      onClick={() => toggleStatus(status)}
                      className={clsx(
                        "flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all",
                        selected
                          ? "bg-accent text-white"
                          : "bg-card-hover text-muted hover:text-foreground"
                      )}
                    >
                      <span className={clsx("w-1.5 h-1.5 rounded-full", selected ? "bg-white" : colors?.dot)} />
                      {status}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-wrap gap-4">
              <div>
                <label className="text-xs text-muted mb-2 block">Program</label>
                <div className="flex gap-1.5">
                  {PROGRAM_TYPES.map((type) => (
                    <button
                      key={type}
                      onClick={() => setSelectedProgram(selectedProgram === type ? "" : type)}
                      className={clsx(
                        "px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors",
                        selectedProgram === type
                          ? "bg-accent text-white"
                          : "bg-card-hover text-muted hover:text-foreground"
                      )}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {crew && crew.length > 0 && (
                <div>
                  <label className="text-xs text-muted mb-2 block">Crew</label>
                  <select
                    value={selectedCrew}
                    onChange={(e) => setSelectedCrew(e.target.value)}
                    className="px-3 py-1.5 rounded-lg bg-card-hover border-none text-foreground text-xs font-medium focus:ring-1 focus:ring-accent outline-none cursor-pointer"
                  >
                    <option value="">All</option>
                    {crew.map((member) => (
                      <option key={member.id} value={member.id}>
                        {member.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Job Grid */}
      {isLoading ? (
        <JobsGridSkeleton />
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-card-hover mb-4">
            <Search className="w-7 h-7 text-muted" />
          </div>
          <p className="text-base font-medium text-foreground">No jobs found</p>
          <p className="text-sm text-muted mt-1">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      )}

      {/* Mobile FAB */}
      <Link
        href="/jobs/new"
        className="md:hidden fixed right-4 bottom-20 w-14 h-14 rounded-2xl bg-accent text-white flex items-center justify-center shadow-lg shadow-accent/30 hover:bg-accent-hover active:scale-95 transition-all z-40"
        aria-label="New Job"
      >
        <Plus className="w-6 h-6 stroke-[2.5]" />
      </Link>
    </div>
  );
}

interface JobData {
  id: string;
  homeowner: string;
  name: string;
  location: string;
  status: string;
  programType: string;
  nextSteps: string;
  processNotes: string;
  inspectionNotes: string;
  applianceNotes: string;
  rebateAmount: number | null;
  auditDate: string;
  assignedCrewNames: string[];
  companyCamLink: string;
  snuggProLink: string;
}

function JobCard({ job }: { job: JobData }) {
  const [activeNote, setActiveNote] = useState<NoteTab>("next");
  const { openJob } = useJobDrawer();

  const statusColor = STATUS_COLORS[job.status] ?? {
    bg: "bg-gray-500/20",
    text: "text-gray-400",
    dot: "bg-gray-400",
    border: "border-gray-500/30",
  };

  const noteContent: Record<NoteTab, string> = {
    next: job.nextSteps,
    process: job.processNotes,
    inspection: job.inspectionNotes,
    appliance: job.applianceNotes,
  };

  const currentNote = noteContent[activeNote];
  const hasAnyNotes = Object.values(noteContent).some((n) => n);

  // Count which tabs have content for the dot indicators
  const tabHasContent: Record<NoteTab, boolean> = {
    next: !!job.nextSteps,
    process: !!job.processNotes,
    inspection: !!job.inspectionNotes,
    appliance: !!job.applianceNotes,
  };

  function navigateToJob() {
    openJob(job.id);
  }

  return (
    <div
      className={clsx(
        "group relative flex flex-col bg-card rounded-2xl border overflow-hidden",
        "hover:bg-card-hover transition-all",
        statusColor.border
      )}
    >
      {/* Status color bar at top */}
      <div className={clsx("h-1 w-full", statusColor.dot)} />

      {/* Card body */}
      <div className="p-3.5 flex flex-col flex-1">
        {/* Header row */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className={clsx("w-2 h-2 rounded-full shrink-0", statusColor.dot)} />
            <span className={clsx("text-[10px] font-medium truncate leading-none", statusColor.text)}>
              {job.status || "No Status"}
            </span>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            {job.companyCamLink && (
              <a
                href={job.companyCamLink}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="p-1 rounded-md hover:bg-blue-500/15 text-blue-400 transition-colors"
                title="CompanyCam"
              >
                <Camera className="w-3.5 h-3.5" />
              </a>
            )}
            {job.snuggProLink && (
              <a
                href={job.snuggProLink}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="p-1 rounded-md hover:bg-emerald-500/15 text-emerald-400 transition-colors"
                title="SnuggPro"
              >
                <FileText className="w-3.5 h-3.5" />
              </a>
            )}
            <ProgramBadge type={job.programType} />
          </div>
        </div>

        {/* Clickable content area → navigates to job detail */}
        <div onClick={navigateToJob} className="cursor-pointer flex-1 flex flex-col">
          {/* Name */}
          <h3 className="font-semibold text-sm leading-tight mb-1 group-hover:text-accent transition-colors">
            {job.homeowner || job.name}
          </h3>

          {/* Address */}
          {job.location && (
            <p className="text-[11px] text-muted leading-snug mb-3 flex items-start gap-1">
              <MapPin className="w-3 h-3 shrink-0 mt-px" />
              <span className="line-clamp-2">{job.location}</span>
            </p>
          )}

          {/* Footer meta */}
          <div className="flex items-center gap-3 text-[11px] text-muted mt-auto">
            {job.rebateAmount != null && (
              <span className="flex items-center gap-0.5 font-semibold text-foreground">
                <DollarSign className="w-3 h-3 text-muted" />
                {job.rebateAmount >= 1000
                  ? `${(job.rebateAmount / 1000).toFixed(job.rebateAmount % 1000 === 0 ? 0 : 1)}k`
                  : job.rebateAmount.toLocaleString()}
              </span>
            )}
            {job.assignedCrewNames.length > 0 && (
              <span className="flex items-center gap-0.5 truncate">
                <Users className="w-3 h-3 shrink-0" />
                <span className="truncate">{job.assignedCrewNames[0]}</span>
                {job.assignedCrewNames.length > 1 && (
                  <span>+{job.assignedCrewNames.length - 1}</span>
                )}
              </span>
            )}
            <ArrowUpRight className="w-3.5 h-3.5 ml-auto opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
          </div>
        </div>
      </div>

      {/* Notes section */}
      {hasAnyNotes && (
        <div className="border-t border-border/50">
          {/* Note tabs */}
          <div className="flex gap-px bg-card-hover/50 px-2 pt-2">
            {NOTE_TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveNote(tab.key)}
                className={clsx(
                  "flex items-center gap-1.5 px-2.5 py-1.5 rounded-t-lg text-[11px] font-medium transition-colors",
                  activeNote === tab.key
                    ? "bg-card text-foreground"
                    : tabHasContent[tab.key]
                    ? "text-muted hover:text-foreground"
                    : "text-muted/30"
                )}
              >
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.shortLabel}</span>
                {activeNote !== tab.key && tabHasContent[tab.key] && (
                  <span className="w-1.5 h-1.5 bg-accent/50 rounded-full" />
                )}
              </button>
            ))}
          </div>

          {/* Note content */}
          <div className="px-4 pb-3.5 pt-2.5 bg-card">
            {currentNote ? (
              <p className="text-[13px] text-foreground/80 leading-[1.6] whitespace-pre-wrap">
                {currentNote}
              </p>
            ) : (
              <p className="text-xs text-muted/40 italic py-1">No {NOTE_TABS.find((t) => t.key === activeNote)?.label?.toLowerCase()}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
