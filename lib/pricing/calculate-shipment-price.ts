import type {
  PricingSettings,
  ShipmentPricingInput,
  ShipmentPricingResult,
} from "./pricing-types";

export function calculateShipmentPriceFromSettings(
  settings: PricingSettings,
  input: ShipmentPricingInput,
): ShipmentPricingResult {
  const weightKg = Number(input.weightKg);

  const baseFee = settings.base_delivery_fee;
  const pricePerKg = settings.price_per_kg;

  const fragileFee = input.isFragile ? settings.fragile_surcharge : 0;

  const expressFee = input.isExpress ? settings.express_delivery_fee : 0;

  const additionalServiceFee = settings.additional_service_fee;

  const weightFee = weightKg * pricePerKg;

  const subtotal =
    baseFee + weightFee + fragileFee + expressFee + additionalServiceFee;

  let deliveryFee = subtotal;

  if (
    settings.min_delivery_fee !== null &&
    deliveryFee < settings.min_delivery_fee
  ) {
    deliveryFee = settings.min_delivery_fee;
  }

  if (
    settings.max_delivery_fee !== null &&
    deliveryFee > settings.max_delivery_fee
  ) {
    deliveryFee = settings.max_delivery_fee;
  }

  deliveryFee = Math.round((deliveryFee + Number.EPSILON) * 100) / 100;

  return {
    currency: settings.currency,
    baseFee,
    weightFee,
    fragileFee,
    expressFee,
    additionalServiceFee,
    subtotal,
    deliveryFee,
  };
}
