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
    data
      .getCurrentUser()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const u = await data.signIn(email, password);
    setUser(u);
    return u;
  }, []);

  const signUp = useCallback(async (input: SignUpInput) => {
    const u = await data.signUp(input);
    setUser(u);
    return u;
  }, []);

  const signOut = useCallback(async () => {
    await data.signOut();
    setUser(null);
  }, []);

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
