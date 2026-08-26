import { categories, products, reviews } from "@/data/catalog";
import { coupons, computeDiscount } from "@/data/coupons";
import type {
  Address,
  Cart,
  CartLine,
  Category,
  Coupon,
  CouponResult,
  DataService,
  ID,
  Order,
  OrderStatus,
  OtpChallenge,
  Product,
  ProductQuery,
  Review,
  User,
} from "@/services/types";

/**
 * Mock adapter — works with zero external services.
 * Catalog is read from the in-repo data file; auth + orders persist to
 * localStorage in the browser so the demo survives refreshes.
 *
 * A demo admin account is seeded: admin@aurexindia.com / admin123
 */

const LS_USER = "aurex.user";
const LS_USERS = "aurex.users";
const LS_ORDERS = "aurex.orders";
const LS_PRODUCTS = "aurex.products.overrides";
const LS_OTP = "aurex.otp.pending";

const isBrowser = typeof window !== "undefined";

function readLS<T>(key: string, fallback: T): T {
  if (!isBrowser) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeLS<T>(key: string, value: T) {
  if (!isBrowser) return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

const seededAdmin: User & { password: string } = {
  id: "u-admin",
  email: "admin@aurexindia.com",
  fullName: "Aurex Admin",
  role: "admin",
  password: "admin123",
};

function allProducts(): Product[] {
  const overrides = readLS<Product[]>(LS_PRODUCTS, []);
  const map = new Map(products.map((p) => [p.id, p]));
  for (const o of overrides) map.set(o.id, o);
  // Exclude delete-tombstones and any malformed override so downstream code
  // (search filters, cards) never hits an undefined name/price/images.
  return Array.from(map.values()).filter(
    (p) => p && p.name && p.slug && !p.slug.startsWith("__deleted__")
  );
}

function delay<T>(value: T, ms = 120): Promise<T> {
  return new Promise((res) => setTimeout(() => res(value), ms));
}

export const mockService: DataService = {
  async getCategories(): Promise<Category[]> {
    return delay(categories);
  },

  async getCategory(slug) {
    return delay(categories.find((c) => c.slug === slug) ?? null);
  },

  async getProducts(query: ProductQuery = {}): Promise<Product[]> {
    let list = allProducts();
    if (query.categorySlug)
      list = list.filter((p) => p.categorySlug === query.categorySlug);
    if (query.isNew) list = list.filter((p) => p.isNew);
    if (query.isFeatured) list = list.filter((p) => p.isFeatured);
    if (query.search) {
      const q = query.search.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.shortDescription.toLowerCase().includes(q) ||
          p.material?.toLowerCase().includes(q)
      );
    }
    if (query.priceMin !== undefined) list = list.filter((p) => p.price >= query.priceMin!);
    if (query.priceMax !== undefined) list = list.filter((p) => p.price <= query.priceMax!);
    switch (query.sort) {
      case "price-asc":
        list = [...list].sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        list = [...list].sort((a, b) => b.price - a.price);
        break;
      case "rating":
        list = [...list].sort((a, b) => b.rating - a.rating);
        break;
      case "popular":
        list = [...list].sort((a, b) => b.reviewCount - a.reviewCount);
        break;
      case "newest":
        list = [...list].sort((a, b) => Number(!!b.isNew) - Number(!!a.isNew));
        break;
      case "relevant":
      case "featured":
      default:
        // Relevance: featured first, then rating × popularity as a tie-break.
        list = [...list].sort(
          (a, b) =>
            Number(!!b.isFeatured) - Number(!!a.isFeatured) ||
            b.rating * b.reviewCount - a.rating * a.reviewCount
        );
    }
    return delay(list);
  },

  async getProduct(slug) {
    return delay(allProducts().find((p) => p.slug === slug) ?? null);
  },

  async getReviews(productId: ID): Promise<Review[]> {
    return delay(reviews[productId] ?? []);
  },

  // ── Coupons ───────────────────────────────────────────
  async getCoupons(): Promise<Coupon[]> {
    return delay(coupons);
  },

  async validateCoupon(code: string, subtotal: number): Promise<CouponResult> {
    return delay(computeDiscount(code, subtotal, coupons));
  },

  // ── Auth ──────────────────────────────────────────────
  async signUp({ email, password, fullName, phone }) {
    const users = readLS<(User & { password: string })[]>(LS_USERS, []);
    if (users.some((u) => u.email === email))
      throw new Error("An account with this email already exists.");
    const user: User & { password: string } = {
      id: `u-${Date.now()}`,
      email,
      fullName,
      phone,
      role: "customer",
      password,
    };
    users.push(user);
    writeLS(LS_USERS, users);
    const { password: _pw, ...safe } = user;
    writeLS(LS_USER, safe);
    return delay(safe);
  },

  // `identifier` may be an email OR a 10-digit mobile number.
  async signIn(identifier, password) {
    const users = [
      seededAdmin,
      ...readLS<(User & { password: string })[]>(LS_USERS, []),
    ];
    const id = identifier.trim().toLowerCase();
    const phone = identifier.replace(/\D/g, "").slice(-10);
    const found = users.find(
      (u) =>
        u.password === password &&
        (u.email.toLowerCase() === id ||
          (phone.length === 10 && u.phone?.replace(/\D/g, "").slice(-10) === phone))
    );
    if (!found) throw new Error("Invalid email/phone or password.");
    const { password: _pw, ...safe } = found;
    writeLS(LS_USER, safe);
    return delay(safe);
  },

  async signOut() {
    if (isBrowser) window.localStorage.removeItem(LS_USER);
    return delay(undefined);
  },

  // ── Phone OTP (mock) ──────────────────────────────────
  // Generates a 6-digit code and returns it as `devCode` so it can be shown
  // on screen while there's no SMS provider. Supabase adapter sends a real SMS.
  async requestOtp(phone): Promise<OtpChallenge> {
    const norm = phone.replace(/\D/g, "").slice(-10);
    if (!/^[6-9]\d{9}$/.test(norm))
      throw new Error("Enter a valid 10-digit Indian mobile number.");
    const code = String(Math.floor(100000 + Math.random() * 900000));
    const pending = readLS<Record<string, string>>(LS_OTP, {});
    pending[norm] = code;
    writeLS(LS_OTP, pending);
    return delay({
      sent: true,
      devCode: code,
      message: `OTP sent to +91 ${norm}.`,
    });
  },

  async verifyOtp(phone, code, fullName) {
    const norm = phone.replace(/\D/g, "").slice(-10);
    const pending = readLS<Record<string, string>>(LS_OTP, {});
    if (pending[norm] !== code.trim())
      throw new Error("Incorrect or expired OTP. Please try again.");
    delete pending[norm];
    writeLS(LS_OTP, pending);

    const users = readLS<(User & { password: string })[]>(LS_USERS, []);
    let user = users.find((u) => u.phone?.replace(/\D/g, "").slice(-10) === norm);
    if (!user) {
      user = {
        id: `u-${Date.now()}`,
        email: `${norm}@phone.aurex`,
        fullName: fullName || `Aurex Customer`,
        phone: norm,
        role: "customer",
        password: "",
      };
      users.push(user);
      writeLS(LS_USERS, users);
    }
    const { password: _pw, ...safe } = user;
    writeLS(LS_USER, safe);
    return delay(safe);
  },

  async getCurrentUser() {
    return delay(readLS<User | null>(LS_USER, null));
  },

  // ── Orders ────────────────────────────────────────────
  async getOrders(userId) {
    const orders = readLS<Order[]>(LS_ORDERS, []);
    return delay(userId ? orders.filter((o) => o.userId === userId) : orders);
  },

  async getOrder(id) {
    return delay(readLS<Order[]>(LS_ORDERS, []).find((o) => o.id === id) ?? null);
  },

  async createOrder(userId: ID, lines: CartLine[], address?: Address) {
    const orders = readLS<Order[]>(LS_ORDERS, []);
    const total = lines.reduce((s, l) => s + l.unitPrice * l.quantity, 0);
    const order: Order = {
      id: `AX${Date.now().toString().slice(-8)}`,
      userId,
      createdAt: new Date().toISOString(),
      status: "pending",
      lines,
      total,
      shippingAddress: address,
    };
    orders.unshift(order);
    writeLS(LS_ORDERS, orders);
    return delay(order);
  },

  async updateOrderStatus(id: ID, status: OrderStatus) {
    const orders = readLS<Order[]>(LS_ORDERS, []);
    const idx = orders.findIndex((o) => o.id === id);
    if (idx < 0) throw new Error("Order not found.");
    orders[idx] = { ...orders[idx], status };
    writeLS(LS_ORDERS, orders);
    return delay(orders[idx]);
  },

  // ── Admin catalog ─────────────────────────────────────
  async upsertProduct(product: Product) {
    const overrides = readLS<Product[]>(LS_PRODUCTS, []);
    const idx = overrides.findIndex((p) => p.id === product.id);
    if (idx >= 0) overrides[idx] = product;
    else overrides.push(product);
    writeLS(LS_PRODUCTS, overrides);
    return delay(product);
  },

  async deleteProduct(id: ID) {
    const overrides = readLS<Product[]>(LS_PRODUCTS, []).filter(
      (p) => p.id !== id
    );
    // tombstone so base products can be hidden too
    overrides.push({ id, slug: `__deleted__${id}` } as Product);
    writeLS(LS_PRODUCTS, overrides);
    return delay(undefined);
  },

  async getUsers() {
    const users = readLS<User[]>(LS_USERS, []);
    return delay([{ ...seededAdmin, password: undefined } as User, ...users]);
  },
};

/** Pure helper so the cart context can compute totals without a round-trip. */
export function summarizeCart(lines: CartLine[]): Cart {
  const subtotal = lines.reduce((s, l) => s + l.unitPrice * l.quantity, 0);
  const itemCount = lines.reduce((s, l) => s + l.quantity, 0);
  return { lines, subtotal, itemCount };
}
