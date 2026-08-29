type DriverPerformance = {
  driverId: string;
  driverName: string;
  totalShipments: number;
  deliveredShipments: number;
  failedShipments: number;
  successRate: number;
};

export function DriverPerformanceTable({
  data,
}: {
  data: DriverPerformance[];
}) {
  if (data.length === 0) {
    return (
      <div className="flex min-h-40 items-center justify-center rounded-xl border border-dashed border-slate-200">
        <p className="text-sm text-slate-500">
          No driver performance data available yet.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-162.5 text-left">
        <thead>
          <tr className="border-b border-slate-200">
            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
              Driver
            </th>

            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
              Shipments
            </th>

            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
              Delivered
            </th>

            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
              Failed
            </th>

            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
              Success Rate
            </th>
          </tr>
        </thead>

        <tbody>
          {data.map((driver) => (
            <tr
              key={driver.driverId}
              className="border-b border-slate-100 last:border-0"
            >
              <td className="px-4 py-4 text-sm font-semibold text-slate-900">
                {driver.driverName}
              </td>

              <td className="px-4 py-4 text-sm text-slate-600">
                {driver.totalShipments.toLocaleString()}
              </td>

              <td className="px-4 py-4 text-sm font-medium text-emerald-600">
                {driver.deliveredShipments.toLocaleString()}
              </td>

              <td className="px-4 py-4 text-sm font-medium text-rose-600">
                {driver.failedShipments.toLocaleString()}
              </td>

              <td className="px-4 py-4">
                <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                  {driver.successRate}%
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
