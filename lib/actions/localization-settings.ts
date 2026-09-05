"use server";

import { revalidatePath } from "next/cache";

import { requireRole } from "@/lib/auth/require-role";
import { createClient } from "@/lib/supabase/server";

const ALLOWED_COUNTRIES = [
  "Nigeria",
  "Ghana",
  "Kenya",
  "South Africa",
  "United Kingdom",
  "United States",
];

const ALLOWED_CURRENCIES = ["NGN", "GHS", "KES", "ZAR", "GBP", "USD"];

const ALLOWED_TIMEZONES = [
  "Africa/Lagos",
  "Africa/Accra",
  "Africa/Nairobi",
  "Africa/Johannesburg",
  "Europe/London",
  "America/New_York",
];

const ALLOWED_DATE_FORMATS = ["DD/MM/YYYY", "MM/DD/YYYY", "YYYY-MM-DD"];

const ALLOWED_TIME_FORMATS = ["12-hour", "24-hour"];

const ALLOWED_LANGUAGES = ["en"];

export async function updateLocalizationSettings(
  _previousState: {
    success?: boolean;
    error?: string;
  },
  formData: FormData,
) {
  const { user } = await requireRole(["admin"]);

  const supabase = await createClient();

  const country = formData.get("default_country")?.toString().trim() ?? "";

  const currency = formData.get("default_currency")?.toString().trim() ?? "";

  const timezone = formData.get("timezone")?.toString().trim() ?? "";

  const dateFormat = formData.get("date_format")?.toString().trim() ?? "";

  const timeFormat = formData.get("time_format")?.toString().trim() ?? "";

  const language = formData.get("language")?.toString().trim() ?? "";

  if (!ALLOWED_COUNTRIES.includes(country)) {
    return {
      error: "Please select a valid default country.",
    };
  }

  if (!ALLOWED_CURRENCIES.includes(currency)) {
    return {
      error: "Please select a valid default currency.",
    };
  }

  if (!ALLOWED_TIMEZONES.includes(timezone)) {
    return {
      error: "Please select a valid timezone.",
    };
  }

  if (!ALLOWED_DATE_FORMATS.includes(dateFormat)) {
    return {
      error: "Please select a valid date format.",
    };
  }

  if (!ALLOWED_TIME_FORMATS.includes(timeFormat)) {
    return {
      error: "Please select a valid time format.",
    };
  }

  if (!ALLOWED_LANGUAGES.includes(language)) {
    return {
      error: "Please select a valid language.",
    };
  }

  const { data: existing, error: lookupError } = await supabase
    .from("localization_settings")
    .select("id")
    .limit(1)
    .maybeSingle();

  if (lookupError) {
    console.error("GET LOCALIZATION SETTINGS ERROR:", lookupError);

    return {
      error: lookupError.message ?? "Unable to load localization settings.",
    };
  }

  const values = {
    default_country: country,
    default_currency: currency,
    timezone,
    date_format: dateFormat,
    time_format: timeFormat,
    language,
    updated_by: user.id,
    updated_at: new Date().toISOString(),
  };

  let error;

  if (existing?.id) {
    const result = await supabase
      .from("localization_settings")
      .update(values)
      .eq("id", existing.id);

    error = result.error;
  } else {
    const result = await supabase.from("localization_settings").insert({
      ...values,
      created_at: new Date().toISOString(),
    });

    error = result.error;
  }

  if (error) {
    console.error("UPDATE LOCALIZATION SETTINGS ERROR:", error);

    return {
      error: error.message ?? "Unable to save localization settings.",
    };
  }

  revalidatePath("/admin/settings");
  revalidatePath("/admin/settings/localization");
  revalidatePath("/");

  return {
    success: true,
  };
}
