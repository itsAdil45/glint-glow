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
