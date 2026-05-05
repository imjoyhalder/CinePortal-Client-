// import Link from "next/link";
// import { FiFilm, FiGithub, FiTwitter, FiInstagram } from "react-icons/fi";
// import { Separator } from "@/components/ui/separator";

// export default function Footer() {
//   return (
//     <footer className="border-t border-border bg-card/50 mt-auto">
//       <div className="container mx-auto px-4 py-12">
//         <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
//           {/* Brand */}
//           <div className="space-y-3">
//             <Link href="/" className="flex items-center gap-2 font-bold text-lg">
//               <FiFilm className="text-primary w-5 h-5" />
//               <span className="text-gradient">CinePortal</span>
//             </Link>
//             <p className="text-sm text-muted-foreground leading-relaxed">
//               Your ultimate destination for discovering, rating, and reviewing movies and series.
//             </p>
//             <div className="flex items-center gap-3 pt-1">
//               <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
//                 <FiGithub className="w-4 h-4" />
//               </a>
//               <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
//                 <FiTwitter className="w-4 h-4" />
//               </a>
//               <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
//                 <FiInstagram className="w-4 h-4" />
//               </a>
//             </div>
//           </div>

//           {/* Explore */}
//           <div>
//             <h4 className="font-semibold text-sm mb-4">Explore</h4>
//             <ul className="space-y-2">
//               {[
//                 { href: "/movies", label: "Browse Movies" },
//                 { href: "/movies?type=SERIES", label: "Browse Series" },
//                 { href: "/movies?sortBy=mostReviewed", label: "Top Rated" },
//                 { href: "/movies?pricing=free", label: "Free Content" },
//               ].map(({ href, label }) => (
//                 <li key={href}>
//                   <Link href={href} className="text-sm text-muted-foreground hover:text-primary transition-colors">
//                     {label}
//                   </Link>
//                 </li>
//               ))}
//             </ul>
//           </div>

//           {/* Account */}
//           <div>
//             <h4 className="font-semibold text-sm mb-4">Account</h4>
//             <ul className="space-y-2">
//               {[
//                 { href: "/sign-in", label: "Sign In" },
//                 { href: "/sign-up", label: "Create Account" },
//                 { href: "/profile", label: "My Profile" },
//                 { href: "/watchlist", label: "Watchlist" },
//               ].map(({ href, label }) => (
//                 <li key={href}>
//                   <Link href={href} className="text-sm text-muted-foreground hover:text-primary transition-colors">
//                     {label}
//                   </Link>
//                 </li>
//               ))}
//             </ul>
//           </div>

//           {/* Support */}
//           <div>
//             <h4 className="font-semibold text-sm mb-4">Support</h4>
//             <ul className="space-y-2">
//               {[
//                 { href: "/faq", label: "Help Center" },
//                 { href: "/faq#privacy", label: "Privacy Policy" },
//                 { href: "/faq#terms", label: "Terms of Service" },
//                 { href: "/contact", label: "Contact Us" },
//               ].map(({ href, label }) => (
//                 <li key={href}>
//                   <Link href={href} className="text-sm text-muted-foreground hover:text-primary transition-colors">
//                     {label}
//                   </Link>
//                 </li>
//               ))}
//             </ul>
//           </div>
//         </div>

//         <Separator className="my-8 opacity-20" />

//         <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
//           <p>© 2026 CinePortal. All rights reserved.</p>
//           <p>Built with Next.js, Tailwind CSS &amp; Better Auth</p>
//         </div>
//       </div>
//     </footer>
//   );
// }


"use client";

import Link from "next/link";
import Image from "next/image";
import { FiGithub, FiTwitter, FiInstagram, FiMail, FiArrowRight } from "react-icons/fi";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

