"use server";

import { revalidatePath } from "next/cache";

import { requireRole } from "@/lib/auth/require-role";
import { createClient } from "@/lib/supabase/server";

type PricingActionState = {
  success?: string;
  error?: string;
};

function parseMoney(value: FormDataEntryValue | null, fieldName: string) {
  const number = Number(value);

  if (!Number.isFinite(number) || number < 0) {
    throw new Error(`${fieldName} must be a valid amount.`);
  }

  return number;
}

export async function updatePricingSettings(
  _prevState: PricingActionState,
  formData: FormData,
): Promise<PricingActionState> {
  const { user } = await requireRole(["admin"]);

  const supabase = await createClient();

  try {
    const currency = String(formData.get("currency") ?? "")
      .trim()
      .toUpperCase();

    if (!currency) {
      return {
        error: "Please select a currency.",
      };
    }

    if (currency.length > 10) {
      return {
        error: "Currency code is invalid.",
      };
    }

    const baseDeliveryFee = parseMoney(
      formData.get("baseDeliveryFee"),
      "Base delivery fee",
    );

    const pricePerKg = parseMoney(formData.get("pricePerKg"), "Price per kg");

    const fragileSurcharge = parseMoney(
      formData.get("fragileSurcharge"),
      "Fragile surcharge",
    );

    const expressDeliveryFee = parseMoney(
      formData.get("expressDeliveryFee"),
      "Express delivery fee",
    );

    const additionalServiceFee = parseMoney(
      formData.get("additionalServiceFee"),
      "Additional service fee",
    );

    const minDeliveryFee = parseMoney(
      formData.get("minDeliveryFee"),
      "Minimum delivery fee",
    );

    const maxDeliveryFeeRaw = formData.get("maxDeliveryFee");

    const maxDeliveryFee =
      maxDeliveryFeeRaw === null || String(maxDeliveryFeeRaw).trim() === ""
        ? null
        : parseMoney(maxDeliveryFeeRaw, "Maximum delivery fee");

    if (maxDeliveryFee !== null && maxDeliveryFee < minDeliveryFee) {
      return {
        error:
          "Maximum delivery fee cannot be lower than the minimum delivery fee.",
      };
    }

    const { data: existing, error: existingError } = await supabase
      .from("pricing_settings")
      .select("id")
      .limit(1)
      .maybeSingle();

    if (existingError) {
      console.error("GET PRICING SETTINGS ERROR:", existingError);

      return {
        error: "Unable to load pricing configuration.",
      };
    }

    const pricingData = {
      currency,
      base_delivery_fee: baseDeliveryFee,
      price_per_kg: pricePerKg,
      fragile_surcharge: fragileSurcharge,
      express_delivery_fee: expressDeliveryFee,
      additional_service_fee: additionalServiceFee,
      min_delivery_fee: minDeliveryFee,
      max_delivery_fee: maxDeliveryFee,
      updated_by: user.id,
      updated_at: new Date().toISOString(),
    };

    if (existing) {
      const { error: updateError } = await supabase
        .from("pricing_settings")
        .update(pricingData)
        .eq("id", existing.id);

      if (updateError) {
        console.error("UPDATE PRICING SETTINGS ERROR:", updateError);

        return {
          error: "Unable to update pricing settings.",
        };
      }
    } else {
      const { error: insertError } = await supabase
        .from("pricing_settings")
        .insert({
          ...pricingData,
          created_by: user.id,
        });

      if (insertError) {
        console.error("CREATE PRICING SETTINGS ERROR:", insertError);

        return {
          error: "Unable to create pricing settings.",
        };
      }
    }

    revalidatePath("/admin/pricing");
    revalidatePath("/admin/settings");

    return {
      success: "Pricing settings updated successfully.",
    };
  } catch (error) {
    console.error("PRICING SETTINGS ACTION ERROR:", error);

    return {
      error:
        error instanceof Error
          ? error.message
          : "Unable to update pricing settings.",
    };
  }
}
