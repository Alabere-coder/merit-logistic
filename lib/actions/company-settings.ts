"use server";

import { revalidatePath } from "next/cache";

import { requireRole } from "@/lib/auth/require-role";
import { createClient } from "@/lib/supabase/server";

export type CompanySettingsState = {
  success?: string;
  error?: string;
};

export async function updateCompanySettings(
  _previousState: CompanySettingsState,
  formData: FormData,
): Promise<CompanySettingsState> {
  try {
    const { user } = await requireRole(["admin"]);
    const supabase = await createClient();

    const companyName = formData.get("companyName");
    const companyEmail = formData.get("companyEmail");
    const companyPhone = formData.get("companyPhone");
    const companyAddress = formData.get("companyAddress");
    const companyWebsite = formData.get("companyWebsite");

    if (typeof companyName !== "string" || !companyName.trim()) {
      return {
        error: "Company name is required.",
      };
    }

    const { data: existingSettings, error: fetchError } = await supabase
      .from("company_settings")
      .select("id")
      .limit(1)
      .maybeSingle();

    if (fetchError) {
      console.error("GET COMPANY SETTINGS ERROR:", fetchError);

      return {
        error: "Unable to load company settings.",
      };
    }

    const settingsData = {
      company_name: companyName.trim(),

      company_email:
        typeof companyEmail === "string" && companyEmail.trim()
          ? companyEmail.trim()
          : null,

      company_phone:
        typeof companyPhone === "string" && companyPhone.trim()
          ? companyPhone.trim()
          : null,

      company_address:
        typeof companyAddress === "string" && companyAddress.trim()
          ? companyAddress.trim()
          : null,

      company_website:
        typeof companyWebsite === "string" && companyWebsite.trim()
          ? companyWebsite.trim()
          : null,

      updated_by: user.id,
      updated_at: new Date().toISOString(),
    };

    let error;

    if (existingSettings?.id) {
      const result = await supabase
        .from("company_settings")
        .update(settingsData)
        .eq("id", existingSettings.id);

      error = result.error;
    } else {
      const result = await supabase
        .from("company_settings")
        .insert(settingsData);

      error = result.error;
    }

    if (error) {
      console.error("UPDATE COMPANY SETTINGS ERROR:", error);

      return {
        error: error.message,
      };
    }

    revalidatePath("/admin/settings");

    return {
      success: "Company settings updated successfully.",
    };
  } catch (error) {
    console.error("UPDATE COMPANY SETTINGS ERROR:", error);

    return {
      error: "Unable to update company settings.",
    };
  }
}
