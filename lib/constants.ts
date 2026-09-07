import type { ShipmentStatus, PackageType } from "@/types/app";

export const SHIPMENT_STATUS_FLOW: ShipmentStatus[] = [
  "pending",
  "approved",
  "picked_up",
  "in_transit",
  "arrived_at_warehouse",
  "out_for_delivery",
  "arrived_at_delivery_destination",
  "delivered",
];

export const STATUS_LABEL: Record<ShipmentStatus, string> = {
  pending: "Pending",
  approved: "Approved",
  picked_up: "Picked up",
  in_transit: "In transit",
  arrived_at_warehouse: "Arrived at warehouse",
  out_for_delivery: "Out for delivery",
  arrived_at_delivery_destination: " Arrived at delivery destination",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export const STATUS_COLOR: Record<ShipmentStatus, string> = {
  pending: "bg-slate-100 text-slate-700 border-slate-200",
  approved: "bg-blue-50 text-blue-700 border-blue-200",
  picked_up: "bg-indigo-50 text-indigo-700 border-indigo-200",
  in_transit: "bg-brand-50 text-brand-700 border-brand-200",
  arrived_at_warehouse: "bg-amber-50 text-amber-700 border-amber-200",
  out_for_delivery: "bg-brand-100 text-brand-800 border-brand-300",
  arrived_at_delivery_destination:
    "bg-brand-100 text-brand-900 border-brand-400",
  delivered: "bg-emerald-50 text-emerald-700 border-emerald-200",
  cancelled: "bg-red-50 text-red-700 border-red-200",
};

export const PACKAGE_TYPES: {
  value: PackageType;
  label: string;
  multiplier: number;
}[] = [
  { value: "document", label: "Document", multiplier: 1 },
  { value: "parcel", label: "Parcel", multiplier: 1.2 },
  { value: "fragile", label: "Fragile item", multiplier: 1.6 },
  { value: "electronics", label: "Electronics", multiplier: 1.8 },
  { value: "food", label: "Food / perishable", multiplier: 1.4 },
  { value: "other", label: "Other", multiplier: 1.3 },
];

export const BASE_FARE = 5.0;
export const PER_KG_RATE = 1.75;

export function estimateShippingCost(
  weightKg: number,
  packageType: PackageType,
) {
  const type =
    PACKAGE_TYPES.find((t) => t.value === packageType) ?? PACKAGE_TYPES[1];
  const raw = BASE_FARE + weightKg * PER_KG_RATE * type.multiplier;
  return Math.round(raw * 100) / 100;
}
