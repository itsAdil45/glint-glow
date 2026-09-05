import type { Metadata } from "next";
import Link from "next/link";
import { Mail, Clock, MessageCircleQuestion } from "lucide-react";
import { PageHero } from "@/components/layout/page-hero";
import { ContactForm } from "@/components/contact/contact-form";

export const metadata: Metadata = {
  title: "Contact Us | Beauty, Skincare & Makeup Support",
  description:
    "Get in touch with the GLOWN team — questions about an order, a product, or anything else.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <div>
      <PageHero
        title="Contact us"
        subtitle="Have a question about an order, a product, or anything else? We'd love to hear from you."
        breadcrumbItems={[{ label: "Home", href: "/" }, { label: "Contact" }]}
      />

      <section className="container-page py-16">
        <div className="max-w-4xl mx-auto grid gap-10 lg:grid-cols-[1fr_1.4fr]">
          <div className="space-y-6">
            <InfoRow icon={Mail} title="Email us">
              <a
                href="mailto:support@glintglow.pk"
                className="text-accent-ink underline underline-offset-4"
              >
                support@glintglow.pk
              </a>
            </InfoRow>
            <InfoRow icon={Clock} title="Response time">
              We typically reply within 1–2 business days.
            </InfoRow>
            <InfoRow icon={MessageCircleQuestion} title="Quick answers">
              For common questions about orders, shipping, and returns, check
              our{" "}
              <Link
                href="/faq"
                className="text-accent-ink underline underline-offset-4"
              >
                FAQ
              </Link>{" "}
              first — you might find what you need right away.
            </InfoRow>
          </div>

          <ContactForm />
        </div>
      </section>
    </div>
  );
}

function InfoRow({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof Mail;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-3.5">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent-ink">
        <Icon size={17} />
      </span>
      <div>
        <h3 className="font-display text-lg mb-1">{title}</h3>
        <p className="text-sm text-muted leading-relaxed">{children}</p>
      </div>
    </div>
  );
}
