"use client";

import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";

import {
  AlertCircle,
  CheckCircle2,
  Globe,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Save,
} from "lucide-react";

import { updateCompanySettings } from "@/lib/actions/company-settings";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type CompanySettings = {
  id: string;
  company_name: string;
  company_email: string | null;
  company_phone: string | null;
  company_address: string | null;
  company_website: string | null;
  company_logo_url?: string | null;
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
      className="bg-linear-to-r from-blue-600 to-indigo-600 font-semibold text-white shadow-md transition-all hover:from-blue-700 hover:to-indigo-700 hover:shadow-lg disabled:opacity-50"
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

  const [companyAddress, setCompanyAddress] = useState(
    settings.company_address ?? "",
  );

  const [companyWebsite, setCompanyWebsite] = useState(
    settings.company_website ?? "",
  );

  /*
   * Keep the form synchronized if the settings object
   * changes after the component has mounted.
   */
  useEffect(() => {
    setCompanyName(settings.company_name ?? "");
    setCompanyEmail(settings.company_email ?? "");
    setCompanyPhone(settings.company_phone ?? "");
    setCompanyAddress(settings.company_address ?? "");
    setCompanyWebsite(settings.company_website ?? "");
  }, [settings]);

  return (
    <form action={formAction} className="space-y-6">
      <div className="grid gap-5 sm:grid-cols-2">
        {/* Company name */}
        <div className="space-y-2 sm:col-span-2">
          <Label
            htmlFor="companyName"
            className="text-xs font-bold uppercase tracking-wider text-slate-500"
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
            className="border-slate-200 bg-slate-50/30 transition-colors focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        {/* Company email */}
        <div className="space-y-2">
          <Label
            htmlFor="companyEmail"
            className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500"
          >
            <Mail className="h-3.5 w-3.5" />
            Company email
          </Label>

          <Input
            id="companyEmail"
            name="companyEmail"
            type="email"
            value={companyEmail}
            onChange={(event) => setCompanyEmail(event.target.value)}
            placeholder="support@example.com"
            className="border-slate-200 bg-slate-50/30 transition-colors focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        {/* Company phone */}
        <div className="space-y-2">
          <Label
            htmlFor="companyPhone"
            className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500"
          >
            <Phone className="h-3.5 w-3.5" />
            Company phone
          </Label>

          <Input
            id="companyPhone"
            name="companyPhone"
            type="tel"
            value={companyPhone}
            onChange={(event) => setCompanyPhone(event.target.value)}
            placeholder="+234..."
            className="border-slate-200 bg-slate-50/30 transition-colors focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        {/* Company address */}
        <div className="space-y-2 sm:col-span-2">
          <Label
            htmlFor="companyAddress"
            className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500"
          >
            <MapPin className="h-3.5 w-3.5" />
            Company address
          </Label>

          <Textarea
            id="companyAddress"
            name="companyAddress"
            value={companyAddress}
            onChange={(event) => setCompanyAddress(event.target.value)}
            placeholder="Enter your company address"
            rows={3}
            className="resize-none border-slate-200 bg-slate-50/30 transition-colors focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        {/* Website */}
        <div className="space-y-2 sm:col-span-2">
          <Label
            htmlFor="companyWebsite"
            className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500"
          >
            <Globe className="h-3.5 w-3.5" />
            Website
          </Label>

          <Input
            id="companyWebsite"
            name="companyWebsite"
            type="url"
            value={companyWebsite}
            onChange={(event) => setCompanyWebsite(event.target.value)}
            placeholder="https://example.com"
            className="border-slate-200 bg-slate-50/30 transition-colors focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
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

// "use client";

// import { useActionState } from "react";
// import { useFormStatus } from "react-dom";

// import {
//   AlertCircle,
//   CheckCircle2,
//   Globe,
//   Loader2,
//   Mail,
//   MapPin,
//   Phone,
//   Save,
// } from "lucide-react";

// import { updateCompanySettings } from "@/lib/actions/company-settings";

// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Button } from "@/components/ui/button";
// import { Textarea } from "@/components/ui/textarea";

// type CompanySettings = {
//   id: string;
//   company_name: string;
//   company_email: string | null;
//   company_phone: string | null;
//   company_address: string | null;
//   company_website: string | null;
//   company_logo_url?: string | null;
// };

// function SubmitButton() {
//   const { pending } = useFormStatus();

//   return (
//     <Button
//       type="submit"
//       disabled={pending}
//       className="bg-linear-to-r from-blue-600 to-indigo-600 font-semibold text-white shadow-md transition-all hover:from-blue-700 hover:to-indigo-700 hover:shadow-lg disabled:opacity-50"
//     >
//       {pending ? (
//         <>
//           <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//           Saving changes...
//         </>
//       ) : (
//         <>
//           <Save className="mr-2 h-4 w-4" />
//           Save changes
//         </>
//       )}
//     </Button>
//   );
// }

// export function CompanySettingsForm({
//   settings,
// }: {
//   settings: CompanySettings;
// }) {
//   const [state, formAction] = useActionState(updateCompanySettings, {});

//   return (
//     <form action={formAction} className="space-y-6">
//       <div className="grid gap-5 sm:grid-cols-2">
//         <div className="space-y-2 sm:col-span-2">
//           <Label
//             htmlFor="companyName"
//             className="text-xs font-bold uppercase tracking-wider text-slate-500"
//           >
//             Company name
//           </Label>

//           <Input
//             id="companyName"
//             name="companyName"
//             defaultValue={settings.company_name}
//             required
//             placeholder="Your logistics company"
//             className="border-slate-200 bg-slate-50/30 transition-colors focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
//           />
//         </div>

//         <div className="space-y-2">
//           <Label
//             htmlFor="companyEmail"
//             className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500"
//           >
//             <Mail className="h-3.5 w-3.5" />
//             Company email
//           </Label>

//           <Input
//             id="companyEmail"
//             name="companyEmail"
//             type="email"
//             defaultValue={settings.company_email ?? ""}
//             placeholder="support@example.com"
//             className="border-slate-200 bg-slate-50/30 transition-colors focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
//           />
//         </div>

//         <div className="space-y-2">
//           <Label
//             htmlFor="companyPhone"
//             className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500"
//           >
//             <Phone className="h-3.5 w-3.5" />
//             Company phone
//           </Label>

//           <Input
//             id="companyPhone"
//             name="companyPhone"
//             type="tel"
//             defaultValue={settings.company_phone ?? ""}
//             placeholder="+234..."
//             className="border-slate-200 bg-slate-50/30 transition-colors focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
//           />
//         </div>

//         <div className="space-y-2 sm:col-span-2">
//           <Label
//             htmlFor="companyAddress"
//             className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500"
//           >
//             <MapPin className="h-3.5 w-3.5" />
//             Company address
//           </Label>

//           <Textarea
//             id="companyAddress"
//             name="companyAddress"
//             defaultValue={settings.company_address ?? ""}
//             placeholder="Enter your company address"
//             rows={3}
//             className="resize-none border-slate-200 bg-slate-50/30 transition-colors focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
//           />
//         </div>

//         <div className="space-y-2 sm:col-span-2">
//           <Label
//             htmlFor="companyWebsite"
//             className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500"
//           >
//             <Globe className="h-3.5 w-3.5" />
//             Website
//           </Label>

//           <Input
//             id="companyWebsite"
//             name="companyWebsite"
//             type="url"
//             defaultValue={settings.company_website ?? ""}
//             placeholder="https://example.com"
//             className="border-slate-200 bg-slate-50/30 transition-colors focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
//           />
//         </div>
//       </div>

//       {state.error && (
//         <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50/90 p-4 text-sm text-rose-800">
//           <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-500" />
//           <div className="font-medium">{state.error}</div>
//         </div>
//       )}

//       {state.success && (
//         <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/90 p-4 text-sm text-emerald-800">
//           <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />
//           <div className="font-medium">{state.success}</div>
//         </div>
//       )}

//       <div className="flex justify-end border-t border-slate-100 pt-5">
//         <SubmitButton />
//       </div>
//     </form>
//   );
// }
