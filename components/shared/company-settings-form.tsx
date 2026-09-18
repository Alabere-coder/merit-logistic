"use client";

import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";

import {
  AlertCircle,
  CheckCircle2,
  Globe,
  HelpCircle,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Save,
} from "lucide-react";
import Image from "next/image";

import { updateCompanySettings } from "@/lib/actions/company-settings";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import WhatsAppIcon from "../icon/WhatsAppIcon";

type CompanySettings = {
  id: string;
  company_name: string;
  company_email: string | null;
  company_phone: string | null;
  whatsapp_number: string | null;
  company_address: string | null;
  company_website: string | null;
  company_logo_url?: string | null;
  help_center_url: string | null;
};

type CompanySettingsFormProps = {
  settings: CompanySettings;
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      disabled={pending}
      className="bg-cyan-500 font-semibold text-white shadow-md transition-all hover:bg-cyan-600 hover:shadow-lg disabled:opacity-50"
    >
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Saving changes...
        </>
      ) : (
        <>
          <Save className="mr-2 h-4 w-4" />
          Save changes
        </>
      )}
    </Button>
  );
}

export function CompanySettingsForm({ settings }: CompanySettingsFormProps) {
  const [state, formAction] = useActionState(updateCompanySettings, {});

  const [companyName, setCompanyName] = useState(settings.company_name ?? "");

  const [companyEmail, setCompanyEmail] = useState(
    settings.company_email ?? "",
  );

  const [companyPhone, setCompanyPhone] = useState(
    settings.company_phone ?? "",
  );

  const [whatsappNumber, setWhatsappNumber] = useState(
    settings.whatsapp_number ?? "",
  );

  const [companyAddress, setCompanyAddress] = useState(
    settings.company_address ?? "",
  );

  const [companyWebsite, setCompanyWebsite] = useState(
    settings.company_website ?? "",
  );

  const [helpCenterUrl, setHelpCenterUrl] = useState(
    settings.help_center_url ?? "",
  );

  /*
   * Keep the form synchronized if the settings object
   * changes after the component has mounted.
   */
  useEffect(() => {
    setCompanyName(settings.company_name ?? "");
    setCompanyEmail(settings.company_email ?? "");
    setCompanyPhone(settings.company_phone ?? "");
    setWhatsappNumber(settings.whatsapp_number ?? "");
    setCompanyAddress(settings.company_address ?? "");
    setCompanyWebsite(settings.company_website ?? "");
    setHelpCenterUrl(settings.help_center_url ?? "");
  }, [settings]);

  return (
    <form action={formAction} className="space-y-6">
      <div className="grid gap-5 sm:grid-cols-2">
        {/* Company name */}
        <div className="space-y-2 sm:col-span-2">
          <Label
            htmlFor="companyName"
            className="text-xs font-bold capitalize tracking-wider text-slate-500"
          >
            Company name
          </Label>

          <Input
            id="companyName"
            name="companyName"
            value={companyName}
            onChange={(event) => setCompanyName(event.target.value)}
            required
            placeholder="Your logistics company"
          />
        </div>

        {/* Company email */}
        <div className="space-y-2">
          <Label
            htmlFor="companyEmail"
            className="flex items-center gap-2 text-xs font-bold capitalize tracking-wider text-slate-500"
          >
            <Mail className="h-3.5 w-3.5 text-cyan-600" />
            Company email
          </Label>

          <Input
            id="companyEmail"
            name="companyEmail"
            type="email"
            value={companyEmail}
            onChange={(event) => setCompanyEmail(event.target.value)}
            placeholder="support@example.com"
          />
        </div>

        {/* Company phone */}
        <div className="space-y-2">
          <Label
            htmlFor="companyPhone"
            className="flex items-center gap-2 text-xs font-bold capitalize tracking-wider text-slate-500"
          >
            <Phone className="h-3.5 w-3.5 text-cyan-600" />
            Company phone
          </Label>

          <Input
            id="companyPhone"
            name="companyPhone"
            type="tel"
            value={companyPhone}
            onChange={(event) => setCompanyPhone(event.target.value)}
            placeholder="+234..."
          />
        </div>

        {/* WhatsApp number */}
        <div className="space-y-2">
          <Label
            htmlFor="whatsappNumber"
            className="flex items-center gap-2 text-xs font-bold capitalize tracking-wider text-slate-500"
          >
            <WhatsAppIcon className="h-3.5 w-3.5 text-green-500" />
            WhatsApp number
          </Label>

          <Input
            id="whatsappNumber"
            name="whatsappNumber"
            type="tel"
            value={whatsappNumber}
            onChange={(event) => setWhatsappNumber(event.target.value)}
            placeholder="+2348012345678"
          />

          <p className="text-xs text-slate-500">
            Customers and drivers can contact the company through WhatsApp.
          </p>
        </div>

        {/* Help Center URL */}
        <div className="space-y-2">
          <Label
            htmlFor="helpCenterUrl"
            className="flex items-center gap-2 text-xs font-bold capitalize tracking-wider text-slate-500"
          >
            <HelpCircle className="h-3.5 w-3.5 text-cyan-600" />
            Help Center URL
          </Label>

          <Input
            id="helpCenterUrl"
            name="helpCenterUrl"
            type="url"
            value={helpCenterUrl}
            onChange={(event) => setHelpCenterUrl(event.target.value)}
            placeholder="https://yourdomain.com/help"
          />

          <p className="text-xs text-slate-500">
            Link used by the Support Assistant's Help Center option.
          </p>
        </div>

        {/* Company address */}
        <div className="space-y-2 sm:col-span-2">
          <Label
            htmlFor="companyAddress"
            className="flex items-center gap-2 text-xs font-bold capitalize tracking-wider text-slate-500"
          >
            <MapPin className="h-3.5 w-3.5 text-cyan-600" />
            Company address
          </Label>

          <Textarea
            id="companyAddress"
            name="companyAddress"
            value={companyAddress}
            onChange={(event) => setCompanyAddress(event.target.value)}
            placeholder="Enter your company address"
            rows={3}
          />
        </div>

        {/* Website */}
        <div className="space-y-2 sm:col-span-2">
          <Label
            htmlFor="companyWebsite"
            className="flex items-center gap-2 text-xs font-bold capitalize tracking-wider text-slate-500"
          >
            <Globe className="h-3.5 w-3.5 text-cyan-600" />
            Website
          </Label>

          <Input
            id="companyWebsite"
            name="companyWebsite"
            type="url"
            value={companyWebsite}
            onChange={(event) => setCompanyWebsite(event.target.value)}
            placeholder="https://example.com"
          />
        </div>
      </div>

      {/* Error */}
      {state.error && (
        <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50/90 p-4 text-sm text-rose-800">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-500" />
          <div className="font-medium">{state.error}</div>
        </div>
      )}

      {/* Success */}
      {state.success && (
        <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/90 p-4 text-sm text-emerald-800">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />
          <div className="font-medium">{state.success}</div>
        </div>
      )}

      {/* Submit */}
      <div className="flex justify-end border-t border-slate-100 pt-5">
        <SubmitButton />
      </div>
    </form>
  );
}
