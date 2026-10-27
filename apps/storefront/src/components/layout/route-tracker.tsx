"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { rememberPage } from "@/lib/auth-redirect";

// Records the current page so the login page can send the shopper back to it.
// Renders nothing. Mount it inside <Suspense> (see Providers): useSearchParams
// would otherwise opt the whole page out of static rendering.
export function RouteTracker() {
  const pathname = usePathname();
  const search = useSearchParams().toString();

  useEffect(() => {
    rememberPage(search ? `${pathname}?${search}` : pathname);
  }, [pathname, search]);

  return null;
}
