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
  isFeatured: boolean;
  relatedProductIds: Product[] | string[];
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
  seo: { title?: string; description?: string };
}

export interface ProductListResponse {
  items: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CartLineItem {
  productId: string;
  variationSku: string | null;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  title: string;
  slug: string;
  image?: string;
  attributes: Record<string, string> | null;
  availableStock: number;
}

export interface CartResponse {
  id: string;
  items: CartLineItem[];
  subtotal: number;
}

export interface Address {
  _id: string;
  fullName: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

export interface UserProfile {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: "customer" | "admin";
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
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  total: number;
  shippingAddress: Omit<Address, "_id" | "isDefault">;
  phone: string;
  status: OrderStatus;
  paymentMethod: string;
  placedAt: string;
}
