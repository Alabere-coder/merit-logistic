export type ShipmentPricingInput = {
  weightKg: number;
  isFragile?: boolean;
  isExpress?: boolean;
};

export type PricingSettings = {
  currency: string;
  base_delivery_fee: number;
  price_per_kg: number;
  fragile_surcharge: number;
  express_delivery_fee: number;
  additional_service_fee: number;
  min_delivery_fee: number | null;
  max_delivery_fee: number | null;
};

export type ShipmentPricingResult = {
  currency: string;
  baseFee: number;
  weightFee: number;
  fragileFee: number;
  expressFee: number;
  additionalServiceFee: number;
  subtotal: number;
  deliveryFee: number;
};
