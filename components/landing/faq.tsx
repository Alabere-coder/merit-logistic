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
    <section
      id="faq"
      className="relative overflow-hidden bg-slate-950 py-24 border-t border-slate-800/80"
    >
      {/* Ambient Background Glow */}
      <div className="pointer-events-none absolute left-1/2 top-1/3 -translate-x-1/2 h-87.5 w-125 rounded-full bg-amber-500/10 blur-[130px]" />

      <div className="container-lg relative z-10 px-4 sm:px-6">
        {/* Section Header */}
        <div className="mx-auto max-w-xl text-center space-y-3">
          <span className="inline-flex items-center gap-2 rounded-full bg-amber-500/10 px-3 py-1 text-[14px] font-mono font-semibold uppercase tracking-widest text-amber-400">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
            FAQ
          </span>
          <h2 className="font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Questions,{" "}
            <span className="bg-linear-to-r from-amber-400 via-amber-200 to-amber-500 bg-clip-text text-transparent">
              answered.
            </span>
          </h2>
          <p className="text-sm text-slate-400">
            Everything you need to know about our enterprise PLUS platform.
          </p>
        </div>

        {/* Accordion List */}
        <div className="mx-auto mt-12 max-w-2xl divide-y divide-slate-800/80 rounded-3xl border border-slate-800 bg-slate-900/60 shadow-2xl backdrop-blur-xl ring-1 ring-white/5 overflow-hidden">
          {faqs.map((f, i) => {
            const isOpen = open === i;
            return (
              <div
                key={f.q}
                className={cn(
                  "transition-colors duration-200",
                  isOpen ? "bg-slate-800/30" : "hover:bg-slate-800/20",
                )}
              >
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/50"
                  aria-expanded={isOpen}
                >
                  <span
                    className={cn(
                      "font-medium transition-colors text-sm sm:text-base",
                      isOpen
                        ? "text-amber-400 font-semibold"
                        : "text-slate-200 group-hover:text-white",
                    )}
                  >
                    {f.q}
                  </span>

                  {/* Animated Plus / Chevron Circle */}
                  <span
                    className={cn(
                      "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition-all duration-300",
                      isOpen
                        ? "border-amber-500/40 bg-amber-500/10 text-amber-400 rotate-180"
                        : "border-slate-700 bg-slate-900 text-slate-400",
                    )}
                  >
                    <ChevronDown className="h-4 w-4 stroke-[2.2]" />
                  </span>
                </button>

                {/* Accordion Content Smooth Transition */}
                <div
                  className={cn(
                    "grid transition-all duration-300 ease-in-out",
                    isOpen
                      ? "grid-rows-[1fr] opacity-100 pb-5"
                      : "grid-rows-[0fr] opacity-0",
                  )}
                >
                  <div className="overflow-hidden px-6">
                    <p className="text-sm leading-relaxed text-slate-400 border-t border-slate-800/60 pt-4">
                      {f.a}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
