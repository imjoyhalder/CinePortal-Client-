import { Skeleton } from "@/components/ui/skeleton";

export default function AdminDashboardLoading() {
  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-9 w-52" />
          <Skeleton className="h-4 w-80" />
        </div>
        <Skeleton className="h-9 w-44 rounded-full" />
      </div>

      {/* 7 stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border/40 bg-card p-5 space-y-4">
            <Skeleton className="h-8 w-8 rounded-lg" />
            <div className="space-y-1.5">
              <Skeleton className="h-7 w-16" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
        ))}
      </div>

      {/* Charts row — line chart + pie chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-xl border border-border/40 bg-card overflow-hidden">
          <div className="border-b px-6 py-4 space-y-1.5">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-3 w-52" />
          </div>
          <div className="p-6">
            <Skeleton className="h-70 w-full rounded-lg" />
          </div>
        </div>

        <div className="rounded-xl border border-border/40 bg-card overflow-hidden">
          <div className="border-b px-6 py-4">
            <Skeleton className="h-4 w-32" />
          </div>
          <div className="p-6 flex flex-col items-center gap-6">
            <Skeleton className="h-45 w-45 rounded-full" />
            <div className="w-full space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-2 w-2 rounded-full" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <Skeleton className="h-3 w-8" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Activity log table */}
      <div className="rounded-xl border border-border/40 bg-card overflow-hidden">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-7 w-32 rounded-md" />
        </div>
        <div className="divide-y divide-border/40">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-6 py-4">
              <Skeleton className="h-7 w-7 rounded-full shrink-0" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-3 w-32" />
                <Skeleton className="h-2.5 w-48" />
              </div>
              <Skeleton className="h-3 w-20 hidden md:block" />
              <Skeleton className="h-5 w-12 rounded-full" />
              <Skeleton className="h-3 w-16 hidden lg:block" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
