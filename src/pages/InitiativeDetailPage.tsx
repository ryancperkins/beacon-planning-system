import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Send, Clock, FileText, MessageSquare, Activity, ChevronDown } from "lucide-react";
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
  const [activeTab, setActiveTab] = useState<"brief" | "notes" | "activity">("brief");
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
        initiative_id: id!,
        author_id: user!.id,
        content,
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
      // Log activity
      await supabase.from("initiative_activity").insert({
        initiative_id: id!,
        actor_id: user!.id,
        action: `Status changed to ${newStatus}`,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["initiative", id] });
      queryClient.invalidateQueries({ queryKey: ["initiative-activity", id] });
      setShowStatusMenu(false);
      toast.success("Status updated");
    },
  });

  if (isLoading) {
    return (
      <GlassPanel style={{ padding: "40px 20px", textAlign: "center" }}>
        <p className="font-body" style={{ fontSize: 13, color: "var(--text-muted)" }}>Loading...</p>
      </GlassPanel>
    );
  }

  if (!initiative) {
    return (
      <GlassPanel style={{ padding: "40px 20px", textAlign: "center" }}>
        <p className="font-body" style={{ fontSize: 13, color: "var(--text-muted)" }}>Initiative not found.</p>
      </GlassPanel>
    );
  }

  const ministry = (initiative as any).ministries;
  const typeLabel = initiative.initiative_type.charAt(0).toUpperCase() + initiative.initiative_type.slice(1);

  const tabs = [
    { key: "brief" as const, label: "Brief", icon: FileText },
    { key: "notes" as const, label: `Notes (${notes.length})`, icon: MessageSquare },
    { key: "activity" as const, label: "Activity", icon: Activity },
  ];

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

        {/* Status control */}
        <div className="relative self-start">
          <button onClick={() => setShowStatusMenu(!showStatusMenu)} className="flex items-center gap-1.5" style={{ cursor: "pointer", background: "none", border: "none", padding: 0 }}>
            <StatusChip status={initiative.status} />
            <ChevronDown size={12} style={{ color: "var(--text-muted)" }} />
          </button>
          {showStatusMenu && (
            <div className="absolute right-0 top-full mt-1 z-50 rounded-xl overflow-hidden" style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", boxShadow: "var(--shadow-dropdown)", minWidth: 160, padding: 4 }}>
              {STATUS_FLOW.map((s) => (
                <button
                  key={s}
                  onClick={() => updateStatus.mutate(s)}
                  className="w-full text-left px-3 py-1.5 rounded-lg font-body block"
                  style={{ border: "none", background: initiative.status === s ? "var(--accent-bg)" : "transparent", color: initiative.status === s ? "var(--accent-text)" : "var(--text-secondary)", fontSize: 12, cursor: "pointer" }}
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-0 mb-5" style={{ borderBottom: "1px solid var(--border)" }}>
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className="flex items-center gap-1.5 px-4 py-2.5 font-body relative"
            style={{
              border: "none", background: "transparent", cursor: "pointer",
              fontSize: 12.5, fontWeight: activeTab === tab.key ? 600 : 450,
              color: activeTab === tab.key ? "var(--accent-text)" : "var(--text-muted)",
            }}
          >
            <tab.icon size={14} />
            {tab.label}
            {activeTab === tab.key && (
              <span style={{ position: "absolute", bottom: -1, left: 16, right: 16, height: 2, borderRadius: 2, background: "var(--accent)", boxShadow: "var(--accent-glow)" }} />
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "brief" && (
        <div className="grid gap-4 md:grid-cols-2">
          <GlassPanel style={{ padding: 20 }}>
            <h3 className="font-display mb-3" style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>Goal</h3>
            <p className="font-body" style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6 }}>{initiative.goal || "No goal specified."}</p>
          </GlassPanel>
          <GlassPanel style={{ padding: 20 }}>
            <h3 className="font-display mb-3" style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>Description</h3>
            <p className="font-body" style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6 }}>{initiative.description || "No description."}</p>
          </GlassPanel>
          <GlassPanel style={{ padding: 20 }}>
            <h3 className="font-display mb-3" style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>Audience</h3>
            <p className="font-body" style={{ fontSize: 13, color: "var(--text-secondary)" }}>{initiative.audience || "Not specified."}</p>
          </GlassPanel>
          <GlassPanel style={{ padding: 20 }}>
            <h3 className="font-display mb-3" style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>Channels</h3>
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
              <h3 className="font-display mb-3" style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>Token Estimate</h3>
              <span className="font-display" style={{ fontSize: 28, fontWeight: 700, color: "var(--accent)" }}>{initiative.token_cost_estimate}</span>
              <span className="font-body ml-1" style={{ fontSize: 12, color: "var(--text-muted)" }}>tokens</span>
            </GlassPanel>
          )}
        </div>
      )}

      {activeTab === "notes" && (
        <div>
          {/* Add note */}
          <div className="flex gap-2 mb-4">
            <input
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Add a note..."
              className="font-body flex-1 bg-transparent outline-none"
              style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid var(--border)", background: "var(--bg-input)", color: "var(--text-primary)", fontSize: 13 }}
              onKeyDown={(e) => { if (e.key === "Enter" && noteText.trim()) addNote.mutate(noteText.trim()); }}
            />
            <button
              disabled={!noteText.trim()}
              onClick={() => noteText.trim() && addNote.mutate(noteText.trim())}
              className="flex items-center justify-center rounded-lg accent-gradient accent-glow"
              style={{ width: 38, height: 38, border: "none", color: "var(--accent-on)", cursor: noteText.trim() ? "pointer" : "not-allowed", opacity: noteText.trim() ? 1 : 0.5 }}
            >
              <Send size={14} />
            </button>
          </div>
          <div className="flex flex-col gap-2">
            {notes.length === 0 ? (
              <GlassPanel style={{ padding: "30px 20px", textAlign: "center" }}>
                <p className="font-body" style={{ fontSize: 13, color: "var(--text-muted)" }}>No notes yet.</p>
              </GlassPanel>
            ) : notes.map((note: any) => (
              <GlassPanel key={note.id} style={{ padding: "12px 16px" }}>
                <p className="font-body" style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5 }}>{note.content}</p>
                <span className="font-body mt-1 block" style={{ fontSize: 11, color: "var(--text-muted)" }}>
                  {format(new Date(note.created_at), "MMM d, yyyy 'at' h:mm a")}
                </span>
              </GlassPanel>
            ))}
          </div>
        </div>
      )}

      {activeTab === "activity" && (
        <div className="flex flex-col gap-0">
          {activity.length === 0 ? (
            <GlassPanel style={{ padding: "30px 20px", textAlign: "center" }}>
              <p className="font-body" style={{ fontSize: 13, color: "var(--text-muted)" }}>No activity yet.</p>
            </GlassPanel>
          ) : activity.map((a: any, idx: number) => (
            <div key={a.id} className="flex items-start gap-3 py-3" style={{ borderBottom: idx < activity.length - 1 ? "1px solid var(--border)" : "none" }}>
              <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ background: "var(--accent-bg-strong)", border: "1px solid var(--accent-border)" }} />
              <div>
                <p className="font-body" style={{ fontSize: 13, color: "var(--text-secondary)" }}>{a.action}</p>
                <span className="font-body" style={{ fontSize: 11, color: "var(--text-muted)" }}>
                  {format(new Date(a.created_at), "MMM d, yyyy 'at' h:mm a")}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
