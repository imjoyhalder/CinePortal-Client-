"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FiFilm, FiGrid, FiUsers, FiMessageSquare, FiTv, FiLogOut, FiChevronLeft } from "react-icons/fi";
import { MdOutlineLocalMovies } from "react-icons/md";
import { Button } from "@/components/ui/button";
import { signOut } from "@/lib/auth-client";
import { toast } from "sonner";

const navItems = [
  { href: "/admin/dashboard", icon: FiGrid, label: "Dashboard" },
  { href: "/admin/movies", icon: MdOutlineLocalMovies, label: "Movies & Series" },
  { href: "/admin/reviews", icon: FiMessageSquare, label: "Reviews" },
  { href: "/admin/users", icon: FiUsers, label: "Users" },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  async function handleSignOut() {
    await signOut();
    toast.success("Signed out");
    window.location.href = "/";
  }

  return (
    <aside className="w-60 shrink-0 min-h-screen bg-sidebar border-r border-sidebar-border flex flex-col">
      {/* Logo */}
      <div className="p-5 border-b border-sidebar-border">
        <Link href="/" className="flex items-center gap-2 font-bold text-base">
          <FiFilm className="text-primary w-5 h-5" />
          <span className="text-gradient">CinePortal</span>
        </Link>
        <p className="text-xs text-muted-foreground mt-0.5">Admin Panel</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(({ href, icon: Icon, label }) => (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              pathname === href
                ? "bg-primary/10 text-primary"
                : "text-sidebar-foreground hover:bg-sidebar-accent"
            }`}
          >
            <Icon className="w-4 h-4 shrink-0" />
            {label}
          </Link>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-sidebar-border space-y-1">
        <Link
          href="/"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-sidebar-accent transition-colors"
        >
          <FiChevronLeft className="w-4 h-4" />
          Back to Site
        </Link>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors w-full text-left"
        >
          <FiLogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
