import { useState, useEffect, useRef, useCallback, createContext, useContext } from "react";

/* ───────────────────────────────────────────────────
   BEACON — Church Creative Operations Platform
   App Shell v3: Light / Dark / System Theme Support
   
   Theme System:
   - "light" — Premium warm light with amber accents
   - "dark"  — Luminous dark with glass morphism + glow
   - "system" — Follows OS prefers-color-scheme
   
   All colors defined as CSS custom properties on :root
   Components read from theme context, never hardcode colors
   ─────────────────────────────────────────────────── */

// ─── Theme Definitions ───
const themes = {
  light: {
    "--bg-base": "#F8F7F5",
    "--bg-surface": "rgba(255,255,255,0.85)",
    "--bg-surface-hover": "rgba(255,255,255,0.95)",
    "--bg-elevated": "#FFFFFF",
    "--bg-inset": "#F0EEEB",
    "--bg-sidebar": "rgba(24,22,19,0.97)",
    "--bg-topbar": "rgba(255,255,255,0.8)",
    "--bg-overlay": "rgba(24,22,19,0.4)",
    "--bg-input": "rgba(0,0,0,0.03)",
    "--bg-input-hover": "rgba(0,0,0,0.05)",
    "--bg-ambient-1": "rgba(251,191,36,0.06)",
    "--bg-ambient-2": "rgba(96,165,250,0.04)",

    "--accent": "#D97706",
    "--accent-light": "#F59E0B",
    "--accent-gradient": "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)",
    "--accent-glow": "0 0 20px rgba(217,119,6,0.12)",
    "--accent-glow-strong": "0 0 30px rgba(217,119,6,0.2)",
    "--accent-bg": "rgba(217,119,6,0.08)",
    "--accent-bg-strong": "rgba(217,119,6,0.12)",
    "--accent-border": "rgba(217,119,6,0.2)",
    "--accent-text": "#92400E",
    "--accent-on": "#FFFBEB",

    "--text-primary": "#1C1917",
    "--text-secondary": "#44403C",
    "--text-tertiary": "#78716C",
    "--text-muted": "#A8A29E",
    "--text-on-accent": "#FFFBEB",
    "--text-sidebar": "#F1F5F9",
    "--text-sidebar-muted": "rgba(148,163,184,0.7)",
    "--text-sidebar-dim": "rgba(148,163,184,0.5)",

    "--border": "rgba(0,0,0,0.08)",
    "--border-hover": "rgba(0,0,0,0.14)",
    "--border-sidebar": "rgba(255,255,255,0.05)",
    "--border-accent": "rgba(217,119,6,0.25)",

    "--shadow-sm": "0 1px 3px rgba(0,0,0,0.04)",
    "--shadow-md": "0 4px 16px rgba(0,0,0,0.06)",
    "--shadow-lg": "0 12px 40px rgba(0,0,0,0.08)",
    "--shadow-dropdown": "0 16px 48px rgba(0,0,0,0.1)",
    "--blur-surface": "blur(20px)",
    "--blur-topbar": "blur(30px)",

    "--badge-bg": "rgba(244,114,182,0.12)",
    "--badge-text": "#DB2777",
    "--badge-border": "rgba(244,114,182,0.2)",
    "--badge-dot": "#DB2777",

    "--status-draft-bg": "rgba(120,113,108,0.1)",
    "--status-draft-text": "#78716C",
    "--status-draft-border": "rgba(120,113,108,0.2)",
    "--status-intake-bg": "rgba(37,99,235,0.08)",
    "--status-intake-text": "#2563EB",
    "--status-intake-border": "rgba(37,99,235,0.15)",
    "--status-needsinfo-bg": "rgba(217,119,6,0.08)",
    "--status-needsinfo-text": "#D97706",
    "--status-needsinfo-border": "rgba(217,119,6,0.15)",
    "--status-reviewed-bg": "rgba(5,150,105,0.08)",
    "--status-reviewed-text": "#059669",
    "--status-reviewed-border": "rgba(5,150,105,0.15)",
    "--status-approved-bg": "rgba(4,120,87,0.08)",
    "--status-approved-text": "#047857",
    "--status-approved-border": "rgba(4,120,87,0.15)",
    "--status-creativeready-bg": "rgba(124,58,237,0.08)",
    "--status-creativeready-text": "#7C3AED",
    "--status-creativeready-border": "rgba(124,58,237,0.15)",
    "--status-inproduction-bg": "rgba(219,39,119,0.08)",
    "--status-inproduction-text": "#DB2777",
    "--status-inproduction-border": "rgba(219,39,119,0.15)",
    "--status-scheduled-bg": "rgba(79,70,229,0.08)",
    "--status-scheduled-text": "#4F46E5",
    "--status-scheduled-border": "rgba(79,70,229,0.15)",
    "--status-complete-bg": "rgba(120,113,108,0.06)",
    "--status-complete-text": "#A8A29E",
    "--status-complete-border": "rgba(120,113,108,0.12)",

    "--type-campaign": "#2563EB",
    "--type-series": "#7C3AED",
    "--type-event": "#DB2777",
  },
  dark: {
    "--bg-base": "#0A0A0C",
    "--bg-surface": "rgba(255,255,255,0.03)",
    "--bg-surface-hover": "rgba(255,255,255,0.06)",
    "--bg-elevated": "rgba(255,255,255,0.05)",
    "--bg-inset": "rgba(255,255,255,0.02)",
    "--bg-sidebar": "rgba(10,10,12,0.8)",
    "--bg-topbar": "rgba(10,10,12,0.6)",
    "--bg-overlay": "rgba(0,0,0,0.6)",
    "--bg-input": "rgba(255,255,255,0.03)",
    "--bg-input-hover": "rgba(255,255,255,0.05)",
    "--bg-ambient-1": "rgba(251,191,36,0.03)",
    "--bg-ambient-2": "rgba(96,165,250,0.02)",

    "--accent": "#FBBF24",
    "--accent-light": "#FCD34D",
    "--accent-gradient": "linear-gradient(135deg, #FBBF24 0%, #F59E0B 100%)",
    "--accent-glow": "0 0 20px rgba(251,191,36,0.15)",
    "--accent-glow-strong": "0 0 30px rgba(251,191,36,0.3)",
    "--accent-bg": "rgba(251,191,36,0.08)",
    "--accent-bg-strong": "rgba(251,191,36,0.12)",
    "--accent-border": "rgba(251,191,36,0.2)",
    "--accent-text": "#FBBF24",
    "--accent-on": "#0A0A0C",

    "--text-primary": "#F1F5F9",
    "--text-secondary": "#CBD5E1",
    "--text-tertiary": "#64748B",
    "--text-muted": "#475569",
    "--text-on-accent": "#0A0A0C",
    "--text-sidebar": "#F1F5F9",
    "--text-sidebar-muted": "rgba(148,163,184,0.7)",
    "--text-sidebar-dim": "rgba(148,163,184,0.5)",

    "--border": "rgba(255,255,255,0.06)",
    "--border-hover": "rgba(255,255,255,0.1)",
    "--border-sidebar": "rgba(255,255,255,0.05)",
    "--border-accent": "rgba(251,191,36,0.25)",

    "--shadow-sm": "none",
    "--shadow-md": "none",
    "--shadow-lg": "0 12px 40px rgba(0,0,0,0.3)",
    "--shadow-dropdown": "0 16px 48px rgba(0,0,0,0.5)",
    "--blur-surface": "blur(20px)",
    "--blur-topbar": "blur(30px)",

    "--badge-bg": "rgba(244,114,182,0.15)",
    "--badge-text": "#F472B6",
    "--badge-border": "rgba(244,114,182,0.2)",
    "--badge-dot": "#F472B6",

    "--status-draft-bg": "rgba(148,163,184,0.12)",
    "--status-draft-text": "#94A3B8",
    "--status-draft-border": "rgba(148,163,184,0.2)",
    "--status-intake-bg": "rgba(96,165,250,0.12)",
    "--status-intake-text": "#60A5FA",
    "--status-intake-border": "rgba(96,165,250,0.2)",
    "--status-needsinfo-bg": "rgba(251,191,36,0.12)",
    "--status-needsinfo-text": "#FBBF24",
    "--status-needsinfo-border": "rgba(251,191,36,0.2)",
    "--status-reviewed-bg": "rgba(52,211,153,0.12)",
    "--status-reviewed-text": "#34D399",
    "--status-reviewed-border": "rgba(52,211,153,0.2)",
    "--status-approved-bg": "rgba(16,185,129,0.12)",
    "--status-approved-text": "#10B981",
    "--status-approved-border": "rgba(16,185,129,0.2)",
    "--status-creativeready-bg": "rgba(167,139,250,0.12)",
    "--status-creativeready-text": "#A78BFA",
    "--status-creativeready-border": "rgba(167,139,250,0.2)",
    "--status-inproduction-bg": "rgba(244,114,182,0.12)",
    "--status-inproduction-text": "#F472B6",
    "--status-inproduction-border": "rgba(244,114,182,0.2)",
    "--status-scheduled-bg": "rgba(129,140,248,0.12)",
    "--status-scheduled-text": "#818CF8",
    "--status-scheduled-border": "rgba(129,140,248,0.2)",
    "--status-complete-bg": "rgba(148,163,184,0.08)",
    "--status-complete-text": "#64748B",
    "--status-complete-border": "rgba(148,163,184,0.15)",

    "--type-campaign": "#60A5FA",
    "--type-series": "#A78BFA",
    "--type-event": "#F472B6",
  },
};

