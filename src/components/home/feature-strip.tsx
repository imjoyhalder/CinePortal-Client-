import { FiCompass, FiStar, FiUsers, FiBookmark } from "react-icons/fi";

const features = [
  {
    icon: FiCompass,
    title: "Discover",
    description: "Find your next favorite film",
  },
  {
    icon: FiStar,
    title: "Rate & Review",
    description: "Share honest ratings and reviews",
  },
  {
    icon: FiUsers,
    title: "Join Community",
    description: "Connect with fellow film lovers",
  },
  {
    icon: FiBookmark,
    title: "Track Watchlist",
    description: "Save, organize and track what to watch",
  },
];

export default function FeatureStrip() {
  return (
    <section className="bg-card border-y border-border/40">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4">
          {features.map(({ icon: Icon, title, description }, i) => (
            <div
              key={title}
              className={`flex items-center gap-4 px-6 py-6 ${
                i < features.length - 1 ? "border-r border-border/40" : ""
              }`}
            >
              <div className="w-11 h-11 rounded-full border border-primary/30 bg-primary/10 flex items-center justify-center shrink-0">
                <Icon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-sm">{title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
