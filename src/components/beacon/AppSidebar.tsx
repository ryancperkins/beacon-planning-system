import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Calendar, Inbox, FileText, BookOpen, Users, GraduationCap,
  Puzzle, Settings, ChevronLeft, ChevronRight, Menu, X,
} from "lucide-react";
import { BeaconLogo } from "./BeaconLogo";
import { ThemeToggle } from "./ThemeToggle";
import { useAuth } from "@/contexts/AuthContext";

const navItems = [
  { id: "/timeline", label: "Timeline", icon: Calendar },
  { id: "/inbox", label: "Inbox", icon: Inbox, badge: 3 },
  { id: "/initiatives", label: "Initiatives", icon: FileText },
  { id: "/library", label: "Library", icon: BookOpen },
  { id: "/community", label: "Community", icon: Users },
  { id: "/mentorship", label: "Mentorship", icon: GraduationCap },
];

const bottomItems = [
  { id: "/integrations", label: "Integrations", icon: Puzzle },
  { id: "/admin", label: "Admin", icon: Settings },
];

export function AppSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut } = useAuth();

  const w = collapsed ? 60 : 220;

  const NavBtn = ({ item }: { item: typeof navItems[0] }) => {
    const isActive = location.pathname === item.id || location.pathname.startsWith(item.id + "/");
    const [h, setH] = useState(false);

    return (
      <button
        onClick={() => { navigate(item.id); setMobileOpen(false); }}
        onMouseEnter={() => setH(true)}
        onMouseLeave={() => setH(false)}
        className="font-body relative w-full"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 11,
          padding: collapsed ? "9px 0" : "9px 12px",
          borderRadius: 10,
          border: "none",
          cursor: "pointer",
          justifyContent: collapsed ? "center" : "flex-start",
          background: isActive ? "var(--accent-bg-strong)" : h ? "rgba(255,255,255,0.04)" : "transparent",
          color: isActive ? "var(--accent)" : h ? "var(--text-sidebar)" : "var(--text-sidebar-muted)",
          transition: "all 0.15s ease",
          fontSize: "13px",
          fontWeight: isActive ? 550 : 450,
          letterSpacing: "0.01em",
        }}
      >
        {isActive && (
          <span style={{
            position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)",
            width: 2, height: 16, borderRadius: 2,
            background: "var(--accent)", boxShadow: "var(--accent-glow)",
          }} />
        )}
        <item.icon size={18} style={{ flexShrink: 0, opacity: isActive ? 1 : 0.7 }} />
        {!collapsed && <span>{item.label}</span>}
        {item.badge && !collapsed && (
          <span style={{
            marginLeft: "auto", background: "var(--badge-bg)", color: "var(--badge-text)",
            fontSize: "10px", fontWeight: 600, padding: "1px 7px", borderRadius: 100,
            minWidth: 18, textAlign: "center", border: "1px solid var(--badge-border)",
          }}>{item.badge}</span>
        )}
        {item.badge && collapsed && (
          <span style={{
            position: "absolute", top: 6, right: 10, width: 6, height: 6, borderRadius: "50%",
            background: "var(--badge-dot)", boxShadow: "0 0 6px var(--badge-border)",
          }} />
        )}
      </button>
    );
  };

  const sidebarContent = (
    <div
      className="flex flex-col h-full"
      style={{
        width: mobileOpen ? 220 : w,
        minWidth: mobileOpen ? 220 : w,
        background: "var(--bg-sidebar)",
        backdropFilter: "blur(40px)",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        borderRight: "1px solid var(--border-sidebar)",
      }}
    >
      {/* Header */}
      <div
        className="flex items-center"
        style={{
          padding: collapsed && !mobileOpen ? "20px 0" : "20px 18px",
          gap: 10,
          justifyContent: collapsed && !mobileOpen ? "center" : "flex-start",
          borderBottom: "1px solid var(--border-sidebar)",
          minHeight: 66,
        }}
      >
        <BeaconLogo size={collapsed && !mobileOpen ? 24 : 26} />
        {(!collapsed || mobileOpen) && (
          <span className="font-display" style={{ fontSize: 16, fontWeight: 700, color: "var(--text-sidebar)", letterSpacing: "-0.03em" }}>
            beacon
          </span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 flex flex-col gap-px" style={{ padding: "10px 6px" }}>
        {navItems.map((item) => <NavBtn key={item.id} item={item} />)}
        <div className="flex-1" />
        <div className="flex flex-col gap-px" style={{ borderTop: "1px solid var(--border-sidebar)", paddingTop: 8, marginTop: 8 }}>
          {bottomItems.map((item) => <NavBtn key={item.id} item={item} />)}
        </div>
      </nav>

      {/* Footer */}
      <div
        className="flex items-center"
        style={{
          padding: collapsed && !mobileOpen ? "10px 6px" : "10px 12px",
          borderTop: "1px solid var(--border-sidebar)",
          justifyContent: collapsed && !mobileOpen ? "center" : "space-between",
          gap: 6,
        }}
      >
        {(!collapsed || mobileOpen) && <ThemeToggle />}
        <button
          onClick={() => { if (mobileOpen) setMobileOpen(false); else setCollapsed(!collapsed); }}
          className="flex rounded-md transition-colors"
          style={{ padding: 6, border: "none", background: "transparent", color: "var(--text-sidebar-dim)", cursor: "pointer" }}
        >
          {collapsed && !mobileOpen ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="fixed top-4 left-4 z-50 md:hidden flex items-center justify-center rounded-lg"
        style={{
          width: 40, height: 40,
          background: "var(--bg-sidebar)",
          border: "1px solid var(--border-sidebar)",
          color: "var(--text-sidebar)",
          cursor: "pointer",
        }}
      >
        {mobileOpen ? <X size={18} /> : <Menu size={18} />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 md:hidden"
          style={{ background: "var(--bg-overlay)" }}
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar - desktop */}
      <div className="hidden md:flex h-screen z-20 flex-shrink-0">
        {sidebarContent}
      </div>

      {/* Sidebar - mobile */}
      <div
        className={`fixed top-0 left-0 h-screen z-40 md:hidden transition-transform duration-300 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {sidebarContent}
      </div>
    </>
  );
}
