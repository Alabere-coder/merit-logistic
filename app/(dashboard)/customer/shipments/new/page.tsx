import { getPricingSettings } from "@/lib/pricing/server-pricing";
import { getLocalizationSettings } from "@/lib/localization/get-localization-settings";

import NewShipmentForm from "@/components/customer/new-shipment-form";

export const instant = false;

export default async function NewShipmentPage() {
  const [pricingResult, localization] = await Promise.all([
    getPricingSettings(),
    getLocalizationSettings(),
  ]);

  if (!pricingResult.success) {
    return (
      <div className="mx-auto w-full max-w-7xl p-4 sm:p-6 lg:p-8">
        <div className="rounded-xl border border-red-200 bg-red-50 p-6">
          <h1 className="text-lg font-semibold text-red-900">
            Unable to load shipping prices
          </h1>

          <p className="mt-2 text-sm text-red-700">{pricingResult.error}</p>
        </div>
      </div>
    );
  }

  return (
    <NewShipmentForm
      pricing={pricingResult.settings}
      localization={localization}
    />
  );
}
