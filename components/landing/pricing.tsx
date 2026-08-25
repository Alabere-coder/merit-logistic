import { Check } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const plans = [
  {
    name: "Pay as you go",
    price: "From $5.75",
    unit: "per parcel",
    features: ["No monthly fee", "Standard tracking", "Email notifications", "Up to 5kg parcels"],
    highlighted: false,
  },
  {
    name: "Business",
    price: "$149",
    unit: "per month",
    features: ["50 shipments included", "Priority dispatch", "Real-time SMS alerts", "Dedicated account manager", "API access"],
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    unit: "volume pricing",
    features: ["Unlimited shipments", "Dedicated fleet options", "Custom SLAs", "Warehousing included", "24/7 support line"],
    highlighted: false,
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="bg-navy-50 py-20">
      <div className="container-lg">
        <div className="mx-auto max-w-xl text-center">
          <span className="font-mono text-xs font-semibold uppercase tracking-widest text-brand-600">Pricing</span>
          <h2 className="mt-3 font-display text-3xl font-700 text-navy-900">Simple pricing, no surprises</h2>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {plans.map((p) => (
            <div
              key={p.name}
              className={cn(
                "rounded-2xl border p-8",
                p.highlighted
                  ? "border-brand-500 bg-navy-900 text-white shadow-xl shadow-brand-500/10"
                  : "border-navy-100 bg-white"
              )}
            >
              {p.highlighted && (
                <span className="mb-4 inline-block rounded-full bg-brand-500 px-3 py-1 text-xs font-semibold text-white">
                  Most popular
                </span>
              )}
              <h3 className={cn("font-display text-lg font-600", p.highlighted ? "text-white" : "text-navy-900")}>{p.name}</h3>
              <div className="mt-3 flex items-baseline gap-1.5">
                <span className={cn("font-display text-3xl font-700", p.highlighted ? "text-white" : "text-navy-900")}>{p.price}</span>
                <span className={cn("text-sm", p.highlighted ? "text-navy-300" : "text-navy-400")}>{p.unit}</span>
              </div>

              <ul className="mt-6 space-y-3">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm">
                    <Check className={cn("mt-0.5 h-4 w-4 shrink-0", p.highlighted ? "text-brand-500" : "text-brand-600")} />
                    <span className={p.highlighted ? "text-navy-200" : "text-navy-600"}>{f}</span>
                  </li>
                ))}
              </ul>

              <Link href="/signup" className="mt-8 block">
                <Button variant={p.highlighted ? "primary" : "outline"} className="w-full">
                  Get started
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