const footerLinks = {
  explore: [
    { href: "/movies", label: "Browse Movies" },
    { href: "/movies?type=SERIES", label: "Browse Series" },
    { href: "/movies?sortBy=mostReviewed", label: "Top Rated" },
    { href: "/pricing", label: "Premium Plans" },
  ],
  account: [
    { href: "/dashboard", label: "My Dashboard" },
    { href: "/dashboard/watchlist", label: "Watchlist" },
    { href: "/settings", label: "Settings" },
    { href: "/sign-up", label: "Create Account" },
  ],
  support: [
    { href: "/faq", label: "Help Center" },
    { href: "/faq#privacy", label: "Privacy Policy" },
    { href: "/faq#terms", label: "Terms of Service" },
    { href: "/contact", label: "Contact Us" },
  ],
};

export default function Footer() {
  return (
    <footer className="relative border-t border-border bg-card/30 backdrop-blur-sm mt-auto">
      {/* Decorative gradient blur */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

      <div className="container mx-auto px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8">
          
          {/* Brand & Newsletter Section (Spans 5 columns) */}
          <div className="lg:col-span-5 space-y-8">
            <div className="space-y-4">
              <Link href="/" className="flex items-center gap-2  w-fit">
                <div className="relative h-8 w-8 overflow-hidden rounded-lg flex items-center justify-center ">
                  <Image alt="Logo" src="/powersync.svg" width={22} height={22} className="h-auto w-auto" />
                </div>
                <span className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
                  CinePortal
                </span>
              </Link>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">
                The next generation of film discovery. Track your watchlist, read deep-dive reviews, and connect with fellow cinema enthusiasts.
              </p>
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-semibold uppercase tracking-wider text-foreground/80">Stay Updated</h4>
              <div className="flex max-w-sm items-center gap-2">
                <div className="relative flex-1">
                  <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input 
                    type="email" 
                    placeholder="Enter your email" 
                    className="w-full bg-muted/50 border border-border rounded-full py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary/40 outline-none transition-all"
                  />
                </div>
                <Button size="sm" className="rounded-full px-4 group">
                  Join <FiArrowRight className="ml-2 w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </div>
          </div>

          {/* Links Sections (Spans 7 columns) */}
          <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-8">
            <div>
              <h4 className="font-bold text-sm mb-6 uppercase tracking-widest text-primary/80">Explore</h4>
              <ul className="space-y-4">
                {footerLinks.explore.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-sm text-muted-foreground hover:text-primary hover:translate-x-1 inline-block transition-all">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-sm mb-6 uppercase tracking-widest text-primary/80">Account</h4>
              <ul className="space-y-4">
                {footerLinks.account.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-sm text-muted-foreground hover:text-primary hover:translate-x-1 inline-block transition-all">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="col-span-2 sm:col-span-1">
              <h4 className="font-bold text-sm mb-6 uppercase tracking-widest text-primary/80">Support</h4>
              <ul className="space-y-4">
                {footerLinks.support.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-sm text-muted-foreground hover:text-primary hover:translate-x-1 inline-block transition-all">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <Separator className="my-12 bg-border/40" />

        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-2 text-center md:text-left">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} <span className="font-semibold text-foreground">CinePortal</span>. All rights reserved.
            </p>
            <div className="flex items-center justify-center md:justify-start gap-4 text-xs text-muted-foreground/60">
              <span className="flex items-center gap-1">Built with Next.js 15</span>
              <span className="w-1 h-1 rounded-full bg-border" />
              <span>Tailwind v4</span>
              <span className="w-1 h-1 rounded-full bg-border" />
              <span>Better Auth</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {[
              { icon: <FiGithub />, href: "https://github.com" },
              { icon: <FiTwitter />, href: "https://twitter.com" },
              { icon: <FiInstagram />, href: "https://instagram.com" },
            ].map((social, i) => (
              <a
                key={i}
                href={social.href}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center w-10 h-10 rounded-full border border-border bg-muted/30 text-muted-foreground hover:text-primary hover:border-primary/30 hover:bg-primary/5 transition-all"
              >
                {social.icon}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}