import { NextRequest, NextResponse } from "next/server";
import { fetchJob, updateJobColumn, updateJobColumnJSON } from "@/lib/monday";
import { JOB_COLUMNS } from "@/lib/constants";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const job = await fetchJob(id);
    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }
    return NextResponse.json(job);
  } catch (error) {
    console.error("Failed to fetch job:", error);
    return NextResponse.json(
      { error: "Failed to fetch job" },
      { status: 500 }
    );
  }
}

// Columns that need JSON value format via change_column_value
const JSON_COLUMNS = new Set([
  JOB_COLUMNS.ASSIGNED_CREW,
]);

// Location column needs special JSON format
const LOCATION_COLUMNS = new Set([
  JOB_COLUMNS.LOCATION,
]);

// Long text columns need JSON { text: value } format
const LONG_TEXT_COLUMNS = new Set([
  JOB_COLUMNS.INSPECTION_NOTES,
  JOB_COLUMNS.PROCESS_NOTES,
  JOB_COLUMNS.APPLIANCE_NOTES,
  JOB_COLUMNS.WORK_TODO,
]);

// Date columns need JSON { date: "YYYY-MM-DD" } format
const DATE_COLUMNS = new Set([
  JOB_COLUMNS.AUDIT_DATE,
]);

// Link columns need JSON { url, text } format
const LINK_COLUMNS = new Set([
  JOB_COLUMNS.COMPANYCAM_LINK,
  JOB_COLUMNS.SNUGGPRO_LINK,
]);

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { columnId, value } = body;

    if (!columnId) {
      return NextResponse.json(
        { error: "columnId is required" },
        { status: 400 }
      );
    }

    if (LONG_TEXT_COLUMNS.has(columnId)) {
      await updateJobColumnJSON(id, columnId, { text: value });
    } else if (DATE_COLUMNS.has(columnId)) {
      await updateJobColumnJSON(id, columnId, { date: value });
    } else if (LINK_COLUMNS.has(columnId)) {
      await updateJobColumnJSON(id, columnId, { url: value, text: value });
    } else if (LOCATION_COLUMNS.has(columnId)) {
      await updateJobColumnJSON(id, columnId, { address: value });
    } else if (JSON_COLUMNS.has(columnId)) {
      await updateJobColumnJSON(id, columnId, value);
    } else {
      await updateJobColumn(id, columnId, value);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update job";
    console.error("Failed to update job:", message);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
