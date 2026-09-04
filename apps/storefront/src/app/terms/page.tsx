import type { Metadata } from "next";
import { PageHero } from "@/components/layout/page-hero";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "The terms and conditions that govern your use of GLOWN and any orders placed with us.",
};

const LAST_UPDATED = "September 2026";

export default function TermsPage() {
  return (
    <div>
      <PageHero
        title="Terms of Service"
        subtitle={`Last updated ${LAST_UPDATED}`}
        breadcrumbItems={[{ label: "Home", href: "/" }, { label: "Terms of Service" }]}
      />

      <section className="container-page py-16">
        <div className="max-w-3xl mx-auto space-y-10">
          <p className="text-muted leading-relaxed">
            These Terms of Service (&quot;Terms&quot;) govern your access to and use of Glint
            Glow&apos;s website and any purchase you make with us. By using our site or placing
            an order, you agree to be bound by these Terms. Please read them carefully.
          </p>

          <PolicySection title="1. Acceptance of terms">
            <p>
              By accessing or using our website, creating an account, or placing an order, you
              confirm that you accept these Terms and agree to comply with them. If you do not
              agree, please do not use our site.
            </p>
          </PolicySection>

          <PolicySection title="2. Account registration">
            <p>
              To place an order or access certain features, you may need to create an account.
              You&apos;re responsible for keeping your login credentials confidential and for all
              activity that happens under your account. Let us know right away if you suspect
              unauthorized use.
            </p>
          </PolicySection>

          <PolicySection title="3. Product information & pricing">
            <p>
              We do our best to ensure product descriptions, images, and prices are accurate.
              Colors may vary slightly depending on your screen, and we reserve the right to
              correct any pricing or listing errors, even after an order has been placed —
              we&apos;ll always contact you first if this affects your order.
            </p>
            <p>All prices are listed in Pakistani Rupees (PKR) unless stated otherwise.</p>
          </PolicySection>

          <PolicySection title="4. Orders & payment">
            <p>
              Placing an order is an offer to purchase, which we may accept or decline (for
              example, if an item is out of stock or there&apos;s a pricing error). We currently
              accept cash on delivery — payment is collected when your order arrives. We reserve
              the right to cancel orders we reasonably suspect to be fraudulent or abusive.
            </p>
          </PolicySection>

          <PolicySection title="5. Shipping & delivery">
            <p>
              Delivery timeframes shown at checkout are estimates, not guarantees. Delays can
              happen due to courier issues, weather, or circumstances outside our control.
              Please make sure your delivery address and phone number are accurate — we&apos;re
              not responsible for failed deliveries caused by incorrect details.
            </p>
          </PolicySection>

          <PolicySection title="6. Returns & exchanges">
            <p>
              If something isn&apos;t right with your order, contact us as soon as possible after
              delivery. For hygiene reasons, certain categories — including opened cosmetics and
              intimates — may not be eligible for return or exchange unless the item arrived
              damaged, defective, or incorrect. We&apos;ll always work with you to make it right.
            </p>
          </PolicySection>

          <PolicySection title="7. Intellectual property">
            <p>
              All content on this site — including product photography, text, logos, and
              design — belongs to GLOWN or our licensors and is protected by applicable
              intellectual property laws. You may not reproduce, distribute, or use it
              commercially without our written permission.
            </p>
          </PolicySection>

          <PolicySection title="8. User conduct">
            <p>You agree not to:</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Use the site for any unlawful purpose or in violation of these Terms.</li>
              <li>Attempt to gain unauthorized access to our systems or another user&apos;s account.</li>
              <li>Post reviews or content that is false, defamatory, or misleading.</li>
              <li>Interfere with the proper functioning of the site.</li>
            </ul>
          </PolicySection>

          <PolicySection title="9. Limitation of liability">
            <p>
              To the fullest extent permitted by law, GLOWN is not liable for any indirect,
              incidental, or consequential damages arising from your use of the site or products
              purchased through it. Our total liability for any claim is limited to the amount
              you paid for the relevant order.
            </p>
          </PolicySection>

          <PolicySection title="10. Governing law">
            <p>
              These Terms are governed by the laws of Pakistan, without regard to conflict of
              law principles. Any disputes arising from these Terms or your use of the site will
              be subject to the exclusive jurisdiction of the courts of Pakistan.
            </p>
          </PolicySection>

          <PolicySection title="11. Changes to these terms">
            <p>
              We may update these Terms from time to time. Changes take effect once posted on
              this page, with the &quot;last updated&quot; date revised accordingly. Continuing
              to use the site after changes are posted means you accept the updated Terms.
            </p>
          </PolicySection>

          <PolicySection title="12. Contact us">
            <p>
              Questions about these Terms? Reach out to us at{" "}
              <a href="mailto:support@glintglow.pk" className="text-accent-ink underline underline-offset-4">
                support@glintglow.pk
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
