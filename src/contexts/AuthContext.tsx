import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

// Use the auto-generated client which has the correct env vars

interface Profile {
  id: string;
  church_id: string | null;
  full_name: string | null;
  avatar_url: string | null;
}

interface Church {
  id: string;
  name: string;
}

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  church: Church | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  createChurch: (churchName: string, campusName: string) => Promise<{ error: any }>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({} as AuthContextValue);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [church, setChurch] = useState<Church | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();
    if (data) {
      setProfile(data as Profile);
      if (data.church_id) {
        const { data: churchData } = await supabase
          .from("churches")
          .select("*")
          .eq("id", data.church_id)
          .single();
        if (churchData) setChurch(churchData as Church);
      }
    }
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          setTimeout(() => fetchProfile(session.user.id), 0);
        } else {
          setProfile(null);
          setChurch(null);
        }
        setLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: window.location.origin,
      },
    });
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
    setChurch(null);
  };

  const createChurch = async (churchName: string, campusName: string) => {
    if (!user) return { error: new Error("Not authenticated") };

    // Create church
    const { data: churchData, error: churchError } = await supabase
      .from("churches")
      .insert({ name: churchName, created_by: user.id })
      .select()
      .single();

    if (churchError) return { error: churchError };

    // Create default campus
    await supabase.from("campuses").insert({
      church_id: churchData.id,
      name: campusName,
    });

    // Update profile with church_id
    await supabase
      .from("profiles")
      .update({ church_id: churchData.id, full_name: user.user_metadata?.full_name || "" })
      .eq("id", user.id);

    // Assign admin role
    await supabase.from("user_roles").insert({
      user_id: user.id,
      role: "admin",
    });

    await fetchProfile(user.id);
    return { error: null };
  };

  const refreshProfile = async () => {
    if (user) await fetchProfile(user.id);
  };

  return (
    <AuthContext.Provider value={{
      user, session, profile, church, loading,
      signUp, signIn, signOut, createChurch, refreshProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
