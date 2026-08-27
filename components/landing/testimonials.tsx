import { Star } from "lucide-react";

const testimonials = [
  {
    quote:
      "We switched our entire fulfillment to SwiftShip last year. Same-day delivery inside the metro area has genuinely changed how our customers shop with us.",
    name: "Amara Chukwu",
    role: "Ops Lead, Lagos Home Goods",
  },
  {
    quote:
      "The tracking page is the first thing our support team pulls up. It cuts 'where's my order' tickets down to almost nothing.",
    name: "Daniel Osei",
    role: "Founder, Osei & Co.",
  },
  {
    quote:
      "Driver assignment used to be a spreadsheet nightmare. Now dispatch just watches the map and taps to assign.",
    name: "Grace Adebayo",
    role: "Logistics Manager, Meridian Retail",
  },
];

export function Testimonials() {
  return (
    <section className="bg-navy-900 py-20">
      <div className="container-lg">
        <div className="mx-auto max-w-xl text-center">
          <span className="font-mono text-xs font-semibold uppercase tracking-widest text-brand-500">
            Testimonials
          </span>
          <h2 className="mt-3 font-display text-3xl font-700 text-white">
            Trusted by teams who ship daily
          </h2>
        </div>

        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          {testimonials.map((t) => (
            <figure
              key={t.name}
              className="rounded-2xl border border-white/10 bg-white/3 p-6"
            >
              <div className="flex gap-0.5 text-brand-500">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-current" />
                ))}
              </div>
              <blockquote className="mt-4 text-sm leading-relaxed text-white">
                "{t.quote}"
              </blockquote>
              <figcaption className="mt-5 border-t border-white/10 pt-4">
                <div className="text-sm font-semibold text-white">{t.name}</div>
                <div className="text-xs text-brand-500">{t.role}</div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
