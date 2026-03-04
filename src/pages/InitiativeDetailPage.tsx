import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Send, Clock, ChevronDown, Upload, Edit, CheckCircle } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { GlassPanel } from "@/components/beacon/GlassPanel";
import { StatusChip } from "@/components/beacon/StatusChip";
import { format } from "date-fns";
import { toast } from "sonner";

const STATUS_FLOW = ["Draft", "Intake", "Needs Info", "Reviewed", "Approved", "Creative Ready", "In Production", "Scheduled", "Complete"];

export default function InitiativeDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [noteText, setNoteText] = useState("");
  const [showStatusMenu, setShowStatusMenu] = useState(false);

  const { data: initiative, isLoading } = useQuery({
    queryKey: ["initiative", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("initiatives")
        .select("*, ministries(name, color)")
        .eq("id", id!)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { data: notes = [] } = useQuery({
    queryKey: ["initiative-notes", id],
    queryFn: async () => {
      const { data } = await supabase
        .from("initiative_notes")
        .select("*")
        .eq("initiative_id", id!)
        .order("created_at", { ascending: false });
      return data || [];
    },
    enabled: !!id,
  });

  const { data: activity = [] } = useQuery({
    queryKey: ["initiative-activity", id],
    queryFn: async () => {
      const { data } = await supabase
        .from("initiative_activity")
        .select("*")
        .eq("initiative_id", id!)
        .order("created_at", { ascending: false });
      return data || [];
    },
    enabled: !!id,
  });

  const addNote = useMutation({
    mutationFn: async (content: string) => {
      const { error } = await supabase.from("initiative_notes").insert({
        initiative_id: id!, author_id: user!.id, content,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["initiative-notes", id] });
      setNoteText("");
      toast.success("Note added");
    },
  });

  const updateStatus = useMutation({
    mutationFn: async (newStatus: string) => {
      const { error } = await supabase.from("initiatives").update({ status: newStatus }).eq("id", id!);
      if (error) throw error;
      await supabase.from("initiative_activity").insert({
        initiative_id: id!, actor_id: user!.id, action: `Status changed to ${newStatus}`,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["initiative", id] });
      queryClient.invalidateQueries({ queryKey: ["initiative-activity", id] });
      queryClient.invalidateQueries({ queryKey: ["inbox-all"] });
      queryClient.invalidateQueries({ queryKey: ["inbox-count"] });
      setShowStatusMenu(false);
      toast.success("Status updated");
    },
  });

  const approveAction = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("initiatives").update({ status: "Approved" }).eq("id", id!);
      if (error) throw error;
      await supabase.from("initiative_activity").insert({
        initiative_id: id!, actor_id: user!.id, action: "Status changed to Approved",
      });
      if (initiative?.token_cost_estimate) {
        await supabase.from("token_transactions").insert({
          initiative_id: id!, ministry_id: initiative.ministry_id,
          amount: initiative.token_cost_estimate, reason: "Initiative approved",
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["initiative", id] });
      queryClient.invalidateQueries({ queryKey: ["initiative-activity", id] });
      queryClient.invalidateQueries({ queryKey: ["inbox-all"] });
      queryClient.invalidateQueries({ queryKey: ["inbox-count"] });
      toast.success("Initiative approved");
    },
  });

  const toggleChecklistItem = useMutation({
    mutationFn: async ({ index, checked }: { index: number; checked: boolean }) => {
      const list = [...(initiative!.missing_info_checklist as any[])];
      list[index] = { ...list[index], checked };
      const { error } = await supabase.from("initiatives").update({ missing_info_checklist: list as any }).eq("id", id!);
      if (error) throw error;
      await supabase.from("initiative_activity").insert({
        initiative_id: id!, actor_id: user!.id,
        action: `Marked '${list[index].label}' as ${checked ? "complete" : "incomplete"}`,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["initiative", id] });
      queryClient.invalidateQueries({ queryKey: ["initiative-activity", id] });
    },
  });

  if (isLoading) {
    return <GlassPanel style={{ padding: "40px 20px", textAlign: "center" }}>
      <p className="font-body" style={{ fontSize: 13, color: "var(--text-muted)" }}>Loading...</p>
    </GlassPanel>;
  }
  if (!initiative) {
    return <GlassPanel style={{ padding: "40px 20px", textAlign: "center" }}>
      <p className="font-body" style={{ fontSize: 13, color: "var(--text-muted)" }}>Initiative not found.</p>
    </GlassPanel>;
  }

  const ministry = (initiative as any).ministries;
  const typeLabel = initiative.initiative_type.charAt(0).toUpperCase() + initiative.initiative_type.slice(1);
  const checklistItems = (initiative.missing_info_checklist as any[] | null) || [];
  const strategy = initiative.recommended_strategy as any;
  const showApprove = ["Reviewed", "Intake"].includes(initiative.status);

  const sectionHeader: React.CSSProperties = { fontSize: 10.5, fontWeight: 600, color: "var(--accent-text)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 };

  return (
    <div>
      <button onClick={() => navigate("/initiatives")} className="flex items-center gap-1 mb-4 font-body" style={{ border: "none", background: "transparent", color: "var(--text-muted)", fontSize: 12.5, cursor: "pointer" }}>
        <ArrowLeft size={14} /> Initiatives
      </button>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-6">
        <div className="flex items-start gap-3">
          <div className="w-3 h-3 rounded-full mt-1.5 flex-shrink-0" style={{ background: ministry?.color || "var(--text-muted)" }} />
          <div>
            <h1 className="font-display" style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.03em" }}>
              {initiative.title}
            </h1>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <span className="font-body" style={{ fontSize: 12, color: "var(--text-tertiary)" }}>{ministry?.name}</span>
              <span style={{ color: "var(--text-muted)" }}>·</span>
              <span className="font-body" style={{ fontSize: 11.5, color: `var(--type-${initiative.initiative_type})`, fontWeight: 550 }}>{typeLabel}</span>
              <span style={{ color: "var(--text-muted)" }}>·</span>
              <span className="font-body flex items-center gap-1" style={{ fontSize: 12, color: "var(--text-muted)" }}>
                <Clock size={11} />
                {format(new Date(initiative.start_date), "MMM d")} – {format(new Date(initiative.end_date), "MMM d, yyyy")}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start">
          {/* Status control */}
          <div className="relative">
            <button onClick={() => setShowStatusMenu(!showStatusMenu)} className="flex items-center gap-1.5" style={{ cursor: "pointer", background: "none", border: "none", padding: 0 }}>
              <StatusChip status={initiative.status} />
              <ChevronDown size={12} style={{ color: "var(--text-muted)" }} />
            </button>
            {showStatusMenu && (
              <div className="absolute right-0 top-full mt-1 z-50 rounded-xl overflow-hidden" style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", boxShadow: "var(--shadow-dropdown)", minWidth: 160, padding: 4 }}>
                {STATUS_FLOW.map((s) => (
                  <button key={s} onClick={() => updateStatus.mutate(s)} className="w-full text-left px-3 py-1.5 rounded-lg font-body block" style={{ border: "none", background: initiative.status === s ? "var(--accent-bg)" : "transparent", color: initiative.status === s ? "var(--accent-text)" : "var(--text-secondary)", fontSize: 12, cursor: "pointer" }}>
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg font-body" style={{ border: "1px solid var(--border)", background: "var(--bg-surface)", color: "var(--text-tertiary)", fontSize: 11.5, cursor: "pointer" }}>
            <Edit size={12} /> Edit
          </button>
          {showApprove && (
            <button onClick={() => approveAction.mutate()} className="flex items-center gap-1 px-3 py-1.5 rounded-lg font-body accent-gradient accent-glow" style={{ border: "none", color: "var(--accent-on)", fontSize: 11.5, fontWeight: 600, cursor: "pointer" }}>
              <CheckCircle size={12} /> Approve
            </button>
          )}
        </div>
      </div>

      {/* Two-column layout */}
      <div className="flex flex-col lg:flex-row gap-5">
        {/* Left Column */}
        <div className="flex-1 flex flex-col gap-5 min-w-0">
          {/* Beacon Brief */}
          <GlassPanel style={{ padding: 20 }}>
            <h3 className="font-body" style={sectionHeader}>Beacon Brief</h3>
            <p className="font-body" style={{ fontSize: 13, color: initiative.initiative_brief ? "var(--text-secondary)" : "var(--text-muted)", lineHeight: 1.6 }}>
              {initiative.initiative_brief || "No brief generated yet."}
            </p>
          </GlassPanel>

          {/* Goal & Description */}
          <div className="grid gap-4 md:grid-cols-2">
            <GlassPanel style={{ padding: 20 }}>
              <h3 className="font-body" style={sectionHeader}>Goal</h3>
              <p className="font-body" style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6 }}>{initiative.goal || "No goal specified."}</p>
            </GlassPanel>
            <GlassPanel style={{ padding: 20 }}>
              <h3 className="font-body" style={sectionHeader}>Audience</h3>
              <p className="font-body" style={{ fontSize: 13, color: "var(--text-secondary)" }}>{initiative.audience || "Not specified."}</p>
            </GlassPanel>
          </div>

          {/* Missing Information */}
          <GlassPanel style={{ padding: 20 }}>
            <h3 className="font-body" style={sectionHeader}>Missing Information</h3>
            {checklistItems.length === 0 ? (
              <p className="font-body" style={{ fontSize: 13, color: "var(--text-muted)" }}>No missing items.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {checklistItems.map((item: any, idx: number) => (
                  <label key={idx} className="flex items-center gap-2 font-body cursor-pointer" style={{ fontSize: 12.5, color: item.checked ? "var(--text-muted)" : "var(--text-secondary)", textDecoration: item.checked ? "line-through" : "none" }}>
                    <input
                      type="checkbox"
                      checked={item.checked || false}
                      onChange={(e) => toggleChecklistItem.mutate({ index: idx, checked: e.target.checked })}
                      style={{ accentColor: "var(--accent)" }}
                    />
                    {item.label}
                  </label>
                ))}
              </div>
            )}
          </GlassPanel>

          {/* Recommended Strategy */}
          <GlassPanel style={{ padding: 20 }}>
            <h3 className="font-body" style={sectionHeader}>Recommended Strategy</h3>
            {!strategy ? (
              <p className="font-body" style={{ fontSize: 13, color: "var(--text-muted)" }}>No strategy generated.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {(strategy.tiers || []).map((tier: any, idx: number) => (
                  <div key={tier.name} className="rounded-xl p-4" style={{
                    border: tier.selected ? "1px solid var(--accent-border)" : "1px solid var(--border)",
                    background: tier.selected ? "var(--accent-bg)" : "var(--bg-inset)",
                    boxShadow: tier.selected ? "var(--accent-glow)" : "none",
                  }}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-body" style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{tier.name}</span>
                      {idx === 1 && <span className="font-body px-2 py-0.5 rounded-full" style={{ fontSize: 9, fontWeight: 600, background: "var(--accent-bg-strong)", color: "var(--accent-text)", border: "1px solid var(--accent-border)" }}>Recommended</span>}
                    </div>
                    <div className="mb-2">
                      <span className="font-display" style={{ fontSize: 22, fontWeight: 700, color: "var(--accent-text)" }}>{tier.tokens}</span>
                      <span className="font-body ml-1" style={{ fontSize: 11, color: "var(--text-muted)" }}>tokens</span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      {(tier.channels || []).map((ch: string) => (
                        <span key={ch} className="font-body" style={{ fontSize: 11.5, color: "var(--text-muted)" }}>· {ch}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </GlassPanel>

          {/* Channels */}
          <GlassPanel style={{ padding: 20 }}>
            <h3 className="font-body" style={sectionHeader}>Channels</h3>
            <div className="flex flex-wrap gap-1.5">
              {initiative.channels_requested && initiative.channels_requested.length > 0 ? (
                initiative.channels_requested.map((ch: string) => (
                  <span key={ch} className="font-body px-2.5 py-1 rounded-full" style={{ fontSize: 11, background: "var(--bg-inset)", color: "var(--text-tertiary)", border: "1px solid var(--border)" }}>
                    {ch}
                  </span>
                ))
              ) : (
                <span className="font-body" style={{ fontSize: 13, color: "var(--text-muted)" }}>None specified.</span>
              )}
            </div>
          </GlassPanel>

          {initiative.token_cost_estimate && (
            <GlassPanel style={{ padding: 20 }}>
              <h3 className="font-body" style={sectionHeader}>Token Estimate</h3>
              <span className="font-display" style={{ fontSize: 28, fontWeight: 700, color: "var(--accent-text)" }}>{initiative.token_cost_estimate}</span>
              <span className="font-body ml-1" style={{ fontSize: 12, color: "var(--text-muted)" }}>tokens</span>
            </GlassPanel>
          )}
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-5" style={{ width: "100%", maxWidth: 320 }}>
          {/* Activity */}
          <GlassPanel style={{ padding: 20 }}>
            <h3 className="font-body" style={sectionHeader}>Activity</h3>
            {activity.length === 0 ? (
              <p className="font-body" style={{ fontSize: 12, color: "var(--text-muted)" }}>No activity yet.</p>
            ) : (
              <div className="flex flex-col">
                {activity.map((a: any, idx: number) => (
                  <div key={a.id} className="py-2" style={{ borderBottom: idx < activity.length - 1 ? "1px solid var(--border)" : "none" }}>
                    <p className="font-body" style={{ fontSize: 12, color: "var(--text-secondary)" }}>{a.action}</p>
                    <span className="font-body" style={{ fontSize: 10.5, color: "var(--text-muted)" }}>
                      {format(new Date(a.created_at), "MMM d, yyyy 'at' h:mm a")}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </GlassPanel>

          {/* Notes */}
          <GlassPanel style={{ padding: 20 }}>
            <h3 className="font-body" style={sectionHeader}>Notes</h3>
            <div className="flex flex-col gap-2 mb-3">
              {notes.length === 0 ? (
                <p className="font-body" style={{ fontSize: 12, color: "var(--text-muted)" }}>No notes yet.</p>
              ) : notes.map((note: any) => (
                <div key={note.id} className="rounded-lg p-3" style={{ background: "var(--bg-inset)", border: "1px solid var(--border)", borderRadius: 10 }}>
                  <p className="font-body" style={{ fontSize: 12.5, color: "var(--text-secondary)", lineHeight: 1.5 }}>{note.content}</p>
                  <span className="font-body mt-1 block" style={{ fontSize: 10.5, color: "var(--text-muted)" }}>
                    {format(new Date(note.created_at), "MMM d 'at' h:mm a")}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Add a note..."
                className="font-body flex-1 bg-transparent outline-none"
                style={{ padding: "8px 10px", borderRadius: 10, border: "1px solid var(--border)", background: "var(--bg-input)", color: "var(--text-primary)", fontSize: 12 }}
                onKeyDown={(e) => { if (e.key === "Enter" && noteText.trim()) addNote.mutate(noteText.trim()); }}
              />
              <button
                disabled={!noteText.trim()}
                onClick={() => noteText.trim() && addNote.mutate(noteText.trim())}
                className="flex items-center justify-center rounded-lg accent-gradient accent-glow"
                style={{ width: 34, height: 34, border: "none", color: "var(--accent-on)", cursor: noteText.trim() ? "pointer" : "not-allowed", opacity: noteText.trim() ? 1 : 0.5 }}
              >
                <Send size={12} />
              </button>
            </div>
          </GlassPanel>

          {/* Attachments placeholder */}
          <GlassPanel style={{ padding: 20 }}>
            <h3 className="font-body" style={sectionHeader}>Attachments</h3>
            <div className="flex flex-col items-center justify-center py-5 rounded-lg" style={{ border: "1.5px dashed var(--border-hover)", borderRadius: 10 }}>
              <Upload size={20} style={{ color: "var(--text-muted)", opacity: 0.5, marginBottom: 8 }} />
              <span className="font-body" style={{ fontSize: 12, color: "var(--text-muted)" }}>Drop files here or click to upload</span>
            </div>
          </GlassPanel>
        </div>
      </div>
    </div>
  );
}
