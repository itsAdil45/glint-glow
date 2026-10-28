"use client";

import { usePathname } from "next/navigation";
import { WhatsAppIcon } from "@/components/icons/social-icons";
import { cn } from "@/lib/utils";

// Matches the phone number already used in the top bar and footer.
// wa.me requires the full international number with no "+" or spaces.
const WHATSAPP_NUMBER = "923324458225";

// On phones the floating button sits on top of the auth forms (covering the
// password field and its show/hide toggle), so it's hidden there below the lg
// breakpoint. Desktop keeps it.
const AUTH_PATHS = ["/login", "/register", "/forgot-password"];

export function WhatsAppButton() {
  const pathname = usePathname();
  const onAuthPage = AUTH_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));

  return (
    <a
      href={`https://wa.me/${WHATSAPP_NUMBER}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className={cn(
        "fixed bottom-20 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform hover:scale-105 lg:bottom-5",
        onAuthPage && "max-lg:hidden",
      )}
    >
      <WhatsAppIcon size={28} />
    </a>
  );
}
