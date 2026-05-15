const stats = [
  { value: "10K+",  label: "Movies & Series" },
  { value: "50K+",  label: "Reviews Written" },
  { value: "25K+",  label: "Active Members" },
  { value: "4.8",   label: "Avg. Rating" },
];

export default function StatsSection() {
  return (
    <section className="py-10 bg-primary/5 border-y border-primary/10">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map(({ value, label }) => (
            <div key={label} className="space-y-1">
              <p className="text-4xl md:text-5xl font-extrabold text-primary tracking-tight">{value}</p>
              <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
