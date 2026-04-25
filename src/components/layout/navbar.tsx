"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FiSearch, FiMenu, FiX, FiUser, FiLogOut, FiList, FiSettings } from "react-icons/fi";
import { MdMovie } from "react-icons/md";
import { Button, buttonVariants } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSession, signOut } from "@/lib/auth-client";
import { toast } from "sonner";

const navLinks = [
  { href: "/", label: "Home", exact: true },
  { href: "/movies?type=MOVIE", label: "Movies", match: "/movies" },
  { href: "/movies?type=SERIES", label: "TV Shows", match: "/movies" },
  { href: "/movies?sortBy=mostReviewed", label: "Reviews", match: "/movies" },
];

export default function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const user = session?.user;
  const isAdmin = user && (user as { role?: string }).role === "ADMIN";

  function isActive(link: { href: string; exact?: boolean; match?: string }) {
    if (link.exact) return pathname === link.href.split("?")[0];
    if (link.match) return pathname.startsWith(link.match);
    return false;
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/movies?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery("");
    }
  }

  async function handleSignOut() {
    await signOut();
    toast.success("Signed out successfully");
    router.push("/");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border/40">
      <div className="container mx-auto px-4 h-16 flex items-center gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0 mr-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <MdMovie className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-bold text-base hidden sm:block">CinePortal</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-0.5 flex-1">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className={cn(
                "px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                isActive(link)
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {link.label}
            </Link>
          ))}
          {isAdmin && (
            <Link
              href="/admin/dashboard"
              className="px-3 py-1.5 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Admin
            </Link>
          )}
        </nav>

        {/* Right section */}
        <div className="flex items-center gap-1.5 ml-auto">
          {/* Search */}
          {searchOpen ? (
            <form onSubmit={handleSearch} className="flex items-center gap-1.5">
              <div className="relative">
                <FiSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <input
                  autoFocus
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search..."
                  className="bg-card border border-border rounded-lg pl-8 pr-3 py-1.5 text-sm w-44 outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/60 transition-all"
                />
              </div>
              <button
                type="button"
                onClick={() => { setSearchOpen(false); setSearchQuery(""); }}
                className="p-1.5 text-muted-foreground hover:text-foreground rounded-md"
              >
                <FiX className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <button
              onClick={() => setSearchOpen(true)}
              className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
              aria-label="Search"
            >
              <FiSearch className="w-4 h-4" />
            </button>
          )}

          {/* Auth */}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-2 outline-none ml-1">
                <Avatar className="w-8 h-8 ring-1 ring-border">
                  <AvatarImage src={user.image ?? undefined} />
                  <AvatarFallback className="bg-primary/20 text-primary text-xs font-semibold">
                    {user.name?.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <div className="px-2 py-2">
                  <p className="text-sm font-semibold truncate">{user.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  {isAdmin && <Badge variant="secondary" className="mt-1 text-xs py-0">Admin</Badge>}
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push("/profile")} className="gap-2 cursor-pointer">
                  <FiUser className="w-4 h-4" /> Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push("/watchlist")} className="gap-2 cursor-pointer">
                  <FiList className="w-4 h-4" /> Watchlist
                </DropdownMenuItem>
                {isAdmin && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => router.push("/admin/dashboard")} className="gap-2 cursor-pointer">
                      <FiSettings className="w-4 h-4" /> Admin Panel
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleSignOut}
                  className="gap-2 text-destructive focus:text-destructive cursor-pointer"
                >
                  <FiLogOut className="w-4 h-4" /> Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <Link href="/sign-in" className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}>
                Sign In
              </Link>
              <Link href="/sign-up" className={cn(buttonVariants({ size: "sm" }), "font-semibold")}>
                Get Started
              </Link>
            </div>
          )}

          {/* Mobile toggle */}
          <button
            className="md:hidden p-2 text-muted-foreground hover:text-foreground rounded-md transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Menu"
          >
            {mobileOpen ? <FiX className="w-5 h-5" /> : <FiMenu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border/40 bg-background/98 px-4 py-4 space-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive(link)
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              {link.label}
            </Link>
          ))}
          {isAdmin && (
            <Link
              href="/admin/dashboard"
              onClick={() => setMobileOpen(false)}
              className="flex items-center px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              Admin Panel
            </Link>
          )}
          {!user && (
            <div className="flex gap-2 pt-3 border-t border-border/40 mt-3">
              <Link
                href="/sign-in"
                onClick={() => setMobileOpen(false)}
                className={cn(buttonVariants({ variant: "outline", size: "sm" }), "flex-1 justify-center")}
              >
                Sign In
              </Link>
              <Link
                href="/sign-up"
                onClick={() => setMobileOpen(false)}
                className={cn(buttonVariants({ size: "sm" }), "flex-1 justify-center font-semibold")}
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
