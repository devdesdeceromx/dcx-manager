import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/shared/lib/supabase";
import type { AppRole } from "@/shared/lib/permissions";

type AuthContextValue = {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  role: AppRole | null;
  signIn: (email: string, password: string) => Promise<string | null>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [role, setRole] = useState<AppRole | null>(null);

  async function syncUser(nextUser: User | null) {
    setUser(nextUser);
    if (!nextUser) {
      setRole(null);
      setIsLoading(false);
      return;
    }
    const { data, error } = await supabase.rpc("get_my_access");
    const access = Array.isArray(data) ? data[0] : data;
    if (error || !access?.is_active) setRole(null);
    else setRole(access.role as AppRole);
    setIsLoading(false);
  }

  useEffect(() => {
    void supabase.auth.getSession().then(({ data }) => {
      void syncUser(data.session?.user ?? null);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        void syncUser(session?.user ?? null);
      },
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  const value = useMemo(
    () => ({
      isAuthenticated: Boolean(user && role),
      isLoading,
      user,
      role,
      signIn: async (email: string, password: string) => {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        return error?.message ?? null;
      },
      signOut: async () => {
        await supabase.auth.signOut();
      },
    }),
    [isLoading, user, role],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Provider and hook intentionally live together to keep the auth boundary cohesive.
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return context;
}
