"use client";

import { useTransition } from "react";
import { assignDriverToShipment } from "@/lib/actions/admin-drivers";
import { toast } from "sonner";
import { Loader2, ChevronDown, UserCheck } from "lucide-react";

export function AssignDriverSelect({
  shipmentId,
  currentDriverId,
  drivers,
}: {
  shipmentId: string;
  currentDriverId: string | null;
  drivers: { id: string; name: string }[];
}) {
  const [pending, startTransition] = useTransition();

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const driverId = e.target.value;
    if (!driverId) return;
    startTransition(async () => {
      const res = await assignDriverToShipment(shipmentId, driverId);
      if (res?.error) toast.error(res.error);
      else toast.success("Driver assigned.");
    });
  }

  const isAssigned = Boolean(currentDriverId);

  return (
    <div className="relative inline-flex items-center min-w-35 rounded-lg border bg-white text-navy-800 shadow-2xs outline-none transition-all disabled:cursor-not-allowed disabled:opacity-70">
      <select
        defaultValue={currentDriverId ?? ""}
        onChange={handleChange}
        disabled={pending}
        className={`h-8 w-full appearance-none rounded-lg border pl-2.5 pr-8 text-xs font-semibold shadow-2xs outline-none transition-all cursor-pointer disabled:cursor-not-allowed disabled:opacity-70 ${
          isAssigned
            ? "border-emerald-200 bg-emerald-50/50 text-emerald-900 hover:border-emerald-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15"
            : "border-navy-200/90 bg-white text-navy-800 hover:border-navy-300 focus:border-navy-600 focus:ring-2 focus:ring-navy-600/15"
        }`}
      >
        <option value="" disabled className="text-navy-400 font-normal">
          {pending ? "Assigning..." : "Assign driver..."}
        </option>
        {drivers.map((d) => (
          <option
            key={d.id}
            value={d.id}
            className="text-navy-900 font-medium py-1"
          >
            {d.name}
          </option>
        ))}
      </select>

      {/* Right Icon State: Loading vs Assigned vs Default Arrow */}
      <div className="pointer-events-none absolute right-2.5 flex items-center justify-center">
        {pending ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin text-navy-500" />
        ) : isAssigned ? (
          <UserCheck className="h-3.5 w-3.5 text-emerald-600" />
        ) : (
          <ChevronDown className="h-3.5 w-3.5 text-navy-400" />
        )}
      </div>
    </div>
  );
}
