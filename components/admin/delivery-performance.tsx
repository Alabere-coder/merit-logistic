import { Clock3, CheckCircle2, Truck, XCircle } from "lucide-react";

type DeliveryPerformanceProps = {
  data: {
    total: number;
    delivered: number;
    active: number;
    cancelled: number;
    deliveryRate: number;
    averageDeliveryTimeHours: number;
  };
};

export function DeliveryPerformance({ data }: DeliveryPerformanceProps) {
  const metrics = [
    {
      label: "Total Deliveries",
      value: data.total.toLocaleString(),
      icon: Truck,
    },
    {
      label: "Delivered",
      value: data.delivered.toLocaleString(),
      icon: CheckCircle2,
    },
    {
      label: "Active Deliveries",
      value: data.active.toLocaleString(),
      icon: Truck,
    },
    {
      label: "Delivery Rate",
      value: `${data.deliveryRate}%`,
      icon: CheckCircle2,
    },
    {
      label: "Cancelled",
      value: data.cancelled.toLocaleString(),
      icon: XCircle,
    },
    {
      label: "Average Delivery Time",
      value: `${data.averageDeliveryTimeHours} hours`,
      icon: Clock3,
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {metrics.map((metric) => {
        const Icon = metric.icon;

        return (
          <div
            key={metric.label}
            className="rounded-2xl border border-slate-200 bg-slate-50/50 p-5"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm">
              <Icon className="h-5 w-5 text-cyan-600" />
            </div>

            <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
              {metric.label}
            </p>

            <p className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
              {metric.value}
            </p>
          </div>
        );
      })}
    </div>
  );
}
