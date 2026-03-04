import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { usePermissions } from "@/hooks/usePermissions";
import { GlassPanel } from "@/components/beacon/GlassPanel";
import { BookOpen, Plus, Search, X } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { motion } from "framer-motion";

const CATEGORIES = ["All", "Templates", "Graphics", "Documents", "Guides"];

export default function LibraryPage() {
  const { church, user } = useAuth();
  const { canAddToLibrary } = usePermissions();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [showAdd, setShowAdd] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newCategory, setNewCategory] = useState("Documents");

  const { data: resources = [], isLoading } = useQuery({
    queryKey: ["resources", church?.id],
    queryFn: async () => {
      const { data } = await supabase.from("resources").select("*").eq("church_id", church!.id).order("created_at", { ascending: false });
      return data || [];
    },
    enabled: !!church?.id,
  });

  const addResource = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("resources").insert({
        church_id: church!.id, title: newTitle, description: newDesc,
        category: newCategory.toLowerCase(), created_by: user!.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resources"] });
      setShowAdd(false); setNewTitle(""); setNewDesc("");
      toast.success("Resource added");
    },
  });

  const filtered = resources.filter((r: any) => {
    const matchCat = category === "All" || r.category.toLowerCase() === category.toLowerCase();
    const matchSearch = !search || r.title.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "8px 10px", borderRadius: 8,
    border: "1px solid var(--border)", background: "var(--bg-input)",
    color: "var(--text-primary)", fontSize: 12.5, fontFamily: "var(--font-body)", outline: "none",
  };

  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
        <div>
          <h1 className="font-display" style={{ fontSize: 21, fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.03em" }}>Resource Library</h1>
          <p className="font-body mt-1" style={{ fontSize: 13, color: "var(--text-tertiary)" }}>Browse and share creative assets</p>
        </div>
        {canAddToLibrary && (
          <button onClick={() => setShowAdd(true)} className="flex items-center gap-1.5 px-4 py-2 rounded-lg font-body accent-gradient accent-glow self-start" style={{ border: "none", color: "var(--accent-on)", fontSize: 12.5, fontWeight: 600, cursor: "pointer" }}>
            <Plus size={14} /> Add Resource
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 mb-5">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{ background: "var(--bg-input)", border: "1px solid var(--border)", flex: "1 1 200px", maxWidth: 300 }}>
          <Search size={14} style={{ color: "var(--text-muted)" }} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search resources..." className="font-body bg-transparent border-none outline-none w-full" style={{ fontSize: 12.5, color: "var(--text-primary)" }} />
        </div>
        <div className="flex gap-1">
          {CATEGORIES.map((cat) => (
            <button key={cat} onClick={() => setCategory(cat)} className="font-body px-3 py-1" style={{
              borderRadius: 100, cursor: "pointer", fontSize: 12, fontWeight: 500,
              border: category === cat ? "1px solid var(--accent-border)" : "1px solid var(--border)",
              background: category === cat ? "var(--accent-bg)" : "transparent",
              color: category === cat ? "var(--accent-text)" : "var(--text-muted)",
            }}>
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Add dialog */}
      {showAdd && (
        <GlassPanel style={{ padding: 20, marginBottom: 16 }}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-body" style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>Add Resource</h3>
            <button onClick={() => setShowAdd(false)} style={{ border: "none", background: "transparent", color: "var(--text-muted)", cursor: "pointer" }}><X size={16} /></button>
          </div>
          <div className="flex flex-col gap-3">
            <input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Title" style={inputStyle} />
            <textarea value={newDesc} onChange={(e) => setNewDesc(e.target.value)} placeholder="Description" rows={2} style={{ ...inputStyle, resize: "vertical" }} />
            <select value={newCategory} onChange={(e) => setNewCategory(e.target.value)} style={inputStyle}>
              {CATEGORIES.filter((c) => c !== "All").map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <button disabled={!newTitle.trim()} onClick={() => addResource.mutate()} className="self-end px-4 py-2 rounded-lg font-body accent-gradient accent-glow" style={{ border: "none", color: "var(--accent-on)", fontSize: 12.5, fontWeight: 600, cursor: newTitle.trim() ? "pointer" : "not-allowed", opacity: newTitle.trim() ? 1 : 0.5 }}>
              Add
            </button>
          </div>
        </GlassPanel>
      )}

      {/* Content */}
      {isLoading ? (
        <GlassPanel style={{ padding: "40px 20px", textAlign: "center" }}>
          <p className="font-body" style={{ fontSize: 13, color: "var(--text-muted)" }}>Loading...</p>
        </GlassPanel>
      ) : filtered.length === 0 ? (
        <GlassPanel style={{ padding: "50px 20px", textAlign: "center" }}>
          <BookOpen size={32} style={{ color: "var(--text-muted)", opacity: 0.4, margin: "0 auto 12px" }} />
          <p className="font-body" style={{ fontSize: 13, color: "var(--text-muted)" }}>
            {resources.length === 0 ? "No resources yet — add your first one!" : "No resources match your filters."}
          </p>
        </GlassPanel>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((r: any) => (
            <GlassPanel key={r.id} hover style={{ padding: 16 }}>
              <div className="flex items-start gap-2 mb-2">
                <span className="font-body flex-1 truncate" style={{ fontSize: 13.5, fontWeight: 600, color: "var(--text-primary)" }}>{r.title}</span>
                <span className="font-body px-2 py-0.5 rounded-full capitalize flex-shrink-0" style={{ fontSize: 10, fontWeight: 600, background: "var(--accent-bg)", color: "var(--accent-text)", border: "1px solid var(--accent-border)" }}>
                  {r.category}
                </span>
              </div>
              {r.description && <p className="font-body mb-2" style={{ fontSize: 12, color: "var(--text-tertiary)", lineHeight: 1.4 }}>{r.description}</p>}
              <div className="font-body" style={{ fontSize: 11, color: "var(--text-muted)" }}>
                {format(new Date(r.created_at), "MMM d, yyyy")}
              </div>
            </GlassPanel>
          ))}
        </div>
      )}
    </motion.div>
  );
}
