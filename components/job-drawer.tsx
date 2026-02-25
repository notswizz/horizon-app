"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import { X } from "lucide-react";
import clsx from "clsx";
import { JobDetailContent } from "@/components/job-detail-content";

// ── Context ─────────────────────────────────────────────

interface JobDrawerContextValue {
  openJob: (id: string) => void;
  closeJob: () => void;
}

const JobDrawerContext = createContext<JobDrawerContextValue | null>(null);

export function useJobDrawer() {
  const ctx = useContext(JobDrawerContext);
  if (!ctx) throw new Error("useJobDrawer must be used within JobDrawerProvider");
  return ctx;
}

// ── Provider + Drawer ───────────────────────────────────

export function JobDrawerProvider({ children }: { children: ReactNode }) {
  const [jobId, setJobId] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);

  const openJob = useCallback((id: string) => {
    setJobId(id);
    setVisible(true);
  }, []);

  const closeJob = useCallback(() => {
    setVisible(false);
    // Clear jobId after transition
    setTimeout(() => setJobId(null), 200);
  }, []);

  // Lock body scroll when open
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

  // Escape key
  useEffect(() => {
    if (!visible) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") closeJob();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [visible, closeJob]);

  return (
    <JobDrawerContext.Provider value={{ openJob, closeJob }}>
      {children}

      {/* Drawer overlay + panel */}
      {jobId && (
        <div
          className={clsx(
            "fixed inset-0 z-50 flex justify-end",
            "transition-opacity duration-200",
            visible ? "opacity-100" : "opacity-0 pointer-events-none"
          )}
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={closeJob}
          />

          {/* Panel */}
          <div
            className={clsx(
              "relative w-full max-w-xl bg-card border-l border-border shadow-2xl",
              "flex flex-col overflow-hidden",
              "transition-transform duration-200 ease-out",
              visible ? "translate-x-0" : "translate-x-full"
            )}
          >
            {/* Close button */}
            <div className="flex items-center justify-end px-4 pt-4 pb-2 shrink-0">
              <button
                type="button"
                onClick={closeJob}
                className="p-2 rounded-xl hover:bg-card-hover text-muted hover:text-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto px-4 pb-6 overscroll-contain">
              <JobDetailContent
                jobId={jobId}
                onNavigateJob={openJob}
              />
            </div>
          </div>
        </div>
      )}
    </JobDrawerContext.Provider>
  );
}
