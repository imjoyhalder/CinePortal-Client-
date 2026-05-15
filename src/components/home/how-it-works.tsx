import { FiSearch, FiEdit3, FiUsers } from "react-icons/fi";

const steps = [
  {
    step: "01",
    icon: FiSearch,
    title: "Discover",
    description:
      "Browse thousands of movies and series. Filter by genre, year, or mood. Find your next watch in seconds.",
  },
  {
    step: "02",
    icon: FiEdit3,
    title: "Review & Rate",
    description:
      "Write honest reviews, rate what you've seen, and help others decide what to watch next.",
  },
  {
    step: "03",
    icon: FiUsers,
    title: "Connect",
    description:
      "Comment on reviews, follow film lovers with similar taste, and build your ultimate watchlist.",
  },
];

export default function HowItWorks() {
  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <div className="text-center space-y-3 mb-10">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">Simple by design</p>
          <h2 className="text-3xl md:text-4xl font-bold">How CinePortal works</h2>
          <p className="text-muted-foreground max-w-md mx-auto text-base">
            From first search to lively discussion — three steps to your next favourite film.
          </p>
        </div>

        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {/* Connector line (desktop only) */}
          <div className="hidden md:block absolute top-10 left-1/6 right-1/6 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

          {steps.map(({ step, icon: Icon, title, description }) => (
            <div key={step} className="relative flex flex-col items-center text-center gap-4 group">
              {/* Step bubble */}
              <div className="relative w-20 h-20 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center group-hover:bg-primary/15 group-hover:border-primary/40 transition-all duration-300 shadow-sm">
                <Icon className="w-8 h-8 text-primary" />
                <span className="absolute -top-2.5 -right-2.5 w-6 h-6 rounded-full bg-primary text-primary-foreground text-[10px] font-black flex items-center justify-center">
                  {step.slice(1)}
                </span>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-bold">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-[220px] mx-auto">{description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
