"use client";

import { useCrew, useJobs } from "@/lib/hooks";
import { CardSkeleton } from "@/components/loading-skeleton";
import { ProgramBadge } from "@/components/program-badge";
import { StatusPill } from "@/components/status-pill";
import { Phone, Mail, Briefcase, ChevronRight } from "lucide-react";
import Link from "next/link";
import clsx from "clsx";

const AVAILABILITY_COLORS: Record<string, string> = {
  Available: "bg-green-500/20 text-green-400",
  Busy: "bg-red-500/20 text-red-400",
  "On Leave": "bg-yellow-500/20 text-yellow-400",
};

export default function CrewPage() {
  const { data: crew, isLoading: crewLoading } = useCrew();
  const { data: jobs } = useJobs();

  // Map crew ID to their assigned jobs
  function getCrewJobs(crewId: string) {
    if (!jobs) return [];
    return jobs.filter((j) => j.assignedCrewIds.includes(crewId));
  }

  return (
    <div className="space-y-4 max-w-4xl">
      <h1 className="text-lg font-bold">Crew</h1>

      {crewLoading ? (
        <div className="grid md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : !crew || crew.length === 0 ? (
        <p className="text-muted text-center py-12">No crew members found</p>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {crew.map((member) => {
            const memberJobs = getCrewJobs(member.id);
            const availClass =
              AVAILABILITY_COLORS[member.availability] ??
              "bg-gray-500/20 text-gray-400";

            return (
              <div
                key={member.id}
                className="bg-card rounded-2xl border border-border p-4 space-y-3"
              >
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold">{member.name}</h3>
                    {member.role && (
                      <span className="text-xs text-muted">{member.role}</span>
                    )}
                  </div>
                  {member.availability && (
                    <span
                      className={clsx(
                        "px-2.5 py-0.5 rounded-full text-xs font-medium",
                        availClass
                      )}
                    >
                      {member.availability}
                    </span>
                  )}
                </div>

                {/* Contact */}
                <div className="flex flex-wrap gap-2">
                  {member.phone && (
                    <a
                      href={`tel:${member.phone}`}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-card-hover text-xs hover:bg-accent-muted hover:text-accent transition-colors"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      {member.phone}
                    </a>
                  )}
                  {member.email && (
                    <a
                      href={`mailto:${member.email}`}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-card-hover text-xs hover:bg-accent-muted hover:text-accent transition-colors"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      {member.email}
                    </a>
                  )}
                </div>

                {/* Assigned jobs */}
                <div>
                  <div className="flex items-center gap-1.5 text-xs text-muted mb-2">
                    <Briefcase className="w-3.5 h-3.5" />
                    <span>
                      {memberJobs.length} assigned job
                      {memberJobs.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                  {memberJobs.length > 0 && (
                    <div className="space-y-1.5">
                      {memberJobs.slice(0, 5).map((job) => (
                        <Link
                          key={job.id}
                          href={`/jobs/${job.id}`}
                          className="flex items-center justify-between p-2 rounded-lg hover:bg-card-hover transition-colors"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-xs font-medium truncate">
                              {job.homeowner}
                            </span>
                            <ProgramBadge type={job.programType} />
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <StatusPill status={job.status} />
                            <ChevronRight className="w-3 h-3 text-muted" />
                          </div>
                        </Link>
                      ))}
                      {memberJobs.length > 5 && (
                        <p className="text-xs text-muted text-center pt-1">
                          +{memberJobs.length - 5} more
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
