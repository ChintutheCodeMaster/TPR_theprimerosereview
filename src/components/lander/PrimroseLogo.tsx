interface PrimroseLogoProps {
  className?: string;
  size?: number;
  color?: string;
  strokeWidth?: number;
}

export function PrimroseLogo({
  className = "",
  size = 28,
  color = "currentColor",
  strokeWidth = 2.8,
}: PrimroseLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Three parallel strokes forming the stylized P */}
      <path
        d="M8 26V8c0-3.3 2.7-6 6-6h4c3.3 0 6 2.7 6 6s-2.7 6-6 6h-6"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M11 26V10.5c0-2.5 2-4.5 4.5-4.5h2c2.5 0 4.5 2 4.5 4.5s-2 4.5-4.5 4.5h-4.5"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M14 26V13c0-1.7 1.3-3 3-3h.5c1.7 0 3 1.3 3 3s-1.3 3-3 3h-2"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

/* A small nav-badge variant that sits cleanly beside the wordmark */
export function PrimroseLogoBadge({
  className = "",
  size = 28,
  variant = "dark",
}: {
  className?: string;
  size?: number;
  variant?: "dark" | "light";
}) {
  const isDark = variant === "dark";
  return (
    <span
      className={`inline-flex items-center justify-center rounded-full ${className}`}
      style={{
        width: size,
        height: size,
        background: isDark ? "#f7c8e0" : "#0a0a0a",
      }}
    >
      <PrimroseLogo
        size={size * 0.55}
        color={isDark ? "#0a0a0a" : "#f7c8e0"}
        strokeWidth={3.2}
      />
    </span>
  );
}
