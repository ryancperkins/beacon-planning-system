export function AmbientBackground() {
  return (
    <>
      <div
        className="fixed pointer-events-none z-0 transition-all duration-300"
        style={{
          top: "-20%",
          left: "30%",
          width: 600,
          height: 600,
          borderRadius: "50%",
          background: "radial-gradient(circle, var(--bg-ambient-1) 0%, transparent 70%)",
        }}
      />
      <div
        className="fixed pointer-events-none z-0 transition-all duration-300"
        style={{
          bottom: "-30%",
          right: "10%",
          width: 500,
          height: 500,
          borderRadius: "50%",
          background: "radial-gradient(circle, var(--bg-ambient-2) 0%, transparent 70%)",
        }}
      />
    </>
  );
}
