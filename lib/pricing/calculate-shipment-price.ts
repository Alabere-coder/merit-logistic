import { createAdminClient } from "@/lib/supabase/admin";

export type ShipmentPricingInput = {
  weightKg: number;
  isFragile?: boolean;
  isExpress?: boolean;
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

  /*
   * Pricing is calculated server-side using the admin client.
   *
   * Customers should never be able to modify pricing_settings.
   * The final price is calculated here rather than trusting
   * a price supplied by the browser.
   */
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
        max_delivery_fee
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

  const baseFee = Number(settings.base_delivery_fee);
  const pricePerKg = Number(settings.price_per_kg);

  const fragileFee = input.isFragile ? Number(settings.fragile_surcharge) : 0;

  const expressFee = input.isExpress
    ? Number(settings.express_delivery_fee)
    : 0;

  const additionalServiceFee = Number(settings.additional_service_fee);

  const weightFee = weightKg * pricePerKg;

  const subtotal =
    baseFee + weightFee + fragileFee + expressFee + additionalServiceFee;

  let deliveryFee = subtotal;

  if (
    settings.min_delivery_fee !== null &&
    deliveryFee < Number(settings.min_delivery_fee)
  ) {
    deliveryFee = Number(settings.min_delivery_fee);
  }

  if (
    settings.max_delivery_fee !== null &&
    deliveryFee > Number(settings.max_delivery_fee)
  ) {
    deliveryFee = Number(settings.max_delivery_fee);
  }

  /*
   * Round to two decimal places before storing the amount.
   */
  deliveryFee = Math.round((deliveryFee + Number.EPSILON) * 100) / 100;

  return {
    success: true,
    pricing: {
      currency: settings.currency,
      baseFee,
      weightFee,
      fragileFee,
      expressFee,
      additionalServiceFee,
      subtotal,
      deliveryFee,
    },
  };
}

// import { createClient } from "@/lib/supabase/server";

// export type ShipmentPricingInput = {
//   weightKg: number;
//   isFragile?: boolean;
//   isExpress?: boolean;
// };

// export type ShipmentPricingResult = {
//   currency: string;
//   baseFee: number;
//   weightFee: number;
//   fragileFee: number;
//   expressFee: number;
//   additionalServiceFee: number;
//   subtotal: number;
//   deliveryFee: number;
// };

// export async function calculateShipmentPrice(
//   input: ShipmentPricingInput,
// ): Promise<
//   | {
//       success: true;
//       pricing: ShipmentPricingResult;
//     }
//   | {
//       success: false;
//       error: string;
//     }
// > {
//   const weightKg = Number(input.weightKg);

//   if (!Number.isFinite(weightKg) || weightKg < 0) {
//     return {
//       success: false,
//       error: "Invalid shipment weight.",
//     };
//   }

//   const supabase = await createClient();

//   const { data: settings, error } = await supabase
//     .from("pricing_settings")
//     .select(
//       `
//         currency,
//         base_delivery_fee,
//         price_per_kg,
//         fragile_surcharge,
//         express_delivery_fee,
//         additional_service_fee,
//         min_delivery_fee,
//         max_delivery_fee
//       `,
//     )
//     .limit(1)
//     .maybeSingle();

//   if (error) {
//     console.error("GET PRICING SETTINGS ERROR:", error);

//     return {
//       success: false,
//       error: "Unable to load pricing settings.",
//     };
//   }

//   if (!settings) {
//     return {
//       success: false,
//       error: "Pricing settings have not been configured.",
//     };
//   }

//   const baseFee = Number(settings.base_delivery_fee);
//   const pricePerKg = Number(settings.price_per_kg);
//   const fragileFee = input.isFragile ? Number(settings.fragile_surcharge) : 0;
//   const expressFee = input.isExpress
//     ? Number(settings.express_delivery_fee)
//     : 0;
//   const additionalServiceFee = Number(settings.additional_service_fee);

//   const weightFee = weightKg * pricePerKg;

//   const subtotal =
//     baseFee + weightFee + fragileFee + expressFee + additionalServiceFee;

//   let deliveryFee = subtotal;

//   if (
//     settings.min_delivery_fee !== null &&
//     deliveryFee < Number(settings.min_delivery_fee)
//   ) {
//     deliveryFee = Number(settings.min_delivery_fee);
//   }

//   if (
//     settings.max_delivery_fee !== null &&
//     deliveryFee > Number(settings.max_delivery_fee)
//   ) {
//     deliveryFee = Number(settings.max_delivery_fee);
//   }

//   return {
//     success: true,
//     pricing: {
//       currency: settings.currency,
//       baseFee,
//       weightFee,
//       fragileFee,
//       expressFee,
//       additionalServiceFee,
//       subtotal,
//       deliveryFee,
//     },
//   };
// }
