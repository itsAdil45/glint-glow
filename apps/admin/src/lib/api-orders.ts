import { apiFetch } from "@/lib/api";
import { Order, OrderStatus } from "@/types";

export async function fetchAdminOrders(): Promise<Order[]> {
  return apiFetch<Order[]>("/orders/admin/all");
}

export async function fetchAdminOrder(id: string): Promise<Order> {
  return apiFetch<Order>(`/orders/${id}`);
}

export async function updateOrderStatus(id: string, status: OrderStatus): Promise<Order> {
  return apiFetch<Order>(`/orders/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}
