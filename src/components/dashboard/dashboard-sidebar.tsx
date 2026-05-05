"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FiFilm,
  FiGrid,
  FiMessageSquare,
  FiBookmark,
  FiCreditCard,
  FiLogOut,
  FiChevronLeft,
  FiMenu,
  FiUser,
} from "react-icons/fi";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { signOut, useSession } from "@/lib/auth-client";
import { toast } from "sonner";

const navItems = [
  { href: "/dashboard",              icon: FiGrid,           label: "Overview"     },
  { href: "/dashboard/reviews",      icon: FiMessageSquare,  label: "My Reviews"   },
  { href: "/dashboard/watchlist",    icon: FiBookmark,       label: "Watchlist"    },
  { href: "/dashboard/subscription", icon: FiCreditCard,     label: "Subscription" },
];

function NavLinks({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return (
    <nav className="flex-1 p-4 space-y-1">
      {navItems.map(({ href, icon: Icon, label }) => {
        const active = href === "/dashboard" ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              active
                ? "bg-primary/10 text-primary"
                : "text-sidebar-foreground hover:bg-sidebar-accent"
            }`}
          >
            <Icon className="w-4 h-4 shrink-0" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

function SidebarUser() {
  const { data: session } = useSession();
  if (!session?.user) return null;
  const { name, email, image } = session.user;

  return (
    <div className="p-4 border-t border-sidebar-border">
      <div className="flex items-center gap-2.5 px-1 mb-3">
        <Avatar className="w-8 h-8 shrink-0">
          <AvatarImage src={image ?? undefined} alt={name} />
          <AvatarFallback className="text-xs bg-primary/10 text-primary">
            {name?.charAt(0).toUpperCase() ?? <FiUser />}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="text-sm font-semibold truncate">{name}</p>
          <p className="text-xs text-muted-foreground truncate">{email}</p>
        </div>
      </div>
      <div className="space-y-1">
        <Link
          href="/"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-sidebar-accent transition-colors"
        >
          <FiChevronLeft className="w-4 h-4" />
          Back to Site
        </Link>
        <button
          onClick={async () => {
            await signOut();
            toast.success("Signed out");
            window.location.href = "/";
          }}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors w-full text-left"
        >
          <FiLogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
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
      <p className="text-xs text-muted-foreground mt-0.5">My Dashboard</p>
    </div>
  );
}

export default function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex w-60 shrink-0 min-h-screen bg-sidebar border-r border-sidebar-border flex-col">
      <SidebarLogo />
      <NavLinks pathname={pathname} />
      <SidebarUser />
    </aside>
  );
}

export function MobileDashboardNav() {
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
            <p className="text-xs text-muted-foreground mt-0.5">My Dashboard</p>
          </div>
        </SheetHeader>
        <NavLinks pathname={pathname} />
        <SidebarUser />
      </SheetContent>
    </Sheet>
  );
}
