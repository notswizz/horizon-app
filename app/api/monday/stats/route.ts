import { NextResponse } from "next/server";
import { fetchAllJobs } from "@/lib/monday";
import { ACTIVE_GROUPS } from "@/lib/constants";
import type { DashboardStats } from "@/lib/monday";

export async function GET() {
  try {
    const jobs = await fetchAllJobs();
    const activeJobs = jobs.filter((j) => ACTIVE_GROUPS.has(j.group));

    const statusCounts: Record<string, number> = {};
    const groupCounts: Record<string, number> = {};
    let pipelineValue = 0;
    let readyToSchedule = 0;
    let thisWeekWork = 0;

    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    weekStart.setHours(0, 0, 0, 0);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 7);

    for (const job of activeJobs) {
      // Count by status
      if (job.status) {
        statusCounts[job.status] = (statusCounts[job.status] || 0) + 1;
      }

      // Count by group
      if (job.group) {
        groupCounts[job.group] = (groupCounts[job.group] || 0) + 1;
      }

      // Pipeline value
      if (job.rebateAmount) {
        pipelineValue += job.rebateAmount;
      }

      // Ready to schedule
      if (job.status === "Rebate Accepted") {
        readyToSchedule++;
      }

      // This week's work — count job if either date falls in current week (no double-count)
      if (
        job.status === "Work Scheduled" ||
        job.status === "Audit Scheduled"
      ) {
        let inThisWeek = false;
        if (job.auditDate) {
          const date = new Date(job.auditDate);
          if (date >= weekStart && date < weekEnd) inThisWeek = true;
        }
        if (job.inspectionDate) {
          const date = new Date(job.inspectionDate);
          if (date >= weekStart && date < weekEnd) inThisWeek = true;
        }
        if (inThisWeek) {
          thisWeekWork++;
        } else if (!job.auditDate && !job.inspectionDate) {
          // Count all work scheduled even without any date
          thisWeekWork++;
        }
      }
    }

    const stats: DashboardStats = {
      totalActive: activeJobs.length,
      pipelineValue,
      readyToSchedule,
      thisWeekWork,
      statusCounts,
      groupCounts,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Failed to fetch stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
