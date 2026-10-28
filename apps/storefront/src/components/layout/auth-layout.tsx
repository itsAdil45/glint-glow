import Link from "next/link";
import { ArrowLeft, Sparkles, Truck, ShieldCheck } from "lucide-react";

const TRUST_POINTS = [
  { icon: Truck, text: "Cash on delivery, everywhere" },
  { icon: ShieldCheck, text: "100% authentic, every order" },
  { icon: Sparkles, text: "Curated makeup, skincare & lingerie" },
];

// Glossy "pearl" orbs for the brand panel — radial gradients with an offset
// highlight so they read as soft spheres rather than flat circles.
const ROSE_ORB =
  "radial-gradient(circle at 30% 26%, #ffffff 0%, #fbdfe2 20%, #e9a2ab 55%, #b95562 100%)";
const GOLD_ORB =
  "radial-gradient(circle at 30% 26%, #fff8e6 0%, #efd9ae 28%, #c9a56b 65%, #8f6f3d 100%)";

export function AuthLayout({
  title,
  subtitle,
  switcher,
  children,
}: {
  title: string;
  subtitle?: string;
  /** Top-right "switch page" prompt, e.g. { prompt: "New here?", label: "Create account", href: "/register" } */
  switcher?: { prompt: string; label: string; href: string };
  children: React.ReactNode;
}) {
  return (
    <div className="relative isolate overflow-hidden">
      {/* page backdrop: a blush wash with a soft gold glow */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-gradient-to-b from-accent-soft via-paper to-paper"
      />
      <div
        aria-hidden
        className="absolute -left-32 top-24 -z-10 h-80 w-80 rounded-full bg-gold-soft opacity-80 blur-3xl"
      />

      <div className="container-page py-6 sm:py-10 lg:py-14">
        <div className="mx-auto grid max-w-6xl overflow-hidden rounded-[2rem] bg-surface shadow-[var(--shadow-soft-lg)] ring-1 ring-line lg:min-h-[700px] lg:grid-cols-[1fr_0.95fr]">
          {/* ───────── Form panel ───────── */}
          <section className="relative flex flex-col px-6 py-7 sm:px-12 sm:py-10">
            {/* mobile-only corner glow, standing in for the brand panel */}
            <div
              aria-hidden
              className="absolute -right-24 -top-24 h-52 w-52 rounded-full bg-gradient-to-br from-accent-soft to-accent/40 lg:hidden"
            />

            <div className="relative flex items-center justify-between gap-4">
              <Link
                href="/"
                aria-label="Back to shop"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-line bg-surface text-ink transition-colors hover:border-ink/40 hover:bg-accent-soft/60"
              >
                <ArrowLeft size={18} />
              </Link>
              {switcher && (
                <p className="text-sm text-ink-soft">
                  {switcher.prompt}{" "}
                  <Link
                    href={switcher.href}
                    className="font-medium text-accent-ink underline decoration-accent-ink/30 underline-offset-[6px] transition-colors hover:decoration-accent-ink"
                  >
                    {switcher.label}
                  </Link>
                </p>
              )}
            </div>

            <div className="relative mx-auto my-10 w-full max-w-md lg:my-auto lg:py-8">
              <h1 className="font-display text-5xl leading-[1.05] text-ink sm:text-6xl">{title}</h1>
              {/* hand-drawn gold stroke under the heading */}
              <svg
                aria-hidden
                viewBox="0 0 160 14"
                className="mt-2 h-3 w-32 text-gold"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
              >
                <path d="M3 9c26-7 50 3 78-2s52-3 76 1" />
              </svg>
              {subtitle && <p className="mt-5 text-[15px] leading-relaxed text-ink-soft">{subtitle}</p>}
              <div className="mt-9">{children}</div>
            </div>
          </section>

          {/* ───────── Brand panel (desktop) ───────── */}
          <aside
            aria-hidden
            className="relative hidden overflow-hidden bg-gradient-to-br from-[#f7d9dc] via-accent to-accent-ink lg:block"
          >
            {/* organic edge: white shape that bleeds the form panel into the artwork */}
            <svg
              viewBox="0 0 120 800"
              preserveAspectRatio="none"
              className="absolute inset-y-0 -left-px h-full w-28 fill-surface"
            >
              <path d="M0 0H44C96 110 6 214 58 330c52 116-34 226 14 340 20 48 4 90-20 130H0Z" />
            </svg>

            {/* soft light pooled in the corners */}
            <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-white/30 blur-3xl" />
            <div className="absolute -bottom-32 -right-10 h-80 w-80 rounded-full bg-gold/25 blur-3xl" />

            {/* orbs */}
            <div
              className="auth-float absolute right-14 top-[9%] h-28 w-28 rounded-full shadow-[0_24px_40px_-12px_rgb(61_39_50/0.45)]"
              style={{ background: GOLD_ORB }}
            />
            <div
              className="auth-float absolute left-24 top-[56%] h-20 w-20 rounded-full shadow-[0_18px_30px_-10px_rgb(61_39_50/0.4)]"
              style={{ background: ROSE_ORB, animationDelay: "-2.5s" }}
            />
            <div
              className="auth-float absolute right-8 bottom-[30%] h-14 w-14 rounded-full shadow-[0_14px_24px_-8px_rgb(61_39_50/0.4)]"
              style={{ background: GOLD_ORB, animationDelay: "-4.5s" }}
            />

            <span className="absolute left-20 top-12 font-display text-3xl tracking-tight text-white">
              GLOWN
            </span>

            {/* floating cards */}
            <ul className="absolute inset-x-0 top-[22%] space-y-5 pl-20 pr-10">
              {TRUST_POINTS.map(({ icon: Icon, text }, i) => (
                <li
                  key={text}
                  className="auth-float flex w-fit max-w-[17rem] items-center gap-3 rounded-2xl bg-surface px-4 py-3 text-sm font-medium text-ink shadow-[0_18px_36px_-14px_rgb(61_39_50/0.4)]"
                  style={{
                    marginLeft: i === 1 ? "2.5rem" : i === 2 ? "1rem" : 0,
                    animationDelay: `${-i * 1.8}s`,
                  }}
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent-ink">
                    <Icon size={17} />
                  </span>
                  {text}
                </li>
              ))}
            </ul>

            <p className="absolute bottom-12 left-20 right-12 font-display text-[2rem] leading-[1.15] text-white">
              Everything you need to look and feel your best.
            </p>
          </aside>
        </div>
      </div>
    </div>
  );
}
