export type UserRole = "customer" | "driver" | "admin";

export type ShipmentStatus =
  | "pending"
  | "approved"
  | "picked_up"
  | "in_transit"
  | "arrived_at_warehouse"
  | "out_for_delivery"
  | "delivered"
  | "cancelled";

export type DriverStatus = "active" | "inactive" | "suspended";

export type PaymentStatus =
  | "pending"
  | "paid"
  | "failed"
  | "refunded";

export type PaymentMethod =
  | "card"
  | "bank_transfer"
  | "wallet"
  | "cash_on_delivery";

export type PackageType =
  | "document"
  | "parcel"
  | "fragile"
  | "electronics"
  | "food"
  | "other";