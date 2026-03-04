import { useState, useEffect, useRef, useCallback } from "react";
import { Search } from "lucide-react";

interface PaletteItem {
  label: string;
  section: string;
  path: string;
}

const items: PaletteItem[] = [
  { label: "Create New Initiative", section: "Actions", path: "/create" },
  { label: "Go to Timeline", section: "Navigation", path: "/timeline" },
  { label: "Go to Inbox", section: "Navigation", path: "/inbox" },
  { label: "Go to Initiatives", section: "Navigation", path: "/initiatives" },
  { label: "Go to Library", section: "Navigation", path: "/library" },
  { label: "Go to Community", section: "Navigation", path: "/community" },
  { label: "Go to Mentorship", section: "Navigation", path: "/mentorship" },
  { label: "Go to Integrations", section: "Navigation", path: "/integrations" },
  { label: "Go to Admin", section: "Navigation", path: "/admin" },
];

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (item: PaletteItem) => void;
}

export function CommandPalette({ isOpen, onClose, onSelect }: Props) {
  const [query, setQuery] = useState("");
  const [si, setSi] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = items.filter((i) => i.label.toLowerCase().includes(query.toLowerCase()));
  const sections = filtered.reduce<Record<string, PaletteItem[]>>((a, i) => {
    if (!a[i.section]) a[i.section] = [];
    a[i.section].push(i);
    return a;
  }, {});

  useEffect(() => {
    if (isOpen) { inputRef.current?.focus(); setQuery(""); setSi(0); }
  }, [isOpen]);

  const onKey = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setSi((i) => Math.min(i + 1, filtered.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setSi((i) => Math.max(i - 1, 0)); }
    else if (e.key === "Enter" && filtered[si]) { onSelect(filtered[si]); }
    else if (e.key === "Escape") { onClose(); }
  }, [filtered, si, onSelect, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 flex items-start justify-center z-[1000]"
      style={{ background: "var(--bg-overlay)", backdropFilter: "blur(8px)", paddingTop: "18vh" }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[500px] overflow-hidden rounded-2xl"
        style={{
          background: "var(--bg-elevated)", backdropFilter: "blur(40px)",
          border: "1px solid var(--border)", boxShadow: "var(--shadow-dropdown)",
        }}
      >
        <div className="flex items-center gap-2.5 px-4 py-3.5" style={{ borderBottom: "1px solid var(--border)" }}>
          <Search size={15} style={{ color: "var(--text-muted)" }} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setSi(0); }}
            onKeyDown={onKey}
            placeholder="Search commands, initiatives..."
            className="flex-1 bg-transparent border-none outline-none font-body"
            style={{ fontSize: 14, color: "var(--text-primary)" }}
          />
          <span className="font-mono-beacon" style={{
            fontSize: 10, padding: "2px 7px", borderRadius: 5,
            border: "1px solid var(--border)", color: "var(--text-muted)", fontWeight: 500,
          }}>esc</span>
        </div>
        <div className="max-h-[340px] overflow-y-auto p-1.5">
          {Object.keys(sections).length === 0 && (
            <div className="py-6 text-center" style={{ color: "var(--text-muted)", fontSize: 12.5 }}>No results found</div>
          )}
          {Object.entries(sections).map(([s, sItems]) => (
            <div key={s}>
              <div className="px-2.5 py-2 uppercase" style={{
                fontSize: 10, fontWeight: 600, color: "var(--text-muted)", letterSpacing: "0.08em",
              }}>{s}</div>
              {sItems.map((item) => {
                const gi = filtered.indexOf(item);
                return (
                  <button
                    key={item.label}
                    onClick={() => onSelect(item)}
                    className="block w-full text-left px-2.5 py-2 rounded-lg font-body"
                    style={{
                      border: "none",
                      background: gi === si ? "var(--accent-bg)" : "transparent",
                      color: gi === si ? "var(--accent-text)" : "var(--text-secondary)",
                      cursor: "pointer", fontSize: 13, fontWeight: 450,
                    }}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
