"use server";

import { revalidatePath } from "next/cache";

import { requireRole } from "@/lib/auth/require-role";
import { createAdminClient } from "@/lib/supabase/admin";

const MAX_FILE_SIZE = 1 * 1024 * 1024; // 1 MB

const ALLOWED_TYPES = {
  "image/png": "png",
  "image/svg+xml": "svg",
  "image/x-icon": "ico",
  "image/vnd.microsoft.icon": "ico",
  "image/webp": "webp",
} as const;

export async function uploadBrandingFavicon(formData: FormData) {
  const { user } = await requireRole(["admin"]);

  const file = formData.get("file");

  if (!(file instanceof File)) {
    return {
      error: "Please select a favicon file.",
    };
  }

  if (file.size === 0) {
    return {
      error: "The selected file is empty.",
    };
  }

  if (file.size > MAX_FILE_SIZE) {
    return {
      error: "Favicon must be 1 MB or smaller.",
    };
  }

  const extension = ALLOWED_TYPES[file.type as keyof typeof ALLOWED_TYPES];

  if (!extension) {
    return {
      error: "Invalid favicon format. Use PNG, SVG, ICO, or WEBP.",
    };
  }

  const supabase = createAdminClient();

  /*
   * Give every upload a unique filename so browsers do not
   * keep displaying an old favicon from cache.
   */
  const fileName = `favicon/favicon-${crypto.randomUUID()}.${extension}`;

  const { error: uploadError } = await supabase.storage
    .from("branding")
    .upload(fileName, file, {
      contentType: file.type,
      upsert: false,
      cacheControl: "3600",
    });

  if (uploadError) {
    console.error("UPLOAD BRANDING FAVICON ERROR:", uploadError);

    return {
      error: uploadError.message ?? "Unable to upload favicon.",
    };
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("branding").getPublicUrl(fileName);

  /*
   * Get the current favicon so we can remove it after
   * successfully replacing it.
   */
  const { data: currentBranding } = await supabase
    .from("branding_settings")
    .select("id, favicon_url")
    .limit(1)
    .maybeSingle();

  let brandingId = currentBranding?.id;

  if (brandingId) {
    const { error: updateError } = await supabase
      .from("branding_settings")
      .update({
        favicon_url: publicUrl,
        updated_by: user.id,
        updated_at: new Date().toISOString(),
      })
      .eq("id", brandingId);

    if (updateError) {
      console.error("UPDATE BRANDING FAVICON ERROR:", updateError);

      /*
       * Cleanup the newly uploaded file because the database
       * was not updated.
       */
      await supabase.storage.from("branding").remove([fileName]);

      return {
        error: updateError.message ?? "Unable to save favicon settings.",
      };
    }
  } else {
    const { data: newBranding, error: insertError } = await supabase
      .from("branding_settings")
      .insert({
        favicon_url: publicUrl,
        updated_by: user.id,
      })
      .select("id")
      .single();

    if (insertError || !newBranding) {
      console.error("CREATE BRANDING SETTINGS ERROR:", insertError);

      await supabase.storage.from("branding").remove([fileName]);

      return {
        error: insertError?.message ?? "Unable to save favicon settings.",
      };
    }

    brandingId = newBranding.id;
  }

  /*
   * Remove the previous favicon after the new one has
   * successfully been saved.
   */
  if (currentBranding?.favicon_url) {
    try {
      const oldUrl = new URL(currentBranding.favicon_url);

      const marker = "/storage/v1/object/public/branding/";

      const markerIndex = oldUrl.pathname.indexOf(marker);

      if (markerIndex !== -1) {
        const oldPath = decodeURIComponent(
          oldUrl.pathname.slice(markerIndex + marker.length),
        );

        if (oldPath && oldPath !== fileName) {
          await supabase.storage.from("branding").remove([oldPath]);
        }
      }
    } catch (error) {
      console.error("CLEANUP OLD BRANDING FAVICON ERROR:", error);
    }
  }

  revalidatePath("/admin/settings");
  revalidatePath("/admin/settings/branding");
  revalidatePath("/");

  return {
    success: true,
    faviconUrl: publicUrl,
  };
}
