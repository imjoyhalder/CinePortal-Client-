// "use client";

// import { useState } from "react";
// import Image from "next/image";
// import Link from "next/link";
// import { useRouter } from "next/navigation";
// import { FiSearch, FiPlay, FiUsers } from "react-icons/fi";
// import { MdMovieCreation } from "react-icons/md";
// import { Button, buttonVariants } from "@/components/ui/button";
// import { cn } from "@/lib/utils";

// const FALLBACK_POSTERS = [
//   "https://image.tmdb.org/t/p/w500/d5NXSklpcvkmXyZSoHjBnFbNcMH.jpg",
//   "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
//   "https://image.tmdb.org/t/p/w500/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg",
//   "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
//   "https://image.tmdb.org/t/p/w500/3bhkrj58Vtu7enYsLebHly2DkEy.jpg",
//   "https://image.tmdb.org/t/p/w500/6oom5QYQ2yQTMJIbnvbkBL9cHo6.jpg",
// ];

// interface HeroSectionProps {
//   posters?: (string | null | undefined)[];
// }

// function PosterCard({ src, offset }: { src: string; offset: string }) {
//   const [errored, setErrored] = useState(false);

//   return (
//     <div
//       className="relative aspect-2/3 rounded-xl overflow-hidden shadow-2xl bg-muted ring-1 ring-white/5"
//       style={{ transform: `translateY(${offset})` }}
//     >
//       {!errored ? (
//         <Image
//           src={src}
//           alt="Movie poster"
//           fill
//           className="object-cover"
//           sizes="180px"
//           onError={() => setErrored(true)}
//         />
//       ) : (
//         <div className="absolute inset-0 flex items-center justify-center bg-card">
//           <MdMovieCreation className="w-10 h-10 text-muted-foreground/30" />
//         </div>
//       )}
//       <div className="absolute inset-0 bg-linear-to-t from-black/20 to-transparent" />
//     </div>
//   );
// }

// export default function HeroSection({ posters = [] }: HeroSectionProps) {
//   const router = useRouter();
//   const [query, setQuery] = useState("");

//   const displayPosters = Array.from({ length: 6 }, (_, i) =>
//     posters[i] || FALLBACK_POSTERS[i]
//   );

//   // Stagger offsets: middle col floats up, outer cols neutral
//   const offsets = ["-8px", "-24px", "-8px", "8px", "24px", "8px"];

//   function handleSearch(e: React.FormEvent) {
//     e.preventDefault();
//     if (query.trim()) router.push(`/movies?search=${encodeURIComponent(query.trim())}`);
//   }

//   return (
//     <section className="relative min-h-[88vh] flex items-center overflow-hidden bg-background">
//       {/* Ambient glow behind poster grid */}
//       <div
//         className="absolute right-0 top-0 bottom-0 w-1/2 pointer-events-none hidden lg:block"
//         style={{
//           background:
//             "radial-gradient(ellipse 80% 60% at 80% 50%, oklch(0.75 0.15 60 / 0.06) 0%, transparent 70%)",
//         }}
//       />

//       <div className="container mx-auto px-4 py-16 lg:py-0">
//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center min-h-[80vh]">

//           {/* ── Left: content ─────────────────────────────── */}
//           <div className="space-y-7">
//             <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 text-sm text-primary font-medium">
//               <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
//               Thousands of titles. One platform.
//             </div>

//             <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.08]">
//               Discover &amp;{" "}
//               <span className="text-gradient">Rate</span>
//               <br />
//               Your Favorites
//             </h1>

//             <p className="text-lg text-muted-foreground leading-relaxed max-w-lg">
//               Explore thousands of movies and TV shows. Read honest reviews, rate
//               what you&apos;ve watched, and share your thoughts with a community
//               of film lovers.
//             </p>

//             {/* Search bar */}
//             <form onSubmit={handleSearch} className="flex gap-2 max-w-md">
//               <div className="relative flex-1">
//                 <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
//                 <input
//                   type="text"
//                   placeholder="Search movies, series, directors..."
//                   className="w-full h-11 pl-10 pr-4 bg-card border border-border/60 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/60 transition-all placeholder:text-muted-foreground/60"
//                   value={query}
//                   onChange={(e) => setQuery(e.target.value)}
//                 />
//               </div>
//               <Button type="submit" className="h-11 px-5 font-semibold shrink-0">
//                 Search
//               </Button>
//             </form>

//             {/* CTA buttons */}
//             <div className="flex flex-wrap items-center gap-3">
//               <Link
//                 href="/movies"
//                 className={cn(buttonVariants({ size: "lg" }), "gap-2 h-11 px-5 font-semibold")}
//               >
//                 <FiPlay className="w-4 h-4" />
//                 Browse Movies
//               </Link>
//               <Link
//                 href="/sign-up"
//                 className={cn(
//                   buttonVariants({ variant: "outline", size: "lg" }),
//                   "gap-2 h-11 px-5 font-semibold"
//                 )}
//               >
//                 <FiUsers className="w-4 h-4" />
//                 Join Community
//               </Link>
//             </div>

//             {/* Trust stats */}
//             <div className="flex flex-wrap items-center gap-8 pt-2">
//               {[
//                 { value: "10K+", label: "Movies & TV Shows" },
//                 { value: "50K+", label: "Reviews" },
//                 { value: "25K+", label: "Members" },
//               ].map(({ value, label }) => (
//                 <div key={label}>
//                   <p className="text-2xl font-bold text-foreground">{value}</p>
//                   <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
//                 </div>
//               ))}
//             </div>
//           </div>

