import { useState, type ReactNode, type CSSProperties } from "react";

interface GlassPanelProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  hover?: boolean;
  glow?: boolean;
  onClick?: () => void;
}

export function GlassPanel({ children, className = "", style = {}, hover = false, glow = false, onClick }: GlassPanelProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={className}
      style={{
        background: hovered && hover ? "var(--bg-surface-hover)" : "var(--bg-surface)",
        backdropFilter: "var(--blur-surface)",
        borderRadius: 14,
        border: `1px solid ${hovered && hover ? "var(--border-hover)" : "var(--border)"}`,
        transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
        cursor: onClick ? "pointer" : "default",
        boxShadow: glow && hovered ? "var(--accent-glow)" : "var(--shadow-sm)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}
