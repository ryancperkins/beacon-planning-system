import { useNavigate } from "react-router-dom";
import { Inbox as InboxIcon, AlertCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { GlassPanel } from "@/components/beacon/GlassPanel";
import { StatusChip } from "@/components/beacon/StatusChip";
import { format } from "date-fns";

export default function InboxPage() {
  const { church } = useAuth();
  const navigate = useNavigate();

  const { data: initiatives = [], isLoading } = useQuery({
    queryKey: ["inbox-initiatives", church?.id],
    queryFn: async () => {
      if (!church?.id) return [];
      const { data, error } = await supabase
        .from("initiatives")
        .select("*, ministries(name, color)")
        .eq("church_id", church.id)
        .in("status", ["Intake", "Needs Info"])
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!church?.id,
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display" style={{ fontSize: 21, fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.03em" }}>
          Inbox
        </h1>
        <p className="font-body mt-1" style={{ fontSize: 13, color: "var(--text-tertiary)" }}>
          Triage and align on incoming initiatives
        </p>
      </div>

      {isLoading ? (
        <GlassPanel style={{ padding: "40px 20px", textAlign: "center" }}>
          <p className="font-body" style={{ fontSize: 13, color: "var(--text-muted)" }}>Loading...</p>
        </GlassPanel>
      ) : initiatives.length === 0 ? (
        <GlassPanel style={{ padding: "50px 20px", textAlign: "center" }}>
          <InboxIcon size={32} style={{ color: "var(--text-muted)", opacity: 0.4, margin: "0 auto 12px" }} />
          <p className="font-body" style={{ fontSize: 14, fontWeight: 550, color: "var(--text-secondary)", marginBottom: 4 }}>All clear!</p>
          <p className="font-body" style={{ fontSize: 12.5, color: "var(--text-muted)" }}>No initiatives need triage right now.</p>
        </GlassPanel>
      ) : (
        <div className="flex flex-col gap-2">
          {initiatives.map((init: any) => {
            const ministry = (init as any).ministries;
            const isNeedsInfo = init.status === "Needs Info";
            return (
              <GlassPanel
                key={init.id}
                hover
                glow={isNeedsInfo}
                onClick={() => navigate(`/initiatives/${init.id}`)}
                style={{ padding: "16px 18px" }}
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                  <div className="flex items-center gap-2.5 flex-1 min-w-0">
                    {isNeedsInfo && <AlertCircle size={15} style={{ color: "var(--status-needsinfo-text)", flexShrink: 0 }} />}
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: ministry?.color || "var(--text-muted)" }} />
                    <div className="min-w-0">
                      <span className="font-body block truncate" style={{ fontSize: 13.5, fontWeight: 600, color: "var(--text-primary)" }}>
                        {init.title}
                      </span>
                      {init.description && (
                        <span className="font-body block truncate" style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
                          {init.description}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0 ml-5 sm:ml-0">
                    <span className="font-body" style={{ fontSize: 11, color: ministry?.color, fontWeight: 550 }}>{ministry?.name}</span>
                    <span className="font-body" style={{ fontSize: 11, color: "var(--text-muted)" }}>
                      {format(new Date(init.created_at), "MMM d")}
                    </span>
                    <StatusChip status={init.status} />
                  </div>
                </div>
              </GlassPanel>
            );
          })}
        </div>
      )}
    </div>
  );
}
