import { NextRequest, NextResponse } from "next/server";
import { fetchAllJobs, createJob } from "@/lib/monday";
import { JOB_COLUMNS } from "@/lib/constants";

export async function GET() {
  try {
    const jobs = await fetchAllJobs();
    return NextResponse.json(jobs);
  } catch (error) {
    console.error("Failed to fetch jobs:", error);
    return NextResponse.json(
      { error: "Failed to fetch jobs" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, phone, email, location, programType, notes } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Homeowner name is required" },
        { status: 400 }
      );
    }

    const columnValues: Record<string, unknown> = {};

    if (phone) columnValues[JOB_COLUMNS.PHONE] = phone;
    if (email) columnValues[JOB_COLUMNS.EMAIL] = { email, text: email };
    if (location) columnValues[JOB_COLUMNS.LOCATION] = { address: location };
    if (programType) columnValues[JOB_COLUMNS.PROGRAM_TYPE] = { label: programType };
    if (notes) columnValues[JOB_COLUMNS.PROCESS_NOTES] = { text: notes };

    const ids: string[] = [];

    if (body.createBoth) {
      // Create HER item
      const herValues = { ...columnValues, [JOB_COLUMNS.PROGRAM_TYPE]: { label: "HER" } };
      const herId = await createJob(name, herValues);
      ids.push(herId);

      // Create HEAR item
      const hearValues = { ...columnValues, [JOB_COLUMNS.PROGRAM_TYPE]: { label: "HEAR" } };
      const hearId = await createJob(name, hearValues);
      ids.push(hearId);
    } else {
      const id = await createJob(name, columnValues);
      ids.push(id);
    }

    return NextResponse.json({ ids }, { status: 201 });
  } catch (error) {
    console.error("Failed to create job:", error);
    return NextResponse.json(
      { error: "Failed to create job" },
      { status: 500 }
    );
  }
}
