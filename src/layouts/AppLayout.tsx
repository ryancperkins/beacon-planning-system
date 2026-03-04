import { useState, useEffect, useCallback } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { AppSidebar } from "@/components/beacon/AppSidebar";
import { TopBar } from "@/components/beacon/TopBar";
import { CommandPalette } from "@/components/beacon/CommandPalette";
import { AmbientBackground } from "@/components/beacon/AmbientBackground";

export default function AppLayout() {
  const [cmdOpen, setCmdOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); setCmdOpen((o) => !o); }
      if (e.key === "Escape") setCmdOpen(false);
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  const onPaletteSelect = useCallback((item: { path: string }) => {
    navigate(item.path);
    setCmdOpen(false);
  }, [navigate]);

  return (
    <div className="flex h-screen overflow-hidden relative" style={{ background: "var(--bg-base)", transition: "background 0.3s ease" }}>
      <AmbientBackground />
      <AppSidebar />
      <div className="flex-1 flex flex-col overflow-hidden relative z-[1]">
        <TopBar onSearch={() => setCmdOpen(true)} />
        <main className="flex-1 overflow-auto p-4 md:p-7">
          <Outlet />
        </main>
      </div>
      <CommandPalette isOpen={cmdOpen} onClose={() => setCmdOpen(false)} onSelect={onPaletteSelect} />
    </div>
  );
}
