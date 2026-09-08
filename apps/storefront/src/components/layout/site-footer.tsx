import Link from "next/link";
import { Mail, Phone } from "lucide-react";
import {
  FacebookIcon,
  InstagramIcon,
  TikTokIcon,
} from "@/components/icons/social-icons";

const SHOP_LINKS = [
  { href: "/about", label: "About" },
  { href: "/collections", label: "Shop all" },
  { href: "/privacy", label: "Privacy policy" },
  { href: "/terms", label: "Terms of service" },
];

const CUSTOMER_LINKS = [
  { href: "/contact", label: "Contact us" },
  { href: "/faq", label: "FAQ" },
  { href: "/account/orders", label: "Track an order" },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-line mt-24 bg-accent-soft/30">
      <div className="container-page grid grid-cols-2 gap-10 py-14 lg:grid-cols-4">
        <div className="col-span-2">
          <span className="font-display text-2xl">
            <img src="/logo.png" alt="GLOWN logo" width={250} height={50} />
          </span>
          <p className="mt-3 max-w-xs text-sm text-muted">
            Cosmetics and intimates, chosen with care. New arrivals every week.
          </p>

          <div className="mt-5 space-y-2">
            <a
              href="mailto:support@glintglow.pk"
              className="flex items-center gap-2 text-sm text-muted hover:text-ink transition-colors"
            >
              <Mail size={15} />
              support@glintglow.pk
            </a>
            <a
              href="tel:+9232 4458225"
              className="flex items-center gap-2 text-sm text-muted hover:text-ink transition-colors"
            >
              <Phone size={15} />
              +92 332 4458225
            </a>
          </div>

          <div className="mt-5 flex items-center gap-3">
            <a
              href="https://www.facebook.com/Glown.pk/"
              aria-label="Facebook"
              className="hover:text-accent-ink transition-colors"
              target="_blank"
            >
              <FacebookIcon size={18} />
            </a>
            <a
              href="https://www.instagram.com/glown.pk"
              aria-label="Instagram"
              className="hover:text-accent-ink transition-colors"
              target="_blank"
            >
              <InstagramIcon size={18} />
            </a>
            <a
              href="https://www.tiktok.com/@glown.pk"
              aria-label="TikTok"
              className="hover:text-accent-ink transition-colors"
              target="_blank"
            >
              <TikTokIcon size={18} />
            </a>
          </div>
        </div>

        <FooterCol title="Shop" links={SHOP_LINKS} />
        <FooterCol title="Customer service" links={CUSTOMER_LINKS} />
      </div>

      <div className="border-t border-line">
        <div className="container-page flex flex-col justify-between gap-2 py-5 text-xs text-muted sm:flex-row">
          <span>© {new Date().getFullYear()} GLOWN. All rights reserved.</span>
          <span>Cash on delivery available on all orders.</span>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({
  title,
  links,
}: {
  title: string;
  links: { href: string; label: string }[];
}) {
  return (
    <div>
      <h4 className="text-xs font-medium tracking-wide text-ink-soft uppercase mb-3">
        {title}
      </h4>
      <ul className="space-y-2">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="text-sm text-muted hover:text-ink transition-colors"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
