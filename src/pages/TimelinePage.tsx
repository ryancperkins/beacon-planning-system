import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, Clock } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { GlassPanel } from "@/components/beacon/GlassPanel";
import { StatusChip } from "@/components/beacon/StatusChip";
import { format, isAfter, isBefore, startOfToday, addMonths, parseISO } from "date-fns";

export default function TimelinePage() {
  const { church } = useAuth();
  const navigate = useNavigate();
  const today = startOfToday();

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

  // Group into: Active Now, Coming Up (next 60 days), Later, Past
  const groups = useMemo(() => {
    const cutoff = addMonths(today, 2);
    const active: any[] = [];
    const upcoming: any[] = [];
    const later: any[] = [];
    const past: any[] = [];

    initiatives.forEach((i: any) => {
      const start = parseISO(i.start_date);
      const end = parseISO(i.end_date);

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
  }, [initiatives, today]);

  const typeLabel = (t: string) => t.charAt(0).toUpperCase() + t.slice(1);

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display" style={{ fontSize: 21, fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.03em" }}>
          Timeline
        </h1>
        <p className="font-body mt-1" style={{ fontSize: 13, color: "var(--text-tertiary)" }}>
          What's happening across your church
        </p>
      </div>

      {isLoading ? (
        <GlassPanel style={{ padding: "40px 20px", textAlign: "center" }}>
          <p className="font-body" style={{ fontSize: 13, color: "var(--text-muted)" }}>Loading timeline...</p>
        </GlassPanel>
      ) : groups.length === 0 ? (
        <GlassPanel style={{ padding: "40px 20px", textAlign: "center" }}>
          <Calendar size={32} style={{ color: "var(--text-muted)", opacity: 0.4, margin: "0 auto 12px" }} />
          <p className="font-body" style={{ fontSize: 13, color: "var(--text-muted)" }}>No initiatives yet — create your first one!</p>
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
                        {/* Left: ministry dot + title */}
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: ministry?.color || "var(--text-muted)" }} />
                          <span className="font-body truncate" style={{ fontSize: 13.5, fontWeight: 600, color: "var(--text-primary)" }}>
                            {init.title}
                          </span>
                        </div>

                        {/* Right: metadata */}
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
