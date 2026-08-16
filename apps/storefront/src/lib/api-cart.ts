import { apiFetch } from "@/lib/api";
import { CartResponse } from "@/types";

export async function fetchCart(): Promise<CartResponse> {
  return apiFetch<CartResponse>("/cart", { withSession: true });
}

export async function addCartItem(
  productId: string,
  quantity: number,
  variationSku?: string,
): Promise<CartResponse> {
  return apiFetch<CartResponse>("/cart/items", {
    method: "POST",
    withSession: true,
    body: JSON.stringify({ productId, quantity, variationSku }),
  });
}

export async function updateCartItem(
  productId: string,
  quantity: number,
  variationSku?: string,
): Promise<CartResponse> {
  const qs = variationSku ? `?variationSku=${encodeURIComponent(variationSku)}` : "";
  return apiFetch<CartResponse>(`/cart/items/${productId}${qs}`, {
    method: "PATCH",
    withSession: true,
    body: JSON.stringify({ quantity }),
  });
}

export async function removeCartItem(productId: string, variationSku?: string): Promise<CartResponse> {
  const qs = variationSku ? `?variationSku=${encodeURIComponent(variationSku)}` : "";
  return apiFetch<CartResponse>(`/cart/items/${productId}${qs}`, {
    method: "DELETE",
    withSession: true,
  });
}

export async function mergeGuestCart(): Promise<CartResponse> {
  return apiFetch<CartResponse>("/cart/merge", {
    method: "POST",
    withSession: true,
  });
}
