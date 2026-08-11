/**
 * CrossSectionSvg Component
 * Renders SVG visualizations of various cross-sections
 * with centroid markers and principal axes
 */

interface CrossSectionSvgProps {
  shape:
    | "rectangle"
    | "circle"
    | "i-beam"
    | "hollow-rectangle"
    | "hollow-circle"
    | "triangle"
    | "channel"
    | "angle";
  dimensions: Record<string, number>;
  showCentroid?: boolean;
  showAxes?: boolean;
  className?: string;
}

export function CrossSectionSvg({
  shape,
  dimensions,
  showCentroid = true,
  showAxes = true,
  className = "",
}: CrossSectionSvgProps) {
  const viewBoxSize = 300;
  const margin = 30;
  const availableSize = viewBoxSize - 2 * margin;

  // Calculate scale to fit shape in viewBox
  const getScale = (width: number, height: number): number => {
    const maxDim = Math.max(width, height);
    return availableSize / maxDim;
  };

  // Center coordinates
  const cx = viewBoxSize / 2;
  const cy = viewBoxSize / 2;

  const renderShape = () => {
    switch (shape) {
      case "rectangle": {
        const w = dimensions.width || 100;
        const h = dimensions.height || 200;
        const scale = getScale(w, h);
        const scaledW = w * scale;
        const scaledH = h * scale;
        const x = cx - scaledW / 2;
        const y = cy - scaledH / 2;

        return (
          <g>
            <rect
              x={x}
              y={y}
              width={scaledW}
              height={scaledH}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            />
            <rect
              x={x}
              y={y}
              width={scaledW}
              height={scaledH}
              fill="currentColor"
              fillOpacity="0.1"
            />
          </g>
        );
      }

      case "circle": {
        const d = dimensions.diameter || 100;
        const scale = getScale(d, d);
        const r = (d * scale) / 2;

        return (
          <g>
            <circle cx={cx} cy={cy} r={r} fill="none" stroke="currentColor" strokeWidth="2" />
            <circle cx={cx} cy={cy} r={r} fill="currentColor" fillOpacity="0.1" />
          </g>
        );
      }

      case "hollow-rectangle": {
        const w = dimensions.width || 100;
        const h = dimensions.height || 200;
        const iw = dimensions.innerWidth || 60;
        const ih = dimensions.innerHeight || 140;
        const scale = getScale(w, h);
        const scaledW = w * scale;
        const scaledH = h * scale;
        const scaledIw = iw * scale;
        const scaledIh = ih * scale;
        const x = cx - scaledW / 2;
        const y = cy - scaledH / 2;
        const ix = cx - scaledIw / 2;
        const iy = cy - scaledIh / 2;

        return (
          <g>
            <rect
              x={x}
              y={y}
              width={scaledW}
              height={scaledH}
              fill="currentColor"
              fillOpacity="0.1"
            />
            <rect x={ix} y={iy} width={scaledIw} height={scaledIh} fill="white" />
            <rect
              x={x}
              y={y}
              width={scaledW}
              height={scaledH}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            />
            <rect
              x={ix}
              y={iy}
              width={scaledIw}
              height={scaledIh}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            />
          </g>
        );
      }

      case "hollow-circle": {
        const d = dimensions.diameter || 100;
        const id = dimensions.innerDiameter || 60;
        const scale = getScale(d, d);
        const r = (d * scale) / 2;
        const ir = (id * scale) / 2;

        return (
          <g>
            <circle cx={cx} cy={cy} r={r} fill="currentColor" fillOpacity="0.1" />
            <circle cx={cx} cy={cy} r={ir} fill="white" />
            <circle cx={cx} cy={cy} r={r} fill="none" stroke="currentColor" strokeWidth="2" />
            <circle cx={cx} cy={cy} r={ir} fill="none" stroke="currentColor" strokeWidth="2" />
          </g>
        );
      }

      case "triangle": {
        const w = dimensions.width || 100;
        const h = dimensions.height || 150;
        const scale = getScale(w, h);
        const scaledW = w * scale;
        const scaledH = h * scale;
        const x1 = cx - scaledW / 2;
        const x2 = cx + scaledW / 2;
        const x3 = cx;
        const y1 = cy + scaledH / 2;
        const y2 = cy + scaledH / 2;
        const y3 = cy - scaledH / 2;

        const points = `${x1},${y1} ${x2},${y2} ${x3},${y3}`;

        return (
          <g>
            <polygon points={points} fill="currentColor" fillOpacity="0.1" />
            <polygon points={points} fill="none" stroke="currentColor" strokeWidth="2" />
          </g>
        );
      }

      case "i-beam": {
        const d = dimensions.depth || 200;
        const fw = dimensions.flangeWidth || 120;
        const ft = dimensions.flangeThickness || 20;
        const wt = dimensions.webThickness || 10;
        const scale = getScale(fw, d);

        const scaledD = d * scale;
        const scaledFw = fw * scale;
        const scaledFt = ft * scale;
        const scaledWt = wt * scale;

        // Top flange
        const tfX = cx - scaledFw / 2;
        const tfY = cy - scaledD / 2;

        // Web
        const webX = cx - scaledWt / 2;
        const webY = cy - scaledD / 2 + scaledFt;
        const webH = scaledD - 2 * scaledFt;

        // Bottom flange
        const bfX = cx - scaledFw / 2;
        const bfY = cy + scaledD / 2 - scaledFt;

        return (
          <g>
            {/* Top flange */}
            <rect
              x={tfX}
              y={tfY}
              width={scaledFw}
              height={scaledFt}
              fill="currentColor"
              fillOpacity="0.1"
            />
            <rect
              x={tfX}
              y={tfY}
              width={scaledFw}
              height={scaledFt}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            />

            {/* Web */}
            <rect
              x={webX}
              y={webY}
              width={scaledWt}
              height={webH}
              fill="currentColor"
              fillOpacity="0.1"
            />
            <rect
              x={webX}
              y={webY}
              width={scaledWt}
              height={webH}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            />

            {/* Bottom flange */}
            <rect
              x={bfX}
              y={bfY}
              width={scaledFw}
              height={scaledFt}
              fill="currentColor"
              fillOpacity="0.1"
            />
            <rect
              x={bfX}
              y={bfY}
              width={scaledFw}
              height={scaledFt}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            />
          </g>
        );
      }

      case "channel": {
        const d = dimensions.channelDepth || 200;
        const w = dimensions.channelWidth || 120;
        const wt = dimensions.channelWebThickness || 10;
        const ft = dimensions.channelFlangeThickness || 15;
        const scale = getScale(w, d);

        const scaledD = d * scale;
        const scaledW = w * scale;
        const scaledWt = wt * scale;
        const scaledFt = ft * scale;

        // Outer rectangle
        const x = cx - scaledW / 2;
        const y = cy - scaledD / 2;

        // Cutout dimensions
        const cutoutW = (scaledW - scaledWt) / 2;
        const cutoutH = scaledD - 2 * scaledFt;
        const cutoutY = y + scaledFt;

        return (
          <g>
            {/* Outer shape with cutouts */}
            <rect
              x={x}
              y={y}
              width={scaledW}
              height={scaledD}
              fill="currentColor"
              fillOpacity="0.1"
            />

            {/* Left cutout */}
            <rect x={x} y={cutoutY} width={cutoutW} height={cutoutH} fill="white" />
            {/* Right cutout */}
            <rect
              x={x + scaledW - cutoutW}
              y={cutoutY}
              width={cutoutW}
              height={cutoutH}
              fill="white"
            />

            {/* Outer outline */}
            <rect
              x={x}
              y={y}
              width={scaledW}
              height={scaledD}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            />

            {/* Cutout outlines */}
            <rect
              x={x}
              y={cutoutY}
              width={cutoutW}
              height={cutoutH}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            />
            <rect
              x={x + scaledW - cutoutW}
              y={cutoutY}
              width={cutoutW}
              height={cutoutH}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            />
          </g>
        );
      }

      case "angle": {
        const l1 = dimensions.legWidth1 || 100;
        const l2 = dimensions.legWidth2 || 100;
        const t = dimensions.thickness || 15;
        const maxLeg = Math.max(l1, l2);
        const scale = getScale(maxLeg, maxLeg);

        const scaledL1 = l1 * scale;
        const scaledL2 = l2 * scale;
        const scaledT = t * scale;

        const x = cx - scaledL2 / 2;
        const y = cy - scaledL1 / 2;

        return (
          <g>
            {/* Vertical leg */}
            <rect
              x={x}
              y={y}
              width={scaledT}
              height={scaledL1}
              fill="currentColor"
              fillOpacity="0.1"
            />
            <rect
              x={x}
              y={y}
              width={scaledT}
              height={scaledL1}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            />

            {/* Horizontal leg */}
            <rect
              x={x}
              y={y + scaledL1 - scaledT}
              width={scaledL2}
              height={scaledT}
              fill="currentColor"
              fillOpacity="0.1"
            />
            <rect
              x={x}
              y={y + scaledL1 - scaledT}
              width={scaledL2}
              height={scaledT}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            />
          </g>
        );
      }

      default:
        return null;
    }
  };

  return (
    <svg
      viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
      className={`w-full h-full ${className}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>Cross-section: {shape}</title>
      <desc>
        {shape} cross-section with {showCentroid ? "centroid" : ""} {showAxes ? "axes" : ""}
      </desc>

      {/* Background */}
      <rect width={viewBoxSize} height={viewBoxSize} fill="transparent" />

      {/* Principal axes */}
      {showAxes && (
        <g stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" opacity="0.4">
          {/* X-axis (horizontal) */}
          <line x1={margin} y1={cy} x2={viewBoxSize - margin} y2={cy} />
          {/* Y-axis (vertical) */}
          <line x1={cx} y1={margin} x2={cx} y2={viewBoxSize - margin} />
          {/* Axis labels */}
          <text x={viewBoxSize - margin + 5} y={cy + 4} fontSize="12" opacity="0.6">
            x
          </text>
          <text x={cx + 4} y={margin - 5} fontSize="12" opacity="0.6">
            y
          </text>
        </g>
      )}

      {/* Shape */}
      {renderShape()}

      {/* Centroid marker */}
      {showCentroid && (
        <g>
          <circle cx={cx} cy={cy} r="4" fill="red" />
          <circle cx={cx} cy={cy} r="4" fill="none" stroke="white" strokeWidth="1" />
          <text x={cx + 8} y={cy - 8} fontSize="12" fill="red" fontWeight="bold">
            C
          </text>
        </g>
      )}
    </svg>
  );
}
