"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  Globe2,
  Loader2,
  Save,
} from "lucide-react";

import { updateLocalizationSettings } from "@/lib/actions/localization-settings";

type LocalizationSettings = {
  id: string;
  default_country: string;
  default_currency: string;
  timezone: string;
  date_format: string;
  time_format: string;
  language: string;
};

type ActionState = {
  success?: boolean;
  error?: string;
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Saving...
        </>
      ) : (
        <>
          <Save className="h-4 w-4" />
          Save settings
        </>
      )}
    </button>
  );
}

const countries = [
  {
    value: "Nigeria",
    label: "Nigeria",
  },
  {
    value: "Ghana",
    label: "Ghana",
  },
  {
    value: "Kenya",
    label: "Kenya",
  },
  {
    value: "South Africa",
    label: "South Africa",
  },
  {
    value: "United Kingdom",
    label: "United Kingdom",
  },
  {
    value: "United States",
    label: "United States",
  },
];

const currencies = [
  {
    value: "NGN",
    label: "NGN — Nigerian Naira",
  },
  {
    value: "GHS",
    label: "GHS — Ghanaian Cedi",
  },
  {
    value: "KES",
    label: "KES — Kenyan Shilling",
  },
  {
    value: "ZAR",
    label: "ZAR — South African Rand",
  },
  {
    value: "GBP",
    label: "GBP — British Pound",
  },
  {
    value: "USD",
    label: "USD — US Dollar",
  },
];

const timezones = [
  {
    value: "Africa/Lagos",
    label: "Africa/Lagos — West Africa Time",
  },
  {
    value: "Africa/Accra",
    label: "Africa/Accra — Ghana",
  },
  {
    value: "Africa/Nairobi",
    label: "Africa/Nairobi — East Africa Time",
  },
  {
    value: "Africa/Johannesburg",
    label: "Africa/Johannesburg — South Africa",
  },
  {
    value: "Europe/London",
    label: "Europe/London — United Kingdom",
  },
  {
    value: "America/New_York",
    label: "America/New_York — Eastern Time",
  },
];

const dateFormats = [
  {
    value: "DD/MM/YYYY",
    label: "DD/MM/YYYY",
    example: "27/08/2026",
  },
  {
    value: "MM/DD/YYYY",
    label: "MM/DD/YYYY",
    example: "08/27/2026",
  },
  {
    value: "YYYY-MM-DD",
    label: "YYYY-MM-DD",
    example: "2026-08-27",
  },
];

export function LocalizationSettingsForm({
  settings,
}: {
  settings: LocalizationSettings;
}) {
  const [state, formAction] = useActionState<ActionState, FormData>(
    updateLocalizationSettings,
    {},
  );

  return (
    <form action={formAction} className="space-y-6">
      {/* Country / Currency */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Country */}
        <div className="space-y-2">
          <label
            htmlFor="default_country"
            className="text-sm font-medium text-slate-700"
          >
            Default country
          </label>

          <select
            id="default_country"
            name="default_country"
            defaultValue={settings.default_country}
            className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10"
          >
            {countries.map((country) => (
              <option key={country.value} value={country.value}>
                {country.label}
              </option>
            ))}
          </select>

          <p className="text-xs text-slate-500">
            Used as the platform's default operating country.
          </p>
        </div>

        {/* Currency */}
        <div className="space-y-2">
          <label
            htmlFor="default_currency"
            className="text-sm font-medium text-slate-700"
          >
            Default currency
          </label>

          <select
            id="default_currency"
            name="default_currency"
            defaultValue={settings.default_currency}
            className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10"
          >
            {currencies.map((currency) => (
              <option key={currency.value} value={currency.value}>
                {currency.label}
              </option>
            ))}
          </select>

          <p className="text-xs text-slate-500">
            Used when displaying platform prices and fees.
          </p>
        </div>
      </div>

      {/* Timezone */}
      <div className="space-y-2">
        <label
          htmlFor="timezone"
          className="text-sm font-medium text-slate-700"
        >
          Timezone
        </label>

        <select
          id="timezone"
          name="timezone"
          defaultValue={settings.timezone}
          className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10"
        >
          {timezones.map((timezone) => (
            <option key={timezone.value} value={timezone.value}>
              {timezone.label}
            </option>
          ))}
        </select>

        <p className="text-xs text-slate-500">
          Determines the default timezone used for displaying dates and times.
        </p>
      </div>

      {/* Date / Time */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Date format */}
        <div className="space-y-2">
          <label
            htmlFor="date_format"
            className="text-sm font-medium text-slate-700"
          >
            Date format
          </label>

          <select
            id="date_format"
            name="date_format"
            defaultValue={settings.date_format}
            className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10"
          >
            {dateFormats.map((format) => (
              <option key={format.value} value={format.value}>
                {format.label} — {format.example}
              </option>
            ))}
          </select>
        </div>

        {/* Time format */}
        <div className="space-y-2">
          <label
            htmlFor="time_format"
            className="text-sm font-medium text-slate-700"
          >
            Time format
          </label>

          <select
            id="time_format"
            name="time_format"
            defaultValue={settings.time_format}
            className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10"
          >
            <option value="12-hour">12-hour — 2:30 PM</option>

            <option value="24-hour">24-hour — 14:30</option>
          </select>
        </div>
      </div>

      {/* Language */}
      <div className="space-y-2">
        <label
          htmlFor="language"
          className="text-sm font-medium text-slate-700"
        >
          Language
        </label>

        <select
          id="language"
          name="language"
          defaultValue={settings.language}
          className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10"
        >
          <option value="en">English</option>
        </select>

        <p className="text-xs text-slate-500">
          Additional languages can be added when internationalization is
          introduced.
        </p>
      </div>

      {/* Preview */}
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-white p-2.5 text-slate-600 shadow-sm">
            <Globe2 className="h-4 w-4" />
          </div>

          <div>
            <p className="text-sm font-semibold text-slate-900">
              Regional settings
            </p>

            <p className="mt-1 text-xs text-slate-500">
              These defaults will be used throughout the platform where
              applicable.
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white p-3">
            <div className="flex items-center gap-2">
              <Globe2 className="h-4 w-4 text-slate-400" />

              <span className="text-xs text-slate-500">Country</span>
            </div>

            <p className="mt-1 text-sm font-semibold text-slate-800">
              {settings.default_country}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-3">
            <div className="flex items-center gap-2">
              <Clock3 className="h-4 w-4 text-slate-400" />

              <span className="text-xs text-slate-500">Timezone</span>
            </div>

            <p className="mt-1 text-sm font-semibold text-slate-800">
              {settings.timezone}
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      {state.error && (
        <div className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />

          <span>{state.error}</span>
        </div>
      )}

      {state.success && (
        <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />

          <span>Localization settings saved successfully.</span>
        </div>
      )}

      {/* Submit */}
      <div className="flex justify-end border-t border-slate-100 pt-5">
        <SubmitButton />
      </div>
    </form>
  );
}