// ─── Theme Context ───
const ThemeContext = createContext({ mode: "dark", resolved: "dark", setMode: () => {} });

function ThemeProvider({ children }) {
  const [mode, setMode] = useState(() => {
    try { return window.localStorage?.getItem?.("beacon-theme") || "system"; } catch { return "system"; }
  });
  const [systemPref, setSystemPref] = useState(() =>
    window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light"
  );

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e) => setSystemPref(e.matches ? "dark" : "light");
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    try { window.localStorage?.setItem?.("beacon-theme", mode); } catch {}
  }, [mode]);

  const resolved = mode === "system" ? systemPref : mode;
  const themeVars = themes[resolved];

  useEffect(() => {
    const root = document.documentElement;
    Object.entries(themeVars).forEach(([key, value]) => root.style.setProperty(key, value));
    root.setAttribute("data-theme", resolved);
  }, [themeVars, resolved]);

  return (
    <ThemeContext.Provider value={{ mode, resolved, setMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

function useTheme() { return useContext(ThemeContext); }

// ─── Icons ───
const icons = {
  timeline: (<svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="14" height="13" rx="2" /><path d="M3 8h14" /><path d="M7 4V2" /><path d="M13 4V2" /></svg>),
  inbox: (<svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 10l2.5-6h9L17 10" /><path d="M3 10v5a2 2 0 002 2h10a2 2 0 002-2v-5" /><path d="M3 10h4l1.5 2h3l1.5-2h4" /></svg>),
  initiatives: (<svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="14" height="14" rx="2" /><path d="M7 7h6" /><path d="M7 10h4" /><path d="M7 13h5" /></svg>),
  library: (<svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h3v12H4z" /><path d="M9 4h3v12H9z" /><path d="M14.5 4l2.5 12h-3L11.5 4z" /></svg>),
  community: (<svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="7" cy="7" r="3" /><circle cx="13" cy="7" r="3" /><path d="M2 16c0-2.5 2-4.5 5-4.5s5 2 5 4.5" /><path d="M12 11.5c3 0 5 2 5 4.5" /></svg>),
  mentorship: (<svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="10" cy="6" r="3" /><path d="M4 17c0-3 2.5-5.5 6-5.5s6 2.5 6 5.5" /><path d="M14 3l2 2-2 2" /></svg>),
  integrations: (<svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="6" height="6" rx="1" /><rect x="12" y="2" width="6" height="6" rx="1" /><rect x="2" y="12" width="6" height="6" rx="1" /><rect x="12" y="12" width="6" height="6" rx="1" /><path d="M8 5h4" /><path d="M5 8v4" /><path d="M15 8v4" /><path d="M8 15h4" /></svg>),
  admin: (<svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="10" cy="10" r="2.5" /><path d="M10 2v2.5M10 15.5V18M18 10h-2.5M4.5 10H2M15.66 4.34l-1.77 1.77M6.11 13.89l-1.77 1.77M15.66 15.66l-1.77-1.77M6.11 6.11L4.34 4.34" /></svg>),
  search: (<svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="7" cy="7" r="4.5" /><path d="M10.5 10.5L14 14" /></svg>),
  bell: (<svg width="17" height="17" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M13.5 6.5a4.5 4.5 0 10-9 0c0 5-2.25 6.5-2.25 6.5h13.5s-2.25-1.5-2.25-6.5" /><path d="M7.5 15a1.5 1.5 0 003 0" /></svg>),
  plus: (<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M8 3v10M3 8h10" /></svg>),
  chevronDown: (<svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3.5 5.5l3.5 3 3.5-3" /></svg>),
  collapse: (<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10 3l-5 5 5 5" /></svg>),
  expand: (<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 3l5 5-5 5" /></svg>),
  sun: (<svg width="15" height="15" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="10" cy="10" r="3.5" /><path d="M10 2v2M10 16v2M2 10h2M16 10h2M4.93 4.93l1.41 1.41M13.66 13.66l1.41 1.41M4.93 15.07l1.41-1.41M13.66 6.34l1.41-1.41" /></svg>),
  moon: (<svg width="15" height="15" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.003 8.003 0 1010.586 10.586z" /></svg>),
  monitor: (<svg width="15" height="15" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="16" height="11" rx="2" /><path d="M7 17h6M10 14v3" /></svg>),
};

// ─── Beacon Logo ───
function BeaconLogo({ size = 26 }) {
  const { resolved } = useTheme();
  const fill1 = resolved === "dark" ? "#FBBF24" : "#D97706";
  const fill2 = resolved === "dark" ? "#FEF3C7" : "#FFFBEB";
  const glowOpacity = resolved === "dark" ? 0.6 : 0.3;
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <defs>
        <radialGradient id="glow" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor={fill1} stopOpacity={glowOpacity} /><stop offset="100%" stopColor={fill1} stopOpacity="0" /></radialGradient>
        <linearGradient id="bGrad" x1="16" y1="4" x2="16" y2="28" gradientUnits="userSpaceOnUse"><stop stopColor="#FBBF24" /><stop offset="1" stopColor="#D97706" /></linearGradient>
      </defs>
      <circle cx="16" cy="16" r="14" fill="url(#glow)" />
      <circle cx="16" cy="16" r="5" fill="url(#bGrad)" />
      <circle cx="16" cy="16" r="2" fill={fill2} />
      <circle cx="16" cy="16" r="9" stroke={fill1} strokeWidth="0.5" opacity="0.3" />
      <circle cx="16" cy="16" r="13" stroke={fill1} strokeWidth="0.3" opacity="0.15" />
    </svg>
  );
}

// ─── Status Chip ───
const statusKeys = {
  "Draft": "draft", "Intake": "intake", "Needs Info": "needsinfo", "Reviewed": "reviewed",
  "Approved": "approved", "Creative Ready": "creativeready", "In Production": "inproduction",
  "Scheduled": "scheduled", "Complete": "complete",
};

function StatusChip({ status }) {
  const key = statusKeys[status] || "draft";
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 10px 3px 8px",
      borderRadius: 100, fontSize: "11px", fontWeight: 550, letterSpacing: "0.02em",
      background: `var(--status-${key}-bg)`, color: `var(--status-${key}-text)`,
      border: `1px solid var(--status-${key}-border)`, lineHeight: "1.4", whiteSpace: "nowrap",
      fontFamily: "var(--font-body)",
    }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: `var(--status-${key}-text)`, boxShadow: `0 0 6px var(--status-${key}-border)` }} />
      {status}
    </span>
  );
}

// ─── Demo Data ───
const demoChurches = [
  { id: 1, name: "Cornerstone Church", campuses: ["Main Campus", "West Campus"] },
  { id: 2, name: "Harbor Community", campuses: ["Downtown", "Eastside", "Online"] },
];
const demoInitiatives = [
  { id: 1, title: "Easter Campaign 2026", ministry: "Communications", status: "In Production", dates: "Mar 15 – Apr 5", type: "campaign", tokens: 45 },
  { id: 2, title: "Youth Summer Series", ministry: "Youth", status: "Creative Ready", dates: "May 1 – Aug 15", type: "series", tokens: 32 },
  { id: 3, title: "Volunteer Appreciation Week", ministry: "Operations", status: "Approved", dates: "Apr 20 – Apr 26", type: "event", tokens: 18 },
  { id: 4, title: "Women's Conference Promo", ministry: "Women's Ministry", status: "Needs Info", dates: "Jun 5 – Jun 7", type: "event", tokens: 28 },
  { id: 5, title: "Fall Sermon Series — Rooted", ministry: "Pastoral", status: "Draft", dates: "Sep 7 – Oct 26", type: "series", tokens: 40 },
  { id: 6, title: "Back to School Drive", ministry: "Outreach", status: "Intake", dates: "Aug 1 – Aug 10", type: "campaign", tokens: 22 },
  { id: 7, title: "Small Groups Launch", ministry: "Discipleship", status: "Reviewed", dates: "Jan 12 – Feb 2", type: "campaign", tokens: 35 },
  { id: 8, title: "Christmas Eve Services", ministry: "Communications", status: "Scheduled", dates: "Dec 20 – Dec 24", type: "event", tokens: 50 },
  { id: 9, title: "Men's Breakfast Series", ministry: "Men's Ministry", status: "Complete", dates: "Jan 5 – Mar 30", type: "series", tokens: 15 },
  { id: 10, title: "Missions Month", ministry: "Missions", status: "Needs Info", dates: "Jul 1 – Jul 31", type: "campaign", tokens: 30 },
];
const demoNotifications = [
  { id: 1, text: "Women's Conference Promo needs additional info", time: "2m ago", unread: true },
  { id: 2, text: "Easter Campaign approved by Pastor Williams", time: "1h ago", unread: true },
  { id: 3, text: "New comment on Youth Summer Series", time: "3h ago", unread: false },
];
const commandPaletteItems = [
  { label: "Create New Initiative", section: "Actions", page: "create" },
  { label: "Go to Timeline", section: "Navigation", page: "timeline" },
  { label: "Go to Inbox", section: "Navigation", page: "inbox" },
  { label: "Go to Initiatives", section: "Navigation", page: "initiatives" },
  { label: "Go to Library", section: "Navigation", page: "library" },
  { label: "Go to Community", section: "Navigation", page: "community" },
  { label: "Go to Mentorship", section: "Navigation", page: "mentorship" },
  { label: "Go to Integrations", section: "Navigation", page: "integrations" },
  { label: "Go to Admin", section: "Navigation", page: "admin" },
  { label: "Easter Campaign 2026", section: "Initiatives", page: "initiative-detail" },
  { label: "Youth Summer Series", section: "Initiatives", page: "initiative-detail" },
];

// ─── Glass Panel ───
function GlassPanel({ children, style = {}, hover = false, onClick, glow = false }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div onClick={onClick} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered && hover ? "var(--bg-surface-hover)" : "var(--bg-surface)",
        backdropFilter: "var(--blur-surface)", borderRadius: 14,
        border: `1px solid ${hovered && hover ? "var(--border-hover)" : "var(--border)"}`,
        transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
        cursor: onClick ? "pointer" : "default",
        boxShadow: glow && hovered ? "var(--accent-glow)" : "var(--shadow-sm)",
        ...style,
      }}
    >{children}</div>
  );
}

// ─── Theme Toggle ───
function ThemeToggle() {
  const { mode, setMode } = useTheme();
  const options = [
    { id: "light", icon: icons.sun, label: "Light" },
    { id: "dark", icon: icons.moon, label: "Dark" },
    { id: "system", icon: icons.monitor, label: "System" },
  ];
  return (
    <div style={{ display: "flex", gap: 1, background: "rgba(255,255,255,0.04)", borderRadius: 8, padding: 2, border: "1px solid var(--border-sidebar)" }}>
      {options.map((o) => (
        <button key={o.id} onClick={() => setMode(o.id)} title={o.label}
          style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            width: 28, height: 26, borderRadius: 6, border: "none", cursor: "pointer",
            background: mode === o.id ? "rgba(251,191,36,0.12)" : "transparent",
            color: mode === o.id ? "#FBBF24" : "rgba(148,163,184,0.4)",
            transition: "all 0.15s",
          }}
        >{o.icon}</button>
      ))}
    </div>
  );
}

// ─── Sidebar ───
function Sidebar({ activePage, onNavigate, collapsed, onToggle }) {
  const navItems = [
    { id: "timeline", label: "Timeline", icon: icons.timeline },
    { id: "inbox", label: "Inbox", icon: icons.inbox, badge: 3 },
    { id: "initiatives", label: "Initiatives", icon: icons.initiatives },
    { id: "library", label: "Library", icon: icons.library },
    { id: "community", label: "Community", icon: icons.community },
    { id: "mentorship", label: "Mentorship", icon: icons.mentorship },
  ];
  const bottomItems = [
    { id: "integrations", label: "Integrations", icon: icons.integrations },
    { id: "admin", label: "Admin", icon: icons.admin },
  ];
  const w = collapsed ? 60 : 220;

  const NavBtn = ({ item }) => {
    const isActive = activePage === item.id;
    const [h, setH] = useState(false);
    return (
      <button onClick={() => onNavigate(item.id)} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
        style={{
          display: "flex", alignItems: "center", gap: 11, padding: collapsed ? "9px 0" : "9px 12px",
          borderRadius: 10, border: "none", cursor: "pointer", width: "100%",
          justifyContent: collapsed ? "center" : "flex-start",
          background: isActive ? "var(--accent-bg-strong)" : h ? "rgba(255,255,255,0.04)" : "transparent",
          color: isActive ? "var(--accent)" : h ? "var(--text-sidebar)" : "var(--text-sidebar-muted)",
          transition: "all 0.15s ease", fontSize: "13px", fontWeight: isActive ? 550 : 450,
          fontFamily: "var(--font-body)", position: "relative", letterSpacing: "0.01em",
        }}
      >
        {isActive && <span style={{ position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)", width: 2, height: 16, borderRadius: 2, background: "var(--accent)", boxShadow: "var(--accent-glow)" }} />}
        <span style={{ flexShrink: 0, display: "flex", opacity: isActive ? 1 : 0.7 }}>{item.icon}</span>
        {!collapsed && <span>{item.label}</span>}
        {item.badge && !collapsed && (
          <span style={{ marginLeft: "auto", background: "var(--badge-bg)", color: "var(--badge-text)", fontSize: "10px", fontWeight: 600, padding: "1px 7px", borderRadius: 100, minWidth: 18, textAlign: "center", border: `1px solid var(--badge-border)` }}>{item.badge}</span>
        )}
        {item.badge && collapsed && (
          <span style={{ position: "absolute", top: 6, right: 10, width: 6, height: 6, borderRadius: "50%", background: "var(--badge-dot)", boxShadow: `0 0 6px var(--badge-border)` }} />
        )}
      </button>
    );
  };

  return (
    <div style={{ width: w, minWidth: w, height: "100vh", background: "var(--bg-sidebar)", backdropFilter: "blur(40px)", display: "flex", flexDirection: "column", transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)", borderRight: "1px solid var(--border-sidebar)", zIndex: 20 }}>
      <div style={{ padding: collapsed ? "20px 0" : "20px 18px", display: "flex", alignItems: "center", gap: 10, justifyContent: collapsed ? "center" : "flex-start", borderBottom: "1px solid var(--border-sidebar)", minHeight: 66 }}>
        <BeaconLogo size={collapsed ? 24 : 26} />
        {!collapsed && <span style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-sidebar)", letterSpacing: "-0.03em", fontFamily: "var(--font-display)" }}>beacon</span>}
      </div>
      <nav style={{ flex: 1, padding: "10px 6px", display: "flex", flexDirection: "column", gap: 1 }}>
        {navItems.map((item) => <NavBtn key={item.id} item={item} />)}
        <div style={{ flex: 1 }} />
        <div style={{ borderTop: "1px solid var(--border-sidebar)", paddingTop: 8, marginTop: 8, display: "flex", flexDirection: "column", gap: 1 }}>
          {bottomItems.map((item) => <NavBtn key={item.id} item={item} />)}
        </div>
      </nav>
      {/* Theme Toggle + Collapse */}
      <div style={{ padding: collapsed ? "10px 6px" : "10px 12px", borderTop: "1px solid var(--border-sidebar)", display: "flex", alignItems: "center", justifyContent: collapsed ? "center" : "space-between", gap: 6 }}>
        {!collapsed && <ThemeToggle />}
        <button onClick={onToggle} style={{ padding: "6px", border: "none", background: "transparent", color: "var(--text-sidebar-dim)", cursor: "pointer", display: "flex", borderRadius: 6, transition: "color 0.15s" }}
          onMouseEnter={(e) => e.currentTarget.style.color = "var(--text-sidebar-muted)"}
          onMouseLeave={(e) => e.currentTarget.style.color = "var(--text-sidebar-dim)"}
        >{collapsed ? icons.expand : icons.collapse}</button>
      </div>
    </div>
  );
}

// ─── Top Bar ───
function TopBar({ church, onChurchChange, onSearch, onCreateInitiative, notificationCount }) {
  const [showChurchMenu, setShowChurchMenu] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);

  return (
    <div style={{ height: 60, minHeight: 60, background: "var(--bg-topbar)", backdropFilter: "var(--blur-topbar)", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", padding: "0 24px", gap: 14, zIndex: 15 }}>
      {/* Church Switcher */}
      <div style={{ position: "relative" }}>
        <button onClick={() => setShowChurchMenu(!showChurchMenu)} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 12px", borderRadius: 9, border: "1px solid var(--border)", background: "var(--bg-surface)", cursor: "pointer", fontSize: "13px", fontWeight: 500, color: "var(--text-primary)", fontFamily: "var(--font-body)", transition: "all 0.15s" }}>
          <span style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--accent)", boxShadow: "var(--accent-glow)" }} />
          {church.name}
          {icons.chevronDown}
        </button>
        {showChurchMenu && (
          <div style={{ position: "absolute", top: "calc(100% + 6px)", left: 0, background: "var(--bg-elevated)", backdropFilter: "var(--blur-topbar)", borderRadius: 12, border: "1px solid var(--border)", boxShadow: "var(--shadow-dropdown)", padding: 5, minWidth: 220, zIndex: 100 }}>
            {demoChurches.map((c) => (
              <button key={c.id} onClick={() => { onChurchChange(c); setShowChurchMenu(false); }}
                style={{ display: "block", width: "100%", padding: "9px 12px", borderRadius: 8, border: "none", background: c.id === church.id ? "var(--accent-bg)" : "transparent", color: "var(--text-primary)", cursor: "pointer", textAlign: "left", fontSize: "12.5px", fontWeight: c.id === church.id ? 550 : 400, fontFamily: "var(--font-body)" }}>
                {c.name}
                <span style={{ display: "block", fontSize: "10.5px", color: "var(--text-muted)", marginTop: 2 }}>{c.campuses.length} campus{c.campuses.length > 1 ? "es" : ""}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Search */}
      <button onClick={onSearch} style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 14px", borderRadius: 9, border: "1px solid var(--border)", background: "var(--bg-input)", cursor: "pointer", flex: "0 1 340px", color: "var(--text-muted)", fontSize: "12.5px", fontFamily: "var(--font-body)", transition: "all 0.15s" }}>
        {icons.search}
        <span>Search initiatives, assets...</span>
        <span style={{ marginLeft: "auto", fontSize: "10px", fontWeight: 500, padding: "2px 6px", borderRadius: 5, border: "1px solid var(--border)", color: "var(--text-muted)", background: "var(--bg-surface)", fontFamily: "var(--font-mono)" }}>⌘K</span>
      </button>

      <div style={{ flex: 1 }} />

      {/* Create */}
      <button onClick={onCreateInitiative} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 9, border: "none", background: "var(--accent-gradient)", color: "var(--accent-on)", cursor: "pointer", fontSize: "12.5px", fontWeight: 600, fontFamily: "var(--font-body)", transition: "all 0.2s", boxShadow: "var(--accent-glow)", letterSpacing: "0.01em" }}>
        {icons.plus} Create Initiative
      </button>

      {/* Notifications */}
      <div style={{ position: "relative" }}>
        <button onClick={() => setShowNotifs(!showNotifs)} style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 36, height: 36, borderRadius: 9, border: "1px solid var(--border)", background: "var(--bg-surface)", cursor: "pointer", color: "var(--text-muted)", position: "relative", transition: "all 0.15s" }}>
          {icons.bell}
          {notificationCount > 0 && (
            <span style={{ position: "absolute", top: -3, right: -3, width: 15, height: 15, borderRadius: "50%", background: "var(--badge-dot)", color: "#fff", fontSize: "9px", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid var(--bg-base)", boxShadow: `0 0 8px var(--badge-border)` }}>{notificationCount}</span>
          )}
        </button>
        {showNotifs && (
          <div style={{ position: "absolute", top: "calc(100% + 8px)", right: 0, background: "var(--bg-elevated)", backdropFilter: "var(--blur-topbar)", borderRadius: 14, border: "1px solid var(--border)", boxShadow: "var(--shadow-dropdown)", padding: 6, width: 330, zIndex: 100 }}>
            <div style={{ padding: "8px 10px 10px", fontSize: "12px", fontWeight: 600, color: "var(--text-primary)", letterSpacing: "0.02em" }}>Notifications</div>
            {demoNotifications.map((n) => (
              <div key={n.id} style={{ padding: "9px 10px", borderRadius: 9, cursor: "pointer", display: "flex", gap: 9, alignItems: "flex-start", background: n.unread ? "var(--bg-surface)" : "transparent" }}>
                {n.unread && <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--status-intake-text)", boxShadow: `0 0 6px var(--status-intake-border)`, flexShrink: 0, marginTop: 5 }} />}
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "12px", color: "var(--text-secondary)", lineHeight: 1.4 }}>{n.text}</div>
                  <div style={{ fontSize: "10.5px", color: "var(--text-muted)", marginTop: 3 }}>{n.time}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Profile */}
      <div style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--accent-gradient)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent-on)", fontSize: "11px", fontWeight: 700, cursor: "pointer", fontFamily: "var(--font-body)", boxShadow: "var(--accent-glow)" }}>RC</div>
    </div>
  );
}

// ─── Command Palette ───
function CommandPalette({ isOpen, onClose, onSelect }) {
  const [query, setQuery] = useState("");
  const [si, setSi] = useState(0);
  const inputRef = useRef(null);
  const filtered = commandPaletteItems.filter((i) => i.label.toLowerCase().includes(query.toLowerCase()));
  const sections = filtered.reduce((a, i) => { if (!a[i.section]) a[i.section] = []; a[i.section].push(i); return a; }, {});

  useEffect(() => { if (isOpen && inputRef.current) { inputRef.current.focus(); setQuery(""); setSi(0); } }, [isOpen]);
  const onKey = useCallback((e) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setSi((i) => Math.min(i + 1, filtered.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setSi((i) => Math.max(i - 1, 0)); }
    else if (e.key === "Enter" && filtered[si]) { onSelect(filtered[si]); }
    else if (e.key === "Escape") { onClose(); }
  }, [filtered, si, onSelect, onClose]);

  if (!isOpen) return null;
  return (
    <div style={{ position: "fixed", inset: 0, background: "var(--bg-overlay)", backdropFilter: "blur(8px)", display: "flex", alignItems: "flex-start", justifyContent: "center", paddingTop: "18vh", zIndex: 1000 }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: "var(--bg-elevated)", backdropFilter: "blur(40px)", borderRadius: 16, border: "1px solid var(--border)", boxShadow: "var(--shadow-dropdown)", width: "100%", maxWidth: 500, overflow: "hidden" }}>
        <div style={{ padding: "14px 18px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ color: "var(--text-muted)" }}>{icons.search}</span>
          <input ref={inputRef} type="text" value={query} onChange={(e) => { setQuery(e.target.value); setSi(0); }} onKeyDown={onKey} placeholder="Search commands, initiatives..." style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontSize: "14px", color: "var(--text-primary)", fontFamily: "var(--font-body)" }} />
          <span style={{ fontSize: "10px", padding: "2px 7px", borderRadius: 5, border: "1px solid var(--border)", color: "var(--text-muted)", fontWeight: 500, fontFamily: "var(--font-mono)" }}>esc</span>
        </div>
        <div style={{ maxHeight: 340, overflowY: "auto", padding: "6px" }}>
          {Object.entries(sections).length === 0 && <div style={{ padding: "24px 14px", textAlign: "center", color: "var(--text-muted)", fontSize: "12.5px" }}>No results found</div>}
          {Object.entries(sections).map(([s, items]) => (
            <div key={s}>
              <div style={{ padding: "8px 10px 4px", fontSize: "10px", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>{s}</div>
              {items.map((item) => {
                const gi = filtered.indexOf(item);
                return (<button key={item.label} onClick={() => onSelect(item)} style={{ display: "block", width: "100%", padding: "9px 10px", borderRadius: 8, border: "none", background: gi === si ? "var(--accent-bg)" : "transparent", color: gi === si ? "var(--accent-text)" : "var(--text-secondary)", cursor: "pointer", textAlign: "left", fontSize: "13px", fontFamily: "var(--font-body)", fontWeight: 450 }}>{item.label}</button>);
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Pages ───
function TimelinePage() {
  const [range, setRange] = useState(90);
  const [filter, setFilter] = useState("all");
  const filters = ["all", "campaign", "series", "event"];
  const items = demoInitiatives.filter((i) => filter === "all" || i.type === filter);

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: "21px", fontWeight: 700, color: "var(--text-primary)", margin: 0, fontFamily: "var(--font-display)", letterSpacing: "-0.03em" }}>Timeline</h1>
          <p style={{ fontSize: "13px", color: "var(--text-tertiary)", marginTop: 4, margin: 0 }}>What's coming across your church</p>
        </div>
        <div style={{ display: "flex", gap: 2, background: "var(--bg-inset)", borderRadius: 10, padding: 3, border: "1px solid var(--border)" }}>
          {[30, 90, 180].map((r) => (
            <button key={r} onClick={() => setRange(r)} style={{ padding: "5px 14px", borderRadius: 7, border: "none", background: range === r ? "var(--accent-bg-strong)" : "transparent", color: range === r ? "var(--accent-text)" : "var(--text-muted)", fontSize: "12px", fontWeight: 550, cursor: "pointer", fontFamily: "var(--font-body)", transition: "all 0.15s" }}>{r}d</button>
          ))}
        </div>
      </div>
      <div style={{ display: "flex", gap: 6, marginBottom: 22 }}>
        {filters.map((f) => (
          <button key={f} onClick={() => setFilter(f)} style={{ padding: "5px 14px", borderRadius: 100, border: `1px solid ${filter === f ? "var(--border-accent)" : "var(--border)"}`, background: filter === f ? "var(--accent-bg)" : "transparent", color: filter === f ? "var(--accent-text)" : "var(--text-muted)", fontSize: "11.5px", fontWeight: 520, cursor: "pointer", textTransform: "capitalize", fontFamily: "var(--font-body)", transition: "all 0.15s" }}>
            {f === "all" ? "All Types" : f}
          </button>
        ))}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {items.map((item) => (
          <GlassPanel key={item.id} hover glow style={{ padding: "16px 20px", display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 3, height: 36, borderRadius: 3, background: `var(--type-${item.type})`, flexShrink: 0, boxShadow: `0 0 8px color-mix(in srgb, var(--type-${item.type}) 30%, transparent)` }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "13.5px", fontWeight: 550, color: "var(--text-primary)", fontFamily: "var(--font-body)", letterSpacing: "-0.01em" }}>{item.title}</div>
              <div style={{ fontSize: "11.5px", color: "var(--text-tertiary)", marginTop: 3 }}>{item.ministry} · {item.dates}</div>
            </div>
            <StatusChip status={item.status} />
            <div style={{ padding: "4px 10px", borderRadius: 7, background: "var(--accent-bg)", border: "1px solid var(--accent-border)", fontSize: "11.5px", fontWeight: 550, color: "var(--accent-text)", fontFamily: "var(--font-body)" }}>{item.tokens}</div>
          </GlassPanel>
        ))}
      </div>
    </div>
  );
}

function InboxPage() {
  const [activeTab, setActiveTab] = useState("intake");
  const tabs = [{ id: "intake", label: "Intake", count: 2 }, { id: "needs-info", label: "Needs Info", count: 2 }, { id: "approvals", label: "Approvals", count: 1 }, { id: "due-soon", label: "Due Soon", count: 1 }];
  const tabF = { intake: ["Intake"], "needs-info": ["Needs Info"], approvals: ["Reviewed", "Approved"], "due-soon": ["In Production", "Creative Ready", "Scheduled"] };
  const filtered = demoInitiatives.filter((i) => tabF[activeTab]?.includes(i.status));

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: "21px", fontWeight: 700, color: "var(--text-primary)", margin: 0, fontFamily: "var(--font-display)", letterSpacing: "-0.03em" }}>Inbox</h1>
        <p style={{ fontSize: "13px", color: "var(--text-tertiary)", marginTop: 4, margin: 0 }}>Triage and align on incoming initiatives</p>
      </div>
      <div style={{ display: "flex", gap: 0, borderBottom: "1px solid var(--border)", marginBottom: 22 }}>
        {tabs.map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ padding: "9px 18px", border: "none", borderBottom: activeTab === tab.id ? "2px solid var(--accent)" : "2px solid transparent", background: "transparent", color: activeTab === tab.id ? "var(--text-primary)" : "var(--text-muted)", fontSize: "12.5px", fontWeight: activeTab === tab.id ? 600 : 450, cursor: "pointer", fontFamily: "var(--font-body)", display: "flex", gap: 6, alignItems: "center", transition: "all 0.15s" }}>
            {tab.label}
            <span style={{ fontSize: "10px", fontWeight: 600, padding: "1px 6px", borderRadius: 100, background: activeTab === tab.id ? "var(--accent-bg-strong)" : "var(--bg-inset)", color: activeTab === tab.id ? "var(--accent-text)" : "var(--text-muted)", border: `1px solid ${activeTab === tab.id ? "var(--accent-border)" : "var(--border)"}` }}>{tab.count}</span>
          </button>
        ))}
      </div>
      {filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 20px" }}>
          <div style={{ fontSize: "14px", fontWeight: 500, marginBottom: 6, color: "var(--text-tertiary)" }}>Nothing here right now</div>
          <div style={{ fontSize: "12.5px", color: "var(--text-muted)" }}>New submissions will appear in this tab</div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {filtered.map((item) => (
            <GlassPanel key={item.id} hover style={{ padding: "14px 20px", display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "13.5px", fontWeight: 550, color: "var(--text-primary)", fontFamily: "var(--font-body)" }}>{item.title}</div>
                <div style={{ fontSize: "11.5px", color: "var(--text-tertiary)", marginTop: 3 }}>{item.ministry} · {item.dates}</div>
              </div>
              <StatusChip status={item.status} />
              <div style={{ fontSize: "11.5px", color: "var(--accent-text)", fontWeight: 550 }}>{item.tokens}</div>
              <div style={{ display: "flex", gap: 5 }}>
                {["Review", "Request Info", "Approve"].map((a) => (
                  <button key={a} style={{ padding: "5px 11px", borderRadius: 7, border: a === "Approve" ? "none" : "1px solid var(--border)", background: a === "Approve" ? "var(--accent-gradient)" : "var(--bg-surface)", color: a === "Approve" ? "var(--accent-on)" : "var(--text-tertiary)", fontSize: "11px", fontWeight: a === "Approve" ? 600 : 480, cursor: "pointer", fontFamily: "var(--font-body)" }}>{a}</button>
                ))}
              </div>
            </GlassPanel>
          ))}
        </div>
      )}
    </div>
  );
}

function InitiativesPage({ onNavigate }) {
  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: "21px", fontWeight: 700, color: "var(--text-primary)", margin: 0, fontFamily: "var(--font-display)", letterSpacing: "-0.03em" }}>Initiatives</h1>
        <p style={{ fontSize: "13px", color: "var(--text-tertiary)", marginTop: 4, margin: 0 }}>All church initiatives in one place</p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))", gap: 10 }}>
        {demoInitiatives.map((item) => (
          <GlassPanel key={item.id} hover glow onClick={() => onNavigate("initiative-detail")} style={{ padding: "18px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <span style={{ fontSize: "10px", fontWeight: 600, color: `var(--type-${item.type})`, textTransform: "uppercase", letterSpacing: "0.06em" }}>{item.type}</span>
              <StatusChip status={item.status} />
            </div>
            <div style={{ fontSize: "14px", fontWeight: 580, color: "var(--text-primary)", marginBottom: 5, fontFamily: "var(--font-body)", letterSpacing: "-0.01em" }}>{item.title}</div>
            <div style={{ fontSize: "11.5px", color: "var(--text-tertiary)" }}>{item.ministry} · {item.dates}</div>
            <div style={{ marginTop: 14, paddingTop: 12, borderTop: "1px solid var(--border)", fontSize: "11.5px", color: "var(--accent-text)", fontWeight: 520, display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ width: 4, height: 4, borderRadius: "50%", background: "var(--accent)", boxShadow: "var(--accent-glow)" }} />
              {item.tokens} tokens estimated
            </div>
          </GlassPanel>
        ))}
      </div>
    </div>
  );
}

