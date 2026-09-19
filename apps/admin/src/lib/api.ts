import { getAccessToken, setAccessToken } from "./token";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export class ApiError extends Error {
  status: number;
  body: unknown;
  constructor(status: number, message: string, body?: unknown) {
    super(message);
    this.status = status;
    this.body = body;
  }
}

async function refreshAccessToken(): Promise<string | null> {
  try {
    const res = await fetch(`${API_URL}/auth/refresh`, { method: "POST", credentials: "include" });
    if (!res.ok) return null;
    const data = await res.json();
    setAccessToken(data.accessToken);
    return data.accessToken;
  } catch {
    return null;
  }
}

// The backend's exception filter wraps every error as
// { statusCode, message, timestamp }, where `message` is whatever
// exception.getResponse() returned — and for a plain
// `new BadRequestException('some string')`, that's itself an object
// ({ statusCode, message: 'some string', error: 'Bad Request' }), not the
// string directly. So the human-readable text is usually one level
// deeper than it looks, and a naive `body.message.toString()` on that
// inner object produces the literal string "[object Object]" — this
// unwraps every shape actually seen from this backend (flat string, flat
// array from a raw ValidationPipe response, or one more level of either
// nested inside).
function extractErrorMessage(body: unknown, fallback: string): string {
  const msg = (body as { message?: unknown })?.message;
  if (typeof msg === "string") return msg;
  if (Array.isArray(msg)) return msg.join(", ");
  if (msg && typeof msg === "object") {
    const inner = (msg as { message?: unknown }).message;
    if (typeof inner === "string") return inner;
    if (Array.isArray(inner)) return inner.join(", ");
  }
  return fallback;
}

interface RequestOptions extends RequestInit {
  auth?: boolean;
  isFormData?: boolean;
  skipRefreshRetry?: boolean;
}

export async function apiFetch<T = unknown>(path: string, options: RequestOptions = {}): Promise<T> {
  const { auth = true, isFormData, skipRefreshRetry, headers, ...rest } = options;

  const finalHeaders: Record<string, string> = { ...(headers as Record<string, string>) };
  if (!isFormData) finalHeaders["Content-Type"] = "application/json";

  if (auth) {
    const token = getAccessToken();
    if (token) finalHeaders["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...rest,
    headers: finalHeaders,
    credentials: "include",
  });

  if (res.status === 401 && auth && !skipRefreshRetry) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      return apiFetch<T>(path, { ...options, skipRefreshRetry: true });
    }
  }

  if (!res.ok) {
    let body: unknown = null;
    try {
      body = await res.json();
    } catch {
      /* no body */
    }
    const message = extractErrorMessage(body, res.statusText);
    throw new ApiError(res.status, message, body);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

export { API_URL, refreshAccessToken };
