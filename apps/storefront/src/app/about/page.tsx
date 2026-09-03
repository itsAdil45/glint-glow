import type { Metadata } from "next";
import Link from "next/link";
import { Sparkles, Truck, ShieldCheck, Heart } from "lucide-react";
import { PageHero } from "@/components/layout/page-hero";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Glint Glow is a curated home for makeup, skincare, fragrances, and lingerie — chosen with care, delivered with cash on delivery, everywhere.",
};

const VALUES = [
  {
    icon: ShieldCheck,
    title: "Authenticity, always",
    body: "Every product we list is sourced directly from brands and authorized distributors. No exceptions, no grey-market shortcuts.",
  },
  {
    icon: Sparkles,
    title: "Curated, not overwhelming",
    body: "We'd rather stock the pieces worth owning than every SKU that exists. Makeup, skincare, fragrances, and lingerie — each chosen on its own merit.",
  },
  {
    icon: Truck,
    title: "Cash on delivery, everywhere",
    body: "Pay when it arrives at your door, wherever you are. No card required, no upfront risk.",
  },
  {
    icon: Heart,
    title: "Built around real routines",
    body: "From a five-minute morning face to a proper self-care evening, we stock for how people actually get ready — not just how it photographs.",
  },
];

export default function AboutPage() {
  return (
    <div>
      <PageHero
        title="About Glint Glow"
        subtitle="A curated home for makeup, skincare, fragrances, and lingerie — chosen with care."
        breadcrumbItems={[{ label: "Home", href: "/" }, { label: "About" }]}
      />

      <section className="container-page py-16">
        <div className="max-w-3xl mx-auto space-y-6">
          <h2 className="font-display text-3xl">Our story</h2>
          <p className="text-muted leading-relaxed">
            Glint Glow started from a simple frustration: finding genuinely good beauty and
            intimates products online usually meant wading through hundreds of near-identical
            listings, unclear sourcing, and prices that didn&apos;t match what showed up at the
            door. We wanted something simpler — a store where every product on the shelf is
            there because someone actually chose it, not because an algorithm needed inventory.
          </p>
          <p className="text-muted leading-relaxed">
            Today that means four categories done properly rather than twenty done halfheartedly:
            makeup that performs as well as it photographs, skincare built around real routines,
            fragrances worth reaching for daily, and lingerie that fits how it should. We add new
            arrivals every week, and we&apos;re just as picky about what we take off the shelf as
            what we put on it.
          </p>
        </div>
      </section>

      <section className="bg-accent-soft/30 border-y border-line py-16">
        <div className="container-page">
          <h2 className="font-display text-3xl text-center mb-10">What we stand for</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {VALUES.map(({ icon: Icon, title, body }) => (
              <div key={title} className="bg-surface rounded-2xl border border-line p-6">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-soft text-accent-ink mb-4">
                  <Icon size={18} />
                </span>
                <h3 className="font-display text-lg mb-1.5">{title}</h3>
                <p className="text-sm text-muted leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container-page py-16">
        <div className="max-w-3xl mx-auto text-center space-y-5">
          <h2 className="font-display text-3xl">Have a question before you order?</h2>
          <p className="text-muted leading-relaxed">
            Our FAQ covers shipping, payment, and returns — or reach out directly and we&apos;ll
            get back to you.
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <Button asChild size="lg">
              <Link href="/faq">Read the FAQ</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/collections">Start shopping</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
