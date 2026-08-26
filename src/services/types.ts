/**
 * Domain types + the DataService interface.
 *
 * The whole app talks to `DataService` only. Concrete adapters (mock now,
 * Supabase next, a custom Node/MERN backend later) implement this contract,
 * so swapping the backend never touches components. See src/services/index.ts.
 */

export type ID = string;

export interface Category {
  id: ID;
  slug: string;
  name: string;
  description?: string;
  image?: string;
}

export interface ProductVariant {
  id: ID;
  name: string; // e.g. "24 cm", "2 L"
  priceDelta?: number; // added to base price
  stock: number;
  images?: string[]; // per-size photos; when set, selecting the size swaps the gallery
}

export interface Review {
  id: ID;
  author: string;
  rating: number; // 1..5
  title?: string;
  body: string;
  verified?: boolean;
  createdAt: string;
}

export interface Product {
  id: ID;
  slug: string;
  name: string;
  categorySlug: string;
  price: number; // INR, base
  compareAtPrice?: number; // strike-through original
  currency: "INR";
  images: string[];
  shortDescription: string;
  description: string;
  features: string[];
  material?: string;
  variants: ProductVariant[];
  rating: number;
  reviewCount: number;
  stock: number;
  badges?: string[]; // "New", "Bestseller", "Lifetime Warranty"
  isNew?: boolean;
  isFeatured?: boolean;
}

export interface CartLine {
  productId: ID;
  slug: string;
  name: string;
  image: string;
  variantId?: ID;
  variantName?: string;
  unitPrice: number;
  quantity: number;
}

export interface Cart {
  lines: CartLine[];
  subtotal: number;
  itemCount: number;
}

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "packed"
  | "shipped"
  | "delivered"
  | "cancelled";

export interface Order {
  id: ID;
  userId: ID;
  createdAt: string;
  status: OrderStatus;
  lines: CartLine[];
  total: number;
  shippingAddress?: Address;
  trackingNumber?: string;
}

export interface Address {
  fullName: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
}

export interface User {
  id: ID;
  email: string;
  fullName?: string;
  phone?: string;
  role: "customer" | "admin";
}

export interface Coupon {
  code: string;
  label: string;
  /** "percent" → value is a %, "flat" → value is INR off */
  type: "percent" | "flat";
  value: number;
  minSubtotal?: number;
  maxDiscount?: number; // cap for percent coupons
}

export interface CouponResult {
  ok: boolean;
  coupon?: Coupon;
  discount: number;
  message: string;
}

export interface SignUpInput {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
}

export interface OtpChallenge {
  sent: boolean;
  /** Present only on the mock backend (no SMS provider) so the code can be
   *  shown on screen for testing. Never populated by the real backend. */
  devCode?: string;
  message: string;
}

export interface ProductQuery {
  categorySlug?: string;
  search?: string;
  sort?: "relevant" | "popular" | "featured" | "price-asc" | "price-desc" | "newest" | "rating";
  isNew?: boolean;
  isFeatured?: boolean;
  priceMin?: number;
  priceMax?: number;
}

/** The single contract every backend adapter must satisfy. */
export interface DataService {
  // Catalog
  getCategories(): Promise<Category[]>;
  getCategory(slug: string): Promise<Category | null>;
  getProducts(query?: ProductQuery): Promise<Product[]>;
  getProduct(slug: string): Promise<Product | null>;
  getReviews(productId: ID): Promise<Review[]>;

  // Coupons / discounts
  getCoupons(): Promise<Coupon[]>;
  validateCoupon(code: string, subtotal: number): Promise<CouponResult>;

  // Auth (mock/Supabase both implement)
  signUp(input: SignUpInput): Promise<User>;
  /** identifier = email OR 10-digit mobile number */
  signIn(identifier: string, password: string): Promise<User>;
  signOut(): Promise<void>;
  getCurrentUser(): Promise<User | null>;

  // Phone OTP (passwordless). requestOtp "sends" a code; verifyOtp signs in,
  // creating a lightweight account for a brand-new phone number.
  requestOtp(phone: string): Promise<OtpChallenge>;
  verifyOtp(phone: string, code: string, fullName?: string): Promise<User>;

  // Orders (admin + account)
  getOrders(userId?: ID): Promise<Order[]>;
  getOrder(id: ID): Promise<Order | null>;
  createOrder(userId: ID, lines: CartLine[], address?: Address): Promise<Order>;
  updateOrderStatus(id: ID, status: OrderStatus): Promise<Order>;

  // Admin: catalog management
  upsertProduct(product: Product): Promise<Product>;
  deleteProduct(id: ID): Promise<void>;
  getUsers(): Promise<User[]>;
}
