// Extracts the video ID from a YouTube link (watch, youtu.be, shorts, embed, live).
// Returns null for anything else, so callers can treat it as "not a valid YouTube link".
export function getYouTubeId(input: string): string | null {
  let url: URL;
  try {
    url = new URL(input.trim());
  } catch {
    return null;
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") return null;

  const host = url.hostname.replace(/^(www|m)\./, "");
  let id: string | null = null;

  if (host === "youtu.be") {
    id = url.pathname.slice(1).split("/")[0];
  } else if (host === "youtube.com" || host === "youtube-nocookie.com") {
    if (url.pathname === "/watch") {
      id = url.searchParams.get("v");
    } else {
      const match = url.pathname.match(/^\/(?:embed|shorts|live)\/([^/?]+)/);
      id = match ? match[1] : null;
    }
  }

  // A YouTube video ID is always 11 characters of [A-Za-z0-9_-].
  return id && /^[\w-]{11}$/.test(id) ? id : null;
}
