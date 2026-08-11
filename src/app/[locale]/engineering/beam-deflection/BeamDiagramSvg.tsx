import type React from "react";

interface BeamDiagramSvgProps {
  beamType: "simply-supported" | "cantilever" | "fixed-fixed";
  loadType: "point-load" | "distributed-load";
  length: number; // m
  shearDiagram?: Array<{ x: number; V: number }>;
  momentDiagram?: Array<{ x: number; M: number }>;
  deflectionCurve?: Array<{ x: number; y: number }>;
  showDimensions?: boolean;
  loadMagnitude?: number; // kN or kN/m
}

export function BeamDiagramSvg({
  beamType,
  loadType,
  length,
  shearDiagram,
  momentDiagram,
  deflectionCurve,
  showDimensions = true,
  loadMagnitude,
}: BeamDiagramSvgProps) {
  const width = 800;
  const height = 600;
  const margin = { top: 40, right: 60, bottom: 40, left: 60 };
  const beamY = 60; // Y position of beam in schematic
  const beamThickness = 8;
  const supportSize = 20;
  const chartHeight = 120;

  // Scale factor for beam length (leave space for dimensions)
  const beamWidth = width - margin.left - margin.right - 40;
  const scaleX = beamWidth / length;

  // Helper: Convert beam x-coordinate (m) to SVG x
  const toSvgX = (x: number) => margin.left + 20 + x * scaleX;

  // Helper: Render support symbol
  const renderSupport = (x: number, type: "pin" | "roller" | "fixed") => {
    const svgX = toSvgX(x);
    const baseY = beamY + beamThickness / 2;

    if (type === "pin") {
      // Triangle pointing up
      return (
        <g>
          <polygon
            points={`${svgX},${baseY} ${svgX - supportSize / 2},${baseY + supportSize} ${svgX + supportSize / 2},${baseY + supportSize}`}
            fill="#334155"
            stroke="#1e293b"
            strokeWidth="1.5"
          />
          <circle cx={svgX} cy={baseY} r="3" fill="#fff" stroke="#1e293b" strokeWidth="1.5" />
        </g>
      );
    } else if (type === "roller") {
      // Triangle with circles (double triangle)
      return (
        <g>
          <polygon
            points={`${svgX},${baseY} ${svgX - supportSize / 2},${baseY + supportSize} ${svgX + supportSize / 2},${baseY + supportSize}`}
            fill="#334155"
            stroke="#1e293b"
            strokeWidth="1.5"
          />
          <circle
            cx={svgX - supportSize / 4}
            cy={baseY + supportSize + 4}
            r="4"
            fill="#64748b"
            stroke="#1e293b"
            strokeWidth="1"
          />
          <circle
            cx={svgX + supportSize / 4}
            cy={baseY + supportSize + 4}
            r="4"
            fill="#64748b"
            stroke="#1e293b"
            strokeWidth="1"
          />
          <circle cx={svgX} cy={baseY} r="3" fill="#fff" stroke="#1e293b" strokeWidth="1.5" />
        </g>
      );
    } else {
      // Fixed support (rectangle)
      return (
        <g>
          <rect
            x={svgX - 4}
            y={baseY - beamThickness / 2}
            width="8"
            height={supportSize + beamThickness}
            fill="#334155"
            stroke="#1e293b"
            strokeWidth="1.5"
          />
          {/* Hatching to indicate fixed */}
          {[0, 4, 8, 12, 16, 20].map((offset) => (
            <line
              key={offset}
              x1={svgX - 4}
              y1={baseY - beamThickness / 2 + offset}
              x2={svgX - 10}
              y2={baseY - beamThickness / 2 + offset + 6}
              stroke="#1e293b"
              strokeWidth="1"
            />
          ))}
        </g>
      );
    }
  };

  // Helper: Render load symbol
  const renderLoad = () => {
    if (loadType === "point-load") {
      // Single downward arrow at center (SS, FF) or free end (cantilever)
      const loadX = beamType === "cantilever" ? length : length / 2;
      const svgX = toSvgX(loadX);
      const arrowTop = beamY - 30;
      const arrowBottom = beamY - beamThickness / 2 - 2;

      return (
        <g>
          <line
            x1={svgX}
            y1={arrowTop}
            x2={svgX}
            y2={arrowBottom}
            stroke="#dc2626"
            strokeWidth="2.5"
          />
          <polygon
            points={`${svgX},${arrowBottom} ${svgX - 6},${arrowBottom - 8} ${svgX + 6},${arrowBottom - 8}`}
            fill="#dc2626"
          />
          {showDimensions && loadMagnitude && (
            <text x={svgX + 10} y={arrowTop + 5} fontSize="12" fill="#dc2626" fontWeight="600">
              P = {loadMagnitude} kN
            </text>
          )}
        </g>
      );
    } else {
      // Distributed load (multiple small arrows)
      const arrows: React.ReactElement[] = [];
      const numArrows = 11;
      const arrowTop = beamY - 30;
      const arrowBottom = beamY - beamThickness / 2 - 2;

      for (let i = 0; i <= numArrows; i++) {
        const x = (length * i) / numArrows;
        const svgX = toSvgX(x);
        arrows.push(
          <g key={i}>
            <line
              x1={svgX}
              y1={arrowTop}
              x2={svgX}
              y2={arrowBottom}
              stroke="#dc2626"
              strokeWidth="1.5"
            />
            <polygon
              points={`${svgX},${arrowBottom} ${svgX - 4},${arrowBottom - 6} ${svgX + 4},${arrowBottom - 6}`}
              fill="#dc2626"
            />
          </g>
        );
      }

      return (
        <g>
          {arrows}
          {showDimensions && loadMagnitude && (
            <text
              x={toSvgX(length / 2) + 10}
              y={arrowTop + 5}
              fontSize="12"
              fill="#dc2626"
              fontWeight="600"
            >
              w = {loadMagnitude} kN/m
            </text>
          )}
        </g>
      );
    }
  };

  // Helper: Render chart (shear or moment)
  const renderChart = (
    data: Array<{ x: number; value: number }>,
    yOffset: number,
    color: string,
    label: string,
    unit: string
  ) => {
    if (!data || data.length === 0) return null;

    const maxAbsValue = Math.max(...data.map((d) => Math.abs(d.value)));
    const scaleY = maxAbsValue > 0 ? (chartHeight / 2 - 10) / maxAbsValue : 1;
    const zeroY = yOffset + chartHeight / 2;

    // Generate path
    const pathData = data
      .map((d, i) => {
        const x = toSvgX(d.x);
        const y = zeroY - d.value * scaleY;
        return `${i === 0 ? "M" : "L"} ${x},${y}`;
      })
      .join(" ");

    return (
      <g>
        {/* Chart border */}
        <rect
          x={margin.left}
          y={yOffset}
          width={beamWidth + 40}
          height={chartHeight}
          fill="none"
          stroke="#cbd5e1"
          strokeWidth="1"
        />

        {/* Zero line */}
        <line
          x1={margin.left}
          y1={zeroY}
          x2={margin.left + beamWidth + 40}
          y2={zeroY}
          stroke="#94a3b8"
          strokeWidth="1"
          strokeDasharray="4 2"
        />

        {/* Chart line */}
        <path d={pathData} fill="none" stroke={color} strokeWidth="2.5" />

        {/* Fill area */}
        <path
          d={`${pathData} L ${toSvgX(length)},${zeroY} L ${toSvgX(0)},${zeroY} Z`}
          fill={color}
          fillOpacity="0.15"
        />

        {/* Label */}
        <text x={margin.left + 5} y={yOffset + 15} fontSize="13" fontWeight="600" fill="#1e293b">
          {label}
        </text>

        {/* Max value annotation */}
        {maxAbsValue > 0 && (
          <text
            x={width - margin.right + 5}
            y={yOffset + chartHeight / 2}
            fontSize="11"
            fill={color}
            fontWeight="500"
          >
            ±{maxAbsValue.toFixed(2)} {unit}
          </text>
        )}
      </g>
    );
  };

  // Prepare chart data
  const shearData = shearDiagram?.map((d) => ({ x: d.x, value: d.V }));
  const momentData = momentDiagram?.map((d) => ({ x: d.x, value: d.M }));
  const deflectionData = deflectionCurve?.map((d) => ({ x: d.x, value: d.y * 50 })); // Exaggerate 50×

  return (
    <svg
      width="100%"
      height="100%"
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="xMidYMid meet"
      className="border rounded-lg bg-white dark:bg-slate-900"
    >
      <title>Beam Deflection Diagram</title>
      <desc>
        {beamType} beam with {loadType} showing shear, moment, and deflection
      </desc>

      {/* Beam Schematic */}
      <g id="beam-schematic">
        {/* Beam */}
        <rect
          x={toSvgX(0)}
          y={beamY - beamThickness / 2}
          width={beamWidth}
          height={beamThickness}
          fill="#64748b"
          stroke="#475569"
          strokeWidth="1.5"
        />

        {/* Supports */}
        {beamType === "simply-supported" && (
          <>
            {renderSupport(0, "pin")}
            {renderSupport(length, "roller")}
          </>
        )}
        {beamType === "cantilever" && renderSupport(0, "fixed")}
        {beamType === "fixed-fixed" && (
          <>
            {renderSupport(0, "fixed")}
            {renderSupport(length, "fixed")}
          </>
        )}

        {/* Load */}
        {renderLoad()}

        {/* Length dimension */}
        {showDimensions && (
          <g>
            <line
              x1={toSvgX(0)}
              y1={beamY + beamThickness / 2 + 40}
              x2={toSvgX(length)}
              y2={beamY + beamThickness / 2 + 40}
              stroke="#64748b"
              strokeWidth="1"
              markerStart="url(#arrowhead-left)"
              markerEnd="url(#arrowhead-right)"
            />
            <text
              x={toSvgX(length / 2)}
              y={beamY + beamThickness / 2 + 55}
              fontSize="12"
              textAnchor="middle"
              fill="#334155"
              fontWeight="500"
            >
              L = {length} m
            </text>
          </g>
        )}
      </g>

      {/* Shear Force Diagram */}
      {shearData && renderChart(shearData, 140, "#3b82f6", "Shear Force", "kN")}

      {/* Bending Moment Diagram */}
      {momentData && renderChart(momentData, 280, "#ef4444", "Bending Moment", "kN·m")}

      {/* Deflection Curve (exaggerated) */}
      {deflectionData && renderChart(deflectionData, 420, "#10b981", "Deflection (50×)", "mm")}

      {/* Arrow markers for dimension lines */}
      <defs>
        <marker
          id="arrowhead-left"
          markerWidth="8"
          markerHeight="8"
          refX="0"
          refY="4"
          orient="auto"
        >
          <polygon points="8 0, 8 8, 0 4" fill="#64748b" />
        </marker>
        <marker
          id="arrowhead-right"
          markerWidth="8"
          markerHeight="8"
          refX="8"
          refY="4"
          orient="auto"
        >
          <polygon points="0 0, 0 8, 8 4" fill="#64748b" />
        </marker>
      </defs>
    </svg>
  );
}
