import { useState } from "react";
import { Navigate } from "react-router-dom";
import { BeaconLogo } from "@/components/beacon/BeaconLogo";
import { GlassPanel } from "@/components/beacon/GlassPanel";
import { AmbientBackground } from "@/components/beacon/AmbientBackground";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export default function OnboardingPage() {
  const { user, profile, loading, createChurch } = useAuth();
  const [churchName, setChurchName] = useState("");
  const [campusName, setCampusName] = useState("Main Campus");
  const [submitting, setSubmitting] = useState(false);

  if (loading) return null;
  if (!user) return <Navigate to="/auth" replace />;
  if (profile?.church_id) return <Navigate to="/timeline" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!churchName.trim()) return;
    setSubmitting(true);
    const { error } = await createChurch(churchName.trim(), campusName.trim() || "Main Campus");
    setSubmitting(false);
    if (error) {
      toast.error(error.message || "Failed to create church");
    } else {
      toast.success("Church created! Welcome to Beacon.");
    }
  };

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "10px 14px", borderRadius: 10,
    border: "1px solid var(--border)", background: "var(--bg-input)",
    fontSize: "13.5px", fontFamily: "var(--font-body)",
    outline: "none", color: "var(--text-primary)", boxSizing: "border-box",
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden px-4" style={{ background: "var(--bg-base)" }}>
      <AmbientBackground />
      <div className="w-full max-w-sm relative z-10">
        <div className="flex flex-col items-center mb-8">
          <BeaconLogo size={40} />
          <h1 className="font-display mt-3" style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.03em" }}>
            Create Your Church
          </h1>
          <p className="font-body mt-1" style={{ fontSize: 13, color: "var(--text-tertiary)" }}>
            Set up your workspace to get started
          </p>
        </div>

        <GlassPanel style={{ padding: "28px 24px" }}>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="font-body block mb-1.5" style={{ fontSize: 11.5, fontWeight: 580, color: "var(--text-tertiary)", letterSpacing: "0.02em" }}>
                Church Name
              </label>
              <input
                type="text"
                value={churchName}
                onChange={(e) => setChurchName(e.target.value)}
                placeholder="Cornerstone Church"
                style={inputStyle}
                required
              />
            </div>

            <div>
              <label className="font-body block mb-1.5" style={{ fontSize: 11.5, fontWeight: 580, color: "var(--text-tertiary)", letterSpacing: "0.02em" }}>
                First Campus Name
              </label>
              <input
                type="text"
                value={campusName}
                onChange={(e) => setCampusName(e.target.value)}
                placeholder="Main Campus"
                style={inputStyle}
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full font-body accent-gradient accent-glow mt-2"
              style={{
                padding: "10px 0", borderRadius: 9, border: "none",
                color: "var(--accent-on)", fontSize: 13.5, fontWeight: 600,
                cursor: submitting ? "wait" : "pointer", opacity: submitting ? 0.7 : 1,
              }}
            >
              {submitting ? "Creating..." : "Get Started"}
            </button>
          </form>
        </GlassPanel>
      </div>
    </div>
  );
}
