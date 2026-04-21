import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { auth as authApi, setToken, clearToken } from "../api";

export interface UserCompany {
  id: string;
  name: string;
  role: string;
  type: string;
}

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  memberships: UserCompany[];
  activeCompanyId: string | null;
}

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (provider: "google" | "microsoft" | "email", email: string, fullName?: string) => Promise<string>;
  logout: () => void;
  setActiveCompany: (companyId: string) => Promise<void>;
  createCompany: (name: string) => Promise<void>;
  createIndependentProfile: (displayName: string) => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const saved = sessionStorage.getItem("hindtrail_user");
      return saved ? (JSON.parse(saved) as AuthUser) : null;
    } catch {
      sessionStorage.removeItem("hindtrail_user");
      return null;
    }
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      sessionStorage.setItem("hindtrail_user", JSON.stringify(user));
    } else {
      sessionStorage.removeItem("hindtrail_user");
    }
  }, [user]);

  const login = async (provider: "google" | "microsoft" | "email", email: string, fullName?: string): Promise<string> => {
    setLoading(true);
    try {
      const res = await authApi.login(email, fullName || email.split("@")[0], provider);
      setToken(res.token);
      setUser({
        id: res.user.id,
        email: res.user.email,
        fullName: res.user.fullName,
        memberships: res.memberships,
        activeCompanyId: res.activeCompanyId,
      });
      return res.next; // "workspace" | "onboarding" | "select_company"
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    clearToken();
    sessionStorage.removeItem("hindtrail_user");
  };

  const setActiveCompany = async (companyId: string) => {
    if (!user) return;
    await authApi.setContext(companyId);
    setUser({ ...user, activeCompanyId: companyId });
  };

  const createCompany = async (name: string) => {
    if (!user) return;
    const res = await authApi.createCompany(name);
    const newCompany: UserCompany = { id: res.companyId, name, role: "admin", type: "contractor" };
    setUser({
      ...user,
      memberships: [...user.memberships, newCompany],
      activeCompanyId: res.companyId,
    });
  };

  const createIndependentProfile = async (displayName: string) => {
    if (!user) return;
    const res = await authApi.createIndependent(displayName);
    const newCompany: UserCompany = { id: res.companyId, name: `${displayName} (Independent)`, role: "admin", type: "independent" };
    setUser({
      ...user,
      memberships: [newCompany],
      activeCompanyId: res.companyId,
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        login,
        logout,
        setActiveCompany,
        createCompany,
        createIndependentProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
