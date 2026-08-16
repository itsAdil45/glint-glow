import { create } from "zustand";
import { AdminUser } from "@/types";
import { setAccessToken } from "@/lib/token";

interface AuthState {
  user: AdminUser | null;
  isHydrating: boolean;
  setUser: (user: AdminUser | null) => void;
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
