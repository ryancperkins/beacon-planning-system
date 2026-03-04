import { useNavigate } from "react-router-dom";
import { Search, Plus, ChevronDown } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { usePermissions } from "@/hooks/usePermissions";
import { ProfileDropdown } from "./ProfileDropdown";
import { NotificationBell } from "./NotificationBell";

interface TopBarProps {
  onSearch: () => void;
}

export function TopBar({ onSearch }: TopBarProps) {
  const { church } = useAuth();
  const { canCreate } = usePermissions();
  const navigate = useNavigate();

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
      <div className="w-10 md:hidden" />

      <div className="font-body flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{
        border: "1px solid var(--border)", background: "var(--bg-surface)",
        fontSize: 13, fontWeight: 500, color: "var(--text-primary)",
      }}>
        <span className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--accent)", boxShadow: "var(--accent-glow)" }} />
        <span className="hidden sm:inline">{church?.name || "No Church"}</span>
        <ChevronDown size={12} />
      </div>

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

      {canCreate && (
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
      )}

      <NotificationBell />
      <ProfileDropdown />
    </div>
  );
}
