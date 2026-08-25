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
    <section id="track" className="bg-navy-50 py-20">
      <div className="container-lg">
        <div className="mx-auto max-w-2xl rounded-2xl border border-navy-100 bg-white p-8 text-center shadow-sm sm:p-12">
          <h2 className="font-display text-2xl font-700 text-navy-900 sm:text-3xl">
            Where's your shipment?
          </h2>
          <p className="mt-2 text-navy-500">Enter your tracking number for live status and delivery history.</p>

          <form onSubmit={handleSubmit} className="mx-auto mt-6 flex max-w-md flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-400" />
              <input
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="SS-2026-004821"
                className="h-12 w-full rounded-lg border border-navy-200 bg-white pl-10 pr-4 font-mono text-sm text-navy-800 placeholder:text-navy-300 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
              />
            </div>
            <Button type="submit" size="lg">Track</Button>
          </form>
        </div>
      </div>
    </section>
  );
}
