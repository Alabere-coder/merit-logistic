"use client";

import dynamic from "next/dynamic";

import type { ComponentProps } from "react";

const TrackingMapInner = dynamic(
  () =>
    import("./tracking-map-inner").then((module) => module.TrackingMapInner),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-105 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-500">
        Loading map...
      </div>
    ),
  },
);

export function TrackingMap(props: ComponentProps<typeof TrackingMapInner>) {
  return <TrackingMapInner {...props} />;
}
