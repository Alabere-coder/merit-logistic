import Link from "next/link";
import { ArrowRight, MapPin, Package } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="relative overflow-hidde min-h-[88vh]">
      <div className="route-dot-grid pointer-events-none absolute inset-0 opacity-[0.15]" />
      <div className="pointer-events-none absolute -top-40 right-[-10%] h-130 w-130 rounded-full bg-brand-500/20 blur-3xl" />

      <div
        className="absolute inset-0 bg-[url('/hero-logistics.jpg')] bg-cover bg-center"
        aria-hidden="true"
      />
      <div className="container-lg relative grid gap-16 py-20 lg:grid-cols-2 lg:items-center justify-center lg:py-28 ">
        <div className="animate-fade-up">
          <span className="inline-flex items-center gap-2 rounded-md border border-white/15 bg-white/6 px-3 py-2 font-mono text-[11px] font-medium tracking-[0.12em] text-slate-200 backdrop-blur-sm">
            <span className="h-2 w-2 rounded-full bg-cyan-500 animate-pulse-dot" />
            Live tracking · 60,000+ shipments/day
          </span>

          <h1 className="mt-7 max-w-3xl font-display text-5xl font-bold leading-[1.02] tracking-[-0.04em] text-white text-balance sm:text-6xl lg:text-[4.6rem]">
            Every shipment,
            <br />
            <span className="text-cyan-400">tracked to the door.</span>
          </h1>

          <p className="mt-7 max-w-xl text-base leading-7 text-slate-100 sm:text-lg">
            AMANAHPLUS moves parcels, documents, and freight across the city and
            across the country — with a dispatch, driver, and warehouse network
            you can watch move in real time.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Link href="/signup">
              <Button
                size="lg"
                className="group h-12 rounded-md bg-brand-500 px-6 font-semibold text-white shadow-lg shadow-brand-500/10 hover:bg-brand-400"
              >
                Ship a package
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <a href="#track">
              <Button
                size="lg"
                variant="outline"
                className="h-12 rounded-md border-white/20 bg-white/4 px-6 text-cyan-400 hover:bg-white/10 hover:text-white"
              >
                Track a shipment
              </Button>
            </a>
          </div>

          <div className="mt-12 flex flex-wrap gap-x-10 gap-y-5 border-t border-white/15 pt-7">
            {[
              ["4.9/5", "average driver rating"],
              ["120+", "cities served"],
              ["98.4%", "on-time delivery"],
            ].map(([stat, label]) => (
              <div key={label}>
                <div className="font-display text-2xl font-bold tracking-tight text-white">
                  {stat}
                </div>
                <div className="mt-1 text-xs uppercase tracking-widest text-cyan-400">
                  {label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Signature element: shipping-label card with animated route */}
        <div className="relative animate-fade-up [animation-delay:150ms]">
          <div className="relative mx-auto max-w-md rounded-2xl bg-white p-6 shadow-2xl shadow-black/40">
            <div className="flex items-center justify-between border-b border-dashed border-navy-200 pb-4">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wider text-navy-400">
                  Tracking number
                </p>
                <p className="font-mono text-lg font-semibold text-navy-900">
                  SS-2026-004821
                </p>
              </div>
              <span className="rounded-full bg-brand-100 px-3 py-1 text-xs font-semibold text-brand-700">
                In transit
              </span>
            </div>

            <div className="relative mt-6 pl-1">
              <svg viewBox="0 0 320 140" className="w-full" fill="none">
                <path
                  d="M20 110 C 90 20, 180 20, 300 40"
                  stroke="#E2E8F0"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray="1 12"
                />
                <path
                  d="M20 110 C 90 20, 180 20, 300 40"
                  stroke="#F97316"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray="1000"
                  strokeDashoffset="1000"
                  className="animate-route-travel"
                  pathLength={1000}
                />
                <circle cx="20" cy="110" r="6" fill="#0F172A" />
                <circle cx="300" cy="40" r="6" fill="#F97316" />
                <circle
                  cx="215"
                  cy="34"
                  r="5"
                  fill="#F97316"
                  className="animate-pulse-dot"
                />
              </svg>
              <div className="mt-1 flex items-center justify-between text-xs font-medium text-navy-500">
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" /> Origin hub
                </span>
                <span className="flex items-center gap-1">
                  Destination <Package className="h-3.5 w-3.5" />
                </span>
              </div>
            </div>

            <div className="mt-6 space-y-3 border-t border-dashed border-navy-200 pt-5">
              {[
                ["Picked up", "Aug 15, 9:12 AM", true],
                ["Arrived at warehouse", "Aug 15, 4:47 PM", true],
                ["Out for delivery", "Aug 16, 8:03 AM", true],
                ["Delivered", "Estimated Aug 16, 5:30 PM", false],
              ].map(([label, time, done]) => (
                <div
                  key={label as string}
                  className="flex items-center gap-3 text-sm"
                >
                  <span
                    className={`h-2 w-2 rounded-full ${done ? "bg-cyan-400" : "bg-navy-200"}`}
                  />
                  <span
                    className={`flex-1 ${done ? "text-navy-800" : "text-navy-400"}`}
                  >
                    {label}
                  </span>
                  <span className="font-mono text-xs text-navy-400">
                    {time}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
