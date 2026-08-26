import { Navigate, useLocation } from "react-router-dom";
import type { ReactNode } from "react";
import { useAuth } from "@/context/AuthContext";

export default function RequireAuth({
  children,
  admin = false,
}: {
  children: ReactNode;
  admin?: boolean;
}) {
  const { user, loading, isAdmin } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="container-x flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-ink/20 border-t-copper" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (admin && !isAdmin) {
    return (
      <div className="container-x py-24 text-center">
        <h1 className="text-2xl font-semibold">Admins only</h1>
        <p className="mt-2 text-ink/60">
          This area is restricted to Aurex staff accounts.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
