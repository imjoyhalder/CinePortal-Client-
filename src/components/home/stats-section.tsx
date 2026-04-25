import { FiFilm, FiMessageSquare, FiUsers, FiStar } from "react-icons/fi";

const stats = [
  { icon: FiFilm, value: "10K+", label: "Movies & TV Shows" },
  { icon: FiMessageSquare, value: "50K+", label: "Reviews" },
  { icon: FiUsers, value: "25K+", label: "Members" },
  { icon: FiStar, value: "4.8/5", label: "Community Rating" },
];

export default function StatsSection() {
  return (
    <section className="bg-card border-y border-border/40">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4">
          {stats.map(({ icon: Icon, value, label }, i) => (
            <div
              key={label}
              className={`flex items-center gap-4 px-6 py-8 ${
                i < stats.length - 1 ? "border-r border-border/40" : ""
              }`}
            >
              <div className="w-12 h-12 rounded-full border border-primary/30 bg-primary/10 flex items-center justify-center shrink-0">
                <Icon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold leading-none">{value}</p>
                <p className="text-xs text-muted-foreground mt-1">{label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
