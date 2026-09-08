import { Phone } from "lucide-react";
import {
  FacebookIcon,
  InstagramIcon,
  TikTokIcon,
} from "@/components/icons/social-icons";

export function TopBar() {
  return (
    <div className="hidden sm:block bg-accent text-white border-b border-line">
      <div className="container-page flex h-10 items-center justify-between text-xs">
        <a
          href="tel:+9232 4458225"
          className="flex items-center gap-1.5 hover:text-accent-ink transition-colors"
        >
          <Phone size={13} />
          +92 332 4458225
        </a>

        <p className="text-white font-medium">
          Free Shipping On Orders Over Rs. 5,000
        </p>

        <div className="flex items-center gap-3">
          <a
            href="https://www.facebook.com/Glown.pk/"
            aria-label="Facebook"
            className="hover:text-accent-ink transition-colors"
            target="_blank"
          >
            <FacebookIcon size={14} />
          </a>
          <a
            href="https://www.tiktok.com/@glown.pk"
            aria-label="TikTok"
            className="hover:text-accent-ink transition-colors"
            target="_blank"
          >
            <TikTokIcon size={14} />
          </a>

          <a
            href="https://www.instagram.com/glown.pk"
            aria-label="Instagram"
            className="hover:text-accent-ink transition-colors"
            target="_blank"
          >
            <InstagramIcon size={14} />
          </a>
        </div>
      </div>
    </div>
  );
}
