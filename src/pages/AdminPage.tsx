import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { usePermissions } from "@/hooks/usePermissions";
import { GlassPanel } from "@/components/beacon/GlassPanel";
import { toast } from "sonner";
import { Users, FileText, Coins, BarChart3, Plus, Trash2, UserPlus } from "lucide-react";
import { motion } from "framer-motion";

type TabKey = "overview" | "team" | "ministries" | "budget";

const TABS: { key: TabKey; label: string; icon: any }[] = [
  { key: "overview", label: "Overview", icon: BarChart3 },
  { key: "team", label: "Team", icon: Users },
  { key: "ministries", label: "Ministries", icon: FileText },
  { key: "budget", label: "Token Budget", icon: Coins },
];

const ROLE_OPTIONS = ["admin", "creative_team", "ministry_director", "ministry_user", "mentor"];

export default function AdminPage() {
  const { church, user } = useAuth();
  const { canManageTeam } = usePermissions();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<TabKey>("overview");
  const [newMinName, setNewMinName] = useState("");
  const [newMinColor, setNewMinColor] = useState("#60A5FA");

  // Queries
  const { data: profiles = [] } = useQuery({
    queryKey: ["admin-profiles", church?.id],
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("*").eq("church_id", church!.id);
      return data || [];
    },
    enabled: !!church?.id && canManageTeam,
  });

  const { data: allRoles = [] } = useQuery({
    queryKey: ["admin-roles", church?.id],
    queryFn: async () => {
      const { data } = await supabase.from("user_roles").select("*");
      return data || [];
    },
    enabled: !!church?.id && canManageTeam,
  });

  const { data: ministries = [] } = useQuery({
    queryKey: ["admin-ministries", church?.id],
    queryFn: async () => {
      const { data } = await supabase.from("ministries").select("*").eq("church_id", church!.id);
      return data || [];
    },
    enabled: !!church?.id,
  });

  const { data: ministryMembers = [] } = useQuery({
    queryKey: ["admin-ministry-members", church?.id],
    queryFn: async () => {
      const { data } = await supabase.from("ministry_members").select("*").eq("church_id", church!.id);
      return data || [];
    },
    enabled: !!church?.id && canManageTeam,
  });

  const { data: initiatives = [] } = useQuery({
    queryKey: ["admin-initiatives", church?.id],
    queryFn: async () => {
      const { data } = await supabase.from("initiatives").select("id, status, token_cost_estimate").eq("church_id", church!.id);
      return data || [];
    },
    enabled: !!church?.id,
  });

  const { data: tokenBalances = [] } = useQuery({
    queryKey: ["admin-token-balances", church?.id],
    queryFn: async () => {
      const now = new Date(); now.setDate(1);
      const month = now.toISOString().split("T")[0];
      const { data } = await supabase.from("token_balances").select("*, ministries(name, color)").eq("church_id", church!.id).eq("month", month);
      return data || [];
    },
    enabled: !!church?.id,
  });

  // Mutations
  const changeRole = useMutation({
    mutationFn: async ({ userId, newRole }: { userId: string; newRole: string }) => {
      // Delete existing role
      await supabase.from("user_roles").delete().eq("user_id", userId);
      // Insert new
      const { error } = await supabase.from("user_roles").insert({ user_id: userId, role: newRole as any });
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin-roles"] }); toast.success("Role updated"); },
  });

  const addMinistry = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("ministries").insert({ church_id: church!.id, name: newMinName, color: newMinColor });
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin-ministries"] }); setNewMinName(""); toast.success("Ministry added"); },
  });

  const deleteMinistry = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("ministries").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin-ministries"] }); toast.success("Ministry deleted"); },
  });

  const updateAllocation = useMutation({
    mutationFn: async ({ id, allocated }: { id: string; allocated: number }) => {
      const { error } = await supabase.from("token_balances").update({ allocated }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin-token-balances"] }); toast.success("Allocation updated"); },
  });

  const assignMinistry = useMutation({
    mutationFn: async ({ userId, ministryId, memberRole }: { userId: string; ministryId: string; memberRole: string }) => {
      const { error } = await supabase.from("ministry_members").insert({
        user_id: userId, ministry_id: ministryId, church_id: church!.id, role: memberRole,
      });
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin-ministry-members"] }); toast.success("Ministry assignment added"); },
  });

  const inputStyle: React.CSSProperties = {
    padding: "8px 10px", borderRadius: 8, border: "1px solid var(--border)",
    background: "var(--bg-input)", color: "var(--text-primary)", fontSize: 12.5,
    fontFamily: "var(--font-body)", outline: "none",
  };

  const activeCount = initiatives.filter((i: any) => !["Complete", "Draft"].includes(i.status)).length;
  const totalTokens = initiatives.reduce((s: number, i: any) => s + (i.token_cost_estimate || 0), 0);

  if (!canManageTeam) {
    return (
      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
        <GlassPanel style={{ padding: "60px 20px", textAlign: "center" }}>
          <p className="font-body" style={{ fontSize: 14, color: "var(--text-muted)" }}>You don't have permission to access this page.</p>
        </GlassPanel>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
      <div className="mb-4">
        <h1 className="font-display" style={{ fontSize: 21, fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.03em" }}>Admin</h1>
        <p className="font-body mt-1" style={{ fontSize: 13, color: "var(--text-tertiary)" }}>Manage your church workspace</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-0 mb-5" style={{ borderBottom: "1px solid var(--border)" }}>
        {TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)} className="flex items-center gap-1.5 px-4 py-2.5 font-body relative" style={{ border: "none", background: "transparent", cursor: "pointer", fontSize: 12.5, fontWeight: isActive ? 600 : 450, color: isActive ? "var(--text-primary)" : "var(--text-muted)" }}>
              <tab.icon size={13} />
              {tab.label}
              {isActive && <span style={{ position: "absolute", bottom: -1, left: 16, right: 16, height: 2, borderRadius: 2, background: "var(--accent)", boxShadow: "var(--accent-glow)" }} />}
            </button>
          );
        })}
      </div>

      {/* Overview */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: "Total Initiatives", value: initiatives.length },
            { label: "Active", value: activeCount },
            { label: "Tokens Estimated", value: totalTokens },
            { label: "Team Members", value: profiles.length },
          ].map((stat) => (
            <GlassPanel key={stat.label} style={{ padding: 20, textAlign: "center" }}>
              <div className="font-display" style={{ fontSize: 28, fontWeight: 700, color: "var(--accent-text)" }}>{stat.value}</div>
              <div className="font-body mt-1" style={{ fontSize: 12, color: "var(--text-muted)" }}>{stat.label}</div>
            </GlassPanel>
          ))}
        </div>
      )}

      {/* Team */}
      {activeTab === "team" && (
        <div className="flex flex-col gap-2">
          <div className="flex justify-end mb-2">
            <button onClick={() => toast.info("Invite feature coming soon")} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-body" style={{ border: "1px solid var(--border)", background: "var(--bg-surface)", color: "var(--text-secondary)", fontSize: 12, cursor: "pointer" }}>
              <UserPlus size={13} /> Invite
            </button>
          </div>
          {profiles.map((p: any) => {
            const userRole = allRoles.find((r: any) => r.user_id === p.id);
            const memberships = ministryMembers.filter((m: any) => m.user_id === p.id);
            return (
              <GlassPanel key={p.id} style={{ padding: "12px 16px" }}>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center font-body accent-gradient" style={{ color: "var(--accent-on)", fontSize: 11, fontWeight: 700, flexShrink: 0 }}>
                      {p.full_name ? p.full_name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2) : "?"}
                    </div>
                    <div className="min-w-0">
                      <div className="font-body truncate" style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{p.full_name || "Unnamed"}</div>
                      <div className="font-body" style={{ fontSize: 11, color: "var(--text-muted)" }}>
                        {memberships.map((m: any) => {
                          const min = ministries.find((mi: any) => mi.id === m.ministry_id);
                          return min ? `${min.name} (${m.role})` : "";
                        }).filter(Boolean).join(", ") || "No ministry"}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={userRole?.role || ""}
                      onChange={(e) => changeRole.mutate({ userId: p.id, newRole: e.target.value })}
                      disabled={p.id === user?.id}
                      style={{ ...inputStyle, width: 160 }}
                    >
                      <option value="">No role</option>
                      {ROLE_OPTIONS.map((r) => <option key={r} value={r}>{r.replace(/_/g, " ")}</option>)}
                    </select>
                    <select
                      onChange={(e) => {
                        if (e.target.value) {
                          assignMinistry.mutate({ userId: p.id, ministryId: e.target.value, memberRole: "member" });
                          e.target.value = "";
                        }
                      }}
                      style={{ ...inputStyle, width: 140 }}
                    >
                      <option value="">+ Ministry</option>
                      {ministries.filter((m: any) => !memberships.some((mm: any) => mm.ministry_id === m.id)).map((m: any) => (
                        <option key={m.id} value={m.id}>{m.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </GlassPanel>
            );
          })}
        </div>
      )}

      {/* Ministries */}
      {activeTab === "ministries" && (
        <div className="flex flex-col gap-2">
          <GlassPanel style={{ padding: "12px 16px" }}>
            <div className="flex items-center gap-2">
              <input type="color" value={newMinColor} onChange={(e) => setNewMinColor(e.target.value)} style={{ width: 28, height: 28, border: "none", cursor: "pointer", background: "transparent" }} />
              <input value={newMinName} onChange={(e) => setNewMinName(e.target.value)} placeholder="New ministry name..." style={{ ...inputStyle, flex: 1 }} />
              <button disabled={!newMinName.trim()} onClick={() => addMinistry.mutate()} className="flex items-center gap-1 px-3 py-1.5 rounded-lg font-body accent-gradient accent-glow" style={{ border: "none", color: "var(--accent-on)", fontSize: 12, fontWeight: 600, cursor: newMinName.trim() ? "pointer" : "not-allowed", opacity: newMinName.trim() ? 1 : 0.5 }}>
                <Plus size={12} /> Add
              </button>
            </div>
          </GlassPanel>
          {ministries.map((m: any) => {
            const memberCount = ministryMembers.filter((mm: any) => mm.ministry_id === m.id).length;
            return (
              <GlassPanel key={m.id} style={{ padding: "12px 16px" }}>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: m.color }} />
                  <span className="font-body flex-1" style={{ fontSize: 13, fontWeight: 550, color: "var(--text-primary)" }}>{m.name}</span>
                  <span className="font-body" style={{ fontSize: 11, color: "var(--text-muted)" }}>{memberCount} member{memberCount !== 1 ? "s" : ""}</span>
                  <button onClick={() => { if (confirm(`Delete ${m.name}?`)) deleteMinistry.mutate(m.id); }} className="flex items-center justify-center rounded-lg" style={{ width: 28, height: 28, border: "1px solid var(--border)", background: "var(--bg-surface)", color: "var(--text-muted)", cursor: "pointer" }}>
                    <Trash2 size={12} />
                  </button>
                </div>
              </GlassPanel>
            );
          })}
        </div>
      )}

      {/* Token Budget */}
      {activeTab === "budget" && (
        <div className="flex flex-col gap-3">
          <GlassPanel style={{ padding: 20, textAlign: "center" }}>
            <div className="font-display" style={{ fontSize: 32, fontWeight: 700, color: "var(--accent-text)" }}>
              {tokenBalances.reduce((s: number, b: any) => s + b.spent, 0)} / {tokenBalances.reduce((s: number, b: any) => s + b.allocated, 0)}
            </div>
            <div className="font-body mt-1" style={{ fontSize: 12, color: "var(--text-muted)" }}>Total tokens spent / allocated this month</div>
          </GlassPanel>
          {tokenBalances.map((b: any) => {
            const ministry = (b as any).ministries;
            const pct = b.allocated > 0 ? Math.min((b.spent / b.allocated) * 100, 100) : 0;
            return (
              <GlassPanel key={b.id} style={{ padding: "14px 16px" }}>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: ministry?.color }} />
                  <span className="font-body flex-1" style={{ fontSize: 13, fontWeight: 550, color: "var(--text-primary)" }}>{ministry?.name}</span>
                  <span className="font-body" style={{ fontSize: 12, color: "var(--text-muted)" }}>{b.spent} / {b.allocated}</span>
                  <input
                    type="number"
                    defaultValue={b.allocated}
                    onBlur={(e) => {
                      const val = parseInt(e.target.value);
                      if (!isNaN(val) && val !== b.allocated) updateAllocation.mutate({ id: b.id, allocated: val });
                    }}
                    style={{ ...inputStyle, width: 70, textAlign: "center" }}
                  />
                </div>
                <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: "var(--bg-inset)" }}>
                  <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: pct > 80 ? "var(--badge-dot)" : "var(--accent)" }} />
                </div>
              </GlassPanel>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
