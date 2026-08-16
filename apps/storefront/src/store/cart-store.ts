import { create } from "zustand";
import { CartResponse } from "@/types";
import { fetchCart, addCartItem, updateCartItem, removeCartItem } from "@/lib/api-cart";

interface CartState {
  cart: CartResponse | null;
  isLoading: boolean;
  itemCount: number;
  load: () => Promise<void>;
  addItem: (productId: string, quantity: number, variationSku?: string) => Promise<void>;
  updateItem: (productId: string, quantity: number, variationSku?: string) => Promise<void>;
  removeItem: (productId: string, variationSku?: string) => Promise<void>;
  setCart: (cart: CartResponse) => void;
}

function countItems(cart: CartResponse | null) {
  return cart?.items.reduce((sum, i) => sum + i.quantity, 0) || 0;
}

export const useCartStore = create<CartState>((set) => ({
  cart: null,
  isLoading: false,
  itemCount: 0,

  setCart: (cart) => set({ cart, itemCount: countItems(cart) }),

  load: async () => {
    set({ isLoading: true });
    try {
      const cart = await fetchCart();
      set({ cart, itemCount: countItems(cart), isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  addItem: async (productId, quantity, variationSku) => {
    const cart = await addCartItem(productId, quantity, variationSku);
    set({ cart, itemCount: countItems(cart) });
  },

  updateItem: async (productId, quantity, variationSku) => {
    const cart = await updateCartItem(productId, quantity, variationSku);
    set({ cart, itemCount: countItems(cart) });
  },

  removeItem: async (productId, variationSku) => {
    const cart = await removeCartItem(productId, variationSku);
    set({ cart, itemCount: countItems(cart) });
  },
}));
