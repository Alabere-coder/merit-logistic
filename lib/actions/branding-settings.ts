"use server";

import { revalidatePath } from "next/cache";

import { requireRole } from "@/lib/auth/require-role";
import { createClient } from "@/lib/supabase/server";

export type BrandingActionState = {
  success?: string;
  error?: string;
  warning?: string;
};

function validateColor(value: FormDataEntryValue | null, fieldName: string) {
  const color = String(value ?? "").trim();

  if (!/^#[0-9A-Fa-f]{6}$/.test(color)) {
    throw new Error(`${fieldName} must be a valid 6-digit hex color.`);
  }

  return color.toUpperCase();
}

export async function updateBrandingSettings(
  _prevState: BrandingActionState,
  formData: FormData,
): Promise<BrandingActionState> {
  const { user } = await requireRole(["admin"]);

  const supabase = await createClient();

  try {
    const taglineRaw = formData.get("tagline");

    const tagline =
      taglineRaw === null || String(taglineRaw).trim() === ""
        ? null
        : String(taglineRaw).trim();

    if (tagline && tagline.length > 150) {
      return {
        error: "Tagline must be 150 characters or less.",
      };
    }

    const primaryColor = validateColor(
      formData.get("primaryColor"),
      "Primary color",
    );

    const secondaryColor = validateColor(
      formData.get("secondaryColor"),
      "Secondary color",
    );

    const { data: existing, error: existingError } = await supabase
      .from("branding_settings")
      .select("id")
      .limit(1)
      .maybeSingle();

    if (existingError) {
      console.error("GET BRANDING SETTINGS ERROR:", existingError);

      return {
        error: "Unable to load branding settings.",
      };
    }

    const brandingData = {
      tagline,
      primary_color: primaryColor,
      secondary_color: secondaryColor,
      updated_by: user.id,
      updated_at: new Date().toISOString(),
    };

    if (existing) {
      const { error: updateError } = await supabase
        .from("branding_settings")
        .update(brandingData)
        .eq("id", existing.id);

      if (updateError) {
        console.error("UPDATE BRANDING SETTINGS ERROR:", updateError);

        return {
          error: "Unable to update branding settings.",
        };
      }
    } else {
      const { error: insertError } = await supabase
        .from("branding_settings")
        .insert(brandingData);

      if (insertError) {
        console.error("CREATE BRANDING SETTINGS ERROR:", insertError);

        return {
          error: "Unable to create branding settings.",
        };
      }
    }

    revalidatePath("/admin/settings");
    revalidatePath("/admin/settings/branding");
    revalidatePath("/");

    return {
      success: "Branding settings updated successfully.",
    };
  } catch (error) {
    console.error("BRANDING SETTINGS ACTION ERROR:", error);

    return {
      error:
        error instanceof Error
          ? error.message
          : "Unable to update branding settings.",
    };
  }
}
