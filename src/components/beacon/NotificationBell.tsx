import { useState, useRef, useEffect } from "react";
import { Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";

const STORAGE_KEY = "beacon_notifications_last_viewed";

export function NotificationBell() {
  const { church } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const lastViewed = localStorage.getItem(STORAGE_KEY) || "1970-01-01T00:00:00Z";

  const { data: activities = [] } = useQuery({
    queryKey: ["notifications", church?.id],
    queryFn: async () => {
      if (!church?.id) return [];
      const { data } = await supabase
        .from("initiative_activity")
        .select("*, initiatives(title)")
        .order("created_at", { ascending: false })
        .limit(20);
      return data || [];
    },
    enabled: !!church?.id,
    refetchInterval: 30000,
  });

  const unreadCount = activities.filter((a: any) => a.created_at > lastViewed).length;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const keyHandler = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", handler);
    document.addEventListener("keydown", keyHandler);
    return () => { document.removeEventListener("mousedown", handler); document.removeEventListener("keydown", keyHandler); };
  }, []);

  const handleOpen = () => {
    setOpen(!open);
    if (!open) {
      localStorage.setItem(STORAGE_KEY, new Date().toISOString());
    }
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={handleOpen}
        className="flex items-center justify-center rounded-lg relative"
        style={{ width: 36, height: 36, border: "1px solid var(--border)", background: "var(--bg-surface)", color: "var(--text-muted)", cursor: "pointer" }}
      >
        <Bell size={17} />
        {unreadCount > 0 && (
          <span style={{
            position: "absolute", top: -3, right: -3, width: 15, height: 15,
            borderRadius: "50%", background: "var(--badge-dot)", color: "#fff",
            fontSize: 9, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center",
            border: "2px solid var(--bg-base)", boxShadow: "0 0 8px var(--badge-border)",
          }}>{unreadCount > 9 ? "9+" : unreadCount}</span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 rounded-xl overflow-hidden z-50" style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", boxShadow: "var(--shadow-dropdown)", width: 300, maxHeight: 360, overflowY: "auto", padding: 4 }}>
          <div className="px-3 py-2 font-body" style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)", borderBottom: "1px solid var(--border)" }}>
            Notifications
          </div>
          {activities.length === 0 ? (
            <div className="px-3 py-6 text-center">
              <span className="font-body" style={{ fontSize: 12, color: "var(--text-muted)" }}>No activity yet</span>
            </div>
          ) : activities.map((a: any) => (
            <button
              key={a.id}
              onClick={() => { navigate(`/initiatives/${a.initiative_id}`); setOpen(false); }}
              className="w-full text-left px-3 py-2.5 rounded-lg font-body flex flex-col gap-0.5"
              style={{ border: "none", background: a.created_at > lastViewed ? "var(--accent-bg)" : "transparent", cursor: "pointer", fontSize: 12 }}
            >
              <span style={{ color: "var(--text-primary)", fontWeight: 550 }}>{a.action}</span>
              <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
                {(a as any).initiatives?.title} · {format(new Date(a.created_at), "MMM d, h:mm a")}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
