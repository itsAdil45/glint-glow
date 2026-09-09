import { apiFetch } from "@/lib/api";

export interface ShippingSettings {
  flatFee: number;
  freeShippingCapEnabled: boolean;
  freeShippingCap: number;
}

export interface ShippingSettingsInput {
  flatFee?: number;
  freeShippingCapEnabled?: boolean;
  freeShippingCap?: number;
}

export async function fetchShippingSettings(): Promise<ShippingSettings> {
  return apiFetch<ShippingSettings>("/shipping-settings");
}

export async function updateShippingSettings(
  data: ShippingSettingsInput,
): Promise<ShippingSettings> {
  return apiFetch<ShippingSettings>("/shipping-settings", {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}
