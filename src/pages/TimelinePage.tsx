import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, Clock } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { GlassPanel } from "@/components/beacon/GlassPanel";
import { StatusChip } from "@/components/beacon/StatusChip";
import { format, isAfter, isBefore, startOfToday, addDays, addMonths, parseISO } from "date-fns";

const RANGES = [
  { label: "30d", days: 30 },
  { label: "90d", days: 90 },
  { label: "180d", days: 180 },
];

const TYPE_FILTERS = [
  { value: "all", label: "All Types" },
  { value: "campaign", label: "Campaign" },
  { value: "series", label: "Series" },
  { value: "event", label: "Event" },
];

export default function TimelinePage() {
  const { church } = useAuth();
  const navigate = useNavigate();
  const today = startOfToday();
  const [rangeDays, setRangeDays] = useState(90);
  const [typeFilter, setTypeFilter] = useState("all");

  const { data: initiatives = [], isLoading } = useQuery({
    queryKey: ["initiatives-timeline", church?.id],
    queryFn: async () => {
      if (!church?.id) return [];
      const { data, error } = await supabase
        .from("initiatives")
        .select("*, ministries(name, color)")
        .eq("church_id", church.id)
        .order("start_date", { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!church?.id,
  });

  const groups = useMemo(() => {
    const rangeEnd = addDays(today, rangeDays);
    const cutoff = addMonths(today, 2);
    const active: any[] = [];
    const upcoming: any[] = [];
    const later: any[] = [];
    const past: any[] = [];

    initiatives.forEach((i: any) => {
      if (typeFilter !== "all" && i.initiative_type !== typeFilter) return;

      const start = parseISO(i.start_date);
      const end = parseISO(i.end_date);

      // Filter: skip if entire range is outside window
      if (isAfter(start, rangeEnd) && isAfter(end, rangeEnd)) return;
      if (isBefore(end, addDays(today, -rangeDays))) return;

      if (i.status === "Complete" || isBefore(end, today)) {
        past.push(i);
      } else if (!isAfter(start, today) && !isBefore(end, today)) {
        active.push(i);
      } else if (isBefore(start, cutoff)) {
        upcoming.push(i);
      } else {
        later.push(i);
      }
    });

    return [
      { label: "Active Now", items: active, accent: true },
      { label: "Coming Up", items: upcoming, accent: false },
      { label: "Later", items: later, accent: false },
      { label: "Past", items: past, accent: false },
    ].filter((g) => g.items.length > 0);
  }, [initiatives, today, rangeDays, typeFilter]);

  const typeLabel = (t: string) => t.charAt(0).toUpperCase() + t.slice(1);

  return (
    <div>
      {/* Header with range toggle */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
        <div>
          <h1 className="font-display" style={{ fontSize: 21, fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.03em" }}>
            Timeline
          </h1>
          <p className="font-body mt-1" style={{ fontSize: 13, color: "var(--text-tertiary)" }}>
            What's happening across your church
          </p>
        </div>
        {/* Range toggle */}
        <div className="flex rounded-full self-start overflow-hidden" style={{ background: "var(--bg-inset)", border: "1px solid var(--border)" }}>
          {RANGES.map((r) => (
            <button
              key={r.label}
              onClick={() => setRangeDays(r.days)}
              className="font-body px-3 py-1"
              style={{
                border: "none", cursor: "pointer", fontSize: 11.5, fontWeight: 550,
                background: rangeDays === r.days ? "var(--accent-bg-strong)" : "transparent",
                color: rangeDays === r.days ? "var(--accent-text)" : "var(--text-muted)",
                borderRadius: 100, transition: "all 0.15s ease",
              }}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Type filter pills */}
      <div className="flex flex-wrap gap-2 mb-5">
        {TYPE_FILTERS.map((t) => {
          const isActive = typeFilter === t.value;
          const typeColor = t.value !== "all" ? `var(--type-${t.value})` : undefined;
          return (
            <button
              key={t.value}
              onClick={() => setTypeFilter(t.value)}
              className="font-body px-3 py-1"
              style={{
                borderRadius: 100, cursor: "pointer", fontSize: 12, fontWeight: 500,
                border: isActive
                  ? `1px solid ${typeColor ? typeColor : "var(--accent-border)"}`
                  : "1px solid var(--border)",
                background: isActive
                  ? (typeColor ? `${typeColor}12` : "var(--accent-bg)")
                  : "transparent",
                color: isActive
                  ? (typeColor || "var(--accent-text)")
                  : "var(--text-muted)",
                transition: "all 0.15s ease",
              }}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {isLoading ? (
        <GlassPanel style={{ padding: "40px 20px", textAlign: "center" }}>
          <p className="font-body" style={{ fontSize: 13, color: "var(--text-muted)" }}>Loading timeline...</p>
        </GlassPanel>
      ) : groups.length === 0 ? (
        <GlassPanel style={{ padding: "40px 20px", textAlign: "center" }}>
          <Calendar size={32} style={{ color: "var(--text-muted)", opacity: 0.4, margin: "0 auto 12px" }} />
          <p className="font-body" style={{ fontSize: 13, color: "var(--text-muted)" }}>No initiatives match your filters.</p>
        </GlassPanel>
      ) : (
        <div className="flex flex-col gap-7">
          {groups.map((group) => (
            <div key={group.label}>
              <div className="flex items-center gap-2 mb-3">
                {group.accent && <span className="w-2 h-2 rounded-full" style={{ background: "var(--accent)", boxShadow: "var(--accent-glow)" }} />}
                <h2 className="font-display" style={{ fontSize: 14, fontWeight: 700, color: group.accent ? "var(--accent-text)" : "var(--text-tertiary)", letterSpacing: "0.02em", textTransform: "uppercase" }}>
                  {group.label}
                </h2>
                <span className="font-body" style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 500 }}>({group.items.length})</span>
              </div>

              <div className="flex flex-col gap-2">
                {group.items.map((init: any) => {
                  const ministry = (init as any).ministries;
                  return (
                    <GlassPanel
                      key={init.id}
                      hover
                      onClick={() => navigate(`/initiatives/${init.id}`)}
                      style={{ padding: "14px 16px" }}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: ministry?.color || "var(--text-muted)" }} />
                          <span className="font-body truncate" style={{ fontSize: 13.5, fontWeight: 600, color: "var(--text-primary)" }}>
                            {init.title}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 flex-shrink-0 ml-5 sm:ml-0">
                          <span className="font-body" style={{ fontSize: 11, color: ministry?.color || "var(--text-muted)", fontWeight: 550 }}>
                            {ministry?.name}
                          </span>
                          <span className="font-body" style={{ fontSize: 11, color: `var(--type-${init.initiative_type})`, fontWeight: 550 }}>
                            {typeLabel(init.initiative_type)}
                          </span>
                          <span className="font-body flex items-center gap-1" style={{ fontSize: 11, color: "var(--text-muted)" }}>
                            <Clock size={10} />
                            {format(new Date(init.start_date), "MMM d")} – {format(new Date(init.end_date), "MMM d")}
                          </span>
                          <StatusChip status={init.status} />
                          {/* Token count */}
                          {init.token_cost_estimate != null && (
                            <span className="font-body" style={{
                              padding: "4px 10px", borderRadius: 7,
                              background: "var(--accent-bg)", border: "1px solid var(--accent-border)",
                              color: "var(--accent-text)", fontSize: 11.5, fontWeight: 550,
                            }}>
                              {init.token_cost_estimate}
                            </span>
                          )}
                        </div>
                      </div>
                    </GlassPanel>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
