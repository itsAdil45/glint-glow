import type { Metadata } from "next";
import { PageHero } from "@/components/layout/page-hero";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How GLOWN collects, uses, and protects your personal information.",
};

const LAST_UPDATED = "September 2026";

export default function PrivacyPage() {
  return (
    <div>
      <PageHero
        title="Privacy Policy"
        subtitle={`Last updated ${LAST_UPDATED}`}
        breadcrumbItems={[{ label: "Home", href: "/" }, { label: "Privacy Policy" }]}
      />

      <section className="container-page py-16">
        <div className="max-w-3xl mx-auto space-y-10">
          <p className="text-muted leading-relaxed">
            This Privacy Policy explains how GLOWN (&quot;we&quot;, &quot;us&quot;, or
            &quot;our&quot;) collects, uses, discloses, and safeguards your information when you
            visit our website or place an order with us. By using our site, you agree to the
            practices described here.
          </p>

          <PolicySection title="1. Information we collect">
            <p>We collect information you give us directly, including:</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Account details — your name, email address, and phone number when you register.</li>
              <li>
                Order and delivery information — shipping address, billing details, and order
                history, needed to fulfill and track your purchases.
              </li>
              <li>
                Communications — anything you send us through the contact form, customer support,
                or product reviews.
              </li>
            </ul>
            <p>We also collect certain information automatically:</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>
                Device and usage data — browser type, pages visited, and time spent, collected
                through standard web technologies to help us understand how the site is used.
              </li>
              <li>Cookies and similar technologies, described in more detail below.</li>
            </ul>
          </PolicySection>

          <PolicySection title="2. How we use your information">
            <p>We use the information we collect to:</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Process, fulfill, and deliver your orders, including cash-on-delivery orders.</li>
              <li>Create and maintain your account, and let you track past orders.</li>
              <li>Respond to your questions, requests, and customer support inquiries.</li>
              <li>
                Send you order confirmations, shipping updates, and — only with your consent —
                marketing communications about new arrivals and offers.
              </li>
              <li>Improve our website, catalog, and overall shopping experience.</li>
              <li>Detect and prevent fraud, abuse, and security incidents.</li>
              <li>Comply with our legal obligations.</li>
            </ul>
          </PolicySection>

          <PolicySection title="3. Cookies">
            <p>
              We use cookies and similar technologies to keep you logged in, remember items in
              your cart, and understand how our site is used. You can control or disable cookies
              through your browser settings, though some parts of the site — like checkout — may
              not work correctly without them.
            </p>
          </PolicySection>

          <PolicySection title="4. How we share your information">
            <p>We do not sell your personal information. We share it only where necessary:</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>
                With delivery and logistics partners, to get your order to your door — including
                for cash-on-delivery collection.
              </li>
              <li>
                With service providers who help us run the site (such as hosting, image storage,
                and email delivery), under obligations to protect your data.
              </li>
              <li>Where required by law, regulation, or a valid legal process.</li>
              <li>In connection with a business transfer, such as a merger or acquisition.</li>
            </ul>
          </PolicySection>

          <PolicySection title="5. Data security">
            <p>
              We take reasonable technical and organizational measures to protect your
              information — including encrypting passwords and restricting access to personal
              data on a need-to-know basis. No method of transmission or storage is completely
              secure, but we work to protect your information to industry standards.
            </p>
          </PolicySection>

          <PolicySection title="6. Data retention">
            <p>
              We keep your personal information for as long as your account is active or as
              needed to provide you services, comply with our legal obligations, resolve
              disputes, and enforce our agreements.
            </p>
          </PolicySection>

          <PolicySection title="7. Your rights and choices">
            <p>Depending on your location, you may have the right to:</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Access, correct, or update the personal information in your account.</li>
              <li>Request deletion of your account and associated personal data.</li>
              <li>Opt out of marketing emails at any time via the unsubscribe link.</li>
            </ul>
            <p>
              You can update most account details yourself from your account page, or contact us
              to make a request.
            </p>
          </PolicySection>

          <PolicySection title="8. Children's privacy">
            <p>
              Our site is not directed at children under 13, and we do not knowingly collect
              personal information from children. If you believe a child has provided us with
              personal information, please contact us and we will remove it.
            </p>
          </PolicySection>

          <PolicySection title="9. Changes to this policy">
            <p>
              We may update this Privacy Policy from time to time to reflect changes in our
              practices or for legal, operational, or regulatory reasons. We&apos;ll update the
              &quot;last updated&quot; date above whenever we do, and encourage you to review this
              page periodically.
            </p>
          </PolicySection>

          <PolicySection title="10. Contact us">
            <p>
              If you have questions about this Privacy Policy or how we handle your information,
              reach out to us at{" "}
              <a href="mailto:privacy@glintglow.pk" className="text-accent-ink underline underline-offset-4">
                privacy@glintglow.pk
              </a>
              .
            </p>
          </PolicySection>
        </div>
      </section>
    </div>
  );
}

function PolicySection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="font-display text-2xl mb-3">{title}</h2>
      <div className="text-muted leading-relaxed space-y-3">{children}</div>
    </div>
  );
}
