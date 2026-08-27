import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { data } from "@/services";
import type { OtpChallenge, SignUpInput, User } from "@/services/types";
import { useToast } from "@/context/ToastContext";
import { authApi } from "@/api/authApi";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  signIn: (identifier: string, password: string) => Promise<User>;
  signUp: (input: SignUpInput) => Promise<User>;
  signOut: () => Promise<void>;
  requestOtp: (phone: string) => Promise<OtpChallenge>;
  verifyOtp: (phone: string, code: string, fullName?: string) => Promise<User>;
  authModalOpen: boolean;
  authModalMode: "login" | "signup";
  openAuthModal: (mode?: "login" | "signup") => void;
  closeAuthModal: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const toast = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Global Auth Modal states
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<"login" | "signup">("login");

  const openAuthModal = useCallback((mode: "login" | "signup" = "login") => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setAuthModalOpen(false);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("aurex_token");
    if (token) {
      authApi.getMe()
        .then(({ user }) => setUser(user))
        .catch((err: any) => {
          if (err.response && (err.response.status === 401 || err.response.status === 403)) {
            localStorage.removeItem("aurex_token");
            setUser(null);
          } else {
            console.error("getMe failed:", err);
            // Don't toast on AbortError/CanceledError to avoid noise on normal reloads
            if (err.name !== 'CanceledError' && err.message !== 'canceled') {
              toast.error("Network error while verifying session. Please refresh.");
            }
          }
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      const { token, user: u } = await authApi.login(email, password);
      localStorage.setItem("aurex_token", token);
      setUser(u);
      toast.success("Welcome back! Signed in successfully.");
      return u;
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Failed to sign in.";
      toast.error(msg);
      throw err;
    }
  }, [toast]);

  const signUp = useCallback(async (input: SignUpInput) => {
    try {
      const { token, user: u } = await authApi.register(input);
      localStorage.setItem("aurex_token", token);
      setUser(u);
      toast.success("Account created successfully! Welcome to Aurex.");
      return u;
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Failed to create account.";
      toast.error(msg);
      throw err;
    }
  }, [toast]);

  const signOut = useCallback(async () => {
    localStorage.removeItem("aurex_token");
    setUser(null);
    toast.info("Signed out successfully.");
  }, [toast]);

  const requestOtp = useCallback((phone: string) => data.requestOtp(phone), []);

  const verifyOtp = useCallback(
    async (phone: string, code: string, fullName?: string) => {
      const u = await data.verifyOtp(phone, code, fullName);
      setUser(u);
      return u;
    },
    []
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      isAdmin: user?.role === "admin",
      signIn,
      signUp,
      signOut,
      requestOtp,
      verifyOtp,
      authModalOpen,
      authModalMode,
      openAuthModal,
      closeAuthModal,
    }),
    [
      user,
      loading,
      signIn,
      signUp,
      signOut,
      requestOtp,
      verifyOtp,
      authModalOpen,
      authModalMode,
      openAuthModal,
      closeAuthModal,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
