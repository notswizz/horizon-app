"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import { X, Phone, Mail, MapPin, Camera, ExternalLink, Calendar, Wrench, FileText, CheckCircle2, XCircle } from "lucide-react";
import clsx from "clsx";
import { useSubItem } from "@/lib/hooks";
import { SUB_COLUMNS } from "@/lib/constants";
import { EditableField, EditableStatus } from "@/components/editable-field";
import { Skeleton } from "@/components/loading-skeleton";

// ── Context ─────────────────────────────────────────────

interface SubDrawerContextValue {
  openSub: (id: string) => void;
  closeSub: () => void;
}

const SubDrawerContext = createContext<SubDrawerContextValue | null>(null);

export function useSubDrawer() {
  const ctx = useContext(SubDrawerContext);
  if (!ctx) throw new Error("useSubDrawer must be used within SubDrawerProvider");
  return ctx;
}

// ── Provider + Drawer ───────────────────────────────────

export function SubDrawerProvider({ children }: { children: ReactNode }) {
  const [subId, setSubId] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);

  const openSub = useCallback((id: string) => {
    setSubId(id);
    setVisible(true);
  }, []);

  const closeSub = useCallback(() => {
    setVisible(false);
    setTimeout(() => setSubId(null), 200);
  }, []);

  useEffect(() => {
    if (visible) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [visible]);

  useEffect(() => {
    if (!visible) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") closeSub();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [visible, closeSub]);

  return (
    <SubDrawerContext.Provider value={{ openSub, closeSub }}>
      {children}

      {subId && (
        <div
          className={clsx(
            "fixed inset-0 z-50 flex justify-end",
            "transition-opacity duration-200",
            visible ? "opacity-100" : "opacity-0 pointer-events-none"
          )}
        >
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={closeSub}
          />

          <div
            className={clsx(
              "relative w-full max-w-xl bg-card border-l border-border shadow-2xl",
              "flex flex-col overflow-hidden",
              "transition-transform duration-200 ease-out",
              visible ? "translate-x-0" : "translate-x-full"
            )}
          >
            <div className="flex items-center justify-end px-4 pt-4 pb-2 shrink-0">
              <button
                type="button"
                onClick={closeSub}
                className="p-2 rounded-xl hover:bg-card-hover text-muted hover:text-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 pb-6 overscroll-contain">
              <SubDetailContent subId={subId} />
            </div>
          </div>
        </div>
      )}
    </SubDrawerContext.Provider>
  );
}

// ── Detail Content ──────────────────────────────────────

const WORK_TYPE_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  "Water Heater": { bg: "bg-blue-500/20", text: "text-blue-400", dot: "bg-blue-400" },
  "Electrician": { bg: "bg-amber-500/20", text: "text-amber-400", dot: "bg-amber-400" },
};

const YES_NO_OPTIONS = ["Done", "Stuck", "Working on it", ""] as const;

function SubDetailContent({ subId }: { subId: string }) {
  const { data: sub, isLoading } = useSubItem(subId);

  if (isLoading) {
    return (
      <div className="space-y-5">
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          <Skeleton className="h-1.5 w-full rounded-none" />
          <div className="p-5 space-y-4">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-8 w-64" />
          </div>
        </div>
        <div className="bg-card rounded-2xl border border-border p-5 space-y-3">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-20 w-full" />
        </div>
      </div>
    );
  }

  if (!sub) {
    return (
      <div className="text-center py-20">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-card-hover mb-4">
          <Wrench className="w-7 h-7 text-muted" />
        </div>
        <p className="text-base font-medium">Sub item not found</p>
      </div>
    );
  }

  const typeColor = WORK_TYPE_COLORS[sub.workType] ?? { bg: "bg-gray-500/20", text: "text-gray-400", dot: "bg-gray-400" };

  const mapsUrl = sub.address
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(sub.address)}`
    : null;

  return (
    <div className="space-y-5">
      {/* Hero Header */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className={clsx("h-1.5 w-full", typeColor.dot)} />
        <div className="p-5 md:p-6">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="min-w-0 flex-1">
              <h2 className="text-2xl font-bold tracking-tight">{sub.name}</h2>
              <div className="flex items-center gap-2.5 mt-1.5">
                <span className={clsx("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold", typeColor.bg, typeColor.text)}>
                  <span className={clsx("w-2 h-2 rounded-full", typeColor.dot)} />
                  {sub.workType || "Unknown"}
                </span>
                <span className="text-xs text-muted">{sub.groupTitle}</span>
              </div>
            </div>
          </div>

          {/* Contact actions */}
          <div className="flex flex-wrap gap-2 mb-4">
            {sub.phone && (
              <a href={`tel:${sub.phone}`} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-background border border-border text-sm font-medium hover:border-accent hover:text-accent transition-colors">
                <Phone className="w-4 h-4" />
                {sub.phone}
              </a>
            )}
            {sub.email && (
              <a href={`mailto:${sub.email}`} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-background border border-border text-sm font-medium hover:border-accent hover:text-accent transition-colors">
                <Mail className="w-4 h-4" />
                <span className="truncate max-w-[180px]">{sub.email}</span>
              </a>
            )}
            {mapsUrl && (
              <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-background border border-border text-sm font-medium hover:border-accent hover:text-accent transition-colors">
                <MapPin className="w-4 h-4" />
                <span className="truncate max-w-[220px]">{sub.address}</span>
              </a>
            )}
          </div>

          {/* CompanyCam link */}
          {sub.companyCamLink ? (
            <a href={sub.companyCamLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500/10 text-blue-400 text-sm font-medium hover:bg-blue-500/20 transition-colors">
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
        </div>
      </div>

      {/* Status Indicators */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="flex items-center gap-2 px-5 pt-4 pb-2">
          <CheckCircle2 className="w-4 h-4 text-muted" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-muted">Status</h2>
        </div>
        <div className="px-5 pb-4 space-y-3">
          <div className="grid grid-cols-3 gap-3">
            <StatusDot label="Wiring" value={sub.wiringComplete} />
            <StatusDot label="NG Approval" value={sub.ngApproval} />
            <StatusDot label="Good to Submit" value={sub.goodToSubmit} />
          </div>
        </div>
      </div>

      {/* Dates */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="flex items-center gap-2 px-5 pt-4 pb-2">
          <Calendar className="w-4 h-4 text-muted" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-muted">Dates</h2>
        </div>
        <div className="px-5 pb-4 grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-muted font-medium mb-1 block">Scheduled</label>
            <EditableField
              jobId={sub.id}
              columnId={SUB_COLUMNS.SCHEDULED_DATE}
              value={sub.scheduledDate}
              type="date"
              updateEndpoint="/api/monday/sub"
              className="[&_p]:text-sm [&>div]:py-1.5 [&>div]:px-2 [&>div]:min-h-0"
            />
          </div>
          <div>
            <label className="text-xs text-muted font-medium mb-1 block">Completed</label>
            <EditableField
              jobId={sub.id}
              columnId={SUB_COLUMNS.COMPLETION_DATE}
              value={sub.completionDate}
              type="date"
              updateEndpoint="/api/monday/sub"
              className="[&_p]:text-sm [&>div]:py-1.5 [&>div]:px-2 [&>div]:min-h-0"
            />
          </div>
        </div>
      </div>

      {/* Scope of Work */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="flex items-center gap-2 px-5 pt-4 pb-2">
          <Wrench className="w-4 h-4 text-muted" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-muted">Scope of Work</h2>
        </div>
        <div className="p-5 pt-2">
          <EditableField
            jobId={sub.id}
            columnId={SUB_COLUMNS.SCOPE}
            value={sub.scope}
            multiline
            updateEndpoint="/api/monday/sub"
          />
        </div>
      </div>

      {/* Notes */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="flex items-center gap-2 px-5 pt-4 pb-2">
          <FileText className="w-4 h-4 text-muted" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-muted">Notes</h2>
        </div>
        <div className="p-5 pt-2">
          <EditableField
            jobId={sub.id}
            columnId={SUB_COLUMNS.NOTES}
            value={sub.notes}
            multiline
            updateEndpoint="/api/monday/sub"
          />
        </div>
      </div>
    </div>
  );
}

function StatusDot({ label, value }: { label: string; value: string }) {
  const isDone = value === "Done";
  const isStuck = value === "Stuck";
  return (
    <div className="text-center">
      <div className={clsx(
        "inline-flex items-center justify-center w-8 h-8 rounded-full mb-1",
        isDone ? "bg-green-500/20" : isStuck ? "bg-red-500/20" : "bg-card-hover"
      )}>
        {isDone ? (
          <CheckCircle2 className="w-4 h-4 text-green-400" />
        ) : isStuck ? (
          <XCircle className="w-4 h-4 text-red-400" />
        ) : (
          <span className="w-2 h-2 rounded-full bg-muted/30" />
        )}
      </div>
      <p className="text-[10px] text-muted font-medium">{label}</p>
    </div>
  );
}
