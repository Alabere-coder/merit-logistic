import {
  LifeBuoy,
  CircleDot,
  Clock3,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

type SupportStatsProps = {
  total: number;
  open: number;
  inProgress: number;
  resolved: number;
  highPriority: number;
};

export function SupportStats({
  total,
  open,
  inProgress,
  resolved,
  highPriority,
}: SupportStatsProps) {
  const stats = [
    {
      label: "Total Tickets",
      value: total,
      icon: LifeBuoy,
    },
    {
      label: "Open",
      value: open,
      icon: CircleDot,
    },
    {
      label: "In Progress",
      value: inProgress,
      icon: Clock3,
    },
    {
      label: "Resolved",
      value: resolved,
      icon: CheckCircle2,
    },
    {
      label: "High Priority",
      value: highPriority,
      icon: AlertTriangle,
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
      {stats.map((stat) => {
        const Icon = stat.icon;

        return (
          <div
            key={stat.label}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
              <Icon className="h-5 w-5 text-cyan-600" />
            </div>

            <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
              {stat.label}
            </p>

            <p className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
              {stat.value.toLocaleString()}
            </p>
          </div>
        );
      })}
    </div>
  );
}
