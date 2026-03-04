import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Inbox as InboxIcon } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { usePermissions } from "@/hooks/usePermissions";
import { GlassPanel } from "@/components/beacon/GlassPanel";
import { StatusChip } from "@/components/beacon/StatusChip";
import { InitiativeRowSkeleton } from "@/components/beacon/LoadingSkeleton";
import { format, addDays, startOfToday } from "date-fns";
import { toast } from "sonner";
import { motion } from "framer-motion";

type TabKey = "intake" | "needsinfo" | "approvals" | "duesoon";

const TABS: { key: TabKey; label: string; emptyMsg: string }[] = [
  { key: "intake", label: "Intake", emptyMsg: "No initiatives need triage right now." },
  { key: "needsinfo", label: "Needs Info", emptyMsg: "No items waiting for info." },
  { key: "approvals", label: "Approvals", emptyMsg: "No initiatives waiting for approval." },
  { key: "duesoon", label: "Due Soon", emptyMsg: "No upcoming deadlines." },
];

export default function InboxPage() {
  const { church, user } = useAuth();
  const { canTriage, canApprove } = usePermissions();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<TabKey>("intake");
  const today = startOfToday();
  const dueSoonCutoff = addDays(today, 14);

  const { data: allInitiatives = [], isLoading } = useQuery({
    queryKey: ["inbox-all", church?.id],
    queryFn: async () => {
      if (!church?.id) return [];
      const { data, error } = await supabase
        .from("initiatives")
        .select("*, ministries(name, color)")
        .eq("church_id", church.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!church?.id,
  });

  const tabData = {
    intake: allInitiatives.filter((i: any) => i.status === "Intake"),
    needsinfo: allInitiatives.filter((i: any) => i.status === "Needs Info"),
    approvals: allInitiatives.filter((i: any) => i.status === "Reviewed"),
    duesoon: allInitiatives.filter((i: any) =>
      !["Complete", "Scheduled", "Draft"].includes(i.status) &&
      new Date(i.start_date) <= dueSoonCutoff &&
      new Date(i.start_date) >= today
    ),
  };

  const quickAction = useMutation({
    mutationFn: async ({ id, newStatus, actionLabel }: { id: string; newStatus: string; actionLabel: string }) => {
      const { error } = await supabase.from("initiatives").update({ status: newStatus }).eq("id", id);
      if (error) throw error;
      await supabase.from("initiative_activity").insert({ initiative_id: id, actor_id: user!.id, action: actionLabel });
      if (newStatus === "Approved") {
        const init = allInitiatives.find((i: any) => i.id === id);
        if (init?.token_cost_estimate) {
          await supabase.from("token_transactions").insert({ initiative_id: id, ministry_id: init.ministry_id, amount: init.token_cost_estimate, reason: "Initiative approved" });
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inbox-all"] });
      queryClient.invalidateQueries({ queryKey: ["inbox-count"] });
      toast.success("Status updated");
    },
  });

  const currentItems = tabData[activeTab];
  const currentTab = TABS.find((t) => t.key === activeTab)!;

  const btnSecondary: React.CSSProperties = {
    border: "1px solid var(--border)", background: "var(--bg-surface)", color: "var(--text-tertiary)",
    fontSize: 11.5, fontWeight: 550, padding: "5px 12px", borderRadius: 9, cursor: "pointer", whiteSpace: "nowrap",
  };
  const btnAccent: React.CSSProperties = {
    ...btnSecondary, background: "var(--accent-gradient)", color: "var(--accent-on)", border: "none",
    fontWeight: 600, boxShadow: "var(--accent-glow)",
  };

  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
      <div className="mb-4">
        <h1 className="font-display" style={{ fontSize: 21, fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.03em" }}>Inbox</h1>
        <p className="font-body mt-1" style={{ fontSize: 13, color: "var(--text-tertiary)" }}>Triage and align on incoming initiatives</p>
      </div>

      <div className="flex gap-0 mb-5" style={{ borderBottom: "1px solid var(--border)" }}>
        {TABS.map((tab) => {
          const count = tabData[tab.key].length;
          const isActive = activeTab === tab.key;
          return (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)} className="flex items-center gap-1.5 px-4 py-2.5 font-body relative" style={{ border: "none", background: "transparent", cursor: "pointer", fontSize: 12.5, fontWeight: isActive ? 600 : 450, color: isActive ? "var(--text-primary)" : "var(--text-muted)" }}>
              {tab.label}
              <span className="font-body" style={{ padding: "1px 7px", borderRadius: 100, fontSize: 10, fontWeight: 600, background: isActive ? "var(--accent-bg-strong)" : "var(--bg-inset)", color: isActive ? "var(--accent-text)" : "var(--text-muted)" }}>{count}</span>
              {isActive && <span style={{ position: "absolute", bottom: -1, left: 16, right: 16, height: 2, borderRadius: 2, background: "var(--accent)", boxShadow: "var(--accent-glow)" }} />}
            </button>
          );
        })}
      </div>

      {isLoading ? (
        <InitiativeRowSkeleton />
      ) : currentItems.length === 0 ? (
        <GlassPanel style={{ padding: "50px 20px", textAlign: "center" }}>
          <InboxIcon size={32} style={{ color: "var(--text-muted)", opacity: 0.4, margin: "0 auto 12px" }} />
          <p className="font-body" style={{ fontSize: 13, color: "var(--text-muted)" }}>{currentTab.emptyMsg}</p>
        </GlassPanel>
      ) : (
        <div className="flex flex-col gap-2">
          {currentItems.map((init: any) => {
            const ministry = (init as any).ministries;
            return (
              <GlassPanel key={init.id} style={{ padding: "14px 18px" }}>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                  <div className="flex items-center gap-2.5 flex-1 min-w-0 cursor-pointer" onClick={() => navigate(`/initiatives/${init.id}`)}>
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: ministry?.color || "var(--text-muted)" }} />
                    <div className="min-w-0">
                      <span className="font-body block truncate" style={{ fontSize: 13.5, fontWeight: 600, color: "var(--text-primary)" }}>{init.title}</span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="font-body" style={{ fontSize: 11, color: ministry?.color, fontWeight: 550 }}>{ministry?.name}</span>
                        <span className="font-body" style={{ fontSize: 11, color: "var(--text-muted)" }}>{format(new Date(init.created_at), "MMM d")}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <StatusChip status={init.status} />
                    {canTriage && activeTab === "intake" && (
                      <>
                        <button className="font-body" style={btnSecondary} onClick={() => quickAction.mutate({ id: init.id, newStatus: "Reviewed", actionLabel: "Status changed to Reviewed" })}>Review</button>
                        <button className="font-body" style={btnSecondary} onClick={() => quickAction.mutate({ id: init.id, newStatus: "Needs Info", actionLabel: "Status changed to Needs Info" })}>Request Info</button>
                        {canApprove && <button className="font-body" style={btnAccent} onClick={() => quickAction.mutate({ id: init.id, newStatus: "Approved", actionLabel: "Status changed to Approved" })}>Approve</button>}
                      </>
                    )}
                    {canTriage && activeTab === "needsinfo" && (
                      <button className="font-body" style={btnAccent} onClick={() => quickAction.mutate({ id: init.id, newStatus: "Intake", actionLabel: "Status changed to Intake (resolved)" })}>Mark Resolved</button>
                    )}
                    {canTriage && activeTab === "approvals" && (
                      <>
                        <button className="font-body" style={btnSecondary} onClick={() => quickAction.mutate({ id: init.id, newStatus: "Draft", actionLabel: "Status changed to Draft (rejected)" })}>Reject</button>
                        {canApprove && <button className="font-body" style={btnAccent} onClick={() => quickAction.mutate({ id: init.id, newStatus: "Approved", actionLabel: "Status changed to Approved" })}>Approve</button>}
                      </>
                    )}
                    {activeTab === "duesoon" && (
                      <button className="font-body" style={btnSecondary} onClick={() => navigate(`/initiatives/${init.id}`)}>View</button>
                    )}
                  </div>
                </div>
              </GlassPanel>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
