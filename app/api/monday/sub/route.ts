import { NextResponse } from "next/server";
import { fetchAllSubItems } from "@/lib/monday";

export async function GET() {
  try {
    const items = await fetchAllSubItems();
    return NextResponse.json(items);
  } catch (error) {
    console.error("Failed to fetch sub items:", error);
    return NextResponse.json(
      { error: "Failed to fetch sub items" },
      { status: 500 }
    );
  }
}
