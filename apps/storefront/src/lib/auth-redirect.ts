// Where to send the user after they log in: back to the page they were on.
//
// Two sources, in order:
//   1. an explicit `?redirect=` on the login URL (set by guards such as the
//      account pages and the checkout "log in" link), then
//   2. the last page the shopper viewed (recorded by <RouteTracker/>), so a
//      plain "Log in" link from any page returns them there too.
// Falls back to /account when neither exists (e.g. they opened /login directly).

const STORAGE_KEY = "lastPage";

// Never remember or redirect to these: the auth pages themselves would loop,
// and an order confirmation isn't somewhere to land after a later login.
const BLOCKED_PATHS = ["/login", "/register", "/forgot-password", "/order-confirmation"];

/**
 * True only for same-site paths like "/product/x?y=1". Rejects absolute URLs,
 * protocol-relative ("//evil.com") and backslash tricks ("/\evil.com") — the
 * redirect value comes from the URL, so it must never be allowed to send
 * someone off-site — plus the blocked pages above.
 */
export function isSafeRedirect(path: string | null | undefined): path is string {
  if (!path || path[0] !== "/" || path[1] === "/") return false;
  if (/[\\\u0000-\u001f]/.test(path)) return false;
  const pathname = path.split(/[?#]/)[0];
  return !BLOCKED_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

export function rememberPage(path: string): void {
  if (!isSafeRedirect(path)) return;
  try {
    sessionStorage.setItem(STORAGE_KEY, path);
  } catch {
    // storage unavailable (private mode, etc.) — fall back to /account later
  }
}

export function resolveAuthRedirect(explicit?: string | null, fallback = "/account"): string {
  if (isSafeRedirect(explicit)) return explicit;
  if (typeof window !== "undefined") {
    try {
      const last = sessionStorage.getItem(STORAGE_KEY);
      if (isSafeRedirect(last)) return last;
    } catch {
      // ignore
    }
  }
  return fallback;
}
