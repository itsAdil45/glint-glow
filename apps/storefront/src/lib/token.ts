// The access token is short-lived and kept in memory only (never localStorage,
// to limit XSS blast radius). The refresh token lives in an httpOnly cookie
// set by the backend, so a page reload can silently re-obtain an access token
// via POST /auth/refresh.
let accessToken: string | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export function getAccessToken() {
  return accessToken;
}
