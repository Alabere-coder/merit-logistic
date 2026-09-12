import { cn } from "@/lib/utils";
import { STATUS_COLOR, STATUS_LABEL } from "@/lib/constants";
import type { ShipmentStatus } from "@/types/app";

// Helper map to extract clean visual themes for different card metrics
const CARD_THEMES: Record<
  string,
  {
    bg: string;
    iconBg: string;
    iconColor: string;
    border: string;
    badgeBg: string;
    badgeText: string;
  }
> = {
  "active shipments": {
    bg: "hover:border-blue-200/80 hover:bg-gradient-to-b hover:from-blue-50/20 hover:to-transparent",
    iconBg:
      "bg-blue-100/80 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-200",
    iconColor: "text-blue-600",
    border: "border-slate-200/80",
    badgeBg: "bg-blue-50/80",
    badgeText: "text-blue-700",
  },
  delivered: {
    bg: "hover:border-emerald-200/80 hover:bg-gradient-to-b hover:from-emerald-50/20 hover:to-transparent",
    iconBg:
      "bg-emerald-100/80 group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-200",
    iconColor: "text-emerald-600",
    border: "border-slate-200/80",
    badgeBg: "bg-emerald-50/80",
    badgeText: "text-emerald-700",
  },
  "total shipments": {
    bg: "hover:border-purple-200/80 hover:bg-gradient-to-b hover:from-purple-50/20 hover:to-transparent",
    iconBg:
      "bg-purple-100/80 group-hover:bg-purple-600 group-hover:text-white transition-colors duration-200",
    iconColor: "text-purple-600",
    border: "border-slate-200/80",
    badgeBg: "bg-purple-50/80",
    badgeText: "text-purple-700",
  },
  "total spent": {
    bg: "hover:border-amber-200/80 hover:bg-gradient-to-b hover:from-amber-50/20 hover:to-transparent",
    iconBg:
      "bg-amber-100/80 group-hover:bg-amber-500 group-hover:text-white transition-colors duration-200",
    iconColor: "text-amber-600",
    border: "border-slate-200/80",
    badgeBg: "bg-amber-50/80",
    badgeText: "text-amber-700",
  },
};

export function StatCard({
  label,
  value,
  icon: Icon,
  trend,
  trendType = "neutral",
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  trend?: string;
  trendType?: "positive" | "negative" | "neutral";
}) {
  const normalizedLabel = label.toLowerCase().trim();
  const theme = CARD_THEMES[normalizedLabel] || {
    bg: "hover:border-slate-300",
    iconBg:
      "bg-slate-100 group-hover:bg-cyan-600 group-hover:text-white transition-colors duration-200",
    iconColor: "text-cyan-600",
    border: "border-slate-200/80",
    badgeBg: "bg-slate-100",
    badgeText: "text-slate-700",
  };

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl border bg-white p-5 shadow-2xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md",
        theme.border,
        theme.bg,
      )}
    >
      <div className="flex items-center justify-between">
        {/* Dynamic Colorful Icon Frame */}
        <span
          className={cn(
            "flex h-11 w-11 items-center justify-center rounded-xl shadow-2xs",
            theme.iconBg,
            theme.iconColor,
          )}
        >
          <Icon className="h-5 w-5" />
        </span>

        {/* Dynamic Trend Pill */}
        {trend && (
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold tracking-tight shadow-2xs ring-1 ring-inset",
              trendType === "positive"
                ? "bg-emerald-50 text-emerald-700 ring-emerald-600/20"
                : trendType === "negative"
                  ? "bg-rose-50 text-rose-700 ring-rose-600/20"
                  : "bg-slate-100 text-slate-600 ring-slate-500/10",
            )}
          >
            {trend}
          </span>
        )}
      </div>

      <div className="mt-4 space-y-1">
        {/* Metric Value */}
        <p className="font-display text-2xl font-extrabold tracking-tight text-slate-900">
          {value}
        </p>

        {/* Metric Label */}
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          {label}
        </p>
      </div>
    </div>
  );
}

export function StatusBadge({ status }: { status: ShipmentStatus }) {
  const color =
    STATUS_COLOR[status] || "bg-slate-100 text-slate-700 border-slate-200";
  const label = STATUS_LABEL[status] || status;

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide shadow-2xs transition-all",
        color,
      )}
    >
      {label}
    </span>
  );
}
