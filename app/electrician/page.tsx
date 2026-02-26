"use client";

import { useState, useMemo } from "react";
import { useSubItems } from "@/lib/hooks";
import { SUB_GROUPS, SUB_COLUMNS } from "@/lib/constants";
import { EditableField } from "@/components/editable-field";
import { Skeleton } from "@/components/loading-skeleton";
import {
  Zap,
  MapPin,
  Calendar,
  CheckCircle2,
  XCircle,
  ChevronDown,
  Search,
  X,
} from "lucide-react";
import clsx from "clsx";

const ELECTRICAL_GROUPS: Set<string> = new Set([
  SUB_GROUPS.ELEC_PRE_SUB,
  SUB_GROUPS.ELEC_APPLIED,
]);

export default function ElectricianPage() {
  const { data: items, isLoading } = useSubItems();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const electricalItems = useMemo(() => {
    if (!items) return [];
    return items.filter((item) => {
      if (!ELECTRICAL_GROUPS.has(item.group)) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          item.name.toLowerCase().includes(q) ||
          item.address.toLowerCase().includes(q) ||
          item.scope.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [items, search]);

  function toggle(id: string) {
    setExpandedId(expandedId === id ? null : id);
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-3">
          <div className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-amber-500/10">
            <Zap className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h1 className="text-base font-bold">Electrical Work</h1>
            <p className="text-[11px] text-muted">Horizon Energy South</p>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-4 space-y-3">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input
            type="text"
            placeholder="Search name, address..."
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

        {/* Count */}
        <p className="text-xs text-muted">
          {isLoading
            ? "Loading..."
            : `${electricalItems.length} item${electricalItems.length !== 1 ? "s" : ""}`}
        </p>

        {/* List */}
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-card rounded-2xl border border-border p-4 space-y-3">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-4 w-56" />
                <Skeleton className="h-3 w-32" />
              </div>
            ))}
          </div>
        ) : electricalItems.length === 0 ? (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-card-hover mb-4">
              <Zap className="w-7 h-7 text-muted" />
            </div>
            <p className="text-base font-medium">No electrical work found</p>
          </div>
        ) : (
          <div className="space-y-2">
            {electricalItems.map((item) => (
              <ElectricalCard
                key={item.id}
                item={item}
                expanded={expandedId === item.id}
                onToggle={() => toggle(item.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

interface ElectricalCardProps {
  item: {
    id: string;
    name: string;
    address: string;
    scope: string;
    notes: string;
    groupTitle: string;
    wiringComplete: string;
    ngApproval: string;
    goodToSubmit: string;
    scheduledDate: string;
    completionDate: string;
    companyCamLink: string;
  };
  expanded: boolean;
  onToggle: () => void;
}

function ElectricalCard({ item, expanded, onToggle }: ElectricalCardProps) {
  return (
    <div className="bg-card rounded-2xl border border-amber-500/20 overflow-hidden">
      {/* Summary row — always visible */}
      <button
        type="button"
        onClick={onToggle}
        className="w-full text-left p-4 flex items-start gap-3 hover:bg-card-hover transition-colors"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-sm truncate">{item.name}</h3>
            <span className="text-[10px] text-amber-700 font-medium shrink-0 bg-amber-500/15 px-1.5 py-0.5 rounded">
              {item.groupTitle}
            </span>
          </div>

          {item.address && (
            <p className="text-[11px] text-muted flex items-center gap-1 mb-1.5">
              <MapPin className="w-3 h-3 shrink-0" />
              <span className="truncate">{item.address}</span>
            </p>
          )}

          {/* Status dots + date row */}
          <div className="flex items-center gap-3 text-[11px]">
            <StatusDot label="Wiring" value={item.wiringComplete} />
            <StatusDot label="NG" value={item.ngApproval} />
            <StatusDot label="Submit" value={item.goodToSubmit} />
            {item.scheduledDate && (
              <span className="flex items-center gap-0.5 text-muted ml-auto">
                <Calendar className="w-3 h-3" />
                {new Date(item.scheduledDate + "T00:00:00").toLocaleDateString(
                  "en-US",
                  { month: "short", day: "numeric" }
                )}
              </span>
            )}
          </div>
        </div>

        <ChevronDown
          className={clsx(
            "w-4 h-4 text-muted shrink-0 mt-1 transition-transform",
            expanded && "rotate-180"
          )}
        />
      </button>

      {/* Expanded detail */}
      {expanded && (
        <div className="border-t border-border px-4 pb-4 pt-3 space-y-4">
          {/* Scope */}
          <div>
            <label className="text-xs text-muted font-medium mb-1 block">
              Scope of Work
            </label>
            <EditableField
              jobId={item.id}
              columnId={SUB_COLUMNS.SCOPE}
              value={item.scope}
              multiline
              updateEndpoint="/api/monday/sub"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="text-xs text-muted font-medium mb-1 block">
              Notes
            </label>
            <EditableField
              jobId={item.id}
              columnId={SUB_COLUMNS.NOTES}
              value={item.notes}
              multiline
              updateEndpoint="/api/monday/sub"
            />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted font-medium mb-1 block">
                Scheduled Date
              </label>
              <EditableField
                jobId={item.id}
                columnId={SUB_COLUMNS.SCHEDULED_DATE}
                value={item.scheduledDate}
                type="date"
                updateEndpoint="/api/monday/sub"
                className="[&_p]:text-sm [&>div]:py-1.5 [&>div]:px-2 [&>div]:min-h-0"
              />
            </div>
            <div>
              <label className="text-xs text-muted font-medium mb-1 block">
                Completion Date
              </label>
              <EditableField
                jobId={item.id}
                columnId={SUB_COLUMNS.COMPLETION_DATE}
                value={item.completionDate}
                type="date"
                updateEndpoint="/api/monday/sub"
                className="[&_p]:text-sm [&>div]:py-1.5 [&>div]:px-2 [&>div]:min-h-0"
              />
            </div>
          </div>

          {/* CompanyCam link */}
          {item.companyCamLink && (
            <a
              href={item.companyCamLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-blue-500/10 text-blue-400 text-xs font-medium hover:bg-blue-500/20 transition-colors"
            >
              CompanyCam
            </a>
          )}
        </div>
      )}
    </div>
  );
}

function StatusDot({ label, value }: { label: string; value: string }) {
  const isDone = value === "Done";
  const isStuck = value === "Stuck";
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-0.5 font-medium",
        isDone ? "text-green-400" : isStuck ? "text-red-400" : "text-muted/40"
      )}
    >
      {isDone ? (
        <CheckCircle2 className="w-3 h-3" />
      ) : isStuck ? (
        <XCircle className="w-3 h-3" />
      ) : (
        <span className="w-3 h-3 rounded-full border border-muted/30 inline-block" />
      )}
      {label}
    </span>
  );
}
