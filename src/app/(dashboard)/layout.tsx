import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import DashboardSidebar, { MobileDashboardNav } from "@/components/dashboard/dashboard-sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Navbar />
      <div className="flex flex-1 min-h-0 overflow-hidden">
        <DashboardSidebar />
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <div className="md:hidden flex items-center gap-3 px-4 h-14 border-b border-border/40 bg-sidebar shrink-0">
            <MobileDashboardNav />
            <span className="font-semibold text-sm">My Dashboard</span>
          </div>
          <div className="flex-1 flex flex-col overflow-y-auto">
            <main className="flex-1 p-4 md:p-6">{children}</main>
            <Footer />
          </div>
        </div>
      </div>
    </div>
  );
}
