import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import type { User, Ngo } from "@shared/schema";

type AuthUser = {
  type: "user";
  data: User;
} | {
  type: "ngo";
  data: Ngo;
} | null;

type AuthContextType = {
  user: AuthUser;
  token: string | null;
  login: (type: "user" | "ngo", data: User | Ngo, token: string) => void;
  logout: () => void;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem("authToken");
    const storedUser = localStorage.getItem("authUser");
    const storedType = localStorage.getItem("authType");
    
    if (storedToken && storedUser && storedType) {
      setToken(storedToken);
      setUser({
        type: storedType as "user" | "ngo",
        data: JSON.parse(storedUser),
      });
    }
    setIsLoading(false);
  }, []);

  const login = (type: "user" | "ngo", data: User | Ngo, authToken: string) => {
    setUser({ type, data } as AuthUser);
    setToken(authToken);
    localStorage.setItem("authToken", authToken);
    localStorage.setItem("authUser", JSON.stringify(data));
    localStorage.setItem("authType", type);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("authToken");
    localStorage.removeItem("authUser");
    localStorage.removeItem("authType");
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
