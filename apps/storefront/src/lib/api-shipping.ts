import { apiFetch } from "@/lib/api";

export interface ShippingSettings {
  flatFee: number;
  freeShippingCapEnabled: boolean;
  freeShippingCap: number;
}

export async function fetchShippingSettings(): Promise<ShippingSettings> {
  return apiFetch<ShippingSettings>("/shipping-settings", { auth: false });
}

// Mirrors the backend's ShippingSettingsService.calculateFee — used only
// for display before an order exists (in the cart/checkout estimate and
// the top-bar banner). The actual charged amount is always computed
// server-side when the order is placed, never trusted from the client.
export function estimateShippingFee(settings: ShippingSettings, subtotal: number): number {
  if (settings.freeShippingCapEnabled && subtotal >= settings.freeShippingCap) {
    return 0;
  }
  return settings.flatFee;
}
