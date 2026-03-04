import { useState, useRef, useEffect } from "react";
import { LogOut, User, Edit } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function ProfileDropdown() {
  const { church, profile, role, signOut, refreshProfile } = useAuth();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editAvatar, setEditAvatar] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  const initials = profile?.full_name
    ? profile.full_name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  const roleBadge = role ? role.replace(/_/g, " ") : "member";

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const keyHandler = (e: KeyboardEvent) => { if (e.key === "Escape") { setOpen(false); setEditing(false); } };
    document.addEventListener("mousedown", handler);
    document.addEventListener("keydown", keyHandler);
    return () => { document.removeEventListener("mousedown", handler); document.removeEventListener("keydown", keyHandler); };
  }, []);

  const handleEdit = () => {
    setEditName(profile?.full_name || "");
    setEditAvatar(profile?.avatar_url || "");
    setEditing(true);
  };

  const handleSave = async () => {
    const { error } = await supabase.from("profiles").update({
      full_name: editName, avatar_url: editAvatar || null,
    }).eq("id", profile!.id);
    if (error) { toast.error("Failed to update profile"); return; }
    toast.success("Profile updated");
    setEditing(false);
    refreshProfile();
  };

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "6px 8px", borderRadius: 8,
    border: "1px solid var(--border)", background: "var(--bg-input)",
    color: "var(--text-primary)", fontSize: 12, fontFamily: "var(--font-body)", outline: "none",
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-center rounded-full font-body accent-gradient accent-glow"
        style={{ width: 32, height: 32, color: "var(--accent-on)", fontSize: 11, fontWeight: 700, cursor: "pointer", border: "none" }}
      >
        {initials}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 rounded-xl overflow-hidden z-50" style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", boxShadow: "var(--shadow-dropdown)", minWidth: 220, padding: 6 }}>
          {!editing ? (
            <>
              <div className="px-3 py-2">
                <div className="font-body" style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{profile?.full_name || "User"}</div>
                <div className="font-body capitalize mt-0.5" style={{ fontSize: 11, color: "var(--accent-text)", fontWeight: 550 }}>{roleBadge}</div>
                <div className="font-body mt-0.5" style={{ fontSize: 11, color: "var(--text-muted)" }}>{church?.name || "No Church"}</div>
              </div>
              <div style={{ borderTop: "1px solid var(--border)", margin: "4px 0" }} />
              <button onClick={handleEdit} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg font-body" style={{ border: "none", background: "transparent", color: "var(--text-secondary)", fontSize: 12.5, cursor: "pointer", textAlign: "left" }}>
                <Edit size={13} /> Edit Profile
              </button>
              <button onClick={() => { signOut(); setOpen(false); }} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg font-body" style={{ border: "none", background: "transparent", color: "var(--text-secondary)", fontSize: 12.5, cursor: "pointer", textAlign: "left" }}>
                <LogOut size={13} /> Sign Out
              </button>
            </>
          ) : (
            <div className="p-3 flex flex-col gap-2">
              <label className="font-body" style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)" }}>Name</label>
              <input value={editName} onChange={(e) => setEditName(e.target.value)} style={inputStyle} />
              <label className="font-body" style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)" }}>Avatar URL</label>
              <input value={editAvatar} onChange={(e) => setEditAvatar(e.target.value)} placeholder="https://..." style={inputStyle} />
              <div className="flex gap-2 mt-1">
                <button onClick={() => setEditing(false)} className="flex-1 font-body py-1.5 rounded-lg" style={{ border: "1px solid var(--border)", background: "var(--bg-surface)", color: "var(--text-secondary)", fontSize: 12, cursor: "pointer" }}>Cancel</button>
                <button onClick={handleSave} className="flex-1 font-body py-1.5 rounded-lg accent-gradient accent-glow" style={{ border: "none", color: "var(--accent-on)", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Save</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
