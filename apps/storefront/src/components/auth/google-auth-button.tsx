"use client";

import Script from "next/script";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { googleAuth, fetchProfile } from "@/lib/api-auth";
import { mergeGuestCart } from "@/lib/api-cart";
import { setAccessToken } from "@/lib/token";
import { useAuthStore } from "@/store/auth-store";
import { useCartStore } from "@/store/cart-store";
import { ApiError } from "@/lib/api";

// Public by design — a Google OAuth web client ID is meant to ship in
// client-side JS (unlike a client secret, which never leaves the server).
// The env var lets each deployment override it without a code change.
const GOOGLE_CLIENT_ID =
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
  "139428633191-rq4gannb13sto2c007lu25r0i8fvjlu6.apps.googleusercontent.com";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
          }) => void;
          renderButton: (
            parent: HTMLElement,
            options: {
              theme?: "outline" | "filled_blue" | "filled_black";
              size?: "large" | "medium" | "small";
              shape?: "rectangular" | "pill" | "circle" | "square";
              text?: "signin_with" | "signup_with" | "continue_with" | "signin";
              width?: number;
            },
          ) => void;
        };
      };
    };
  }
}

export function GoogleAuthButton({
  redirect = "/account",
  text = "continue_with",
  onError,
}: {
  redirect?: string;
  text?: "signin_with" | "signup_with" | "continue_with";
  onError?: (message: string) => void;
}) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const setUser = useAuthStore((s) => s.setUser);
  const setCart = useCartStore((s) => s.setCart);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  const handleCredential = useCallback(
    async (response: { credential: string }) => {
      try {
        const { accessToken } = await googleAuth(response.credential);
        setAccessToken(accessToken);
        const profile = await fetchProfile();
        setUser(profile);
        const cart = await mergeGuestCart();
        setCart(cart);
        router.push(redirect);
      } catch (err) {
        onError?.(err instanceof ApiError ? err.message : "Could not sign in with Google");
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps -- router/setUser/setCart are stable; onError is passed once per page and re-including it here would just re-init the same button on every parent re-render
    [redirect],
  );

  useEffect(() => {
    if (!scriptLoaded || !window.google || !containerRef.current) return;
    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: handleCredential,
    });
    window.google.accounts.id.renderButton(containerRef.current, {
      theme: "outline",
      size: "large",
      shape: "pill",
      text,
      width: containerRef.current.offsetWidth || 320,
    });
  }, [scriptLoaded, handleCredential, text]);

  return (
    <>
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onLoad={() => setScriptLoaded(true)}
      />
      <div ref={containerRef} className="w-full flex justify-center [&>div]:w-full" />
    </>
  );
}
