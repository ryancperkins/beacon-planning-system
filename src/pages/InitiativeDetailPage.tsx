import { GlassPanel } from "@/components/beacon/GlassPanel";

export default function InitiativeDetailPage() {
  return (
    <div>
      <div className="mb-7">
        <h1 className="font-display" style={{ fontSize: 21, fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.03em" }}>
          Initiative Detail
        </h1>
      </div>
      <GlassPanel style={{ padding: "40px 20px", textAlign: "center" }}>
        <p style={{ color: "var(--text-muted)", fontSize: 13 }}>Initiative workspace will be wired in Phase 2</p>
      </GlassPanel>
    </div>
  );
}
