import { NextRequest, NextResponse } from "next/server";
import { fetchSubItem, updateSubColumn, updateSubColumnJSON } from "@/lib/monday";
import { SUB_COLUMNS } from "@/lib/constants";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const item = await fetchSubItem(id);
    if (!item) {
      return NextResponse.json({ error: "Sub item not found" }, { status: 404 });
    }
    return NextResponse.json(item);
  } catch (error) {
    console.error("Failed to fetch sub item:", error);
    return NextResponse.json(
      { error: "Failed to fetch sub item" },
      { status: 500 }
    );
  }
}

const LONG_TEXT_COLUMNS = new Set([
  SUB_COLUMNS.SCOPE,
  SUB_COLUMNS.NOTES,
]);

const DATE_COLUMNS = new Set([
  SUB_COLUMNS.SCHEDULED_DATE,
  SUB_COLUMNS.COMPLETION_DATE,
]);

const LINK_COLUMNS = new Set([
  SUB_COLUMNS.COMPANYCAM_LINK,
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
      await updateSubColumnJSON(id, columnId, { text: value });
    } else if (DATE_COLUMNS.has(columnId)) {
      await updateSubColumnJSON(id, columnId, { date: value });
    } else if (LINK_COLUMNS.has(columnId)) {
      await updateSubColumnJSON(id, columnId, { url: value, text: value });
    } else {
      await updateSubColumn(id, columnId, value);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update sub item";
    console.error("Failed to update sub item:", message);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
