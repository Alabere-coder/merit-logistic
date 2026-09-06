"use server";

import { revalidatePath } from "next/cache";

import { requireRole } from "@/lib/auth/require-role";
import { createClient } from "@/lib/supabase/server";

/* =========================================================
   TYPES
========================================================= */

export type CommunicationActionState = {
  success?: string;
  error?: string;
  warning?: string;
};

/* =========================================================
   UPDATE COMMUNICATION SETTINGS
   Admin only
========================================================= */

export async function updateCommunicationSettings(
  _prevState: CommunicationActionState,
  formData: FormData,
): Promise<CommunicationActionState> {
  const { user } = await requireRole(["admin"]);

  const supabase = await createClient();

  /* -------------------------------------------------------
     Read form values
  ------------------------------------------------------- */

  const senderName = String(formData.get("sender_name") ?? "").trim();

  const senderEmail = String(formData.get("sender_email") ?? "").trim();

  const replyToEmail = String(formData.get("reply_to_email") ?? "").trim();

  const emailEnabled = formData.get("email_enabled") === "on";

  const welcomeEmailEnabled = formData.get("welcome_email_enabled") === "on";

  const shipmentCreatedEmailEnabled =
    formData.get("shipment_created_email_enabled") === "on";

  const shipmentStatusEmailEnabled =
    formData.get("shipment_status_email_enabled") === "on";

  const paymentEmailEnabled = formData.get("payment_email_enabled") === "on";

  const passwordResetEmailEnabled =
    formData.get("password_reset_email_enabled") === "on";

  const smsEnabled = formData.get("sms_enabled") === "on";

  const whatsappEnabled = formData.get("whatsapp_enabled") === "on";

  const customerNotificationsEnabled =
    formData.get("customer_notifications_enabled") === "on";

  const driverNotificationsEnabled =
    formData.get("driver_notifications_enabled") === "on";

  const adminNotificationsEnabled =
    formData.get("admin_notifications_enabled") === "on";

  /* -------------------------------------------------------
     Validation
  ------------------------------------------------------- */

  if (!senderName) {
    return {
      error: "Please enter a sender name.",
    };
  }

  if (senderName.length > 100) {
    return {
      error: "Sender name must be 100 characters or less.",
    };
  }

  if (senderEmail && !isValidEmail(senderEmail)) {
    return {
      error: "Please enter a valid sender email address.",
    };
  }

  if (replyToEmail && !isValidEmail(replyToEmail)) {
    return {
      error: "Please enter a valid reply-to email address.",
    };
  }

  /* -------------------------------------------------------
     Find existing settings
  ------------------------------------------------------- */

  const { data: existing, error: lookupError } = await supabase
    .from("communication_settings")
    .select("id")
    .limit(1)
    .maybeSingle();

  if (lookupError) {
    console.error("GET COMMUNICATION SETTINGS ERROR:", lookupError);

    return {
      error: lookupError.message ?? "Unable to load communication settings.",
    };
  }

  /* -------------------------------------------------------
     Settings payload
  ------------------------------------------------------- */

  const settings = {
    email_enabled: emailEnabled,
    sender_name: senderName,
    sender_email: senderEmail || null,
    reply_to_email: replyToEmail || null,

    welcome_email_enabled: welcomeEmailEnabled,
    shipment_created_email_enabled: shipmentCreatedEmailEnabled,
    shipment_status_email_enabled: shipmentStatusEmailEnabled,
    payment_email_enabled: paymentEmailEnabled,
    password_reset_email_enabled: passwordResetEmailEnabled,

    sms_enabled: smsEnabled,
    whatsapp_enabled: whatsappEnabled,

    customer_notifications_enabled: customerNotificationsEnabled,
    driver_notifications_enabled: driverNotificationsEnabled,
    admin_notifications_enabled: adminNotificationsEnabled,

    updated_at: new Date().toISOString(),
    updated_by: user.id,
  };

  /* -------------------------------------------------------
     Update existing row
  ------------------------------------------------------- */

  if (existing?.id) {
    const { error } = await supabase
      .from("communication_settings")
      .update(settings)
      .eq("id", existing.id);

    if (error) {
      console.error("UPDATE COMMUNICATION SETTINGS ERROR:", error);

      return {
        error: error.message ?? "Unable to update communication settings.",
      };
    }
  } else {
    /* -----------------------------------------------------
       Insert settings if no row exists
    ----------------------------------------------------- */

    const { error } = await supabase
      .from("communication_settings")
      .insert(settings);

    if (error) {
      console.error("INSERT COMMUNICATION SETTINGS ERROR:", error);

      return {
        error: error.message ?? "Unable to create communication settings.",
      };
    }
  }

  /* -------------------------------------------------------
     Revalidate affected pages
  ------------------------------------------------------- */

  revalidatePath("/admin/settings");
  revalidatePath("/admin/settings/communication");

  return {
    success: "Communication settings saved successfully.",
  };
}

/* =========================================================
   EMAIL VALIDATION
========================================================= */

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
