import Link from "next/link";
import { Sparkles, Truck, ShieldCheck } from "lucide-react";

const TRUST_POINTS = [
  { icon: Truck, text: "Cash on delivery, everywhere" },
  { icon: ShieldCheck, text: "100% authentic, every order" },
  { icon: Sparkles, text: "Curated makeup, skincare & lingerie" },
];

export function AuthLayout({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="container-page py-10 lg:py-16">
      <div className="mx-auto max-w-5xl overflow-hidden rounded-3xl border border-line card-shadow lg:grid lg:grid-cols-[1.05fr_1fr]">
        {/* Brand panel — desktop only, keeps the mobile form full-width and
            uncluttered instead of squeezing a second block above it. */}
        <div className="hidden lg:flex relative flex-col justify-between bg-gradient-to-br from-ink via-ink to-ink-soft p-10 text-paper overflow-hidden">
          <div
            aria-hidden
            className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-gold/10 blur-3xl"
          />
          <div
            aria-hidden
            className="absolute -left-16 bottom-0 h-56 w-56 rounded-full bg-accent-soft/10 blur-3xl"
          />
          <Link href="/" className="relative font-display text-3xl tracking-tight">
            GLOWN
          </Link>
          <div className="relative">
            <p className="font-display text-2xl leading-snug max-w-xs">
              Everything you need to look and feel your best.
            </p>
            <ul className="mt-8 space-y-4">
              {TRUST_POINTS.map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-center gap-3 text-sm text-paper/85">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-paper/10">
                    <Icon size={15} />
                  </span>
                  {text}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Form panel */}
        <div className="bg-surface p-7 sm:p-10 flex flex-col justify-center">
          <Link href="/" className="font-display text-2xl tracking-tight lg:hidden mb-6 inline-block">
            GLOWN
          </Link>
          <h1 className="font-display text-3xl">{title}</h1>
          {subtitle && <p className="text-sm text-muted mt-2">{subtitle}</p>}
          <div className="mt-7">{children}</div>
        </div>
      </div>
    </div>
  );
}
