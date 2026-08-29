"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

const periods = [
  { value: "all", label: "All time" },
  { value: "today", label: "Today" },
  { value: "7days", label: "Last 7 days" },
  { value: "30days", label: "Last 30 days" },
  { value: "3months", label: "Last 3 months" },
  { value: "year", label: "This year" },
];

export function ReportPeriodFilter({
  currentPeriod,
}: {
  currentPeriod: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function handleChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());

    if (value === "all") {
      params.delete("period");
    } else {
      params.set("period", value);
    }

    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <select
      value={currentPeriod}
      onChange={(event) => handleChange(event.target.value)}
      className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
    >
      {periods.map((period) => (
        <option key={period.value} value={period.value}>
          {period.label}
        </option>
      ))}
    </select>
  );
}
