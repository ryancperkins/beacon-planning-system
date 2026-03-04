import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading, profile } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen" style={{ background: "var(--bg-base)" }}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full accent-gradient animate-pulse" />
          <span className="font-body text-sm" style={{ color: "var(--text-muted)" }}>Loading...</span>
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;

  // If user has no church, redirect to onboarding
  if (profile && !profile.church_id) return <Navigate to="/onboarding" replace />;

  return <>{children}</>;
}
