import { ImageResponse } from "next/og";
import { readFile } from "fs/promises";
import { join } from "path";
import { NextRequest } from "next/server";

export const runtime = "nodejs";

// Read once per warm server instance rather than on every request — logo.png
// never changes at runtime, so there's no reason to hit disk each time.
let cachedLogoDataUrl: string | null = null;

async function getLogoDataUrl(): Promise<string> {
  if (cachedLogoDataUrl) return cachedLogoDataUrl;
  const buffer = await readFile(join(process.cwd(), "public", "logo.png"));
  cachedLogoDataUrl = `data:image/png;base64,${buffer.toString("base64")}`;
  return cachedLogoDataUrl;
}

/**
 * Single shared social-preview card for every page that doesn't have real
 * photography of its own (a product page uses the actual product images
 * instead — see product/[slug]/page.tsx). Takes an optional ?title= so
 * different pages can show a distinct headline without each needing their
 * own generated image.
 *
 * Deliberately a plain API route rather than the opengraph-image.tsx file
 * convention: that convention only covers the exact route segment it's
 * placed in (not child routes), and can't be used at all inside a
 * catch-all segment like /collections/[[...slug]] — both of which would
 * have meant either duplicating this file across every route or leaving
 * some pages without a working image.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get("title") || "Effortless Radiance";
  const logoSrc = await getLogoDataUrl();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #fdf7f4 0%, #faeaea 100%)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#ffffff",
            border: "2px solid #b8965f",
            borderRadius: 28,
            padding: "56px 88px",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logoSrc} width={620} height={207} alt="" />
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 40,
            fontSize: 32,
            fontWeight: 500,
            color: "#3d2732",
            textAlign: "center",
            maxWidth: 920,
          }}
        >
          {title}
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 22,
            fontSize: 22,
            color: "#b8965f",
          }}
        >
          GLOWN.PK
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      headers: {
        "Cache-Control": "public, immutable, no-transform, max-age=86400",
      },
    },
  );
}
