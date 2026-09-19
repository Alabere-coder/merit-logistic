import { createAdminClient } from "@/lib/supabase/admin";

import { calculateShipmentPriceFromSettings } from "./calculate-shipment-price";

import type {
  PricingSettings,
  ShipmentPricingInput,
  ShipmentPricingResult,
} from "./pricing-types";

export async function getPricingSettings(): Promise<
  | {
      success: true;
      settings: PricingSettings;
    }
  | {
      success: false;
      error: string;
    }
> {
  const supabase = createAdminClient();

  const { data: settings, error } = await supabase
    .from("pricing_settings")
    .select(
      `
      currency,
      base_delivery_fee,
      price_per_kg,
      fragile_surcharge,
      express_delivery_fee,
      additional_service_fee,
      min_delivery_fee,
      max_delivery_fee,
      driver_payout_rate
    `,
    )
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("GET PRICING SETTINGS ERROR:", error);

    return {
      success: false,
      error: "Unable to load pricing settings.",
    };
  }

  if (!settings) {
    return {
      success: false,
      error: "Pricing settings have not been configured.",
    };
  }

  return {
    success: true,
    settings: {
      currency: settings.currency,
      base_delivery_fee: Number(settings.base_delivery_fee),
      price_per_kg: Number(settings.price_per_kg),
      fragile_surcharge: Number(settings.fragile_surcharge),
      express_delivery_fee: Number(settings.express_delivery_fee),
      additional_service_fee: Number(settings.additional_service_fee),
      min_delivery_fee:
        settings.min_delivery_fee === null
          ? null
          : Number(settings.min_delivery_fee),
      max_delivery_fee:
        settings.max_delivery_fee === null
          ? null
          : Number(settings.max_delivery_fee),
      driver_payout_rate: Number(settings.driver_payout_rate),
    },
  };
}

export async function calculateShipmentPrice(
  input: ShipmentPricingInput,
): Promise<
  | {
      success: true;
      pricing: ShipmentPricingResult;
    }
  | {
      success: false;
      error: string;
    }
> {
  const weightKg = Number(input.weightKg);

  if (!Number.isFinite(weightKg) || weightKg < 0) {
    return {
      success: false,
      error: "Invalid shipment weight.",
    };
  }

  const pricingSettingsResult = await getPricingSettings();

  if (!pricingSettingsResult.success) {
    return pricingSettingsResult;
  }

  const pricing = calculateShipmentPriceFromSettings(
    pricingSettingsResult.settings,
    {
      ...input,
      weightKg,
    },
  );

  return {
    success: true,
    pricing,
  };
}
