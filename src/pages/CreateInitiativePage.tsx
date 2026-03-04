import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { GlassPanel } from "@/components/beacon/GlassPanel";
import { toast } from "sonner";

const CHANNELS = ["Social Media", "Email", "Print", "Video", "Direct Mail", "Lobby Display", "In-Service Announcement", "Website"];
const TYPES = [
  { value: "campaign", label: "Campaign", desc: "Multi-channel outreach over a set period" },
  { value: "series", label: "Series", desc: "Recurring content or teaching series" },
  { value: "event", label: "Event", desc: "One-time or recurring event promotion" },
];

const steps = ["Goal", "Details", "Channels", "Review"];

export default function CreateInitiativePage() {
  const { church, user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    title: "",
    goal: "",
    description: "",
    audience: "",
    initiative_type: "campaign",
    ministry_id: "",
    campus_id: "",
    start_date: "",
    end_date: "",
    channels_requested: [] as string[],
  });

  const { data: ministries = [] } = useQuery({
    queryKey: ["ministries", church?.id],
    queryFn: async () => {
      const { data } = await supabase.from("ministries").select("*").eq("church_id", church!.id);
      return data || [];
    },
    enabled: !!church?.id,
  });

  const { data: campuses = [] } = useQuery({
    queryKey: ["campuses", church?.id],
    queryFn: async () => {
      const { data } = await supabase.from("campuses").select("*").eq("church_id", church!.id);
      return data || [];
    },
    enabled: !!church?.id,
  });

  const update = (field: string, value: any) => setForm((f) => ({ ...f, [field]: value }));
  const toggleChannel = (ch: string) => {
    setForm((f) => ({
      ...f,
      channels_requested: f.channels_requested.includes(ch)
        ? f.channels_requested.filter((c) => c !== ch)
        : [...f.channels_requested, ch],
    }));
  };

  const canNext = () => {
    if (step === 0) return form.title.trim() && form.goal.trim();
    if (step === 1) return form.ministry_id && form.start_date && form.end_date;
    return true;
  };

  const handleSubmit = async () => {
    if (!church || !user) return;
    setSaving(true);
    const { error } = await supabase.from("initiatives").insert({
      church_id: church.id,
      title: form.title,
      goal: form.goal,
      description: form.description,
      audience: form.audience || null,
      initiative_type: form.initiative_type,
      ministry_id: form.ministry_id,
      campus_id: form.campus_id || null,
      start_date: form.start_date,
      end_date: form.end_date,
      channels_requested: form.channels_requested,
      created_by: user.id,
      status: "Intake",
    });
    setSaving(false);
    if (error) {
      toast.error("Failed to create initiative");
      console.error(error);
    } else {
      toast.success("Initiative created!");
      navigate("/initiatives");
    }
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid var(--border)",
    background: "var(--bg-input)",
    color: "var(--text-primary)",
    fontSize: 13,
    fontFamily: "var(--font-body)",
    outline: "none",
  };

  const labelStyle: React.CSSProperties = { fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6, display: "block" };

  return (
    <div className="max-w-xl mx-auto">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1 mb-4 font-body" style={{ border: "none", background: "transparent", color: "var(--text-muted)", fontSize: 12.5, cursor: "pointer" }}>
        <ArrowLeft size={14} /> Back
      </button>

      <div className="mb-6">
        <h1 className="font-display" style={{ fontSize: 24, fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.03em" }}>
          Create Initiative
        </h1>
        <p className="font-body mt-1" style={{ fontSize: 13, color: "var(--text-tertiary)" }}>
          Start with your goal — we'll help figure out the rest
        </p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-1 mb-6">
        {steps.map((s, i) => (
          <div key={s} className="flex items-center gap-1">
            <div
              className="flex items-center justify-center rounded-full font-body"
              style={{
                width: 24, height: 24, fontSize: 11, fontWeight: 600,
                background: i <= step ? "var(--accent-gradient)" : "var(--bg-inset)",
                color: i <= step ? "var(--accent-on)" : "var(--text-muted)",
                border: i <= step ? "none" : "1px solid var(--border)",
              }}
            >
              {i < step ? <Check size={12} /> : i + 1}
            </div>
            <span className="font-body hidden sm:inline" style={{ fontSize: 11, color: i <= step ? "var(--text-primary)" : "var(--text-muted)", fontWeight: i === step ? 600 : 400 }}>{s}</span>
            {i < steps.length - 1 && <div style={{ width: 20, height: 1, background: "var(--border)", margin: "0 4px" }} />}
          </div>
        ))}
      </div>

      <GlassPanel style={{ padding: "24px 20px" }}>
        {/* Step 0: Goal */}
        {step === 0 && (
          <div className="flex flex-col gap-4">
            <div>
              <label className="font-body" style={labelStyle}>Initiative Title *</label>
              <input value={form.title} onChange={(e) => update("title", e.target.value)} placeholder="e.g., Easter Campaign 2026" style={inputStyle} />
            </div>
            <div>
              <label className="font-body" style={labelStyle}>What's the goal? *</label>
              <textarea value={form.goal} onChange={(e) => update("goal", e.target.value)} placeholder="What are you trying to achieve?" rows={3} style={{ ...inputStyle, resize: "vertical" }} />
            </div>
            <div>
              <label className="font-body" style={labelStyle}>Description</label>
              <textarea value={form.description} onChange={(e) => update("description", e.target.value)} placeholder="Brief context for the creative team..." rows={2} style={{ ...inputStyle, resize: "vertical" }} />
            </div>
          </div>
        )}

        {/* Step 1: Details */}
        {step === 1 && (
          <div className="flex flex-col gap-4">
            <div>
              <label className="font-body" style={labelStyle}>Initiative Type</label>
              <div className="flex flex-wrap gap-2">
                {TYPES.map((t) => (
                  <button
                    key={t.value}
                    onClick={() => update("initiative_type", t.value)}
                    className="flex flex-col items-start px-3 py-2 rounded-lg font-body"
                    style={{
                      border: form.initiative_type === t.value ? "1px solid var(--accent-border)" : "1px solid var(--border)",
                      background: form.initiative_type === t.value ? "var(--accent-bg)" : "var(--bg-surface)",
                      color: "var(--text-primary)", cursor: "pointer", flex: "1 1 120px",
                    }}
                  >
                    <span style={{ fontSize: 12.5, fontWeight: 600, color: form.initiative_type === t.value ? "var(--accent-text)" : "var(--text-primary)" }}>{t.label}</span>
                    <span style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>{t.desc}</span>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="font-body" style={labelStyle}>Ministry *</label>
              <select value={form.ministry_id} onChange={(e) => update("ministry_id", e.target.value)} style={inputStyle}>
                <option value="">Select ministry...</option>
                {ministries.map((m: any) => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </div>
            <div>
              <label className="font-body" style={labelStyle}>Campus</label>
              <select value={form.campus_id} onChange={(e) => update("campus_id", e.target.value)} style={inputStyle}>
                <option value="">All campuses</option>
                {campuses.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="font-body" style={labelStyle}>Start Date *</label>
                <input type="date" value={form.start_date} onChange={(e) => update("start_date", e.target.value)} style={inputStyle} />
              </div>
              <div className="flex-1">
                <label className="font-body" style={labelStyle}>End Date *</label>
                <input type="date" value={form.end_date} onChange={(e) => update("end_date", e.target.value)} style={inputStyle} />
              </div>
            </div>
            <div>
              <label className="font-body" style={labelStyle}>Target Audience</label>
              <input value={form.audience} onChange={(e) => update("audience", e.target.value)} placeholder="e.g., Young adults 18-30" style={inputStyle} />
            </div>
          </div>
        )}

        {/* Step 2: Channels */}
        {step === 2 && (
          <div>
            <label className="font-body" style={labelStyle}>Requested Channels</label>
            <p className="font-body mb-3" style={{ fontSize: 12, color: "var(--text-muted)" }}>Select all that apply</p>
            <div className="flex flex-wrap gap-2">
              {CHANNELS.map((ch) => {
                const selected = form.channels_requested.includes(ch);
                return (
                  <button
                    key={ch}
                    onClick={() => toggleChannel(ch)}
                    className="px-3 py-1.5 rounded-full font-body"
                    style={{
                      fontSize: 12, fontWeight: 500, cursor: "pointer",
                      border: selected ? "1px solid var(--accent-border)" : "1px solid var(--border)",
                      background: selected ? "var(--accent-bg)" : "var(--bg-surface)",
                      color: selected ? "var(--accent-text)" : "var(--text-secondary)",
                    }}
                  >
                    {selected && <Check size={10} style={{ display: "inline", marginRight: 4 }} />}
                    {ch}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 3: Review */}
        {step === 3 && (
          <div className="flex flex-col gap-3">
            <h3 className="font-display" style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)" }}>Review Your Initiative</h3>
            {[
              ["Title", form.title],
              ["Goal", form.goal],
              ["Type", TYPES.find((t) => t.value === form.initiative_type)?.label || form.initiative_type],
              ["Ministry", ministries.find((m: any) => m.id === form.ministry_id)?.name || "—"],
              ["Campus", campuses.find((c: any) => c.id === form.campus_id)?.name || "All campuses"],
              ["Dates", form.start_date && form.end_date ? `${form.start_date} → ${form.end_date}` : "—"],
              ["Audience", form.audience || "—"],
              ["Channels", form.channels_requested.length > 0 ? form.channels_requested.join(", ") : "None selected"],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between items-start gap-4" style={{ borderBottom: "1px solid var(--border)", paddingBottom: 8 }}>
                <span className="font-body" style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", minWidth: 80 }}>{label}</span>
                <span className="font-body text-right" style={{ fontSize: 12.5, color: "var(--text-primary)" }}>{value}</span>
              </div>
            ))}
          </div>
        )}
      </GlassPanel>

      {/* Navigation */}
      <div className="flex justify-between mt-5">
        <button
          onClick={() => step > 0 ? setStep(step - 1) : navigate(-1)}
          className="flex items-center gap-1 px-4 py-2 rounded-lg font-body"
          style={{ border: "1px solid var(--border)", background: "var(--bg-surface)", color: "var(--text-secondary)", fontSize: 12.5, cursor: "pointer" }}
        >
          <ArrowLeft size={14} /> {step === 0 ? "Cancel" : "Back"}
        </button>
        {step < 3 ? (
          <button
            disabled={!canNext()}
            onClick={() => setStep(step + 1)}
            className="flex items-center gap-1 px-4 py-2 rounded-lg font-body accent-gradient accent-glow"
            style={{ border: "none", color: "var(--accent-on)", fontSize: 12.5, fontWeight: 600, cursor: canNext() ? "pointer" : "not-allowed", opacity: canNext() ? 1 : 0.5 }}
          >
            Next <ArrowRight size={14} />
          </button>
        ) : (
          <button
            disabled={saving}
            onClick={handleSubmit}
            className="flex items-center gap-1 px-5 py-2 rounded-lg font-body accent-gradient accent-glow"
            style={{ border: "none", color: "var(--accent-on)", fontSize: 12.5, fontWeight: 600, cursor: saving ? "wait" : "pointer" }}
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
            Create Initiative
          </button>
        )}
      </div>
    </div>
  );
}
