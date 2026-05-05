"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FiFilm,
  FiGrid,
  FiUsers,
  FiMessageSquare,
  FiCreditCard,
  FiLogOut,
  FiChevronLeft,
  FiMenu,
} from "react-icons/fi";
import { MdOutlineLocalMovies } from "react-icons/md";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { signOut } from "@/lib/auth-client";
import { toast } from "sonner";

const navItems = [
  { href: "/admin/dashboard",      icon: FiGrid,               label: "Dashboard" },
  { href: "/admin/movies",         icon: MdOutlineLocalMovies, label: "Movies & Series" },
  { href: "/admin/reviews",        icon: FiMessageSquare,      label: "Reviews" },
  { href: "/admin/users",          icon: FiUsers,              label: "Users" },
  { href: "/admin/subscriptions",  icon: FiCreditCard,         label: "Subscriptions" },
];

function NavLinks({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return (
    <nav className="flex-1 p-4 space-y-1">
      {navItems.map(({ href, icon: Icon, label }) => (
        <Link
          key={href}
          href={href}
          onClick={onNavigate}
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
  );
}

function SidebarFooter({ onNavigate }: { onNavigate?: () => void }) {
  async function handleSignOut() {
    await signOut();
    toast.success("Signed out");
    window.location.href = "/";
  }

  return (
    <div className="p-4 border-t border-sidebar-border space-y-1">
      <Link
        href="/"
        onClick={onNavigate}
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
  );
}

function SidebarLogo() {
  return (
    <div className="p-5 border-b border-sidebar-border">
      <Link href="/" className="flex items-center gap-2 font-bold text-base">
        <FiFilm className="text-primary w-5 h-5" />
        <span className="text-gradient">CinePortal</span>
      </Link>
      <p className="text-xs text-muted-foreground mt-0.5">Admin Panel</p>
    </div>
  );
}

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex w-60 shrink-0 min-h-screen bg-sidebar border-r border-sidebar-border flex-col">
      <SidebarLogo />
      <NavLinks pathname={pathname} />
      <SidebarFooter />
    </aside>
  );
}

export function MobileAdminNav() {
  const pathname = usePathname();

  return (
    <Sheet>
      <SheetTrigger
        render={
          <button
            className="inline-flex items-center justify-center rounded-md p-1.5 text-foreground hover:bg-muted transition-colors"
            aria-label="Open navigation menu"
          />
        }
      >
        <FiMenu className="w-5 h-5" />
      </SheetTrigger>
      <SheetContent side="left" className="p-0 w-72 bg-sidebar border-sidebar-border flex flex-col gap-0">
        <SheetHeader className="p-0 border-b border-sidebar-border">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <div className="p-5">
            <Link href="/" className="flex items-center gap-2 font-bold text-base">
              <FiFilm className="text-primary w-5 h-5" />
              <span className="text-gradient">CinePortal</span>
            </Link>
            <p className="text-xs text-muted-foreground mt-0.5">Admin Panel</p>
          </div>
        </SheetHeader>
        <NavLinks pathname={pathname} />
        <SidebarFooter />
      </SheetContent>
    </Sheet>
  );
}
