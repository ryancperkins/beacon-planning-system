const statusKeys: Record<string, string> = {
  "Draft": "draft",
  "Intake": "intake",
  "Needs Info": "needsinfo",
  "Reviewed": "reviewed",
  "Approved": "approved",
  "Creative Ready": "creativeready",
  "In Production": "inproduction",
  "Scheduled": "scheduled",
  "Complete": "complete",
};

export function StatusChip({ status }: { status: string }) {
  const key = statusKeys[status] || "draft";
  return (
    <span
      className="font-body"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        padding: "3px 10px 3px 8px",
        borderRadius: 100,
        fontSize: "11px",
        fontWeight: 550,
        letterSpacing: "0.02em",
        background: `var(--status-${key}-bg)`,
        color: `var(--status-${key}-text)`,
        border: `1px solid var(--status-${key}-border)`,
        lineHeight: "1.4",
        whiteSpace: "nowrap",
      }}
    >
      <span
        style={{
          width: 5,
          height: 5,
          borderRadius: "50%",
          background: `var(--status-${key}-text)`,
          boxShadow: `0 0 6px var(--status-${key}-border)`,
        }}
      />
      {status}
    </span>
  );
}
