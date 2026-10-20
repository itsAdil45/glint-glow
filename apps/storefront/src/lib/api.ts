import { getAccessToken, setAccessToken } from "./token";
import { getSessionId } from "./session";

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

async function requestNewAccessToken(): Promise<string | null> {
  try {
    const res = await fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      credentials: "include",
    });
    if (!res.ok) return null;
    const data = await res.json();
    setAccessToken(data.accessToken);
    return data.accessToken;
  } catch {
    return null;
  }
}

// Single-flight: Providers' mount refresh, 401-retries from other requests
// and React Strict Mode's double-run effects can all ask for a new token at
// the same moment. They share one POST /auth/refresh — firing several in
// parallel is wasteful and, with refresh-token rotation, one can invalidate
// the others' token.
let refreshInFlight: Promise<string | null> | null = null;

function refreshAccessToken(): Promise<string | null> {
  if (!refreshInFlight) {
    refreshInFlight = requestNewAccessToken().finally(() => {
      refreshInFlight = null;
    });
  }
  return refreshInFlight;
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
  auth?: boolean; // attach Authorization header
  withSession?: boolean; // attach x-session-id header (guest cart)
  skipRefreshRetry?: boolean;
}

async function performRequest<T>(path: string, options: RequestOptions): Promise<T> {
  const { auth = true, withSession = false, skipRefreshRetry, headers, ...rest } = options;

  const finalHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    ...(headers as Record<string, string>),
  };

  if (auth) {
    const token = getAccessToken();
    if (token) finalHeaders["Authorization"] = `Bearer ${token}`;
  }
  if (withSession) {
    finalHeaders["x-session-id"] = getSessionId();
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...rest,
    headers: finalHeaders,
    credentials: "include",
  });

  if (res.status === 401 && auth && !skipRefreshRetry) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      return performRequest<T>(path, { ...options, skipRefreshRetry: true });
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

// Identical GETs that overlap in time share one network request. Most views
// fetch in a mount effect, and in dev React Strict Mode runs every effect
// twice (mount -> cleanup -> mount), so each of those fetches went out twice;
// the same happens in production whenever two components ask for the same
// data at once (e.g. header + page). Browser-only: on the server this module
// state would be shared across users' requests. Mutations are never deduped.
const inFlightGets = new Map<string, Promise<unknown>>();

export function apiFetch<T = unknown>(path: string, options: RequestOptions = {}): Promise<T> {
  const method = (options.method ?? "GET").toUpperCase();
  const dedupable =
    typeof window !== "undefined" && method === "GET" && !options.body && !options.signal;
  if (!dedupable) return performRequest<T>(path, options);

  const key = [options.auth ?? true, options.withSession ?? false, getAccessToken() ?? "", path].join("|");
  const existing = inFlightGets.get(key);
  if (existing) return existing as Promise<T>;

  const request = performRequest<T>(path, options).finally(() => inFlightGets.delete(key));
  inFlightGets.set(key, request);
  return request;
}

export { API_URL, refreshAccessToken };
