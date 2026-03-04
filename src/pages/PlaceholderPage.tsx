import type { LucideIcon } from "lucide-react";

interface Props {
  title: string;
  description: string;
  Icon: LucideIcon;
}

export default function PlaceholderPage({ title, description, Icon }: Props) {
  return (
    <div className="flex flex-col items-center justify-center text-center" style={{ height: "60vh" }}>
      <div className="mb-4" style={{ color: "var(--text-muted)", opacity: 0.5, transform: "scale(2.5)" }}>
        <Icon size={18} />
      </div>
      <h1 className="font-display mb-2" style={{ fontSize: 21, fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.03em" }}>
        {title}
      </h1>
      <p className="font-body mb-6 max-w-xs" style={{ fontSize: 13.5, color: "var(--text-tertiary)" }}>
        {description}
      </p>
      <button
        className="font-body accent-gradient accent-glow"
        style={{
          padding: "9px 22px", borderRadius: 9, border: "none",
          color: "var(--accent-on)", fontSize: 12.5, fontWeight: 600, cursor: "pointer",
        }}
      >
        Get Started
      </button>
    </div>
  );
}
