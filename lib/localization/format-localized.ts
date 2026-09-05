import type { LocalizationSettings } from "./get-localization-settings";

/* =========================================================
   CURRENCY
========================================================= */

export function formatLocalizedCurrency(
  amount: number,
  settings: LocalizationSettings,
) {
  return new Intl.NumberFormat(
    settings.language === "en" ? "en-NG" : settings.language,
    {
      style: "currency",
      currency: settings.default_currency,
      currencyDisplay: "symbol",
    },
  ).format(amount);
}

/* =========================================================
   DATE
========================================================= */

export function formatLocalizedDate(
  date: string | Date,
  settings: LocalizationSettings,
) {
  const locale = settings.language === "en" ? "en-NG" : settings.language;

  const options: Intl.DateTimeFormatOptions = {
    timeZone: settings.timezone,
  };

  switch (settings.date_format) {
    case "MM/DD/YYYY":
      options.month = "2-digit";
      options.day = "2-digit";
      options.year = "numeric";
      break;

    case "YYYY-MM-DD":
      options.year = "numeric";
      options.month = "2-digit";
      options.day = "2-digit";
      break;

    case "DD/MM/YYYY":
    default:
      options.day = "2-digit";
      options.month = "2-digit";
      options.year = "numeric";
      break;
  }

  return new Intl.DateTimeFormat(locale, options).format(new Date(date));
}

/* =========================================================
   DATE + TIME
========================================================= */

export function formatLocalizedDateTime(
  date: string | Date,
  settings: LocalizationSettings,
) {
  const locale = settings.language === "en" ? "en-NG" : settings.language;

  return new Intl.DateTimeFormat(locale, {
    timeZone: settings.timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: settings.time_format === "12-hour",
  }).format(new Date(date));
}

/* =========================================================
   TIME ONLY
========================================================= */

export function formatLocalizedTime(
  date: string | Date,
  settings: LocalizationSettings,
) {
  const locale = settings.language === "en" ? "en-NG" : settings.language;

  return new Intl.DateTimeFormat(locale, {
    timeZone: settings.timezone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: settings.time_format === "12-hour",
  }).format(new Date(date));
}
