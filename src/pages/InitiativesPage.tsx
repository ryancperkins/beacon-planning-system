import { GlassPanel } from "@/components/beacon/GlassPanel";

export default function InitiativesPage() {
  return (
    <div>
      <div className="mb-7">
        <h1 className="font-display" style={{ fontSize: 21, fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.03em" }}>
          Initiatives
        </h1>
        <p className="font-body mt-1" style={{ fontSize: 13, color: "var(--text-tertiary)" }}>
          All church initiatives in one place
        </p>
      </div>
      <GlassPanel style={{ padding: "40px 20px", textAlign: "center" }}>
        <p style={{ color: "var(--text-muted)", fontSize: 13 }}>Initiatives will be wired in Phase 2</p>
      </GlassPanel>
    </div>
  );
}