//           {/* ── Right: poster grid ─────────────────────────── */}
//           <div className="hidden lg:flex justify-center items-center">
//             <div className="grid grid-cols-3 gap-3 w-full max-w-sm">
//               {displayPosters.map((src, i) => (
//                 <PosterCard key={i} src={src} offset={offsets[i]} />
//               ))}
//             </div>
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// }


"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FiSearch, FiPlay, FiUsers, FiTrendingUp } from "react-icons/fi";
import { MdMovieCreation } from "react-icons/md";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const FALLBACK_POSTERS = [
  "https://image.tmdb.org/t/p/w500/d5NXSklpcvkmXyZSoHjBnFbNcMH.jpg",
  "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
  "https://image.tmdb.org/t/p/w500/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg",
  "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
  "https://image.tmdb.org/t/p/w500/3bhkrj58Vtu7enYsLebHly2DkEy.jpg",
  "https://image.tmdb.org/t/p/w500/6oom5QYQ2yQTMJIbnvbkBL9cHo6.jpg",
];

interface HeroSectionProps {
  posters?: (string | null | undefined)[];
}

function PosterCard({ src, index }: { src: string; index: number }) {
  const [errored, setErrored] = useState(false);
  
  // Staggered animation effect based on index
  const delays = ["0ms", "200ms", "100ms", "300ms", "150ms", "250ms"];

  return (
    <div
      className="group relative aspect-[2/3] rounded-2xl overflow-hidden shadow-xl transition-all duration-500 hover:scale-105 hover:-translate-y-2 hover:shadow-primary/20 bg-muted ring-1 ring-white/10"
      style={{ transitionDelay: delays[index % 6] }}
    >
      {!errored ? (
        <Image
          src={src}
          alt="Movie poster"
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-110"
          sizes="(max-width: 768px) 33vw, 20vw"
          onError={() => setErrored(true)}
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-card">
          <MdMovieCreation className="w-10 h-10 text-muted-foreground/20" />
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  );
}

export default function HeroSection({ posters = [] }: HeroSectionProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const displayPosters = Array.from({ length: 6 }, (_, i) =>
    posters[i] || FALLBACK_POSTERS[i]
  );

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) router.push(`/movies?search=${encodeURIComponent(query.trim())}`);
  }

  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-background py-2 lg:py-2">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-[120px] pointer-events-none" />

      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          
          {/* Left Content (Span 7) */}
          <div className="lg:col-span-7 space-y-8 text-center lg:text-left order-2 lg:order-1">


            <h1 className="text-5xl md:text-6xl lg:text-8xl font-black tracking-tight leading-[0.95] text-balance">
              Watch. Rate. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-500 to-blue-500">
                Discuss.
              </span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto lg:mx-0">
              Join the world&apos;s largest community of cinema enthusiasts. 
              Track your watchlist, filter by mood, and discover your next obsession.
            </p>

            {/* Search Bar - Better Desktop/Mobile handling */}
            <form onSubmit={handleSearch} className="relative max-w-xl mx-auto lg:mx-0 group">
              <div className="relative flex flex-col sm:flex-row gap-3 p-2 bg-card/50 backdrop-blur-md border border-border/50 rounded-2xl shadow-2xl transition-all focus-within:ring-2 focus-within:ring-primary/40">
                <div className="relative flex-1 flex items-center">
                  <FiSearch className="absolute left-4 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <input
                    type="text"
                    placeholder="Search 10,000+ titles..."
                    className="w-full h-12 pl-12 pr-4 bg-transparent outline-none text-base placeholder:text-muted-foreground/60"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                </div>
                <Button type="submit" size="lg" className="rounded-xl h-12 px-8 font-bold shadow-lg shadow-primary/20">
                  Search
                </Button>
              </div>
            </form>

            {/* Actions & Stats */}
            <div className="flex flex-col sm:flex-row items-center gap-6 pt-4 justify-center lg:justify-start">
              <div className="flex items-center gap-4">
                <Link href="/movies" className={cn(buttonVariants({ size: "lg" }), "rounded-full px-8")}>
                  <FiPlay className="mr-2 fill-current" /> Browse
                </Link>
                <Link href="/sign-up" className={cn(buttonVariants({ variant: "ghost", size: "lg" }), "rounded-full")}>
                  Join Community
                </Link>
              </div>
              
              <div className="hidden sm:block h-8 w-px bg-border/60" />
              
              <div className="flex gap-6">
                <div>
                  <p className="text-xl font-bold">50k+</p>
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Reviews</p>
                </div>
                <div>
                  <p className="text-xl font-bold">12k+</p>
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Users</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Poster Grid (Span 5) */}
          <div className="lg:col-span-5 order-1 lg:order-2">
            <div className="grid grid-cols-3 gap-4 relative">
              {/* Decorative background element for the grid */}
              <div className="absolute -inset-4 bg-primary/5 rounded-[2rem] -z-10 rotate-3" />
              
              {displayPosters.map((src, i) => (
                <div key={i} className={cn(
                  "first:mt-8 last:mt-[-2rem]", // Slight staggering for the first and last column
                  i % 3 === 1 ? "translate-y-4" : "" // Middle column shift
                )}>
                  <PosterCard src={src} index={i} />
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}