import { NextResponse } from "next/server";
import { fetchCrew } from "@/lib/monday";

export async function GET() {
  try {
    const crew = await fetchCrew();
    return NextResponse.json(crew);
  } catch (error) {
    console.error("Failed to fetch crew:", error);
    return NextResponse.json(
      { error: "Failed to fetch crew" },
      { status: 500 }
    );
  }
}
