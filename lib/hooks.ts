"use client";

import useSWR, { mutate } from "swr";
import type { Job, CrewMember, DashboardStats, ActivityEvent } from "./monday";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function useJobs() {
  return useSWR<Job[]>("/api/monday/jobs", fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 30000,
  });
}

export function useJob(id: string) {
  return useSWR<Job>(id ? `/api/monday/jobs/${id}` : null, fetcher, {
    revalidateOnFocus: false,
  });
}

export function useCrew() {
  return useSWR<CrewMember[]>("/api/monday/crew", fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 60000,
  });
}

export function useStats() {
  return useSWR<DashboardStats>("/api/monday/stats", fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 30000,
  });
}

export function useActivity() {
  return useSWR<ActivityEvent[]>("/api/monday/activity", fetcher, {
    revalidateOnFocus: false,
    refreshInterval: 60000,
  });
}

export async function updateJob(
  jobId: string,
  columnId: string,
  value: string
) {
  const res = await fetch(`/api/monday/jobs/${jobId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ columnId, value }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || `Failed to update (${res.status})`);
  }

  // Revalidate
  mutate(`/api/monday/jobs/${jobId}`);
  mutate("/api/monday/jobs");
  mutate("/api/monday/stats");
}
