import AdminSidebar, { MobileAdminNav } from "@/components/admin/admin-sidebar";
import { AuthGuard } from "@/components/auth/auth-guard";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard requireAdmin>
      <div className="flex h-screen overflow-hidden">
        <AdminSidebar />
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <div className="md:hidden flex items-center gap-3 px-4 h-14 border-b border-border/40 bg-sidebar shrink-0">
            <MobileAdminNav />
            <span className="font-semibold text-sm">CinePortal Admin</span>
          </div>
          <main className="flex-1 p-4 md:p-6 overflow-y-auto">{children}</main>
        </div>
      </div>
    </AuthGuard>
  );
}
