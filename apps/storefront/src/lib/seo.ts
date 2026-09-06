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
 * Sitewide Organization schema, rendered once in the root layout. `sameAs`
 * (social profile links) and `logo` are intentionally left out for now —
 * there are no real social URLs or a logo image asset anywhere in the
 * project yet, and emitting placeholder/fake values would be worse than
 * omitting them. Add both once real assets/accounts exist.
 */
export function buildOrganizationJsonLd() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "GLOWN",
    url: siteUrl,
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
