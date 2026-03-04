import { GlassPanel } from "./GlassPanel";

export function InitiativeRowSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="flex flex-col gap-2">
      {Array.from({ length: count }).map((_, i) => (
        <GlassPanel key={i} style={{ padding: "14px 18px" }}>
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full animate-pulse" style={{ background: "var(--bg-inset)" }} />
            <div className="flex-1 flex flex-col gap-1.5">
              <div className="h-3.5 rounded animate-pulse" style={{ background: "var(--bg-inset)", width: `${55 + i * 8}%` }} />
              <div className="h-2.5 rounded animate-pulse" style={{ background: "var(--bg-inset)", width: "30%" }} />
            </div>
            <div className="h-5 w-16 rounded-full animate-pulse" style={{ background: "var(--bg-inset)" }} />
          </div>
        </GlassPanel>
      ))}
    </div>
  );
}

export function DetailSkeleton() {
  return (
    <div className="flex flex-col gap-5">
      <div className="h-6 w-48 rounded animate-pulse" style={{ background: "var(--bg-inset)" }} />
      <GlassPanel style={{ padding: 20 }}>
        <div className="flex flex-col gap-3">
          <div className="h-3 rounded animate-pulse" style={{ background: "var(--bg-inset)", width: "80%" }} />
          <div className="h-3 rounded animate-pulse" style={{ background: "var(--bg-inset)", width: "60%" }} />
          <div className="h-3 rounded animate-pulse" style={{ background: "var(--bg-inset)", width: "70%" }} />
        </div>
      </GlassPanel>
    </div>
  );
}
