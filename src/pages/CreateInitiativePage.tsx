import { GlassPanel } from "@/components/beacon/GlassPanel";

export default function CreateInitiativePage() {
  return (
    <div className="max-w-xl mx-auto">
      <div className="mb-7">
        <h1 className="font-display" style={{ fontSize: 24, fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.03em" }}>
          Create Initiative
        </h1>
        <p className="font-body mt-1" style={{ fontSize: 13, color: "var(--text-tertiary)" }}>
          Start with your goal — we'll help figure out the rest
        </p>
      </div>
      <GlassPanel style={{ padding: "40px 20px", textAlign: "center" }}>
        <p style={{ color: "var(--text-muted)", fontSize: 13 }}>Create flow will be wired in Phase 2</p>
      </GlassPanel>
    </div>
  );
}
