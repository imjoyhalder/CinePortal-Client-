import AdminSidebar, { MobileAdminNav } from "@/components/admin/admin-sidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <div className="md:hidden flex items-center gap-3 px-4 h-14 border-b border-border/40 bg-sidebar">
          <MobileAdminNav />
          <span className="font-semibold text-sm">CinePortal Admin</span>
        </div>
        <main className="flex-1 p-4 md:p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
