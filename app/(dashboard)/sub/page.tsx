"use client";

import { useState, useMemo } from "react";
import { useSubItems } from "@/lib/hooks";
import { SUB_GROUPS } from "@/lib/constants";
import { JobsGridSkeleton } from "@/components/loading-skeleton";
import { useSubDrawer } from "@/components/sub-drawer";
import {
  Search,
  X,
  MapPin,
  Wrench,
  Calendar,
  CheckCircle2,
  XCircle,
  ArrowUpRight,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import clsx from "clsx";

const WORK_TYPE_COLORS: Record<string, { bg: string; text: string; dot: string; border: string }> = {
  "Water Heater": { bg: "bg-blue-500/20", text: "text-blue-400", dot: "bg-blue-400", border: "border-blue-500/30" },
  "Electrician": { bg: "bg-amber-500/20", text: "text-amber-400", dot: "bg-amber-400", border: "border-amber-500/30" },
};

type FilterTab = "all" | "water_heater" | "electrical" | "ready" | "waiting" | "completed";

const FILTER_TABS: { key: FilterTab; label: string }[] = [
  { key: "all", label: "All" },
  { key: "water_heater", label: "Water Heater" },
  { key: "electrical", label: "Electrical" },
  { key: "ready", label: "Ready" },
  { key: "waiting", label: "Waiting" },
  { key: "completed", label: "Completed" },
];

export default function SubWorkPage() {
  const { data: items, isLoading } = useSubItems();
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<FilterTab>("all");

  const filtered = useMemo(() => {
    if (!items) return [];

    return items.filter((item) => {
      // Exclude cancelled
      if (item.group === SUB_GROUPS.CANCELLED) return false;

      // Tab filter
      const whGroups: Set<string> = new Set([SUB_GROUPS.WH_READY, SUB_GROUPS.WH_WAITING, SUB_GROUPS.WH_NEXTGEN]);
      const elecGroups: Set<string> = new Set([SUB_GROUPS.ELEC_PRE_SUB, SUB_GROUPS.ELEC_APPLIED]);
      if (activeTab === "water_heater" && !whGroups.has(item.group)) return false;
      if (activeTab === "electrical" && !elecGroups.has(item.group)) return false;
      if (activeTab === "ready" && item.group !== SUB_GROUPS.WH_READY) return false;
      if (activeTab === "waiting" && item.group !== SUB_GROUPS.WH_WAITING) return false;
      if (activeTab === "completed" && item.group !== SUB_GROUPS.COMPLETED) return false;

      // Search
      if (search) {
        const q = search.toLowerCase();
        const match =
          item.name.toLowerCase().includes(q) ||
          item.address.toLowerCase().includes(q) ||
          item.scope.toLowerCase().includes(q);
        if (!match) return false;
      }

      return true;
    });
  }, [items, search, activeTab]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold">Sub Work</h1>
          <p className="text-xs text-muted mt-0.5">
            {isLoading ? "Loading..." : `${filtered.length} item${filtered.length !== 1 ? "s" : ""}`}
          </p>
        </div>
        <Link
          href="/electrician"
          target="_blank"
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-amber-700 hover:text-amber-600 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 hover:border-amber-500/30 transition-colors"
          title="Open electrician portal"
        >
          Electrician Portal
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
        <input
          type="text"
          placeholder="Search name, address, scope..."
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

      {/* Filter Tabs */}
      <div className="flex gap-1 bg-card rounded-xl p-1 border border-border overflow-x-auto">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={clsx(
              "flex-1 py-2 px-3 rounded-lg text-xs font-medium whitespace-nowrap transition-colors",
              activeTab === tab.key
                ? "bg-accent-muted text-accent"
                : "text-muted hover:text-foreground"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      {isLoading ? (
        <JobsGridSkeleton />
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-card-hover mb-4">
            <Wrench className="w-7 h-7 text-muted" />
          </div>
          <p className="text-base font-medium text-foreground">No sub work found</p>
          <p className="text-sm text-muted mt-1">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((item) => (
            <SubCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}

interface SubCardItem {
  id: string;
  name: string;
  address: string;
  workType: string;
  scope: string;
  groupTitle: string;
  wiringComplete: string;
  ngApproval: string;
  scheduledDate: string;
}

function SubCard({ item }: { item: SubCardItem }) {
  const { openSub } = useSubDrawer();
  const typeColor = WORK_TYPE_COLORS[item.workType] ?? {
    bg: "bg-gray-500/20",
    text: "text-gray-400",
    dot: "bg-gray-400",
    border: "border-gray-500/30",
  };

  return (
    <div
      onClick={() => openSub(item.id)}
      className={clsx(
        "group relative flex flex-col bg-card rounded-2xl border overflow-hidden cursor-pointer",
        "hover:bg-card-hover transition-all",
        typeColor.border
      )}
    >
      <div className={clsx("h-1 w-full", typeColor.dot)} />

      <div className="p-3.5 flex flex-col flex-1">
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className={clsx("w-2 h-2 rounded-full shrink-0", typeColor.dot)} />
            <span className={clsx("text-[10px] font-medium truncate leading-none", typeColor.text)}>
              {item.workType || "Unknown"}
            </span>
          </div>
          <span className="text-[10px] text-muted font-medium truncate">{item.groupTitle}</span>
        </div>

        {/* Name */}
        <h3 className="font-semibold text-sm leading-tight mb-1 group-hover:text-accent transition-colors">
          {item.name}
        </h3>

        {/* Address */}
        {item.address && (
          <p className="text-[11px] text-muted leading-snug mb-2 flex items-start gap-1">
            <MapPin className="w-3 h-3 shrink-0 mt-px" />
            <span className="line-clamp-2">{item.address}</span>
          </p>
        )}

        {/* Scope snippet */}
        {item.scope && (
          <p className="text-[11px] text-muted/70 line-clamp-2 mb-3">{item.scope}</p>
        )}

        {/* Footer */}
        <div className="flex items-center gap-3 text-[11px] text-muted mt-auto">
          {/* Status dots */}
          <div className="flex items-center gap-1.5">
            <StatusDotSmall label="W" value={item.wiringComplete} />
            <StatusDotSmall label="NG" value={item.ngApproval} />
          </div>

          {item.scheduledDate && (
            <span className="flex items-center gap-0.5">
              <Calendar className="w-3 h-3" />
              {new Date(item.scheduledDate + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </span>
          )}

          <ArrowUpRight className="w-3.5 h-3.5 ml-auto opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
        </div>
      </div>
    </div>
  );
}

function StatusDotSmall({ label, value }: { label: string; value: string }) {
  const isDone = value === "Done";
  const isStuck = value === "Stuck";
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-0.5 text-[10px] font-medium",
        isDone ? "text-green-400" : isStuck ? "text-red-400" : "text-muted/40"
      )}
      title={`${label}: ${value || "N/A"}`}
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