function InitiativeDetailPage() {
  const i = demoInitiatives[0];
  const sectionLabel = { fontSize: "10.5px", fontWeight: 600, color: "var(--accent-text)", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 12px" };
  return (
    <div>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 30 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
            <h1 style={{ fontSize: "21px", fontWeight: 700, color: "var(--text-primary)", margin: 0, fontFamily: "var(--font-display)", letterSpacing: "-0.03em" }}>{i.title}</h1>
            <StatusChip status={i.status} />
          </div>
          <p style={{ fontSize: "13px", color: "var(--text-tertiary)", margin: 0 }}>{i.ministry} · {i.dates} · {i.tokens} tokens</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button style={{ padding: "7px 16px", borderRadius: 9, border: "1px solid var(--border)", background: "var(--bg-surface)", color: "var(--text-tertiary)", fontSize: "12.5px", fontWeight: 500, cursor: "pointer", fontFamily: "var(--font-body)" }}>Edit</button>
          <button style={{ padding: "7px 16px", borderRadius: 9, border: "none", background: "var(--accent-gradient)", color: "var(--accent-on)", fontSize: "12.5px", fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-body)", boxShadow: "var(--accent-glow)" }}>Approve</button>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 16 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <GlassPanel style={{ padding: "20px" }}>
            <h3 style={sectionLabel}>Beacon Brief</h3>
            <p style={{ fontSize: "13.5px", color: "var(--text-secondary)", lineHeight: 1.7, margin: 0 }}>A church-wide campaign to build excitement for Easter services, targeting both regular attenders and community guests. The initiative spans three weeks of coordinated promotion across social media, print, and in-service announcements, with the goal of increasing Easter attendance by 20% over last year.</p>
          </GlassPanel>
          <GlassPanel style={{ padding: "20px" }}>
            <h3 style={sectionLabel}>Missing Information</h3>
            {["Service times confirmed", "Guest speaker headshot", "Childcare details for landing page"].map((item, idx) => (
              <label key={idx} style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 0", cursor: "pointer", fontSize: "13px", color: "var(--text-secondary)" }}>
                <input type="checkbox" style={{ accentColor: "var(--accent)", width: 15, height: 15 }} />{item}
              </label>
            ))}
          </GlassPanel>
          <GlassPanel style={{ padding: "20px" }}>
            <h3 style={sectionLabel}>Recommended Strategy</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
              {[{ tier: "Light", tokens: 20, ch: ["Social Media", "Bulletin"] }, { tier: "Standard", tokens: 35, ch: ["Social", "Bulletin", "Email", "Lobby Display"] }, { tier: "Full", tokens: 50, ch: ["Social", "Bulletin", "Email", "Lobby", "Video", "Direct Mail"] }].map((t) => (
                <div key={t.tier} style={{ padding: "14px", borderRadius: 12, border: t.tier === "Standard" ? "1px solid var(--border-accent)" : "1px solid var(--border)", background: t.tier === "Standard" ? "var(--accent-bg)" : "var(--bg-inset)", boxShadow: t.tier === "Standard" ? "var(--accent-glow)" : "none" }}>
                  <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)", marginBottom: 4 }}>{t.tier}</div>
                  <div style={{ fontSize: "22px", fontWeight: 700, color: "var(--accent-text)", marginBottom: 10, fontFamily: "var(--font-display)" }}>{t.tokens} <span style={{ fontSize: "11px", fontWeight: 400, color: "var(--text-muted)" }}>tokens</span></div>
                  {t.ch.map((c) => <div key={c} style={{ fontSize: "11.5px", color: "var(--text-muted)", padding: "2.5px 0" }}>· {c}</div>)}
                </div>
              ))}
            </div>
          </GlassPanel>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <GlassPanel style={{ padding: "20px" }}>
            <h3 style={sectionLabel}>Activity</h3>
            {[{ a: "Status changed to In Production", b: "Sarah M.", t: "2h ago" }, { a: "Approved by Pastor Williams", b: "Pastor W.", t: "1 day ago" }, { a: "Brief generated", b: "Beacon AI", t: "3 days ago" }, { a: "Initiative created", b: "Ryan C.", t: "5 days ago" }].map((x, idx) => (
              <div key={idx} style={{ padding: "7px 0", borderBottom: idx < 3 ? "1px solid var(--border)" : "none" }}>
                <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{x.a}</div>
                <div style={{ fontSize: "10.5px", color: "var(--text-muted)", marginTop: 2 }}>{x.b} · {x.t}</div>
              </div>
            ))}
          </GlassPanel>
          <GlassPanel style={{ padding: "20px" }}>
            <h3 style={sectionLabel}>Notes</h3>
            <div style={{ padding: "10px 12px", borderRadius: 10, background: "var(--bg-inset)", border: "1px solid var(--border)", marginBottom: 10 }}>
              <div style={{ fontSize: "11.5px", fontWeight: 550, color: "var(--text-primary)" }}>Sarah M.</div>
              <div style={{ fontSize: "12px", color: "var(--text-tertiary)", marginTop: 4, lineHeight: 1.5 }}>Let's coordinate the social content calendar with the youth team — they have overlapping dates.</div>
              <div style={{ fontSize: "10px", color: "var(--text-muted)", marginTop: 4 }}>Yesterday at 3:42 PM</div>
            </div>
            <textarea placeholder="Add a note..." style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid var(--border)", background: "var(--bg-input)", fontSize: "12px", fontFamily: "var(--font-body)", resize: "vertical", minHeight: 56, outline: "none", boxSizing: "border-box", color: "var(--text-primary)" }} />
          </GlassPanel>
          <GlassPanel style={{ padding: "20px" }}>
            <h3 style={sectionLabel}>Attachments</h3>
            <div style={{ padding: "22px", borderRadius: 10, border: "1.5px dashed var(--border-hover)", textAlign: "center", color: "var(--text-muted)", fontSize: "12px", cursor: "pointer" }}>Drop files here or click to upload</div>
          </GlassPanel>
        </div>
      </div>
    </div>
  );
}

function CreateInitiativePage({ onNavigate }) {
  const [step, setStep] = useState(1);
  const inp = { width: "100%", padding: "10px 14px", borderRadius: 10, border: "1px solid var(--border)", background: "var(--bg-input)", fontSize: "13.5px", fontFamily: "var(--font-body)", outline: "none", color: "var(--text-primary)", boxSizing: "border-box", colorScheme: "auto" };
  const lbl = { display: "block", fontSize: "11.5px", fontWeight: 580, color: "var(--text-tertiary)", marginBottom: 6, letterSpacing: "0.02em" };
  const pri = { padding: "9px 26px", borderRadius: 9, border: "none", background: "var(--accent-gradient)", color: "var(--accent-on)", fontSize: "13px", fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-body)", boxShadow: "var(--accent-glow)" };
  const sec = { padding: "9px 20px", borderRadius: 9, border: "1px solid var(--border)", background: "transparent", color: "var(--text-tertiary)", fontSize: "12.5px", fontWeight: 500, cursor: "pointer", fontFamily: "var(--font-body)" };

  return (
    <div style={{ maxWidth: 620, margin: "0 auto" }}>
      <div style={{ display: "flex", gap: 4, marginBottom: 40 }}>
        {[1, 2, 3, 4].map((s) => (
          <div key={s} style={{ flex: 1, height: 2, borderRadius: 2, background: s <= step ? "var(--accent-gradient)" : "var(--border)", transition: "background 0.4s ease", boxShadow: s <= step ? "var(--accent-glow)" : "none" }} />
        ))}
      </div>
      {step === 1 && (
        <div>
          <h1 style={{ fontSize: "24px", fontWeight: 700, color: "var(--text-primary)", margin: "0 0 8px", fontFamily: "var(--font-display)", letterSpacing: "-0.03em" }}>What are you trying to accomplish?</h1>
          <p style={{ fontSize: "13.5px", color: "var(--text-tertiary)", margin: "0 0 28px" }}>Start with your goal — we'll help figure out the best way to communicate it.</p>
          <textarea placeholder="e.g., We want to invite the community to our Easter services..." style={{ ...inp, minHeight: 140, lineHeight: 1.65, resize: "vertical", padding: "14px 16px" }} />
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 20 }}><button onClick={() => setStep(2)} style={pri}>Continue</button></div>
        </div>
      )}
      {step === 2 && (
        <div>
          <h1 style={{ fontSize: "24px", fontWeight: 700, color: "var(--text-primary)", margin: "0 0 8px", fontFamily: "var(--font-display)", letterSpacing: "-0.03em" }}>A few quick details</h1>
          <p style={{ fontSize: "13.5px", color: "var(--text-tertiary)", margin: "0 0 28px" }}>Help us understand scope and timing.</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            {[{ l: "Initiative Title", p: "Easter 2026 Outreach Campaign" }, { l: "Ministry", p: "Select ministry..." }, { l: "Target Audience", p: "Who is this for?" }].map((f) => (
              <div key={f.l}><label style={lbl}>{f.l}</label><input type="text" placeholder={f.p} style={inp} /></div>
            ))}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {["Start Date", "End Date"].map((l) => <div key={l}><label style={lbl}>{l}</label><input type="date" style={inp} /></div>)}
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 28 }}>
            <button onClick={() => setStep(1)} style={sec}>Back</button>
            <button onClick={() => setStep(3)} style={pri}>Generate Strategy</button>
          </div>
        </div>
      )}
      {step === 3 && (
        <div>
          <h1 style={{ fontSize: "24px", fontWeight: 700, color: "var(--text-primary)", margin: "0 0 8px", fontFamily: "var(--font-display)", letterSpacing: "-0.03em" }}>Here's what Beacon recommends</h1>
          <p style={{ fontSize: "13.5px", color: "var(--text-tertiary)", margin: "0 0 28px" }}>AI-generated strategy based on your goals and timeline.</p>
          <GlassPanel style={{ padding: "20px", marginBottom: 12 }}>
            <h3 style={{ fontSize: "10.5px", fontWeight: 600, color: "var(--accent-text)", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 10px" }}>Generated Brief</h3>
            <p style={{ fontSize: "13.5px", color: "var(--text-secondary)", lineHeight: 1.65, margin: 0 }}>A comprehensive Easter outreach campaign targeting both regular attenders and unchurched community members. Emphasis on personal invitation and removing barriers for first-time guests.</p>
          </GlassPanel>
          <div style={{ padding: "18px 20px", borderRadius: 14, marginBottom: 12, background: "var(--accent-bg)", border: "1px solid var(--accent-border)" }}>
            <h3 style={{ fontSize: "10.5px", fontWeight: 600, color: "var(--accent-text)", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 10px" }}>Still Needed</h3>
            <div style={{ fontSize: "12.5px", color: "var(--accent-text)", opacity: 0.8 }}>· Confirm service times · Guest speaker details · Childcare availability</div>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 28 }}>
            <button onClick={() => setStep(2)} style={sec}>Back</button>
            <button onClick={() => setStep(4)} style={pri}>Review & Submit</button>
          </div>
        </div>
      )}
      {step === 4 && (
        <div style={{ textAlign: "center", paddingTop: 40 }}>
          <div style={{ width: 60, height: 60, borderRadius: "50%", background: "var(--status-approved-bg)", border: "1px solid var(--status-approved-border)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", fontSize: "24px", boxShadow: "0 0 30px var(--status-approved-border)" }}>
            <span style={{ color: "var(--status-approved-text)" }}>✓</span>
          </div>
          <h1 style={{ fontSize: "24px", fontWeight: 700, color: "var(--text-primary)", margin: "0 0 8px", fontFamily: "var(--font-display)", letterSpacing: "-0.03em" }}>Initiative Submitted</h1>
          <p style={{ fontSize: "13.5px", color: "var(--text-tertiary)", margin: "0 0 28px" }}>Your initiative has been sent to the creative team's inbox for review.</p>
          <button onClick={() => onNavigate("inbox")} style={pri}>Go to Inbox</button>
        </div>
      )}
    </div>
  );
}

