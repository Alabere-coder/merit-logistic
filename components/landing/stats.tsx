const stats = [
  { value: "2.3M+", label: "Parcels delivered" },
  { value: "4,800", label: "Active drivers" },
  { value: "120+", label: "Cities covered" },
  { value: "98.4%", label: "On-time rate" },
];

export function Stats() {
  return (
    <section className="border-b border-navy-100 bg-white">
      <div className="container-lg grid grid-cols-2 divide-navy-100 py-12 sm:grid-cols-4 sm:divide-x">
        {stats.map((s, i) => (
          <div key={s.label} className={`px-6 text-center ${i > 1 ? "mt-8 sm:mt-0" : ""}`}>
            <div className="font-display text-3xl font-700 text-navy-900 sm:text-4xl">{s.value}</div>
            <div className="mt-1.5 text-sm text-navy-500">{s.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
