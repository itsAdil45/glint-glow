import { apiFetch } from "@/lib/api";
import { Address } from "@/types";

export async function fetchAddresses(): Promise<Address[]> {
  return apiFetch<Address[]>("/addresses");
}

export type AddressInput = Omit<Address, "_id">;

export async function createAddress(data: AddressInput): Promise<Address> {
  return apiFetch<Address>("/addresses", { method: "POST", body: JSON.stringify(data) });
}

export async function updateAddress(id: string, data: Partial<AddressInput>): Promise<Address> {
  return apiFetch<Address>(`/addresses/${id}`, { method: "PATCH", body: JSON.stringify(data) });
}

export async function deleteAddress(id: string): Promise<{ message: string }> {
  return apiFetch(`/addresses/${id}`, { method: "DELETE" });
}
