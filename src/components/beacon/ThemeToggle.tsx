import { Sun, Moon, Monitor } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

export function ThemeToggle() {
  const { mode, setMode } = useTheme();
  const options = [
    { id: "light" as const, icon: Sun, label: "Light" },
    { id: "dark" as const, icon: Moon, label: "Dark" },
    { id: "system" as const, icon: Monitor, label: "System" },
  ];

  return (
    <div className="flex gap-px rounded-lg p-0.5" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid var(--border-sidebar)" }}>
      {options.map((o) => (
        <button
          key={o.id}
          onClick={() => setMode(o.id)}
          title={o.label}
          className="flex items-center justify-center rounded-md transition-all"
          style={{
            width: 28,
            height: 26,
            border: "none",
            cursor: "pointer",
            background: mode === o.id ? "rgba(251,191,36,0.12)" : "transparent",
            color: mode === o.id ? "#FBBF24" : "rgba(148,163,184,0.4)",
          }}
        >
          <o.icon size={15} />
        </button>
      ))}
    </div>
  );
}
