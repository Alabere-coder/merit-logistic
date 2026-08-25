"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const faqs = [
  {
    q: "How do I track my shipment?",
    a: "Enter your tracking number in the tracking section above, or log into your customer dashboard to see every shipment you've ever sent in one place.",
  },
  {
    q: "How is my shipping cost calculated?",
    a: "Cost is based on package weight and type — fragile and electronics items carry a higher handling multiplier. You'll see the exact price before you confirm a shipment.",
  },
  {
    q: "Can I change the delivery address after booking?",
    a: "Yes, as long as the shipment hasn't been picked up yet. Contact support or update it from your dashboard while the status still shows Pending or Approved.",
  },
  {
    q: "How do drivers get onboarded?",
    a: "Driver accounts are created directly by our operations team, who issue login credentials and verify vehicle and license details before activation.",
  },
  {
    q: "What happens if my package is damaged?",
    a: "Every shipment is insured. File a claim from your dashboard with photos, and our support team will resolve it within 3 business days.",
  },
];

export function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="py-20">
      <div className="container-lg">
        <div className="mx-auto max-w-xl text-center">
          <span className="font-mono text-xs font-semibold uppercase tracking-widest text-brand-600">FAQ</span>
          <h2 className="mt-3 font-display text-3xl font-700 text-navy-900">Questions, answered</h2>
        </div>

        <div className="mx-auto mt-10 max-w-2xl divide-y divide-navy-100 rounded-2xl border border-navy-100 bg-white">
          {faqs.map((f, i) => (
            <div key={f.q}>
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                aria-expanded={open === i}
              >
                <span className="font-medium text-navy-800">{f.q}</span>
                <ChevronDown className={cn("h-4.5 w-4.5 shrink-0 text-navy-400 transition-transform", open === i && "rotate-180")} />
              </button>
              <div className={cn("grid transition-all duration-200", open === i ? "grid-rows-[1fr] pb-5" : "grid-rows-[0fr]")}>
                <div className="overflow-hidden px-6">
                  <p className="text-sm leading-relaxed text-navy-500">{f.a}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
