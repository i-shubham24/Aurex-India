import { useEffect, useMemo, useState } from "react";
import {
  LayoutDashboard, Package, ShoppingCart, Users, Plus, Trash2, Save, X,
} from "lucide-react";
import { data } from "@/services";
import { formatINR } from "@/lib/format";
import Seo from "@/components/Seo";
import type { Order, OrderStatus, Product, User } from "@/services/types";

type Tab = "dashboard" | "products" | "orders" | "users";
const ORDER_STATUSES: OrderStatus[] = [
  "pending", "confirmed", "packed", "shipped", "delivered", "cancelled",
];

export default function AdminPage() {
  const [tab, setTab] = useState<Tab>("dashboard");
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  async function refresh() {
    setLoading(true);
    try {
      const [p, o, u] = await Promise.all([
        data.getProducts(),
        data.getOrders(),
        data.getUsers(),
      ]);
      setProducts(p);
      setOrders(o);
      setUsers(u);
    } catch (err) {
      console.error("Admin refresh failed:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  const revenue = useMemo(
    () => orders.filter((o) => o.status !== "cancelled").reduce((s, o) => s + o.total, 0),
    [orders]
  );

  const tabs: { id: Tab; label: string; Icon: typeof Package }[] = [
    { id: "dashboard", label: "Dashboard", Icon: LayoutDashboard },
    { id: "products", label: "Products", Icon: Package },
    { id: "orders", label: "Orders", Icon: ShoppingCart },
    { id: "users", label: "Users", Icon: Users },
  ];

  return (
    <div className="container-x py-10">
      <Seo title="Admin Panel" noindex />
      <h1 className="text-3xl font-semibold">Admin panel</h1>
      <p className="mt-1 text-ink/60">Manage products, inventory, orders and customers.</p>

      <div className="mt-6 flex flex-wrap gap-2">
        {tabs.map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              tab === id ? "bg-ink text-cream" : "bg-white text-ink/70 ring-1 ring-ink/10 hover:bg-ink/[0.04]"
            }`}
          >
            <Icon size={16} /> {label}
          </button>
        ))}
      </div>

      <div className="mt-8">
        {loading ? (
          <div className="card h-40 animate-pulse bg-sand/50" />
        ) : tab === "dashboard" ? (
          <Dashboard
            products={products.length}
            orders={orders.length}
            users={users.length}
            revenue={revenue}
            recent={orders.slice(0, 5)}
          />
        ) : tab === "products" ? (
          <ProductsAdmin products={products} onChange={refresh} />
        ) : tab === "orders" ? (
          <OrdersAdmin orders={orders} onChange={refresh} />
        ) : (
          <UsersAdmin users={users} />
        )}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="card p-5">
      <p className="text-sm text-ink/55">{label}</p>
      <p className="mt-1 text-2xl font-semibold">{value}</p>
    </div>
  );
}

function Dashboard({
  products, orders, users, revenue, recent,
}: {
  products: number; orders: number; users: number; revenue: number; recent: Order[];
}) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Revenue" value={formatINR(revenue)} />
        <Stat label="Orders" value={orders} />
        <Stat label="Products" value={products} />
        <Stat label="Customers" value={users} />
      </div>
      <div className="card p-5">
        <h3 className="mb-3 font-semibold">Recent orders</h3>
        {recent.length === 0 ? (
          <p className="text-sm text-ink/55">No orders yet.</p>
        ) : (
          <ul className="divide-y divide-ink/[0.06] text-sm">
            {recent.map((o) => (
              <li key={o.id} className="flex items-center justify-between py-2">
                <span className="font-medium">{o.id}</span>
                <span className="capitalize text-ink/60">{o.status}</span>
                <span className="font-semibold">{formatINR(o.total)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function ProductsAdmin({ products, onChange }: { products: Product[]; onChange: () => void }) {
  const [editing, setEditing] = useState<Product | null>(null);

  async function del(id: string) {
    if (!confirm("Delete this product?")) return;
    await data.deleteProduct(id);
    onChange();
  }

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <button
          onClick={() =>
            setEditing({
              id: `p-${Date.now()}`, slug: "", name: "", categorySlug: "triply",
              price: 0, currency: "INR", images: [""], shortDescription: "", description: "",
              features: [], variants: [], rating: 0, reviewCount: 0, stock: 0,
            } as Product)
          }
          className="btn-copper"
        >
          <Plus size={16} /> Add product
        </button>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="border-b border-ink/10 text-left text-ink/55">
            <tr>
              <th className="p-4 font-medium">Product</th>
              <th className="p-4 font-medium">Category</th>
              <th className="p-4 font-medium">Price</th>
              <th className="p-4 font-medium">Stock</th>
              <th className="p-4 font-medium"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink/[0.06]">
            {products.map((p) => (
              <tr key={p.id}>
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <img src={p.images[0]} alt="" className="h-10 w-10 rounded-lg object-cover" />
                    <span className="font-medium">{p.name}</span>
                  </div>
                </td>
                <td className="p-4 capitalize text-ink/60">{p.categorySlug.replace(/-/g, " ")}</td>
                <td className="p-4">{formatINR(p.price)}</td>
                <td className="p-4">
                  <span className={p.stock < 20 ? "text-red-600" : ""}>{p.stock}</span>
                </td>
                <td className="p-4 text-right">
                  <button onClick={() => setEditing(p)} className="btn-ghost px-2 py-1 text-xs">Edit</button>
                  <button onClick={() => del(p.id)} className="p-1 text-ink/40 hover:text-red-600" aria-label="Delete">
                    <Trash2 size={15} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <ProductEditor
          product={editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            onChange();
          }}
        />
      )}
    </div>
  );
}

function ProductEditor({
  product, onClose, onSaved,
}: {
  product: Product; onClose: () => void; onSaved: () => void;
}) {
  const [form, setForm] = useState<Product>(product);
  const [saving, setSaving] = useState(false);

  function set<K extends keyof Product>(key: K, value: Product[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function save() {
    setSaving(true);
    const slug = form.slug || form.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    try {
      await data.upsertProduct({ ...form, slug, images: form.images.filter(Boolean) });
      onSaved();
    } catch (err) {
      alert("Failed to save product");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4" onClick={onClose}>
      <div className="w-full max-w-lg rounded-xl2 bg-cream p-6 shadow-lift" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">{product.slug ? "Edit product" : "New product"}</h3>
          <button onClick={onClose} className="btn-ghost p-2"><X size={18} /></button>
        </div>
        <div className="max-h-[70vh] space-y-3 overflow-y-auto pr-1">
          <div>
            <label className="label">Name</label>
            <input className="input" value={form.name} onChange={(e) => set("name", e.target.value)} />
          </div>
          <div>
            <label className="label">Category slug</label>
            <input className="input" value={form.categorySlug} onChange={(e) => set("categorySlug", e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Price (₹)</label>
              <input type="number" min={0} className="input" value={form.price}
                onChange={(e) => set("price", Math.max(0, Number(e.target.value) || 0))} />
            </div>
            <div>
              <label className="label">Stock</label>
              <input type="number" min={0} className="input" value={form.stock}
                onChange={(e) => set("stock", Math.max(0, Number(e.target.value) || 0))} />
            </div>
          </div>
          <div>
            <label className="label">Image URL</label>
            <input className="input" value={form.images[0] ?? ""} onChange={(e) => set("images", [e.target.value])} />
          </div>
          <div>
            <label className="label">Short description</label>
            <textarea className="input" rows={2} value={form.shortDescription} onChange={(e) => set("shortDescription", e.target.value)} />
          </div>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button onClick={onClose} className="btn-outline">Cancel</button>
          <button onClick={save} disabled={saving || !form.name} className="btn-primary">
            <Save size={16} /> {saving ? "Saving…" : "Save product"}
          </button>
        </div>
      </div>
    </div>
  );
}

function OrdersAdmin({ orders, onChange }: { orders: Order[]; onChange: () => void }) {
  async function setStatus(id: string, status: OrderStatus) {
    await data.updateOrderStatus(id, status);
    onChange();
  }

  if (orders.length === 0)
    return <div className="card p-10 text-center text-ink/55">No orders yet.</div>;

  return (
    <div className="card overflow-x-auto">
      <table className="w-full min-w-[640px] text-sm">
        <thead className="border-b border-ink/10 text-left text-ink/55">
          <tr>
            <th className="p-4 font-medium">Order</th>
            <th className="p-4 font-medium">Date</th>
            <th className="p-4 font-medium">Items</th>
            <th className="p-4 font-medium">Total</th>
            <th className="p-4 font-medium">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-ink/[0.06]">
          {orders.map((o) => (
            <tr key={o.id}>
              <td className="p-4 font-medium">{o.id}</td>
              <td className="p-4 text-ink/60">{new Date(o.createdAt).toLocaleDateString("en-IN")}</td>
              <td className="p-4 text-ink/60">{o.lines.length}</td>
              <td className="p-4 font-semibold">{formatINR(o.total)}</td>
              <td className="p-4">
                <select
                  aria-label={`Change status for order ${o.id}`}
                  value={o.status}
                  onChange={(e) => setStatus(o.id, e.target.value as OrderStatus)}
                  className="rounded-lg border border-ink/15 bg-white px-2 py-1 text-sm capitalize focus:border-copper focus:outline-none"
                >
                  {ORDER_STATUSES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function UsersAdmin({ users }: { users: User[] }) {
  return (
    <div className="card overflow-x-auto">
      <table className="w-full min-w-[480px] text-sm">
        <thead className="border-b border-ink/10 text-left text-ink/55">
          <tr>
            <th className="p-4 font-medium">Name</th>
            <th className="p-4 font-medium">Email</th>
            <th className="p-4 font-medium">Phone</th>
            <th className="p-4 font-medium">Role</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-ink/[0.06]">
          {users.map((u) => (
            <tr key={u.id}>
              <td className="p-4 font-medium">{u.fullName ?? "—"}</td>
              <td className="p-4 text-ink/60">{u.email}</td>
              <td className="p-4 text-ink/60">{u.phone ? `+91 ${u.phone}` : "—"}</td>
              <td className="p-4">
                <span className={`chip ${u.role === "admin" ? "bg-copper/15 text-copper" : "bg-ink/[0.06] text-ink/60"}`}>
                  {u.role}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
