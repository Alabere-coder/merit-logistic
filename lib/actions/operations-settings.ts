"use server";

import { revalidatePath } from "next/cache";

import { requireRole } from "@/lib/auth/require-role";
import { createClient } from "@/lib/supabase/server";

export type OperationsSettingsState = {
  success?: string;
  error?: string;
};

export async function updateOperationsSettings(
  _previousState: OperationsSettingsState,
  formData: FormData,
): Promise<OperationsSettingsState> {
  try {
    /* =====================================================
       ADMIN AUTHORIZATION
    ====================================================== */

    const { user } = await requireRole(["admin"]);

    const supabase = await createClient();

    /* =====================================================
       READ FORM VALUES
    ====================================================== */

    const defaultDeliveryDays = Number(formData.get("defaultDeliveryDays"));

    const maxDeliveryDays = Number(formData.get("maxDeliveryDays"));

    const shipmentExpiryDays = Number(formData.get("shipmentExpiryDays"));

    const supportResponseHours = Number(formData.get("supportResponseHours"));

    const deliveryInstructions = formData.get("deliveryInstructions");

    /* =====================================================
       VALIDATE NUMBERS
    ====================================================== */

    if (
      !Number.isInteger(defaultDeliveryDays) ||
      defaultDeliveryDays < 1 ||
      defaultDeliveryDays > 30
    ) {
      return {
        error: "Default delivery days must be between 1 and 30.",
      };
    }

    if (
      !Number.isInteger(maxDeliveryDays) ||
      maxDeliveryDays < 1 ||
      maxDeliveryDays > 60
    ) {
      return {
        error: "Maximum delivery days must be between 1 and 60.",
      };
    }

    if (maxDeliveryDays < defaultDeliveryDays) {
      return {
        error:
          "Maximum delivery days cannot be less than default delivery days.",
      };
    }

    if (
      !Number.isInteger(shipmentExpiryDays) ||
      shipmentExpiryDays < 1 ||
      shipmentExpiryDays > 365
    ) {
      return {
        error: "Shipment expiry must be between 1 and 365 days.",
      };
    }

    if (
      !Number.isInteger(supportResponseHours) ||
      supportResponseHours < 1 ||
      supportResponseHours > 168
    ) {
      return {
        error: "Support response time must be between 1 and 168 hours.",
      };
    }

    /* =====================================================
       VALIDATE DELIVERY INSTRUCTIONS
    ====================================================== */

    if (
      deliveryInstructions !== null &&
      typeof deliveryInstructions !== "string"
    ) {
      return {
        error: "Invalid delivery instructions.",
      };
    }

    const cleanedInstructions =
      typeof deliveryInstructions === "string" && deliveryInstructions.trim()
        ? deliveryInstructions.trim()
        : null;

    if (cleanedInstructions && cleanedInstructions.length > 2000) {
      return {
        error: "Delivery instructions must be 2000 characters or less.",
      };
    }

    /* =====================================================
       CHECK EXISTING SETTINGS
    ====================================================== */

    const { data: existingSettings, error: fetchError } = await supabase
      .from("operations_settings")
      .select("id")
      .limit(1)
      .maybeSingle();

    if (fetchError) {
      console.error("GET OPERATIONS SETTINGS ERROR:", fetchError);

      return {
        error: fetchError.message ?? "Unable to load operations settings.",
      };
    }

    /* =====================================================
       SETTINGS DATA
    ====================================================== */

    const settingsData = {
      default_delivery_days: defaultDeliveryDays,
      max_delivery_days: maxDeliveryDays,
      shipment_expiry_days: shipmentExpiryDays,
      support_response_hours: supportResponseHours,
      delivery_instructions: cleanedInstructions,
      updated_by: user.id,
      updated_at: new Date().toISOString(),
    };

    /* =====================================================
       UPDATE EXISTING SETTINGS
    ====================================================== */

    if (existingSettings?.id) {
      const { error: updateError } = await supabase
        .from("operations_settings")
        .update(settingsData)
        .eq("id", existingSettings.id);

      if (updateError) {
        console.error("UPDATE OPERATIONS SETTINGS ERROR:", updateError);

        return {
          error: updateError.message ?? "Unable to update operations settings.",
        };
      }
    } else {

    /* =====================================================
       CREATE SETTINGS IF NONE EXIST
    ====================================================== */
      const { error: insertError } = await supabase
        .from("operations_settings")
        .insert({
          ...settingsData,
          created_by: user.id,
        });

      if (insertError) {
        console.error("CREATE OPERATIONS SETTINGS ERROR:", insertError);

        return {
          error: insertError.message ?? "Unable to create operations settings.",
        };
      }
    }

    /* =====================================================
       REFRESH ADMIN SETTINGS PAGE
    ====================================================== */

    revalidatePath("/admin/settings");

    return {
      success: "Operations settings updated successfully.",
    };
  } catch (error) {
    console.error("UPDATE OPERATIONS SETTINGS ERROR:", error);

    return {
      error: "Unable to update operations settings. Please try again.",
    };
  }
}
