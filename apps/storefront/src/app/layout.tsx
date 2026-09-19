import type { Metadata } from "next";
import Script from "next/script";
import { Cormorant_Garamond, Jost } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { WhatsAppButton } from "@/components/layout/whatsapp-button";
import { defaultRobots, buildOrganizationJsonLd, buildWebSiteJsonLd, buildOpenGraph, buildTwitter } from "@/lib/seo";
import { JsonLd } from "@/components/seo/json-ld";
import { Toaster } from "react-hot-toast";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

const jost = Jost({
  variable: "--font-jost",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

// Not set locally by default — every environment (dev, staging, other
// deployments of this template) would otherwise fire events into the same
// production GTM container. Set NEXT_PUBLIC_GTM_ID to enable.
const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID;

export const metadata: Metadata = {
  title: {
    default: "GLOWN — beauty & essentials",
    template: "%s",
  },
  description: "Cosmetics and intimates, chosen with care.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  ),
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },
  // Site-wide default — index/follow only on the real production domain
  // (glown.pk), noindex/nofollow everywhere else (local, staging,
  // previews). Auth pages and anything auth-dependent override this
  // explicitly with an unconditional noindex regardless of environment.
  robots: defaultRobots(),
  // Safety net only: every page below sets its own openGraph (it has to,
  // to get its own image/url), which fully replaces this rather than
  // merging with it — see the comment in lib/seo.ts. This just means a
  // page someone adds later without remembering that doesn't end up with
  // no preview at all.
  openGraph: buildOpenGraph({ url: "/" }),
  twitter: buildTwitter(),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${jost.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-paper text-ink">
        {GTM_ID && (
          <>
            <Script id="gtm-script" strategy="afterInteractive">
              {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${GTM_ID}');`}
            </Script>
            <noscript>
              <iframe
                src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
                height="0"
                width="0"
                style={{ display: "none", visibility: "hidden" }}
              />
            </noscript>
          </>
        )}

        <JsonLd data={buildOrganizationJsonLd()} />
        <JsonLd data={buildWebSiteJsonLd()} />
        <Providers>
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <SiteFooter />
          <WhatsAppButton />
        </Providers>
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 4000,
            style: {
              background: "var(--color-surface)",
              color: "var(--color-ink)",
              border: "1px solid var(--color-line)",
              fontFamily: "var(--font-body)",
              fontSize: "0.875rem",
            },
            success: { iconTheme: { primary: "var(--color-accent-ink)", secondary: "var(--color-paper)" } },
            error: { iconTheme: { primary: "var(--color-danger)", secondary: "var(--color-paper)" } },
          }}
        />
      </body>
    </html>
  );
}
