"use client";

import { FormEvent, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Search, Loader2 } from "lucide-react";
import { toast } from "sonner";

export function TrackingSearchForm() {
  const router = useRouter();
  const [trackingNumber, setTrackingNumber] = useState("");
  const [pending, startTransition] = useTransition();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const value = trackingNumber.trim();

    if (!value) {
      toast.error("Enter a tracking number.");
      return;
    }

    startTransition(() => {
      router.push(`/customer/track/${encodeURIComponent(value)}`);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

        <input
          type="text"
          value={trackingNumber}
          onChange={(event) => setTrackingNumber(event.target.value)}
          placeholder="Enter tracking number"
          className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
          disabled={pending}
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-brand-600 px-5 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Searching...
          </>
        ) : (
          <>
            <Search className="h-4 w-4" />
            Track Shipment
          </>
        )}
      </button>
    </form>
  );
}
