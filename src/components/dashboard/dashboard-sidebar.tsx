// "use client";

// import Link from "next/link";
// import { usePathname } from "next/navigation";
// import {
//   FiFilm,
//   FiGrid,
//   FiMessageSquare,
//   FiBookmark,
//   FiCreditCard,
//   FiLogOut,
//   FiChevronLeft,
//   FiMenu,
//   FiUser,
// } from "react-icons/fi";
// import {
//   Sheet,
//   SheetTrigger,
//   SheetContent,
//   SheetHeader,
//   SheetTitle,
// } from "@/components/ui/sheet";
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// import { signOut, useSession } from "@/lib/auth-client";
// import { toast } from "sonner";

// const navItems = [
//   { href: "/dashboard",              icon: FiGrid,           label: "Overview"     },
//   { href: "/dashboard/reviews",      icon: FiMessageSquare,  label: "My Reviews"   },
//   { href: "/dashboard/watchlist",    icon: FiBookmark,       label: "Watchlist"    },
//   { href: "/dashboard/subscription", icon: FiCreditCard,     label: "Subscription" },
// ];

// function NavLinks({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
//   return (
//     <nav className="flex-1 p-4 space-y-1">
//       {navItems.map(({ href, icon: Icon, label }) => {
//         const active = href === "/dashboard" ? pathname === href : pathname.startsWith(href);
//         return (
//           <Link
//             key={href}
//             href={href}
//             onClick={onNavigate}
//             className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
//               active
//                 ? "bg-primary/10 text-primary"
//                 : "text-sidebar-foreground hover:bg-sidebar-accent"
//             }`}
//           >
//             <Icon className="w-4 h-4 shrink-0" />
//             {label}
//           </Link>
//         );
//       })}
//     </nav>
//   );
// }

// function SidebarUser() {
//   const { data: session } = useSession();
//   if (!session?.user) return null;
//   const { name, email, image } = session.user;

//   return (
//     <div className="p-4 border-t border-sidebar-border">
//       <div className="flex items-center gap-2.5 px-1 mb-3">
//         <Avatar className="w-8 h-8 shrink-0">
//           <AvatarImage src={image ?? undefined} alt={name} />
//           <AvatarFallback className="text-xs bg-primary/10 text-primary">
//             {name?.charAt(0).toUpperCase() ?? <FiUser />}
//           </AvatarFallback>
//         </Avatar>
//         <div className="min-w-0">
//           <p className="text-sm font-semibold truncate">{name}</p>
//           <p className="text-xs text-muted-foreground truncate">{email}</p>
//         </div>
//       </div>
//       <div className="space-y-1">
//         <Link
//           href="/"
//           className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-sidebar-accent transition-colors"
//         >
//           <FiChevronLeft className="w-4 h-4" />
//           Back to Site
//         </Link>
//         <button
//           onClick={async () => {
//             await signOut();
//             toast.success("Signed out");
//             window.location.href = "/";
//           }}
//           className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors w-full text-left"
//         >
//           <FiLogOut className="w-4 h-4" />
//           Sign Out
//         </button>
//       </div>
//     </div>
//   );
// }

// function SidebarLogo() {
//   return (
//     <div className="p-5 border-b border-sidebar-border">
//       <Link href="/" className="flex items-center gap-2 font-bold text-base">
//         <FiFilm className="text-primary w-5 h-5" />
//         <span className="text-gradient">CinePortal</span>
//       </Link>
//       <p className="text-xs text-muted-foreground mt-0.5">My Dashboard</p>
//     </div>
//   );
// }

// export default function DashboardSidebar() {
//   const pathname = usePathname();

//   return (
//     <aside className="hidden md:flex w-60 shrink-0 min-h-screen bg-sidebar border-r border-sidebar-border flex-col">
//       <SidebarLogo />
//       <NavLinks pathname={pathname} />
//       <SidebarUser />
//     </aside>
//   );
// }

// export function MobileDashboardNav() {
//   const pathname = usePathname();

//   return (
//     <Sheet>
//       <SheetTrigger
//         render={
//           <button
//             className="inline-flex items-center justify-center rounded-md p-1.5 text-foreground hover:bg-muted transition-colors"
//             aria-label="Open navigation menu"
//           />
//         }
//       >
//         <FiMenu className="w-5 h-5" />
//       </SheetTrigger>
//       <SheetContent side="left" className="p-0 w-72 bg-sidebar border-sidebar-border flex flex-col gap-0">
//         <SheetHeader className="p-0 border-b border-sidebar-border">
//           <SheetTitle className="sr-only">Navigation</SheetTitle>
//           <div className="p-5">
//             <Link href="/" className="flex items-center gap-2 font-bold text-base">
//               <FiFilm className="text-primary w-5 h-5" />
//               <span className="text-gradient">CinePortal</span>
//             </Link>
//             <p className="text-xs text-muted-foreground mt-0.5">My Dashboard</p>
//           </div>
//         </SheetHeader>
//         <NavLinks pathname={pathname} />
//         <SidebarUser />
//       </SheetContent>
//     </Sheet>
//   );
// }

