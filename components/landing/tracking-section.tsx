"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export function TrackingSection() {
  const [value, setValue] = useState("");
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!value.trim()) return;
    router.push(`/track/${encodeURIComponent(value.trim())}`);
  }

  return (
    <section
      id="track"
      className="relative overflow-hidden bg-slate-950 py-24 border-y border-slate-800/80"
    >
      {/* Layered Decorative Background Effects */}
      <div className="route-dot-grid pointer-events-none absolute inset-0 opacity-15 mask-[radial-linear(ellipse_at_center,transparent_10%,black)]" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-100 w-150 rounded-full bg-amber-500/10 blur-[130px]" />

      <div className="container-lg relative z-10 px-4 sm:px-6">
        <div className="mx-auto max-w-2xl rounded-3xl border border-slate-800 bg-slate-900/90 p-8 text-center shadow-2xl backdrop-blur-xl sm:p-12 ring-1 ring-white/10">
          {/* Badge Indicator */}
          <span className="inline-flex items-center gap-2 rounded-full border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-400 mb-4">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
            Real-Time Tracking System
          </span>

          <h2 className="font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Where's your{" "}
            <span className="bg-linear-to-r from-amber-400 via-amber-200 to-amber-500 bg-clip-text text-transparent">
              shipment?
            </span>
          </h2>

          <p className="mt-3 text-sm text-slate-400 sm:text-base max-w-lg mx-auto">
            Enter your tracking number for live status updates, route location,
            and delivery history.
          </p>

          {/* Form Area */}
          <form
            onSubmit={handleSubmit}
            className="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row"
          >
            <div className="relative flex-1 group">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-300 transition-colors group-focus-within:text-amber-400" />
              <input
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="SS-2026-004821"
                className="h-12 w-full rounded-xl border border-slate-700/80 bg-slate-700 pl-10 pr-4 font-mono text-xs sm:text-sm text-slate-300 placeholder:text-slate-600 transition-all focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500/20 focus:bg-slate-600 shadow-inner"
              />
            </div>

            <Button
              type="submit"
              size="lg"
              className="h-12 px-6 font-semibold bg-linear-to-r from-amber-500 to-amber-600 text-slate-950 hover:from-amber-400 hover:to-amber-500 shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 transition-all duration-200"
            >
              Track Package
            </Button>
          </form>

          {/* Trust Micro-Text */}
          <p className="mt-4 text-[11px] text-slate-300">
            Supports Freight, Air Cargo, and Express Courier Reference IDs
          </p>
        </div>
      </div>
    </section>
  );
}
