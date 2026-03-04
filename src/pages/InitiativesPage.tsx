import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, Filter, ChevronDown } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { GlassPanel } from "@/components/beacon/GlassPanel";
import { StatusChip } from "@/components/beacon/StatusChip";
import { format } from "date-fns";

const STATUS_OPTIONS = ["All", "Draft", "Intake", "Needs Info", "Reviewed", "Approved", "Creative Ready", "In Production", "Scheduled", "Complete"];
const TYPE_OPTIONS = ["All", "campaign", "series", "event"];

export default function InitiativesPage() {
  const { church } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);

  const { data: initiatives = [], isLoading } = useQuery({
    queryKey: ["initiatives", church?.id],
    queryFn: async () => {
      if (!church?.id) return [];
      const { data, error } = await supabase
        .from("initiatives")
        .select("*, ministries(name, color)")
        .eq("church_id", church.id)
        .order("start_date", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!church?.id,
  });

  const filtered = useMemo(() => {
    return initiatives.filter((i: any) => {
      const matchSearch = !search || i.title.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "All" || i.status === statusFilter;
      const matchType = typeFilter === "All" || i.initiative_type === typeFilter;
      return matchSearch && matchStatus && matchType;
    });
  }, [initiatives, search, statusFilter, typeFilter]);

  const typeLabel = (t: string) => t.charAt(0).toUpperCase() + t.slice(1);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="font-display" style={{ fontSize: 21, fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.03em" }}>
            Initiatives
          </h1>
          <p className="font-body mt-1" style={{ fontSize: 13, color: "var(--text-tertiary)" }}>
            {initiatives.length} initiative{initiatives.length !== 1 ? "s" : ""} across your church
          </p>
        </div>
        <button
          onClick={() => navigate("/create")}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg font-body accent-gradient accent-glow self-start"
          style={{ border: "none", color: "var(--accent-on)", fontSize: 12.5, fontWeight: 600, cursor: "pointer" }}
        >
          <Plus size={14} /> New Initiative
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 mb-5">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{ background: "var(--bg-input)", border: "1px solid var(--border)", flex: "1 1 200px", maxWidth: 340 }}>
          <Search size={14} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search initiatives..."
            className="font-body bg-transparent border-none outline-none w-full"
            style={{ fontSize: 12.5, color: "var(--text-primary)" }}
          />
        </div>

        {/* Status filter */}
        <div className="relative">
          <button
            onClick={() => { setShowStatusDropdown(!showStatusDropdown); setShowTypeDropdown(false); }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-body"
            style={{ border: "1px solid var(--border)", background: "var(--bg-surface)", fontSize: 12, color: statusFilter === "All" ? "var(--text-muted)" : "var(--text-primary)", cursor: "pointer" }}
          >
            <Filter size={12} /> {statusFilter === "All" ? "Status" : statusFilter} <ChevronDown size={10} />
          </button>
          {showStatusDropdown && (
            <div className="absolute top-full left-0 mt-1 z-50 rounded-xl overflow-hidden" style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", boxShadow: "var(--shadow-dropdown)", minWidth: 150, padding: 4 }}>
              {STATUS_OPTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => { setStatusFilter(s); setShowStatusDropdown(false); }}
                  className="w-full text-left px-3 py-1.5 rounded-lg font-body block"
                  style={{ border: "none", background: statusFilter === s ? "var(--accent-bg)" : "transparent", color: statusFilter === s ? "var(--accent-text)" : "var(--text-secondary)", fontSize: 12, cursor: "pointer" }}
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Type filter */}
        <div className="relative">
          <button
            onClick={() => { setShowTypeDropdown(!showTypeDropdown); setShowStatusDropdown(false); }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-body"
            style={{ border: "1px solid var(--border)", background: "var(--bg-surface)", fontSize: 12, color: typeFilter === "All" ? "var(--text-muted)" : "var(--text-primary)", cursor: "pointer" }}
          >
            {typeFilter === "All" ? "Type" : typeLabel(typeFilter)} <ChevronDown size={10} />
          </button>
          {showTypeDropdown && (
            <div className="absolute top-full left-0 mt-1 z-50 rounded-xl overflow-hidden" style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", boxShadow: "var(--shadow-dropdown)", minWidth: 130, padding: 4 }}>
              {TYPE_OPTIONS.map((t) => (
                <button
                  key={t}
                  onClick={() => { setTypeFilter(t); setShowTypeDropdown(false); }}
                  className="w-full text-left px-3 py-1.5 rounded-lg font-body block"
                  style={{ border: "none", background: typeFilter === t ? "var(--accent-bg)" : "transparent", color: typeFilter === t ? "var(--accent-text)" : "var(--text-secondary)", fontSize: 12, cursor: "pointer" }}
                >
                  {t === "All" ? "All" : typeLabel(t)}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <GlassPanel style={{ padding: "40px 20px", textAlign: "center" }}>
          <p className="font-body" style={{ fontSize: 13, color: "var(--text-muted)" }}>Loading initiatives...</p>
        </GlassPanel>
      ) : filtered.length === 0 ? (
        <GlassPanel style={{ padding: "40px 20px", textAlign: "center" }}>
          <p className="font-body" style={{ fontSize: 13, color: "var(--text-muted)" }}>
            {initiatives.length === 0 ? "No initiatives yet — create your first one!" : "No initiatives match your filters."}
          </p>
        </GlassPanel>
      ) : (
        <GlassPanel style={{ overflow: "hidden" }}>
          {/* Header (desktop only) */}
          <div className="hidden md:grid" style={{ gridTemplateColumns: "1fr 120px 90px 140px 70px", padding: "10px 16px", borderBottom: "1px solid var(--border)", fontSize: 11, fontWeight: 600, color: "var(--text-muted)", letterSpacing: "0.04em", textTransform: "uppercase" }}>
            <span>Initiative</span>
            <span>Ministry</span>
            <span>Type</span>
            <span>Dates</span>
            <span>Status</span>
          </div>

          {/* Rows */}
          {filtered.map((init: any, idx: number) => (
            <div
              key={init.id}
              onClick={() => navigate(`/initiatives/${init.id}`)}
              className="flex flex-col md:grid items-start md:items-center gap-2 md:gap-0 cursor-pointer transition-colors"
              style={{
                gridTemplateColumns: "1fr 120px 90px 140px 70px",
                padding: "12px 16px",
                borderBottom: idx < filtered.length - 1 ? "1px solid var(--border)" : "none",
                background: "transparent",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-surface-hover)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              {/* Title */}
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: (init as any).ministries?.color || "var(--text-muted)" }} />
                <span className="font-body truncate" style={{ fontSize: 13, fontWeight: 550, color: "var(--text-primary)" }}>{init.title}</span>
              </div>

              {/* Ministry */}
              <span className="font-body truncate" style={{ fontSize: 12, color: "var(--text-tertiary)" }}>
                {(init as any).ministries?.name || "—"}
              </span>

              {/* Type */}
              <span className="font-body" style={{ fontSize: 11.5, color: `var(--type-${init.initiative_type})`, fontWeight: 550 }}>
                {typeLabel(init.initiative_type)}
              </span>

              {/* Dates */}
              <span className="font-body" style={{ fontSize: 11.5, color: "var(--text-muted)" }}>
                {format(new Date(init.start_date), "MMM d")} – {format(new Date(init.end_date), "MMM d")}
              </span>

              {/* Status */}
              <StatusChip status={init.status} />
            </div>
          ))}
        </GlassPanel>
      )}
    </div>
  );
}
