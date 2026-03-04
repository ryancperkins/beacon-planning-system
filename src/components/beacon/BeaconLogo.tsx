import { useTheme } from "@/contexts/ThemeContext";

export function BeaconLogo({ size = 26 }: { size?: number }) {
  const { resolved } = useTheme();
  const fill1 = resolved === "dark" ? "#FBBF24" : "#D97706";
  const fill2 = resolved === "dark" ? "#FEF3C7" : "#FFFBEB";
  const glowOpacity = resolved === "dark" ? 0.6 : 0.3;

  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <defs>
        <radialGradient id="glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={fill1} stopOpacity={glowOpacity} />
          <stop offset="100%" stopColor={fill1} stopOpacity={0} />
        </radialGradient>
        <linearGradient id="bGrad" x1="16" y1="4" x2="16" y2="28" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FBBF24" />
          <stop offset="1" stopColor="#D97706" />
        </linearGradient>
      </defs>
      <circle cx="16" cy="16" r="14" fill="url(#glow)" />
      <circle cx="16" cy="16" r="5" fill="url(#bGrad)" />
      <circle cx="16" cy="16" r="2" fill={fill2} />
      <circle cx="16" cy="16" r="9" stroke={fill1} strokeWidth="0.5" opacity={0.3} />
      <circle cx="16" cy="16" r="13" stroke={fill1} strokeWidth="0.3" opacity={0.15} />
    </svg>
  );
}
