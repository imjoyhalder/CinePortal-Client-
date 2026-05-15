import { Skeleton } from "@/components/ui/skeleton";

export default function AdminUsersLoading() {
  return (
    <div className="space-y-5">
      <div className="space-y-1.5">
        <Skeleton className="h-7 w-24" />
        <Skeleton className="h-4 w-40" />
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="rounded-xl border border-border/40 p-4 space-y-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-7 w-12" />
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <Skeleton className="h-9 flex-1 min-w-52" />
        <Skeleton className="h-9 w-28" />
        <Skeleton className="h-9 w-28" />
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border/60 overflow-hidden">
        <div className="bg-muted/40 border-b border-border/60 px-4 py-3">
          <Skeleton className="h-4 w-72" />
        </div>
        <div className="divide-y divide-border/40">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-4 py-3 bg-background">
              <Skeleton className="h-4 w-6 shrink-0" />
              <div className="flex items-center gap-2.5">
                <Skeleton className="w-8 h-8 rounded-full shrink-0" />
                <div className="space-y-1.5">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-3 w-36" />
                </div>
              </div>
              <Skeleton className="h-5 w-14 hidden sm:block" />
              <Skeleton className="h-5 w-16 hidden md:block" />
              <Skeleton className="h-4 w-8 hidden md:block" />
              <Skeleton className="h-4 w-24 hidden lg:block" />
              <Skeleton className="h-4 w-16 hidden sm:block" />
              <Skeleton className="h-8 w-24 ml-auto shrink-0" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
