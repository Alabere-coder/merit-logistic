import { unstable_cache } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";

export type BrandingSettings = {
  id: string;
  tagline: string | null;
  primary_color: string;
  secondary_color: string;
  favicon_url: string | null;
};

const defaultBranding: BrandingSettings = {
  id: "",
  tagline: null,
  primary_color: "#2563EB",
  secondary_color: "#4F46E5",
  favicon_url: null,
};

export async function getBrandingSettings(): Promise<BrandingSettings> {
  return unstable_cache(
    async () => {
      const supabase = createAdminClient();

      const { data, error } = await supabase
        .from("branding_settings")
        .select(
          `
          id,
          tagline,
          primary_color,
          secondary_color,
          favicon_url
        `,
        )
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error("GET PUBLIC BRANDING SETTINGS ERROR:", {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
        });

        return defaultBranding;
      }

      return data ?? defaultBranding;
    },
    ["branding-settings"],
    {
      revalidate: 3600,
      tags: ["branding-settings"],
    },
  )();
}
