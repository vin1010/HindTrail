import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

export interface UserCompany {
  id: string;
  name: string;
  role: string;
  type: "client" | "contractor" | "independent";
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
  login: (provider: "google" | "microsoft" | "email", email?: string) => void;
  logout: () => void;
  setActiveCompany: (companyId: string) => void;
  joinCompany: (companyName: string) => void;
  createCompany: (companyName: string) => void;
  createIndependentProfile: (displayName: string) => void;
}

const AuthContext = createContext<AuthState | null>(null);

// Mock user data matching the product doc's demo scenario
const MOCK_USER: AuthUser = {
  id: "u1",
  email: "vindy@roteq.co.za",
  fullName: "Vindy",
  memberships: [
    { id: "c1", name: "Roteq Engineering", role: "pm", type: "contractor" },
    { id: "c2", name: "Glencore Ltd.", role: "viewer", type: "client" },
  ],
  activeCompanyId: "c1",
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const saved = sessionStorage.getItem("hindtrail_user");
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    if (user) {
      sessionStorage.setItem("hindtrail_user", JSON.stringify(user));
    } else {
      sessionStorage.removeItem("hindtrail_user");
    }
  }, [user]);

  const login = (_provider: "google" | "microsoft" | "email", _email?: string) => {
    // Mock: simulate login returning a user with memberships
    setUser(MOCK_USER);
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem("hindtrail_user");
  };

  const setActiveCompany = (companyId: string) => {
    if (!user) return;
    const valid = user.memberships.find((m) => m.id === companyId);
    if (valid) {
      setUser({ ...user, activeCompanyId: companyId });
    }
  };

  const joinCompany = (companyName: string) => {
    if (!user) return;
    const newCompany: UserCompany = {
      id: `c${Date.now()}`,
      name: companyName,
      role: "member",
      type: "contractor",
    };
    setUser({
      ...user,
      memberships: [...user.memberships, newCompany],
      activeCompanyId: newCompany.id,
    });
  };

  const createCompany = (companyName: string) => {
    if (!user) return;
    const newCompany: UserCompany = {
      id: `c${Date.now()}`,
      name: companyName,
      role: "admin",
      type: "contractor",
    };
    setUser({
      ...user,
      memberships: [...user.memberships, newCompany],
      activeCompanyId: newCompany.id,
    });
  };

  const createIndependentProfile = (displayName: string) => {
    if (!user) return;
    const newCompany: UserCompany = {
      id: `c${Date.now()}`,
      name: `${displayName} (Independent)`,
      role: "admin",
      type: "independent",
    };
    setUser({
      ...user,
      memberships: [newCompany],
      activeCompanyId: newCompany.id,
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
        setActiveCompany,
        joinCompany,
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
