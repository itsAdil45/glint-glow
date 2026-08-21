export interface ProductImage {
  url: string;
  alt?: string;
}

export interface ProductAttribute {
  name: string;
  values: string[];
}

export interface ProductVariation {
  sku: string;
  attributes: Record<string, string>;
  price: number;
  compareAtPrice?: number;
  stock: number;
  images: ProductImage[];
  isActive: boolean;
}

export interface Product {
  _id: string;
  title: string;
  slug: string;
  description: string;
  shortDescription?: string;
  brand?: string;
  categoryIds: string[];
  images: ProductImage[];
  basePrice: number;
  compareAtPrice?: number;
  hasVariations: boolean;
  attributes: ProductAttribute[];
  variations: ProductVariation[];
  stock: number;
  isPublished: boolean;
  isFeatured: boolean;
  isFragrance: boolean;
  isSkinCare: boolean;
  isMakeupAccessory: boolean;
  isMakeup: boolean;
  isLingerie: boolean;
  relatedProductIds: string[];
  ratingsAvg: number;
  ratingsCount: number;
  seo: { title?: string; description?: string; keywords?: string[] };
  createdAt: string;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  parentId: string | null;
  image?: string;
  isActive: boolean;
  seo: { title?: string; description?: string };
}

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export interface OrderItem {
  productId: string;
  title: string;
  variationSku: string | null;
  attributes: Record<string, string>;
  quantity: number;
  price: number;
  image?: string;
}

export interface Order {
  _id: string;
  orderNumber: string;
  userId: string;
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  total: number;
  shippingAddress: {
    fullName: string;
    phone: string;
    line1: string;
    line2?: string;
    city: string;
    state?: string;
    postalCode: string;
    country: string;
  };
  phone: string;
  status: OrderStatus;
  paymentMethod: string;
  placedAt: string;
}

export interface AdminUser {
  _id: string;
  name: string;
  email: string;
  role: "customer" | "admin";
}
