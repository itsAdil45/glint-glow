import { apiFetch } from "@/lib/api";
import { Order } from "@/types";

export async function placeOrder(data: { addressId: string; phone: string }): Promise<Order> {
  return apiFetch<Order>("/orders", { method: "POST", body: JSON.stringify(data) });
}

export async function fetchMyOrders(): Promise<Order[]> {
  return apiFetch<Order[]>("/orders");
}

export async function fetchOrder(id: string): Promise<Order> {
  return apiFetch<Order>(`/orders/${id}`);
}
