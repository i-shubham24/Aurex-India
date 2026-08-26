import { Link, useNavigate } from "react-router-dom";
import { LogOut, Package, User as UserIcon, ShieldCheck } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { data } from "@/services";
import { useAsync } from "@/lib/useAsync";
import { formatINR } from "@/lib/format";
import Seo from "@/components/Seo";
import type { OrderStatus } from "@/services/types";

const statusStyle: Record<OrderStatus, string> = {
  pending: "bg-amber-100 text-amber-700",
  confirmed: "bg-blue-100 text-blue-700",
  packed: "bg-indigo-100 text-indigo-700",
  shipped: "bg-purple-100 text-purple-700",
  delivered: "bg-forest/10 text-forest",
  cancelled: "bg-red-100 text-red-700",
};

export default function AccountPage() {
  const { user, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const { data: orders, loading } = useAsync(
    () => (user ? data.getOrders(user.id) : Promise.resolve([])),
    [user?.id]
  );

  async function logout() {
    await signOut();
    navigate("/");
  }

  if (!user) return null;

  return (
    <div className="container-x py-10">
      <Seo title="My Account" noindex />
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">My account</h1>
          <p className="mt-1 text-ink/60">Welcome back, {user.fullName ?? user.email}.</p>
        </div>
        <div className="flex gap-2">
          {isAdmin && (
            <Link to="/admin" className="btn-copper">
              <ShieldCheck size={16} /> Admin panel
            </Link>
          )}
          <button onClick={logout} className="btn-outline">
            <LogOut size={16} /> Sign out
          </button>
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[300px_1fr]">
        {/* Profile */}
        <div className="card h-fit p-6">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-full bg-copper/10 text-copper">
              <UserIcon size={22} />
            </div>
            <div>
              <p className="font-semibold">{user.fullName ?? "Aurex Customer"}</p>
              <p className="text-xs text-ink/55">{user.role}</p>
            </div>
          </div>
          <dl className="mt-5 space-y-3 text-sm">
            <div>
              <dt className="text-ink/50">Email</dt>
              <dd className="font-medium">{user.email}</dd>
            </div>
            {user.phone && (
              <div>
                <dt className="text-ink/50">Mobile</dt>
                <dd className="font-medium">+91 {user.phone}</dd>
              </div>
            )}
          </dl>
        </div>

        {/* Orders */}
        <div>
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
            <Package size={18} /> My orders
          </h2>
          {loading ? (
            <div className="card h-32 animate-pulse bg-sand/50" />
          ) : orders && orders.length > 0 ? (
            <div className="space-y-4">
              {orders.map((o) => (
                <div key={o.id} className="card p-5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="font-semibold">Order {o.id}</p>
                      <p className="text-xs text-ink/50">
                        {new Date(o.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric", month: "short", year: "numeric",
                        })}
                      </p>
                    </div>
                    <span className={`chip capitalize ${statusStyle[o.status]}`}>{o.status}</span>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {o.lines.map((l) => (
                      <img
                        key={`${l.productId}-${l.variantId ?? ""}`}
                        src={l.image}
                        alt={l.name}
                        title={l.name}
                        className="h-14 w-14 rounded-lg object-cover"
                      />
                    ))}
                  </div>
                  <div className="mt-4 flex items-center justify-between border-t border-ink/10 pt-3 text-sm">
                    <span className="text-ink/60">{o.lines.length} item(s)</span>
                    <span className="font-semibold">{formatINR(o.total)}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="card p-10 text-center">
              <p className="text-ink/60">No orders yet.</p>
              <Link to="/shop" className="btn-copper mt-4">Start shopping</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
