import { create } from "zustand";
import { CartResponse } from "@/types";
import {
  fetchCart,
  addCartItem,
  updateCartItem,
  removeCartItem,
  applyCartCoupon,
  removeCartCoupon,
} from "@/lib/api-cart";
import { waitForAuthHydration } from "@/store/auth-store";

interface CartState {
  cart: CartResponse | null;
  isLoading: boolean;
  itemCount: number;
  load: () => Promise<void>;
  addItem: (productId: string, quantity: number, variationSku?: string) => Promise<void>;
  updateItem: (productId: string, quantity: number, variationSku?: string) => Promise<void>;
  removeItem: (productId: string, variationSku?: string) => Promise<void>;
  applyCoupon: (code: string) => Promise<void>;
  removeCoupon: () => Promise<void>;
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
      // On a page refresh the access token is gone until Providers has
      // restored the session. Fetching before that sends the request as a
      // guest, which returns the (empty) guest cart instead of the logged-in
      // user's — so the cart looked lost until the next add-to-cart or a
      // visit to the cart page re-fetched it.
      await waitForAuthHydration();
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

  applyCoupon: async (code) => {
    // Deliberately no try/catch here — a rejected code needs to reach the
    // cart page so it can show the specific reason next to the input,
    // same as every other cart mutation above.
    const cart = await applyCartCoupon(code);
    set({ cart, itemCount: countItems(cart) });
  },

  removeCoupon: async () => {
    const cart = await removeCartCoupon();
    set({ cart, itemCount: countItems(cart) });
  },
}));
