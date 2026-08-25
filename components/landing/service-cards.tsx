import { Truck, Warehouse, Zap, Globe2, ShieldCheck, PackageCheck } from "lucide-react";

const services = [
  { icon: Zap, title: "Same-day delivery", desc: "Local pickup and drop-off within city limits, usually inside 4 hours." },
  { icon: Truck, title: "Freight & bulk", desc: "Pallet and multi-parcel freight with dedicated route planning." },
  { icon: Warehouse, title: "Warehousing", desc: "Short-term storage and cross-docking at 40+ regional hubs." },
  { icon: Globe2, title: "Nationwide network", desc: "Door-to-door coverage across 120+ cities and growing." },
  { icon: ShieldCheck, title: "Insured shipping", desc: "Every parcel is covered against loss or damage in transit." },
  { icon: PackageCheck, title: "Proof of delivery", desc: "Photo confirmation and signature capture on every drop-off." },
];

export function ServiceCards() {
  return (
    <section id="services" className="py-20">
      <div className="container-lg">
        <div className="mx-auto max-w-xl text-center">
          <span className="font-mono text-xs font-semibold uppercase tracking-widest text-brand-600">Services</span>
          <h2 className="mt-3 font-display text-3xl font-700 text-navy-900">Built for how you actually ship</h2>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s) => (
            <div key={s.title} className="group rounded-2xl border border-navy-100 bg-white p-6 transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-navy-900/5">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-navy-900 text-brand-500 transition-colors group-hover:bg-brand-500 group-hover:text-white">
                <s.icon className="h-5 w-5" strokeWidth={2} />
              </div>
              <h3 className="mt-4 font-display text-lg font-600 text-navy-900">{s.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-navy-500">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
