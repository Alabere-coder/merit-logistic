import { createAdminClient } from "@/lib/supabase/admin";

export type LocalizationSettings = {
  id: string;
  default_country: string;
  default_currency: string;
  timezone: string;
  date_format: string;
  time_format: string;
  language: string;
};

const defaultLocalization: LocalizationSettings = {
  id: "",
  default_country: "Nigeria",
  default_currency: "NGN",
  timezone: "Africa/Lagos",
  date_format: "DD/MM/YYYY",
  time_format: "12-hour",
  language: "en",
};

export async function getLocalizationSettings(): Promise<LocalizationSettings> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("localization_settings")
    .select(
      `
        id,
        default_country,
        default_currency,
        timezone,
        date_format,
        time_format,
        language
      `,
    )
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("GET LOCALIZATION SETTINGS ERROR:", error);

    return defaultLocalization;
  }

  return data ?? defaultLocalization;
}