function PlaceholderPage({ title, description, icon }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "60vh", textAlign: "center" }}>
      <div style={{ color: "var(--text-muted)", marginBottom: 16, transform: "scale(2.5)", opacity: 0.5 }}>{icon}</div>
      <h1 style={{ fontSize: "21px", fontWeight: 700, color: "var(--text-primary)", margin: "0 0 8px", fontFamily: "var(--font-display)", letterSpacing: "-0.03em" }}>{title}</h1>
      <p style={{ fontSize: "13.5px", color: "var(--text-tertiary)", margin: "0 0 24px", maxWidth: 340 }}>{description}</p>
      <button style={{ padding: "9px 22px", borderRadius: 9, border: "none", background: "var(--accent-gradient)", color: "var(--accent-on)", fontSize: "12.5px", fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-body)", boxShadow: "var(--accent-glow)" }}>Get Started</button>
    </div>
  );
}

// ─── Main App ───
function AppInner() {
  const [activePage, setActivePage] = useState("timeline");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [cmdOpen, setCmdOpen] = useState(false);
  const [church, setChurch] = useState(demoChurches[0]);
  const { resolved } = useTheme();

  useEffect(() => {
    const h = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); setCmdOpen((o) => !o); }
      if (e.key === "Escape") setCmdOpen(false);
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  const nav = useCallback((p) => setActivePage(p), []);

  const renderPage = () => {
    switch (activePage) {
      case "timeline": return <TimelinePage />;
      case "inbox": return <InboxPage />;
      case "initiatives": return <InitiativesPage onNavigate={nav} />;
      case "initiative-detail": return <InitiativeDetailPage />;
      case "create": return <CreateInitiativePage onNavigate={nav} />;
      case "library": return <PlaceholderPage title="Resource Library" description="Browse and share creative assets across your church network." icon={icons.library} />;
      case "community": return <PlaceholderPage title="Community" description="Connect with church creatives, share case studies, and learn together." icon={icons.community} />;
      case "mentorship": return <PlaceholderPage title="Mentorship" description="Find experienced creative directors who can guide your ministry." icon={icons.mentorship} />;
      case "integrations": return <PlaceholderPage title="Integrations" description="Connect Beacon to your existing tools like ClickUp, Planning Center, and Slack." icon={icons.integrations} />;
      case "admin": return <PlaceholderPage title="Admin" description="Manage your church workspace, token allocations, and team permissions." icon={icons.admin} />;
      default: return <TimelinePage />;
    }
  };

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden", background: "var(--bg-base)", transition: "background 0.3s ease" }}>
      {/* Ambient glows */}
      <div style={{ position: "fixed", top: "-20%", left: "30%", width: 600, height: 600, borderRadius: "50%", background: `radial-gradient(circle, var(--bg-ambient-1) 0%, transparent 70%)`, pointerEvents: "none", zIndex: 0, transition: "background 0.3s" }} />
      <div style={{ position: "fixed", bottom: "-30%", right: "10%", width: 500, height: 500, borderRadius: "50%", background: `radial-gradient(circle, var(--bg-ambient-2) 0%, transparent 70%)`, pointerEvents: "none", zIndex: 0, transition: "background 0.3s" }} />

      <Sidebar activePage={activePage} onNavigate={nav} collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", position: "relative", zIndex: 1 }}>
        <TopBar church={church} onChurchChange={setChurch} onSearch={() => setCmdOpen(true)} onCreateInitiative={() => nav("create")} notificationCount={2} />
        <main style={{ flex: 1, overflow: "auto", padding: "28px 32px" }}>{renderPage()}</main>
      </div>
      <CommandPalette isOpen={cmdOpen} onClose={() => setCmdOpen(false)} onSelect={(i) => { nav(i.page); setCmdOpen(false); }} />
    </div>
  );
}

export default function BeaconApp() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');
        @import url('https://api.fontshare.com/v2/css?f[]=satoshi@400,500,600,700&display=swap');
        :root { --font-display: 'Outfit', sans-serif; --font-body: 'Satoshi', 'Outfit', sans-serif; --font-mono: 'SF Mono', 'Fira Code', monospace; }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: var(--font-body); -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }
        @keyframes fadeSlideIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: var(--border-hover); border-radius: 3px; }
        input::placeholder, textarea::placeholder { color: var(--text-muted); }
        ::selection { background: var(--accent-bg-strong); color: var(--text-primary); }
      `}</style>
      <ThemeProvider>
        <AppInner />
      </ThemeProvider>
    </>
  );
}
