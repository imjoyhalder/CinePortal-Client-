
"use client";

import { Suspense, useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  FiSearch, FiMenu, FiX, FiUser, FiLogOut,
  FiList, FiSettings, FiGrid, FiHelpCircle, FiChevronDown
} from "react-icons/fi";
import { buttonVariants } from "@/components/ui/button";
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
import Image from "next/image";

const navLinks = [
  { href: "/", label: "Home", exact: true },
  { href: "/movies?type=MOVIE", label: "Movies", match: "/movies", queryKey: "type", queryVal: "MOVIE" },
  { href: "/movies?type=SERIES", label: "TV Shows", match: "/movies", queryKey: "type", queryVal: "SERIES" },
  { href: "/movies?sortBy=mostReviewed", label: "Reviews", match: "/movies", queryKey: "sortBy", queryVal: "mostReviewed" },
  { href: "/faq", label: "FAQ", match: "/faq" },
  { href: "/about", label: "About", match: "/about" },
];

function NavLinks({ mobile, onNavigate }: { mobile?: boolean; onNavigate?: () => void }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function isActive(link: typeof navLinks[number]) {
    if (link.exact) return pathname === "/";
    if (!link.match || !pathname.startsWith(link.match)) return false;
    if (link.queryKey) return searchParams.get(link.queryKey) === link.queryVal;
    return true;
  }

  return (
    <>
      {navLinks.map((link) => (
        <Link
          key={link.label}
          href={link.href}
          onClick={onNavigate}
          className={cn(
            "relative flex items-center transition-all duration-200",
            mobile
              ? "px-4 py-3 rounded-xl text-base font-medium"
              : "px-3 py-1.5 text-sm font-medium",
            isActive(link)
              ? "text-primary"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {link.label}
          {!mobile && isActive(link) && (
            <span className="absolute -bottom-[21px] left-0 right-0 h-[2px] bg-primary rounded-t-full" />
          )}
        </Link>
      ))}
    </>
  );
}

function NavLinksFallback({ mobile }: { mobile?: boolean }) {
  return (
    <div className={cn("flex", mobile ? "flex-col gap-1" : "items-center gap-1")}>
      {navLinks.map((link) => (
        <div key={link.label} className={cn("rounded-md bg-muted/50 animate-pulse", mobile ? "h-12 w-full" : "h-8 w-16")} />
      ))}
    </div>
  );
}

export default function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [scrolled, setScrolled] = useState(false);

  const user = session?.user;
  const isAdmin = user && (user as { role?: string }).role === "ADMIN";

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  function handleSearch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/movies?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      setMobileOpen(false);
    }
  }

  async function handleSignOut() {
    await signOut();
    toast.success("Signed out successfully");
    router.refresh();
  }

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300 border-b",
        scrolled
          ? "bg-background/80 backdrop-blur-xl border-border shadow-sm py-2"
          : "bg-background border-transparent py-4"
      )}
    >
      <div className="container mx-auto px-4 flex items-center justify-between gap-8">

        {/* Left: Logo & Desktop Nav */}
        <div className="flex items-center gap-10">
          <Link href="/" className="flex items-center gap-2 transition-transform ">
            <div className="relative h-9 w-9 overflow-hidden   flex items-center justify-center">
              <Image
                alt="Logo"
                src="/powersync.svg"
                width={28}
                height={28}
                className="h-auto w-auto"
                priority
              />
            </div>
            <span className="font-bold text-xl tracking-tight hidden lg:block bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
              CinePortal
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-2">
            <Suspense fallback={<NavLinksFallback />}>
              <NavLinks />
            </Suspense>
          </nav>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3">

          <form onSubmit={handleSearch} className="hidden sm:flex relative items-center">
            <FiSearch className="absolute left-3 w-4 h-4 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search movies..."
              className="h-10 w-40 lg:w-64 bg-muted/50 border-transparent rounded-full pl-10 pr-4 text-sm transition-all focus:w-80 focus:bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary/40 outline-none"
            />
          </form>

          <div className="flex items-center gap-2 border-l pl-3 ml-1 border-border/60">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger className="group flex items-center gap-2 outline-none">
                  <Avatar className="h-9 w-9 border-2 border-transparent group-hover:border-primary/20 transition-all">
                    <AvatarImage src={user.image ?? undefined} />
                    <AvatarFallback className="bg-primary text-primary-foreground font-bold">
                      {user.name?.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <FiChevronDown className="w-4 h-4 text-muted-foreground group-data-[state=open]:rotate-180 transition-transform" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64 p-2 mt-2">
                  {/* Fixed: Standard div instead of DropdownMenuLabel to avoid context errors */}
                  <div className="flex flex-col space-y-1 p-3">
                    <p className="text-sm font-semibold leading-none">{user.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => router.push("/dashboard")} className="rounded-lg py-2.5 cursor-pointer">
                    <FiGrid className="mr-3 h-4 w-4" /> Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push("/dashboard/watchlist")} className="rounded-lg py-2.5 cursor-pointer">
                    <FiList className="mr-3 h-4 w-4" /> Watchlist
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push("/faq")} className="rounded-lg py-2.5 cursor-pointer">
                    <FiHelpCircle className="mr-3 h-4 w-4" /> Help & FAQ
                  </DropdownMenuItem>
                  {isAdmin && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => router.push("/admin/dashboard")} className="rounded-lg py-2.5 cursor-pointer text-primary">
                        <FiSettings className="mr-3 h-4 w-4" /> Admin Console
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="rounded-lg py-2.5 cursor-pointer text-destructive focus:bg-destructive/10">
                    <FiLogOut className="mr-3 h-4 w-4" /> Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/sign-in" className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "rounded-full")}>
                  Log in
                </Link>
                <Link href="/sign-up" className={cn(buttonVariants({ size: "sm" }), "rounded-full px-5 font-semibold")}>
                  Sign up
                </Link>
              </div>
            )}

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-full hover:bg-muted transition-colors"
            >
              {mobileOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {mobileOpen && (
        <div className="fixed inset-x-0 top-[65px] bottom-0 z-50 bg-background md:hidden overflow-y-auto animate-in slide-in-from-top duration-300">
          <div className="p-6 flex flex-col gap-4">
            <form onSubmit={handleSearch} className="relative mb-4">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search..."
                className="w-full bg-muted/50 border-none rounded-xl py-3 pl-10 pr-4 outline-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </form>

            <div className="flex flex-col gap-1">
              <Suspense fallback={<NavLinksFallback mobile />}>
                <NavLinks mobile onNavigate={() => setMobileOpen(false)} />
              </Suspense>
              {isAdmin && (
                <Link
                  href="/admin/dashboard"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center px-4 py-3 rounded-xl text-base font-medium text-primary bg-primary/5"
                >
                  Admin Console
                </Link>
              )}
            </div>

            <div className="mt-auto pt-8 border-t">
              {user ? (
                <div className="space-y-1">
                  <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 text-muted-foreground" onClick={() => setMobileOpen(false)}>
                    <FiGrid className="w-5 h-5" /> Dashboard
                  </Link>
                  <button onClick={handleSignOut} className="flex items-center gap-3 px-4 py-3 text-destructive w-full">
                    <FiLogOut className="w-5 h-5" /> Logout
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4 px-4">
                  <Link href="/sign-in" className={cn(buttonVariants({ variant: "outline" }), "rounded-xl")} onClick={() => setMobileOpen(false)}>Log In</Link>
                  <Link href="/sign-up" className={cn(buttonVariants(), "rounded-xl")} onClick={() => setMobileOpen(false)}>Sign Up</Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}