import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Bell, Plus, ChevronDown, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface TopBarProps {
  onSearch: () => void;
}

export function TopBar({ onSearch }: TopBarProps) {
  const { church, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [showProfile, setShowProfile] = useState(false);

  const initials = profile?.full_name
    ? profile.full_name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  return (
    <div
      className="flex items-center gap-3 px-4 md:px-6 z-15"
      style={{
        height: 60,
        minHeight: 60,
        background: "var(--bg-topbar)",
        backdropFilter: "var(--blur-topbar)",
        borderBottom: "1px solid var(--border)",
      }}
    >
      {/* Spacer for mobile hamburger */}
      <div className="w-10 md:hidden" />

      {/* Church name */}
      <div className="font-body flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{
        border: "1px solid var(--border)", background: "var(--bg-surface)",
        fontSize: 13, fontWeight: 500, color: "var(--text-primary)",
      }}>
        <span className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--accent)", boxShadow: "var(--accent-glow)" }} />
        <span className="hidden sm:inline">{church?.name || "No Church"}</span>
        <ChevronDown size={12} />
      </div>

      {/* Search */}
      <button
        onClick={onSearch}
        className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-lg font-body flex-shrink"
        style={{
          border: "1px solid var(--border)", background: "var(--bg-input)",
          color: "var(--text-muted)", fontSize: "12.5px", cursor: "pointer",
          maxWidth: 340, minWidth: 0,
        }}
      >
        <Search size={15} />
        <span className="hidden md:inline">Search initiatives...</span>
        <span className="ml-auto font-mono-beacon hidden lg:inline" style={{
          fontSize: 10, fontWeight: 500, padding: "2px 6px", borderRadius: 5,
          border: "1px solid var(--border)", color: "var(--text-muted)", background: "var(--bg-surface)",
        }}>⌘K</span>
      </button>

      <div className="flex-1" />

      {/* Create */}
      <button
        onClick={() => navigate("/create")}
        className="flex items-center gap-1.5 px-3 md:px-4 py-2 rounded-lg font-body accent-gradient accent-glow"
        style={{
          border: "none", color: "var(--accent-on)",
          fontSize: "12.5px", fontWeight: 600, cursor: "pointer", letterSpacing: "0.01em",
        }}
      >
        <Plus size={14} />
        <span className="hidden sm:inline">Create</span>
      </button>

      {/* Notifications */}
      <button
        className="flex items-center justify-center rounded-lg relative"
        style={{
          width: 36, height: 36,
          border: "1px solid var(--border)", background: "var(--bg-surface)",
          color: "var(--text-muted)", cursor: "pointer",
        }}
      >
        <Bell size={17} />
        <span style={{
          position: "absolute", top: -3, right: -3, width: 15, height: 15,
          borderRadius: "50%", background: "var(--badge-dot)", color: "#fff",
          fontSize: 9, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center",
          border: "2px solid var(--bg-base)", boxShadow: "0 0 8px var(--badge-border)",
        }}>2</span>
      </button>

      {/* Profile */}
      <div className="relative">
        <button
          onClick={() => setShowProfile(!showProfile)}
          className="flex items-center justify-center rounded-full font-body accent-gradient accent-glow"
          style={{
            width: 32, height: 32, color: "var(--accent-on)",
            fontSize: 11, fontWeight: 700, cursor: "pointer", border: "none",
          }}
        >
          {initials}
        </button>
        {showProfile && (
          <div
            className="absolute right-0 mt-2 rounded-xl overflow-hidden z-50"
            style={{
              background: "var(--bg-elevated)", border: "1px solid var(--border)",
              boxShadow: "var(--shadow-dropdown)", minWidth: 180, padding: 5,
            }}
          >
            <div className="px-3 py-2" style={{ fontSize: 12, color: "var(--text-muted)" }}>
              {profile?.full_name || "User"}
            </div>
            <button
              onClick={() => { signOut(); setShowProfile(false); }}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg font-body"
              style={{
                border: "none", background: "transparent", color: "var(--text-secondary)",
                fontSize: 12.5, cursor: "pointer", textAlign: "left",
              }}
            >
              <LogOut size={14} /> Sign Out
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
