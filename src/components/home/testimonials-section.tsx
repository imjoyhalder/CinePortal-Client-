import { AiFillStar } from "react-icons/ai";

const testimonials = [
  {
    name: "Sarah K.",
    handle: "@sarahwatches",
    avatar: "SK",
    rating: 5,
    text: "I've tried every movie tracker out there. CinePortal is the only one where the community actually makes me want to log in every day. The reviews feel real, not algorithmic.",
    color: "bg-violet-500",
  },
  {
    name: "Marcus T.",
    handle: "@marcusfilms",
    avatar: "MT",
    rating: 5,
    text: "Found three hidden gems last month just by reading the Newly Added section. The spoiler warnings are a lifesaver. My watchlist has never been this organised.",
    color: "bg-sky-500",
  },
  {
    name: "Priya M.",
    handle: "@priyacinema",
    avatar: "PM",
    rating: 5,
    text: "Upgraded to Pro and haven't looked back. Premium content access + no ads is worth every penny. The comparison table on the pricing page made the decision easy.",
    color: "bg-emerald-500",
  },
];

export default function TestimonialsSection() {
  return (
    <section className="py-20 bg-card border-y border-border/40">
      <div className="container mx-auto px-4">
        <div className="text-center space-y-3 mb-14">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">Loved by film lovers</p>
          <h2 className="text-3xl md:text-4xl font-bold">What our community says</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {testimonials.map(({ name, handle, avatar, rating, text, color }) => (
            <div
              key={name}
              className="flex flex-col gap-5 rounded-2xl border border-border/50 bg-background p-6 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
            >
              {/* Stars */}
              <div className="flex gap-0.5">
                {Array.from({ length: rating }).map((_, i) => (
                  <AiFillStar key={i} className="w-4 h-4 text-amber-400" />
                ))}
              </div>

              {/* Quote */}
              <p className="text-sm text-muted-foreground leading-relaxed flex-1">
                &ldquo;{text}&rdquo;
              </p>

              {/* Author */}
              <div className="flex items-center gap-3 pt-2 border-t border-border/40">
                <div className={`w-9 h-9 rounded-full ${color} flex items-center justify-center text-white text-xs font-bold shrink-0`}>
                  {avatar}
                </div>
                <div>
                  <p className="text-sm font-semibold leading-none">{name}</p>
                  <p className="text-xs text-muted-foreground mt-1">{handle}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
