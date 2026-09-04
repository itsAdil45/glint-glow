import { Phone } from "lucide-react";
import { FacebookIcon, InstagramIcon, XIcon, PinterestIcon } from "@/components/icons/social-icons";

export function TopBar() {
  return (
    <div className="hidden sm:block bg-accent text-white border-b border-line">
      <div className="container-page flex h-10 items-center justify-between text-xs">
        <a
          href="tel:+923047629941"
          className="flex items-center gap-1.5 hover:text-accent-ink transition-colors"
        >
          <Phone size={13} />
          +92 304 7629941
        </a>

        <p className="text-white font-medium">
          Free Shipping On Orders Over Rs. 5,000
        </p>

        <div className="flex items-center gap-3">
          <a
            href="#"
            aria-label="Facebook"
            className="hover:text-accent-ink transition-colors"
          >
            <FacebookIcon size={14} />
          </a>
          <a
            href="#"
            aria-label="X (Twitter)"
            className="hover:text-accent-ink transition-colors"
          >
            <XIcon size={14} />
          </a>
          <a
            href="#"
            aria-label="Pinterest"
            className="hover:text-accent-ink transition-colors"
          >
            <PinterestIcon size={14} />
          </a>
          <a
            href="#"
            aria-label="Instagram"
            className="hover:text-accent-ink transition-colors"
          >
            <InstagramIcon size={14} />
          </a>
        </div>
      </div>
    </div>
  );
}