"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FiFilm,
  FiGrid,
  FiMessageSquare,
  FiBookmark,
  FiCreditCard,
  FiShoppingBag,
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
import { Button } from "@/components/ui/button";
import { signOut, useSession } from "@/lib/auth-client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/dashboard",              icon: FiGrid,         label: "Overview"     },
  { href: "/dashboard/reviews",      icon: FiMessageSquare, label: "My Reviews"  },
  { href: "/dashboard/watchlist",    icon: FiBookmark,     label: "Watchlist"    },
  { href: "/dashboard/purchases",    icon: FiShoppingBag,  label: "Purchases"    },
  { href: "/dashboard/subscription", icon: FiCreditCard,   label: "Subscription" },
] as const;

// --- Sub-components ---

const SidebarLogo = () => (
  <div className="flex flex-col px-6 py-6 border-b border-sidebar-border bg-sidebar/50 backdrop-blur-sm">
    <Link 
      href="/" 
      className="flex items-center gap-2.5 font-bold text-xl hover:opacity-80 transition-opacity"
    >
      <div className="bg-primary p-1.5 rounded-lg shadow-sm">
        <FiFilm className="text-primary-foreground w-5 h-5" />
      </div>
      <span className="tracking-tight text-foreground">CinePortal</span>
    </Link>
  </div>
);

const NavLinks = ({ onNavigate }: { onNavigate?: () => void }) => {
  const pathname = usePathname();

  return (
    <nav className="flex-1 px-4 py-6 space-y-1">
      {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
        const isActive = href === "/dashboard" 
          ? pathname === href 
          : pathname.startsWith(href);

        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group",
              isActive
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            )}
          >
            <Icon className={cn("w-4.5 h-4.5 shrink-0", !isActive && "group-hover:scale-110 transition-transform")} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
};

const SidebarUser = () => {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  
  if (!session?.user) return null;
  const { name, email, image } = session.user;

  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      await signOut();
      window.location.href = "/";
    } catch (error) {
      toast.error("Failed to sign out");
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 mt-auto border-t border-sidebar-border bg-sidebar-accent/20">
      <div className="flex items-center gap-3 px-2 mb-4">
        <Avatar className="h-10 w-10 border-2 border-background shadow-sm">
          <AvatarImage src={image ?? undefined} alt={name ?? "User"} />
          <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
            {name?.charAt(0).toUpperCase() || <FiUser />}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col min-w-0">
          <span className="text-sm font-bold truncate text-foreground leading-tight">{name}</span>
          <span className="text-[11px] text-muted-foreground truncate font-medium">{email}</span>
        </div>
      </div>

      <div className="grid gap-1">
        <Button variant="ghost" size="sm" asChild className="justify-start text-muted-foreground hover:text-foreground h-9">
          <Link href="/">
            <FiChevronLeft className="mr-2 h-4 w-4" />
            Exit to Home
          </Link>
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          disabled={isLoading}
          onClick={handleSignOut}
          className="justify-start text-destructive hover:text-destructive hover:bg-destructive/10 h-9"
        >
          <FiLogOut className="mr-2 h-4 w-4" />
          {isLoading ? "Signing out..." : "Sign Out"}
        </Button>
      </div>
    </div>
  );
};

// --- Main Exports ---

export default function DashboardSidebar() {
  return (
    <aside className="hidden md:flex w-64 shrink-0 h-full bg-sidebar border-r border-sidebar-border flex-col overflow-hidden">
      {/* <SidebarLogo /> */}
      <div className="flex-1 overflow-y-auto">
        <NavLinks />
      </div>
      <SidebarUser />
    </aside>
  );
}

export function MobileDashboardNav() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger>
        <Button variant="ghost" size="icon" className="md:hidden shrink-0" aria-label="Open Menu">
          <FiMenu className="w-5 h-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0 w-[280px] bg-sidebar border-sidebar-border flex flex-col">
        <SheetHeader className="sr-only">
          <SheetTitle>Dashboard Navigation</SheetTitle>
        </SheetHeader>
        <SidebarLogo />
        <div className="flex-1 overflow-y-auto">
          <NavLinks onNavigate={() => setOpen(false)} />
        </div>
        <SidebarUser />
      </SheetContent>
    </Sheet>
  );
}