import { useState } from "react";
import { Navigate } from "react-router-dom";
import { BeaconLogo } from "@/components/beacon/BeaconLogo";
import { GlassPanel } from "@/components/beacon/GlassPanel";
import { AmbientBackground } from "@/components/beacon/AmbientBackground";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export default function AuthPage() {
  const { user, profile, loading } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { signIn, signUp } = useAuth();

  if (loading) return null;
  if (user && profile?.church_id) return <Navigate to="/timeline" replace />;
  if (user && profile && !profile.church_id) return <Navigate to="/onboarding" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (isSignUp) {
        const { error } = await signUp(email, password, fullName);
        if (error) { toast.error(error.message); return; }
        toast.success("Account created! Check your email to confirm.");
      } else {
        const { error } = await signIn(email, password);
        if (error) { toast.error(error.message); return; }
      }
    } finally {
      setSubmitting(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "10px 14px",
    borderRadius: 10,
    border: "1px solid var(--border)",
    background: "var(--bg-input)",
    fontSize: "13.5px",
    fontFamily: "var(--font-body)",
    outline: "none",
    color: "var(--text-primary)",
    boxSizing: "border-box",
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden px-4" style={{ background: "var(--bg-base)" }}>
      <AmbientBackground />
      <div className="w-full max-w-sm relative z-10">
        <div className="flex flex-col items-center mb-8">
          <BeaconLogo size={40} />
          <h1 className="font-display mt-3" style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.03em" }}>
            beacon
          </h1>
          <p className="font-body mt-1" style={{ fontSize: 13, color: "var(--text-tertiary)" }}>
            Church creative operations platform
          </p>
        </div>

        <GlassPanel style={{ padding: "28px 24px" }}>
          <h2 className="font-display mb-6" style={{ fontSize: 18, fontWeight: 600, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
            {isSignUp ? "Create your account" : "Welcome back"}
          </h2>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {isSignUp && (
              <div>
                <label className="font-body block mb-1.5" style={{ fontSize: 11.5, fontWeight: 580, color: "var(--text-tertiary)", letterSpacing: "0.02em" }}>
                  Full Name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your name"
                  style={inputStyle}
                  required
                />
              </div>
            )}

            <div>
              <label className="font-body block mb-1.5" style={{ fontSize: 11.5, fontWeight: 580, color: "var(--text-tertiary)", letterSpacing: "0.02em" }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@church.org"
                style={inputStyle}
                required
              />
            </div>

            <div>
              <label className="font-body block mb-1.5" style={{ fontSize: 11.5, fontWeight: 580, color: "var(--text-tertiary)", letterSpacing: "0.02em" }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={inputStyle}
                required
                minLength={6}
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full font-body accent-gradient accent-glow mt-2"
              style={{
                padding: "10px 0",
                borderRadius: 9,
                border: "none",
                color: "var(--accent-on)",
                fontSize: 13.5,
                fontWeight: 600,
                cursor: submitting ? "wait" : "pointer",
                opacity: submitting ? 0.7 : 1,
              }}
            >
              {submitting ? "..." : isSignUp ? "Create Account" : "Sign In"}
            </button>
          </form>

          <div className="mt-5 text-center">
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="font-body"
              style={{
                background: "none", border: "none", cursor: "pointer",
                fontSize: 12.5, color: "var(--accent-text)",
              }}
            >
              {isSignUp ? "Already have an account? Sign in" : "Don't have an account? Sign up"}
            </button>
          </div>
        </GlassPanel>
      </div>
    </div>
  );
}
