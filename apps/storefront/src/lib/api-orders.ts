import { apiFetch } from "@/lib/api";
import { Order } from "@/types";

export interface PlaceOrderData {
  phone: string;
  // Logged-in checkout
  addressId?: string;
  // Guest checkout
  email?: string;
  fullName?: string;
  line1?: string;
  line2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}

export async function placeOrder(data: PlaceOrderData): Promise<Order> {
  return apiFetch<Order>("/orders", {
    method: "POST",
    withSession: true, // needed so a guest's cart can be identified/cleared
    body: JSON.stringify(data),
  });
}

// Used by the order-confirmation page — works for a logged-in owner (via
// the auth token) or a guest (via the email they checked out with).
export async function fetchOrderConfirmation(orderNumber: string, email?: string): Promise<Order> {
  const qs = email ? `?email=${encodeURIComponent(email)}` : "";
  return apiFetch<Order>(`/orders/confirmation/${orderNumber}${qs}`);
}

export async function fetchMyOrders(): Promise<Order[]> {
  return apiFetch<Order[]>("/orders");
}

export async function fetchOrder(id: string): Promise<Order> {
  return apiFetch<Order>(`/orders/${id}`);
}
