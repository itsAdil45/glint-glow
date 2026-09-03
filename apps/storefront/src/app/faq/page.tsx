import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/layout/page-hero";
import { FaqAccordion, FaqItem } from "@/components/faq/faq-accordion";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Answers to common questions about ordering, payment, shipping, and returns at Glint Glow.",
};

const FAQ_GROUPS: { title: string; items: FaqItem[] }[] = [
  {
    title: "Orders & payment",
    items: [
      {
        question: "How do I place an order?",
        answer:
          "Browse any category, add items to your cart, and head to checkout. You'll enter your delivery details and confirm your order — no payment is taken upfront.",
      },
      {
        question: "What payment methods do you accept?",
        answer:
          "We currently offer cash on delivery on every order, everywhere we deliver. You pay in cash when your order arrives at your door — no card or advance payment needed.",
      },
      {
        question: "Can I change or cancel my order after placing it?",
        answer:
          "If your order hasn't shipped yet, contact us as soon as possible and we'll do our best to update or cancel it. Once it's out for delivery, changes usually aren't possible.",
      },
      {
        question: "Do I need an account to order?",
        answer:
          "You can browse and add items to your cart without an account, but you'll need to create one (or sign in with Google) at checkout so we can confirm your order and let you track it.",
      },
    ],
  },
  {
    title: "Shipping & delivery",
    items: [
      {
        question: "How long does delivery take?",
        answer:
          "Delivery times vary by location, but most orders arrive within a few business days of being placed. You'll see an estimate at checkout before you confirm your order.",
      },
      {
        question: "Do you deliver everywhere?",
        answer:
          "We deliver cash-on-delivery orders nationwide. If we're ever unable to reach your specific area, we'll let you know before your order ships.",
      },
      {
        question: "How can I track my order?",
        answer:
          "Once you're logged in, visit your account's order history to see the current status of every order you've placed with us.",
      },
      {
        question: "What if I'm not home when my order arrives?",
        answer:
          "Our delivery partner will typically attempt redelivery or contact you to arrange a convenient time. Keeping your phone number accurate at checkout helps this go smoothly.",
      },
    ],
  },
  {
    title: "Returns & exchanges",
    items: [
      {
        question: "What's your return policy?",
        answer:
          "If an item arrives damaged, defective, or incorrect, contact us right away and we'll sort out a replacement or refund. For hygiene reasons, opened cosmetics and intimates generally can't be returned unless there's a genuine issue with the item itself.",
      },
      {
        question: "How do I start a return?",
        answer:
          "Reach out to us with your order number and a quick description (and photo, if possible) of the issue, and we'll guide you through the next steps.",
      },
    ],
  },
  {
    title: "Products & account",
    items: [
      {
        question: "Are your products authentic?",
        answer:
          "Yes — every product we list is sourced directly from brands or authorized distributors. We don't deal in grey-market or counterfeit stock.",
      },
      {
        question: "How do I know if a product will suit me?",
        answer:
          "Each product page includes a full description and available shades or sizes. If you're ever unsure, our customer service team is happy to help you choose before you order.",
      },
      {
        question: "How do I reset my password?",
        answer:
          "From the login page, select \"Forgot password?\" and we'll send a one-time code to your email so you can set a new one.",
      },
      {
        question: "Can I sign in with Google?",
        answer:
          "Yes — you can create an account or log in with your Google account directly from the login and register pages, no separate password needed.",
      },
    ],
  },
];

export default function FaqPage() {
  return (
    <div>
      <PageHero
        title="Frequently asked questions"
        subtitle="Everything you need to know about ordering, payment, shipping, and returns."
        breadcrumbItems={[{ label: "Home", href: "/" }, { label: "FAQ" }]}
      />

      <section className="container-page py-16">
        <div className="max-w-3xl mx-auto space-y-12">
          {FAQ_GROUPS.map((group) => (
            <div key={group.title}>
              <h2 className="font-display text-2xl mb-4">{group.title}</h2>
              <FaqAccordion items={group.items} />
            </div>
          ))}

          <p className="text-center text-sm text-muted pt-4">
            Still have a question?{" "}
            <Link href="/about" className="text-accent-ink underline underline-offset-4">
              Learn more about us
            </Link>{" "}
            or reach out — a dedicated contact page is coming soon.
          </p>
        </div>
      </section>
    </div>
  );
}
