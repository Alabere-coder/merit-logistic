import { createAdminClient } from "@/lib/supabase/admin";

export type CompanySettings = {
  id: string;
  company_name: string;
  company_email: string | null;
  company_phone: string | null;
  whatsapp_number: string | null;
  company_address: string | null;
  company_website: string | null;
  company_logo_url: string | null;
  help_center_url: string | null;
};

const defaultCompanySettings: CompanySettings = {
  id: "",
  company_name: "Emirate Global",
  company_email: null,
  company_phone: null,
  whatsapp_number: null,
  company_address: null,
  company_website: null,
  company_logo_url: null,
  help_center_url: null,
};

export async function getCompanySettings(): Promise<CompanySettings> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("company_settings")
    .select(
      `
      id,
      company_name,
      company_email,
      company_phone,
      whatsapp_number,
      company_address,
      company_website,
      company_logo_url,
      help_center_url
    `,
    )
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("GET COMPANY SETTINGS ERROR:", {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
    });

    return defaultCompanySettings;
  }

  return data ?? defaultCompanySettings;
}
