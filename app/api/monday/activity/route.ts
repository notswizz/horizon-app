import { NextResponse } from "next/server";
import { mondayQuery } from "@/lib/monday";
import type { ActivityEvent } from "@/lib/monday";
import { JOBS_BOARD_ID, JOB_COLUMNS } from "@/lib/constants";

const SKIP_EVENTS = new Set(["delete_pulse", "batch_delete_pulses", "delete_group"]);

function parseActivityEvent(log: {
  id: string;
  event: string;
  data: string;
  created_at: string;
}): ActivityEvent | null {
  if (SKIP_EVENTS.has(log.event)) return null;

  let data: Record<string, unknown>;
  try {
    data = JSON.parse(log.data);
  } catch {
    return null;
  }

  const jobName = (data.pulse_name as string) ?? "Unknown";
  const jobId = String(data.pulse_id ?? "");
  // created_at is in 100-nanosecond intervals
  const timestamp = new Date(Number(log.created_at) / 10_000_000 * 1000).toISOString();

  if (log.event === "create_pulse") {
    return {
      id: log.id,
      type: "new",
      description: `New job created: ${jobName}`,
      jobName,
      jobId,
      timestamp,
    };
  }

  if (log.event === "move_pulse_from_group") {
    const sourceGroup = (data.source_group as Record<string, string>)?.title ?? "Unknown";
    const destGroup = (data.dest_group as Record<string, string>)?.title ?? "Unknown";
    return {
      id: log.id,
      type: "move",
      description: `${jobName} moved from ${sourceGroup} to ${destGroup}`,
      jobName,
      jobId,
      timestamp,
    };
  }

  if (log.event === "update_column_value") {
    const columnId = data.column_id as string;
    const columnTitle = (data.column_title as string) ?? columnId;

    if (columnId === JOB_COLUMNS.STATUS) {
      const prev = data.previous_value as Record<string, unknown> | undefined;
      const curr = data.value as Record<string, unknown> | undefined;
      const fromLabel = (prev?.label as Record<string, string>)?.text ?? "";
      const toLabel = (curr?.label as Record<string, string>)?.text ?? "";

      return {
        id: log.id,
        type: "status",
        description: `${jobName} status changed${fromLabel ? ` from ${fromLabel}` : ""} to ${toLabel || "unknown"}`,
        jobName,
        jobId,
        timestamp,
        statusFrom: fromLabel || undefined,
        statusTo: toLabel || undefined,
      };
    }

    if (columnId === JOB_COLUMNS.ASSIGNED_CREW) {
      return {
        id: log.id,
        type: "crew",
        description: `Crew assignment updated for ${jobName}`,
        jobName,
        jobId,
        timestamp,
      };
    }

    // Generic field edit
    return {
      id: log.id,
      type: "edit",
      description: `${columnTitle} updated on ${jobName}`,
      jobName,
      jobId,
      timestamp,
    };
  }

  return null;
}

export async function GET() {
  try {
    const result = await mondayQuery<{
      boards: {
        activity_logs: {
          id: string;
          event: string;
          data: string;
          created_at: string;
        }[];
      }[];
    }>(`query {
      boards(ids: [${JOBS_BOARD_ID}]) {
        activity_logs(limit: 30) {
          id
          event
          data
          created_at
        }
      }
    }`);

    const logs = result.boards[0]?.activity_logs ?? [];
    const events: ActivityEvent[] = [];

    for (const log of logs) {
      const event = parseActivityEvent(log);
      if (event) events.push(event);
    }

    return NextResponse.json(events);
  } catch (error) {
    console.error("Activity feed error:", error);
    return NextResponse.json(
      { error: "Failed to fetch activity" },
      { status: 500 }
    );
  }
}
