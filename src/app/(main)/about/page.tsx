import type { Metadata } from "next";
import Link from "next/link";
import { FiFilm, FiUsers, FiStar, FiShield, FiHeart, FiZap } from "react-icons/fi";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "About — CinePortal",
  description: "Learn about CinePortal, the community-powered movie and series rating platform.",
};

const TEAM = [
  { name: "Alex Rivera", role: "Founder & CEO", initials: "AR", color: "bg-primary/15 text-primary" },
  { name: "Jordan Kim", role: "Head of Product", initials: "JK", color: "bg-blue-500/15 text-blue-400" },
  { name: "Sam Patel", role: "Lead Engineer", initials: "SP", color: "bg-purple-500/15 text-purple-400" },
  { name: "Morgan Chen", role: "Design Lead", initials: "MC", color: "bg-green-500/15 text-green-400" },
];

const VALUES = [
  {
    icon: <FiUsers className="w-5 h-5" />,
    title: "Community First",
    description: "Every feature we build puts our community of film lovers at the center.",
    color: "bg-primary/10 text-primary",
  },
  {
    icon: <FiStar className="w-5 h-5" />,
    title: "Honest Reviews",
    description: "We believe in authentic, human-written reviews — no bots, no sponsored fluff.",
    color: "bg-amber-500/10 text-amber-400",
  },
  {
    icon: <FiShield className="w-5 h-5" />,
    title: "Safe & Trusted",
    description: "Our moderation team ensures the platform remains respectful and trustworthy.",
    color: "bg-green-500/10 text-green-400",
  },
  {
    icon: <FiZap className="w-5 h-5" />,
    title: "Always Improving",
    description: "We ship improvements weekly based on community feedback and data.",
    color: "bg-blue-500/10 text-blue-400",
  },
];

const STATS = [
  { value: "25K+", label: "Community Members" },
  { value: "10K+", label: "Movies & Series" },
  { value: "50K+", label: "Reviews Written" },
  { value: "4.8★", label: "Average App Rating" },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-background pointer-events-none" />
        <div className="container mx-auto px-4 text-center relative">
          <div className="inline-flex items-center gap-2 border border-primary/30 rounded-full px-4 py-1.5 text-sm text-primary font-medium mb-6">
            <FiHeart className="w-3.5 h-3.5" />
            Made by film lovers, for film lovers
          </div>
          <h1 className="text-5xl md:text-6xl font-black tracking-tight mb-6">
            About{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-500">
              CinePortal
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            CinePortal is a community-powered movie and series discovery platform where every opinion
            matters. We bring together film enthusiasts to rate, review, and recommend the best of
            cinema — from Hollywood blockbusters to indie gems.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 border-y border-border/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {STATS.map(({ value, label }) => (
              <div key={label}>
                <p className="text-4xl font-black text-primary mb-1">{value}</p>
                <p className="text-sm text-muted-foreground">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our story */}
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center gap-2 text-primary mb-3">
                <FiFilm className="w-4 h-4" />
                <span className="text-sm font-medium uppercase tracking-wider">Our Story</span>
              </div>
              <h2 className="text-3xl font-bold mb-4">Started with a passion for cinema</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                CinePortal was founded in 2024 by a group of film enthusiasts who were frustrated
                with aggregator scores that didn&apos;t reflect real audience sentiment. We wanted a
                place where real people — not critics — could define what makes a great film.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Today, CinePortal is home to thousands of passionate reviewers who discover,
                rate, and discuss movies and series from every genre, era, and corner of the world.
                Our platform is built on transparency, community, and a deep love of storytelling.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {["Drama", "Sci-Fi", "Thriller", "Comedy", "Horror", "Romance"].map((genre, i) => (
                <Link
                  key={genre}
                  href={`/movies?genre=${genre}`}
                  className="rounded-xl border border-border/50 bg-card p-4 text-center hover:border-primary/40 hover:bg-primary/5 transition-colors"
                >
                  <p className="text-2xl mb-1">
                    {["🎭", "🚀", "🎯", "😂", "👻", "❤️"][i]}
                  </p>
                  <p className="text-sm font-medium">{genre}</p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-card/30 border-y border-border/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">What we stand for</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Our values guide every decision we make, from features we build to how we moderate content.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {VALUES.map(({ icon, title, description, color }) => (
              <div key={title} className="rounded-xl border border-border/50 bg-card p-6 text-center">
                <div className={`w-12 h-12 rounded-full ${color} flex items-center justify-center mx-auto mb-4`}>
                  {icon}
                </div>
                <h3 className="font-semibold mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">Meet the team</h2>
            <p className="text-muted-foreground">The people building CinePortal</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-3xl mx-auto">
            {TEAM.map(({ name, role, initials, color }) => (
              <div key={name} className="rounded-xl border border-border/50 bg-card p-6 text-center">
                <div className={`w-16 h-16 rounded-full ${color} flex items-center justify-center mx-auto mb-3 text-xl font-bold`}>
                  {initials}
                </div>
                <p className="font-semibold">{name}</p>
                <p className="text-sm text-muted-foreground mt-0.5">{role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 border-t border-border/30">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Join our community</h2>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            Sign up for free and start discovering, rating, and reviewing your favorite movies and series.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button size="lg" className="px-8" asChild>
              <Link href="/sign-up">Get Started Free</Link>
            </Button>
            <Button size="lg" variant="outline" className="px-8" asChild>
              <Link href="/movies">Browse Movies</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
