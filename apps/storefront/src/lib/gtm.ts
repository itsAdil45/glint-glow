// Google Tag Manager dataLayer helper. Events follow GA4's recommended
// ecommerce event schema (view_item / add_to_cart / begin_checkout /
// purchase), so any GA4 tag configured later inside the GTM dashboard can
// read these directly — no further code changes needed to wire up
// analytics once the container has a GA4 tag attached to it.

declare global {
  interface Window {
    dataLayer: Record<string, unknown>[];
  }
}

export interface GtmItem {
  item_id: string;
  item_name: string;
  price: number;
  item_brand?: string;
  item_variant?: string;
  quantity?: number;
}

const CURRENCY = "PKR";

function push(event: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer || [];
  // GA4's own recommendation: clear the previous ecommerce object first —
  // dataLayer values otherwise persist across pushes and can leak into the
  // next event's payload (e.g. a stale item list).
  window.dataLayer.push({ ecommerce: null });
  window.dataLayer.push(event);
}

export function trackViewItem(item: GtmItem) {
  push({
    event: "view_item",
    ecommerce: { currency: CURRENCY, value: item.price, items: [item] },
  });
}

export function trackAddToCart(item: GtmItem) {
  const quantity = item.quantity ?? 1;
  push({
    event: "add_to_cart",
    ecommerce: { currency: CURRENCY, value: item.price * quantity, items: [item] },
  });
}

export function trackBeginCheckout(items: GtmItem[], value: number) {
  push({
    event: "begin_checkout",
    ecommerce: { currency: CURRENCY, value, items },
  });
}

export function trackPurchase(params: {
  transactionId: string;
  value: number;
  shipping: number;
  items: GtmItem[];
}) {
  push({
    event: "purchase",
    ecommerce: {
      transaction_id: params.transactionId,
      currency: CURRENCY,
      value: params.value,
      shipping: params.shipping,
      items: params.items,
    },
  });
}
