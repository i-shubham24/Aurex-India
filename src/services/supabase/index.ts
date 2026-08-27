import { getSupabase } from "@/lib/supabase";
import { computeDiscount } from "@/data/coupons";
import type {
  Address,
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
 * Supabase adapter. Implements the same DataService contract as the mock, but
 * against Postgres tables (see supabase/schema.sql). Not yet exercised against
 * a live project — flip VITE_DATA_SOURCE=supabase and run the schema to enable.
 *
 * Table/column names are kept close to the domain types so the mapping is
 * obvious. Adjust here only — never in components.
 */

function db() {
  return getSupabase();
}

function mapProductRow(row: any): Product {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    categorySlug: row.category_slug,
    price: row.price,
    compareAtPrice: row.compare_at_price ?? undefined,
    currency: "INR",
    images: row.images ?? [],
    shortDescription: row.short_description ?? "",
    description: row.description ?? "",
    features: row.features ?? [],
    material: row.material ?? undefined,
    variants: row.variants ?? [],
    rating: row.rating ?? 0,
    reviewCount: row.review_count ?? 0,
    stock: row.stock ?? 0,
    badges: row.badges ?? [],
    isNew: row.is_new ?? false,
    isFeatured: row.is_featured ?? false,
  };
}

export const supabaseService: DataService = {
  async getCategories(): Promise<Category[]> {
    const { data, error } = await db().from("categories").select("*").order("name");
    if (error) throw error;
    return (data ?? []) as Category[];
  },

  async getCategory(slug) {
    const { data, error } = await db()
      .from("categories")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();
    if (error) throw error;
    return (data as Category) ?? null;
  },

  async getProducts(query: ProductQuery = {}): Promise<Product[]> {
    let q = db().from("products").select("*");
    if (query.categorySlug) q = q.eq("category_slug", query.categorySlug);
    if (query.isNew) q = q.eq("is_new", true);
    if (query.isFeatured) q = q.eq("is_featured", true);
    if (query.search) q = q.ilike("name", `%${query.search}%`);
    if (query.priceMin !== undefined) q = q.gte("price", query.priceMin);
    if (query.priceMax !== undefined) q = q.lte("price", query.priceMax);
    switch (query.sort) {
      case "price-asc":
        q = q.order("price", { ascending: true });
        break;
      case "price-desc":
        q = q.order("price", { ascending: false });
        break;
      case "rating":
        q = q.order("rating", { ascending: false });
        break;
      case "popular":
        q = q.order("review_count", { ascending: false });
        break;
      case "newest":
        q = q.order("created_at", { ascending: false });
        break;
      case "relevant":
      case "featured":
      default:
        q = q.order("is_featured", { ascending: false }).order("rating", { ascending: false });
    }
    const { data, error } = await q;
    if (error) throw error;
    return (data ?? []).map(mapProductRow);
  },

  async getProduct(slug) {
    const { data, error } = await db()
      .from("products")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();
    if (error) throw error;
    return data ? mapProductRow(data) : null;
  },

  async getReviews(productId: ID): Promise<Review[]> {
    const { data, error } = await db()
      .from("reviews")
      .select("*")
      .eq("product_id", productId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []) as Review[];
  },

  async getCoupons(): Promise<Coupon[]> {
    const { data, error } = await db().from("coupons").select("*").eq("active", true);
    if (error) throw error;
    return (data ?? []) as Coupon[];
  },

  async validateCoupon(code: string, subtotal: number): Promise<CouponResult> {
    const list = await this.getCoupons();
    return computeDiscount(code, subtotal, list);
  },

  async signUp({ email, password, fullName, phone }) {
    const { data, error } = await db().auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName, phone } },
    });
    if (error) throw error;
    const u = data.user;
    return {
      id: u?.id ?? "",
      email,
      fullName,
      phone,
      role: "customer",
    };
  },

  // `identifier` may be an email OR a 10-digit mobile number.
  async signIn(identifier, password) {
    const isPhone = /^[6-9]\d{9}$/.test(identifier.replace(/\D/g, "").slice(-10));
    const credentials = isPhone
      ? { phone: `+91${identifier.replace(/\D/g, "").slice(-10)}`, password }
      : { email: identifier.trim(), password };
    const { data, error } = await db().auth.signInWithPassword(credentials);
    if (error) throw error;
    const u = data.user;
    return {
      id: u?.id ?? "",
      email: u?.email ?? (isPhone ? "" : identifier),
      fullName: (u?.user_metadata as any)?.full_name,
      phone: (u?.user_metadata as any)?.phone,
      role: ((u?.user_metadata as any)?.role as User["role"]) ?? "customer",
    };
  },

  async signOut() {
    const { error } = await db().auth.signOut();
    if (error) throw error;
  },

  async requestOtp(phone): Promise<OtpChallenge> {
    const e164 = `+91${phone.replace(/\D/g, "").slice(-10)}`;
    const { error } = await db().auth.signInWithOtp({ phone: e164 });
    if (error) throw error;
    // No devCode on the real backend — a real SMS is sent.
    return { sent: true, message: `OTP sent to ${e164}.` };
  },

  async verifyOtp(phone, code, fullName): Promise<User> {
    const e164 = `+91${phone.replace(/\D/g, "").slice(-10)}`;
    const { data, error } = await db().auth.verifyOtp({
      phone: e164,
      token: code.trim(),
      type: "sms",
    });
    if (error) throw error;
    const u = data.user;
    if (fullName && u) {
      await db().auth.updateUser({ data: { full_name: fullName } });
    }
    return {
      id: u?.id ?? "",
      email: u?.email ?? "",
      fullName: (u?.user_metadata as any)?.full_name ?? fullName,
      phone: u?.phone ?? phone,
      role: ((u?.user_metadata as any)?.role as User["role"]) ?? "customer",
    };
  },

  async getCurrentUser() {
    const { data } = await db().auth.getUser();
    const u = data.user;
    if (!u) return null;
    return {
      id: u.id,
      email: u.email ?? "",
      fullName: (u.user_metadata as any)?.full_name,
      phone: (u.user_metadata as any)?.phone,
      role: ((u.user_metadata as any)?.role as User["role"]) ?? "customer",
    };
  },

  async getOrders(userId) {
    let q = db().from("orders").select("*").order("created_at", { ascending: false });
    if (userId) q = q.eq("user_id", userId);
    const { data, error } = await q;
    if (error) throw error;
    return (data ?? []) as Order[];
  },

  async getOrder(id) {
    const { data, error } = await db()
      .from("orders")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (error) throw error;
    return (data as Order) ?? null;
  },

  async createOrder(userId: ID, lines: CartLine[], address?: Address, couponCode?: string) {
    const total = lines.reduce((sum, l) => sum + l.unitPrice * l.quantity, 0);
    const { data, error } = await db()
      .from("orders")
      .insert({
        user_id: userId,
        status: "pending",
        lines,
        total,
        shipping_address: address ?? null,
      })
      .select()
      .single();
    if (error) throw error;
    return data as Order;
  },

  async updateOrderStatus(id: ID, status: OrderStatus) {
    const { data, error } = await db()
      .from("orders")
      .update({ status })
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data as Order;
  },

  async upsertProduct(product: Product) {
    const row = {
      id: product.id,
      slug: product.slug,
      name: product.name,
      category_slug: product.categorySlug,
      price: product.price,
      compare_at_price: product.compareAtPrice ?? null,
      images: product.images,
      short_description: product.shortDescription,
      description: product.description,
      features: product.features,
      material: product.material ?? null,
      variants: product.variants,
      rating: product.rating,
      review_count: product.reviewCount,
      stock: product.stock,
      badges: product.badges ?? [],
      is_new: product.isNew ?? false,
      is_featured: product.isFeatured ?? false,
    };
    const { error } = await db().from("products").upsert(row);
    if (error) throw error;
    return product;
  },

  async deleteProduct(id: ID) {
    const { error } = await db().from("products").delete().eq("id", id);
    if (error) throw error;
  },

  async getUsers() {
    // Requires a "profiles" table mirroring auth.users (see schema.sql).
    const { data, error } = await db().from("profiles").select("*");
    if (error) throw error;
    return (data ?? []) as User[];
  },
};
