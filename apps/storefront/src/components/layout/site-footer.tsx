import Link from "next/link";
import { AtSign, MessageCircle, Send } from "lucide-react";

const CUSTOMER_LINKS = [
  { href: "/contact", label: "Contact us" },
  { href: "/returns", label: "Returns & exchanges" },
  { href: "/faq", label: "FAQ" },
  { href: "/shipping", label: "Shipping" },
];

const COMPANY_LINKS = [
  { href: "/about", label: "About" },
  { href: "/products", label: "Shop all" },
  { href: "/privacy", label: "Privacy policy" },
  { href: "/terms", label: "Terms of service" },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-line mt-24">
      <div className="container-page py-14 grid grid-cols-2 gap-10 lg:grid-cols-5">
        <div className="col-span-2">
          <span className="font-display text-2xl">Store</span>
          <p className="mt-3 text-sm text-muted max-w-xs">
            Thoughtfully made goods, shipped with care. New arrivals every week.
          </p>
          <div className="flex items-center gap-3 mt-5">
            <a href="#" aria-label="Instagram" className="hover:text-accent-ink">
              <AtSign size={18} />
            </a>
            <a href="#" aria-label="Chat with us" className="hover:text-accent-ink">
              <MessageCircle size={18} />
            </a>
            <a href="#" aria-label="Newsletter" className="hover:text-accent-ink">
              <Send size={18} />
            </a>
          </div>
        </div>

        <FooterCol title="Shop" links={COMPANY_LINKS} />
        <FooterCol title="Customer service" links={CUSTOMER_LINKS} />

        <div>
          <h4 className="text-xs font-medium tracking-wide text-ink-soft uppercase mb-3">
            Newsletter
          </h4>
          <p className="text-sm text-muted mb-3">Get news on new arrivals and offers.</p>
          <form className="flex">
            <input
              type="email"
              placeholder="Email address"
              className="h-10 w-full border border-line bg-paper px-3 text-sm outline-none focus:border-ink"
            />
            <button type="submit" className="h-10 px-4 bg-ink text-paper text-sm shrink-0">
              Join
            </button>
          </form>
        </div>
      </div>

      <div className="border-t border-line">
        <div className="container-page py-5 flex flex-col sm:flex-row justify-between gap-2 text-xs text-muted">
          <span>© {new Date().getFullYear()} Store. All rights reserved.</span>
          <span>Cash on delivery available on all orders.</span>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: { href: string; label: string }[] }) {
  return (
    <div>
      <h4 className="text-xs font-medium tracking-wide text-ink-soft uppercase mb-3">{title}</h4>
      <ul className="space-y-2">
        {links.map((link) => (
          <li key={link.href}>
            <Link href={link.href} className="text-sm text-muted hover:text-ink transition-colors">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
