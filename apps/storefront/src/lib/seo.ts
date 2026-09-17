import type { Metadata } from "next";

// Whether this deployment is the real production site (glown.pk), as
// opposed to a local, staging, or preview build. Deliberately checks the
// configured site URL's hostname rather than NODE_ENV — hosts like Vercel
// build preview/staging deployments with NODE_ENV=production too, so that
// alone would wrongly mark them as the live site and let them get indexed.
const PRODUCTION_HOSTS = ["glown.pk", "www.glown.pk"];

export function isProductionSite(): boolean {
  try {
    const url = new URL(process.env.NEXT_PUBLIC_SITE_URL || "");
    return PRODUCTION_HOSTS.includes(url.hostname);
  } catch {
    return false;
  }
}

// Default robots directive for every page that doesn't explicitly override
// it (auth pages and their dependents always override this with an
// unconditional noindex, regardless of environment).
export function defaultRobots() {
  return isProductionSite()
    ? { index: true, follow: true }
    : { index: false, follow: false };
}

// Auth pages (login/register/forgot-password) and anything that requires
// being logged in (checkout, /account/**) — never indexed, in every
// environment, since none of it has any search value and some of it is
// user-specific.
export const NOINDEX_NOFOLLOW = { index: false, follow: false };

// ---- Structured data (JSON-LD) helpers ----

export interface BreadcrumbSchemaItem {
  label: string;
  href?: string;
}

/**
 * Builds schema.org BreadcrumbList JSON-LD from the same {label, href}
 * trail already used to render the visual Breadcrumb component — so
 * every page with a visible breadcrumb gets a matching one without
 * maintaining the trail twice. Per Google's guidance, the current page
 * (last item) can omit its URL; every prior item includes an absolute one.
 */
export function buildBreadcrumbJsonLd(items: BreadcrumbSchemaItem[]) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      ...(item.href ? { item: `${siteUrl}${item.href}` } : {}),
    })),
  };
}

/**
 * Sitewide Organization schema, rendered once in the root layout.
 */
export function buildOrganizationJsonLd() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "GLOWN",
    url: siteUrl,
    logo: `${siteUrl}/logo.png`,
    sameAs: [
      "https://www.facebook.com/Glown.pk/",
      "https://www.instagram.com/glown.pk",
      "https://www.tiktok.com/@glown.pk",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+92-304-7629941",
      email: "support@glintglow.pk",
      contactType: "customer service",
    },
  };
}

/**
 * Sitewide WebSite schema with a SearchAction, matching the header search
 * form's actual behavior exactly (GET /collections?search=...) — this is
 * what allows Google to show a sitelinks search box, though showing it is
 * entirely Google's call, not something this markup can force.
 */
export function buildWebSiteJsonLd() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "GLOWN",
    url: siteUrl,
    potentialAction: {
      "@type": "SearchAction",
      target: `${siteUrl}/collections?search={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

// ---- Open Graph / Twitter Card helpers ----
//
// openGraph is a shallow-merged key in Next's metadata resolution: if a
// page defines its own `openGraph` object at all, it fully replaces
// anything set in a parent layout rather than merging field-by-field. So
// putting siteName/type/locale only in the root layout wouldn't actually
// reach any page that sets its own openGraph (which is every content page,
// since each needs its own image) — every call site goes through this
// helper instead, which is the single place those shared fields live.
//
// title/description are deliberately NOT set here even though the type
// allows it: Next.js already fills openGraph.title/description from the
// same metadata object's top-level title/description when the field is
// left out, so setting it twice would just be a maintenance hazard if the
// two ever drifted.
const SITE_NAME = "GLOWN";
const DEFAULT_OG_IMAGE_PATH = "/api/og";

export function buildOpenGraph(
  options: {
    /** Rendered into the shared fallback card via /api/og?title=; ignored if images is provided. */
    title?: string;
    /** Page path, e.g. "/about" — resolves against metadataBase. */
    url?: string;
    /** Real photos for a page that has them (currently only product pages) — bypasses the generated fallback card entirely. */
    images?: { url: string; width?: number; height?: number }[];
  } = {},
): NonNullable<Metadata["openGraph"]> {
  const { title, url, images } = options;
  return {
    siteName: SITE_NAME,
    type: "website",
    locale: "en_US",
    ...(url ? { url } : {}),
    images: images ?? [
      {
        url: title ? `${DEFAULT_OG_IMAGE_PATH}?title=${encodeURIComponent(title)}` : DEFAULT_OG_IMAGE_PATH,
        width: 1200,
        height: 630,
      },
    ],
  };
}

export function buildTwitter(images?: { url: string }[]): NonNullable<Metadata["twitter"]> {
  return {
    card: "summary_large_image",
    ...(images ? { images } : {}),
  };
}
