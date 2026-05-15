import { FiCompass, FiStar, FiUsers, FiBookmark } from "react-icons/fi";

const features = [
  {
    icon: FiCompass,
    title: "Discover",
    description: "Find your next favourite film by genre, mood, or year",
  },
  {
    icon: FiStar,
    title: "Rate & Review",
    description: "Share honest takes and read what the community thinks",
  },
  {
    icon: FiUsers,
    title: "Join Community",
    description: "Connect with film lovers who share your taste",
  },
  {
    icon: FiBookmark,
    title: "Track Watchlist",
    description: "Save, organise, and never forget what to watch",
  },
];

export default function FeatureStrip() {
  return (
    <section className="border-y border-border/40 bg-card">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4">
          {features.map(({ icon: Icon, title, description }, i) => (
            <div
              key={title}
              className={`group flex items-center gap-4 px-6 py-5 transition-colors hover:bg-primary/5 ${
                i < features.length - 1 ? "border-r border-border/40" : ""
              }`}
            >
              <div className="w-11 h-11 rounded-xl border border-primary/20 bg-primary/8 flex items-center justify-center shrink-0 group-hover:bg-primary/15 group-hover:border-primary/40 transition-all">
                <Icon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-sm">{title}</p>
                <p className="text-xs text-muted-foreground mt-0.5 leading-snug">{description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
