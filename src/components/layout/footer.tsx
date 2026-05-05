import Link from "next/link";
import { FiFilm, FiGithub, FiTwitter, FiInstagram } from "react-icons/fi";
import { Separator } from "@/components/ui/separator";

export default function Footer() {
  return (
    <footer className="border-t border-border bg-card/50 mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-3">
            <Link href="/" className="flex items-center gap-2 font-bold text-lg">
              <FiFilm className="text-primary w-5 h-5" />
              <span className="text-gradient">CinePortal</span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Your ultimate destination for discovering, rating, and reviewing movies and series.
            </p>
            <div className="flex items-center gap-3 pt-1">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <FiGithub className="w-4 h-4" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <FiTwitter className="w-4 h-4" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <FiInstagram className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Explore */}
          <div>
            <h4 className="font-semibold text-sm mb-4">Explore</h4>
            <ul className="space-y-2">
              {[
                { href: "/movies", label: "Browse Movies" },
                { href: "/movies?type=SERIES", label: "Browse Series" },
                { href: "/movies?sortBy=mostReviewed", label: "Top Rated" },
                { href: "/movies?pricing=free", label: "Free Content" },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account */}
          <div>
            <h4 className="font-semibold text-sm mb-4">Account</h4>
            <ul className="space-y-2">
              {[
                { href: "/sign-in", label: "Sign In" },
                { href: "/sign-up", label: "Create Account" },
                { href: "/profile", label: "My Profile" },
                { href: "/watchlist", label: "Watchlist" },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold text-sm mb-4">Support</h4>
            <ul className="space-y-2">
              {[
                { href: "/faq", label: "Help Center" },
                { href: "/faq#privacy", label: "Privacy Policy" },
                { href: "/faq#terms", label: "Terms of Service" },
                { href: "/contact", label: "Contact Us" },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <Separator className="my-8 opacity-20" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>© 2026 CinePortal. All rights reserved.</p>
          <p>Built with Next.js, Tailwind CSS &amp; Better Auth</p>
        </div>
      </div>
    </footer>
  );
}
