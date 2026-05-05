import DashboardSidebar, { MobileDashboardNav } from "@/components/dashboard/dashboard-sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <DashboardSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <div className="md:hidden flex items-center gap-3 px-4 h-14 border-b border-border/40 bg-sidebar">
          <MobileDashboardNav />
          <span className="font-semibold text-sm">My Dashboard</span>
        </div>
        <main className="flex-1 p-4 md:p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
