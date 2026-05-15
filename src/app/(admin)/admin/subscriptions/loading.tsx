import { Skeleton } from "@/components/ui/skeleton";

export default function AdminSubscriptionsLoading() {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="space-y-1.5">
          <Skeleton className="h-7 w-36" />
          <Skeleton className="h-4 w-20" />
        </div>
        <Skeleton className="h-9 w-32" />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {[0, 1, 2].map((i) => (
          <div key={i} className="rounded-xl border border-border/50 p-4 space-y-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-8 w-12" />
            <Skeleton className="h-3 w-24" />
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <Skeleton className="h-9 flex-1 min-w-52" />
        <Skeleton className="h-9 w-32" />
        <Skeleton className="h-9 w-32" />
      </div>

      <div className="rounded-lg border border-border/60 overflow-hidden">
        <div className="bg-muted/40 border-b border-border/60 px-4 py-3">
          <Skeleton className="h-4 w-80" />
        </div>
        <div className="divide-y divide-border/40">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-4 py-3 bg-background">
              <Skeleton className="h-4 w-6 shrink-0" />
              <div className="flex items-center gap-2.5">
                <Skeleton className="w-8 h-8 rounded-full shrink-0" />
                <div className="space-y-1">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-3 w-36 hidden sm:block" />
                </div>
              </div>
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-4 w-16 hidden sm:block" />
              <Skeleton className="h-4 w-16 hidden sm:block" />
              <Skeleton className="h-4 w-24 hidden md:block" />
              <Skeleton className="h-4 w-24 hidden lg:block" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
