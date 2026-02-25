import clsx from "clsx";

export function Skeleton({ className }: { className?: string }) {
  return <div className={clsx("skeleton rounded-lg", className)} />;
}

export function CardSkeleton() {
  return (
    <div className="bg-card rounded-2xl border border-border p-4 space-y-3">
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-5 w-16" />
      </div>
      <Skeleton className="h-4 w-48" />
      <div className="flex items-center gap-2">
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
      <Skeleton className="h-4 w-24" />
    </div>
  );
}

export function JobCardSkeleton() {
  return (
    <div className="bg-card rounded-2xl border border-border overflow-hidden">
      <Skeleton className="h-1 w-full rounded-none" />
      <div className="p-3.5 space-y-2.5">
        <div className="flex items-center justify-between">
          <Skeleton className="h-3 w-20 rounded-full" />
          <Skeleton className="h-5 w-12 rounded-md" />
        </div>
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-3.5 w-full" />
        <div className="flex gap-2 pt-1">
          <Skeleton className="h-3.5 w-12" />
          <Skeleton className="h-3.5 w-16" />
        </div>
      </div>
      <div className="border-t border-border/50 px-3.5 py-2.5 space-y-1.5">
        <div className="flex gap-1">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-4 flex-1 rounded" />
          ))}
        </div>
        <Skeleton className="h-10 w-full rounded" />
      </div>
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="bg-card rounded-2xl border border-border p-4 space-y-2">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-8 w-16" />
    </div>
  );
}

export function JobsGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <JobCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function JobsListSkeleton() {
  return <JobsGridSkeleton />;
}
