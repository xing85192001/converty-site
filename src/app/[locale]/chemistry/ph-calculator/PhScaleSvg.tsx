/**
 * pH Scale SVG Visualization
 * Shows a color gradient from pH 0-14 with indicator
 */

interface PhScaleSvgProps {
  ph: number;
}

export function PhScaleSvg({ ph }: PhScaleSvgProps) {
  // Clamp pH between 0 and 14
  const clampedPh = Math.max(0, Math.min(14, ph));

  // Calculate position (0-100%)
  const position = (clampedPh / 14) * 100;

  // Define color stops for the gradient
  const gradientStops = [
    { offset: "0%", color: "#dc2626" }, // pH 0-1: Strong red
    { offset: "14.3%", color: "#ea580c" }, // pH 2: Red-orange
    { offset: "28.6%", color: "#f97316" }, // pH 4: Orange
    { offset: "42.9%", color: "#fb923c" }, // pH 6: Light orange
    { offset: "50%", color: "#84cc16" }, // pH 7: Green (neutral)
    { offset: "57.1%", color: "#3b82f6" }, // pH 8: Light blue
    { offset: "71.4%", color: "#2563eb" }, // pH 10: Blue
    { offset: "85.7%", color: "#7c3aed" }, // pH 12: Purple
    { offset: "100%", color: "#8b5cf6" }, // pH 14: Violet
  ];

  return (
    <svg
      width="100%"
      height="120"
      viewBox="0 0 400 120"
      className="rounded-lg"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Define gradient */}
      <defs>
        <linearGradient id="phGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          {gradientStops.map((stop) => (
            <stop key={stop.offset} offset={stop.offset} stopColor={stop.color} />
          ))}
        </linearGradient>
      </defs>

      {/* Scale background */}
      <rect x="30" y="40" width="340" height="30" fill="url(#phGradient)" rx="4" />

      {/* pH markers */}
      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14].map((value) => {
        const x = 30 + (value / 14) * 340;
        return (
          <g key={value}>
            <line
              x1={x}
              y1="70"
              x2={x}
              y2={value % 2 === 0 ? "80" : "75"}
              stroke="currentColor"
              strokeWidth="1"
              opacity="0.5"
            />
            {value % 2 === 0 && (
              <text
                x={x}
                y="95"
                textAnchor="middle"
                fill="currentColor"
                fontSize="12"
                opacity="0.7"
              >
                {value}
              </text>
            )}
          </g>
        );
      })}

      {/* Current pH indicator */}
      <g>
        {/* Indicator line */}
        <line
          x1={30 + (position / 100) * 340}
          y1="20"
          x2={30 + (position / 100) * 340}
          y2="70"
          stroke="currentColor"
          strokeWidth="2"
        />

        {/* Indicator triangle */}
        <polygon
          points={`${30 + (position / 100) * 340 - 6},20 ${30 + (position / 100) * 340 + 6},20 ${30 + (position / 100) * 340},10`}
          fill="currentColor"
        />

        {/* pH value */}
        <text
          x={30 + (position / 100) * 340}
          y="115"
          textAnchor="middle"
          fill="currentColor"
          fontSize="16"
          fontWeight="bold"
        >
          pH {clampedPh.toFixed(2)}
        </text>
      </g>

      {/* Labels */}
      <text x="15" y="58" textAnchor="end" fill="currentColor" fontSize="11" opacity="0.6">
        Acidic
      </text>
      <text x="385" y="58" textAnchor="start" fill="currentColor" fontSize="11" opacity="0.6">
        Basic
      </text>
    </svg>
  );
}
