"use client";

import { useActionState, useRef, useState } from "react";
import { useFormStatus } from "react-dom";

import {
  AlertCircle,
  CheckCircle2,
  Image as ImageIcon,
  Loader2,
  Palette,
  Save,
  Upload,
} from "lucide-react";

import {
  updateBrandingSettings,
  type BrandingActionState,
} from "@/lib/actions/branding-settings";
import { uploadBrandingFavicon } from "@/lib/actions/branding-favicon";

type BrandingSettings = {
  id: string;
  tagline: string | null;
  primary_color: string;
  secondary_color: string;
  favicon_url: string | null;
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-500 hover:bg-cyan-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Saving...
        </>
      ) : (
        <>
          <Save className="h-4 w-4" />
          Save branding
        </>
      )}
    </button>
  );
}

function UploadFaviconButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Uploading...
        </>
      ) : (
        <>
          <Upload className="h-4 w-4" />
          Upload favicon
        </>
      )}
    </button>
  );
}

export function BrandingSettingsForm({
  settings,
}: {
  settings: BrandingSettings;
}) {
  const [state, formAction] = useActionState<BrandingActionState, FormData>(
    updateBrandingSettings,
    {},
  );

  const [primaryColor, setPrimaryColor] = useState(settings.primary_color);

  const [secondaryColor, setSecondaryColor] = useState(
    settings.secondary_color,
  );

  const [faviconUrl, setFaviconUrl] = useState(settings.favicon_url);

  const [faviconError, setFaviconError] = useState<string | null>(null);

  const [faviconSuccess, setFaviconSuccess] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFaviconUpload(formData: FormData) {
    setFaviconError(null);
    setFaviconSuccess(false);

    const file = formData.get("file");

    if (!(file instanceof File)) {
      setFaviconError("Please select a favicon file.");
      return;
    }

    if (file.size === 0) {
      setFaviconError("The selected file is empty.");
      return;
    }

    if (file.size > 1024 * 1024) {
      setFaviconError("Favicon must be 1 MB or smaller.");
      return;
    }

    const allowedTypes = [
      "image/png",
      "image/svg+xml",
      "image/x-icon",
      "image/vnd.microsoft.icon",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      setFaviconError("Invalid format. Use PNG, SVG, ICO, or WEBP.");
      return;
    }

    const result = await uploadBrandingFavicon(formData);

    if (result.error) {
      setFaviconError(result.error);
      return;
    }

    if (result.success && result.faviconUrl) {
      setFaviconUrl(result.faviconUrl);
      setFaviconSuccess(true);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  return (
    <div className="space-y-8">
      {/* -------------------------------------------------
          BRANDING COLORS
      ------------------------------------------------- */}

      <form action={formAction} className="space-y-6">
        {/* Tagline */}
        <div className="space-y-2">
          <label
            htmlFor="tagline"
            className="text-sm font-medium text-slate-700"
          >
            Tagline
          </label>

          <input
            id="tagline"
            name="tagline"
            type="text"
            defaultValue={settings.tagline ?? ""}
            maxLength={150}
            placeholder="Fast, reliable delivery you can trust"
            className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10"
          />

          <p className="text-xs text-slate-500">
            A short phrase that represents your company.
          </p>
        </div>

        {/* Colors */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Primary */}
          <div className="space-y-2">
            <label
              htmlFor="primary_color"
              className="text-sm font-medium text-slate-700"
            >
              Primary color
            </label>

            <div className="flex items-center gap-3">
              <input
                id="primary_color"
                name="primary_color"
                type="color"
                value={primaryColor}
                onChange={(event) => setPrimaryColor(event.target.value)}
                className="h-11 w-14 cursor-pointer rounded-lg border border-slate-200 bg-white p-1"
              />

              <div className="flex h-11 flex-1 items-center rounded-xl border border-slate-200 bg-slate-50 px-3.5">
                <span className="font-mono text-sm text-slate-700">
                  {primaryColor.toUpperCase()}
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-500">
              Used for primary buttons, links, and key actions.
            </p>
          </div>

          {/* Secondary */}
          <div className="space-y-2">
            <label
              htmlFor="secondary_color"
              className="text-sm font-medium text-slate-700"
            >
              Secondary color
            </label>

            <div className="flex items-center gap-3">
              <input
                id="secondary_color"
                name="secondary_color"
                type="color"
                value={secondaryColor}
                onChange={(event) => setSecondaryColor(event.target.value)}
                className="h-11 w-14 cursor-pointer rounded-lg border border-slate-200 bg-white p-1"
              />

              <div className="flex h-11 flex-1 items-center rounded-xl border border-slate-200 bg-slate-50 px-3.5">
                <span className="font-mono text-sm text-slate-700">
                  {secondaryColor.toUpperCase()}
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-500">
              Used for secondary actions and visual accents.
            </p>
          </div>
        </div>

        {/* Preview */}
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
          <div className="flex items-center gap-3">
            <div
              className="flex h-11 w-11 items-center justify-center rounded-xl text-white shadow-sm"
              style={{
                backgroundColor: primaryColor,
              }}
            >
              <Palette className="h-5 w-5" />
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-900">
                Brand preview
              </p>

              <p className="text-xs text-slate-500">
                Preview of your selected brand colors.
              </p>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              className="rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-sm"
              style={{
                backgroundColor: primaryColor,
              }}
            >
              Primary action
            </button>

            <button
              type="button"
              className="rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-sm"
              style={{
                backgroundColor: secondaryColor,
              }}
            >
              Secondary action
            </button>
          </div>
        </div>

        {/* Form messages */}
        {state.error && (
          <div className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{state.error}</span>
          </div>
        )}

        {state.success && (
          <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
            <span>Branding settings saved successfully.</span>
          </div>
        )}

        <div className="flex justify-end border-t border-slate-100 pt-5">
          <SubmitButton />
        </div>
      </form>

      {/* -------------------------------------------------
          FAVICON
      ------------------------------------------------- */}

      <div className="border-t border-slate-100 pt-8">
        <div className="mb-5 flex items-center gap-3">
          <div className="rounded-xl bg-slate-100 p-2.5 text-cyan-600">
            <ImageIcon className="h-4 w-4" />
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-900">Favicon</h3>

            <p className="text-xs text-slate-500">
              The small icon displayed in the browser tab.
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            {/* Current favicon */}
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                {faviconUrl ? (
                  <img
                    src={faviconUrl}
                    alt="Current favicon"
                    className="h-10 w-10 object-contain"
                  />
                ) : (
                  <ImageIcon className="h-6 w-6 text-slate-300" />
                )}
              </div>

              <div>
                <p className="text-sm font-medium text-slate-800">
                  {faviconUrl ? "Current favicon" : "No favicon uploaded"}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  PNG, SVG, ICO, or WEBP · Max 1 MB
                </p>
              </div>
            </div>

            {/* Upload form */}
            <form
              action={handleFaviconUpload}
              className="flex flex-col gap-3 sm:items-end"
            >
              <input
                ref={fileInputRef}
                type="file"
                name="file"
                accept=".png,.svg,.ico,.webp,image/png,image/svg+xml,image/x-icon,image/webp"
                className="block w-full text-sm text-slate-500 file:mr-3 file:rounded-lg file:border-0 file:bg-white file:px-3 file:py-2 file:text-sm file:font-medium file:text-slate-700 file:shadow-sm hover:file:bg-slate-50 sm:w-auto"
              />

              <UploadFaviconButton />
            </form>
          </div>

          {/* Success */}
          {faviconSuccess && (
            <div className="mt-5 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />

              <span>
                Favicon uploaded successfully. Your website will use the new
                favicon.
              </span>
            </div>
          )}

          {/* Error */}
          {faviconError && (
            <div className="mt-5 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />

              <span>{faviconError}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
