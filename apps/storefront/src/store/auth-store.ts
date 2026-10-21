import { create } from "zustand";
import { UserProfile } from "@/types";
import { setAccessToken } from "@/lib/token";

interface AuthState {
  user: UserProfile | null;
  isHydrating: boolean;
  setUser: (user: UserProfile | null) => void;
  setHydrating: (value: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isHydrating: true,
  setUser: (user) => set({ user }),
  setHydrating: (value) => set({ isHydrating: value }),
  logout: () => {
    setAccessToken(null);
    set({ user: null });
  },
}));

/**
 * Resolves once the initial session restore (Providers: refresh token ->
 * profile) has finished. The access token only lives in memory, so until then
 * a request goes out as a guest even if the user is logged in — anything that
 * fetches per-user data on page load (like the cart) should await this first.
 */
export function waitForAuthHydration(): Promise<void> {
  if (!useAuthStore.getState().isHydrating) return Promise.resolve();
  return new Promise((resolve) => {
    const unsubscribe = useAuthStore.subscribe((state) => {
      if (!state.isHydrating) {
        unsubscribe();
        resolve();
      }
    });
  });
}
