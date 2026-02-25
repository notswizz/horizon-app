"use client";

import { use } from "react";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { JobDetailContent } from "@/components/job-detail-content";

export default function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  return (
    <div className="max-w-3xl space-y-5">
      <Link
        href="/jobs"
        className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Jobs
      </Link>

      <JobDetailContent jobId={id} />
    </div>
  );
}
