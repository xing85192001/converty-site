/**
 * Moment of Inertia Calculator
 * Calculates second moment of area for various cross-sections
 * Reference: "Mechanics of Materials" by Beer & Johnston
 */

import beamSectionsData from "@/data/engineering/beam-sections.json";
import type { CalculationResult } from "@/types";
import type { BeamSection } from "./types";

export interface MomentOfInertiaInput {
  shape:
    | "rectangle"
    | "circle"
    | "i-beam"
    | "hollow-rectangle"
    | "hollow-circle"
    | "triangle"
    | "channel"
    | "angle";
  // Rectangle / Hollow Rectangle
  width?: number; // mm
  height?: number; // mm
  // Circle / Hollow Circle
  diameter?: number; // mm
  // Hollow shapes
  innerWidth?: number; // mm
  innerHeight?: number; // mm
  innerDiameter?: number; // mm
  // I-beam specific
  flangeWidth?: number; // mm
  flangeThickness?: number; // mm
  webThickness?: number; // mm
  depth?: number; // mm
  // Channel specific
  channelDepth?: number; // mm
  channelWidth?: number; // mm
  channelWebThickness?: number; // mm
  channelFlangeThickness?: number; // mm
  // Angle specific
  legWidth1?: number; // mm
  legWidth2?: number; // mm
  thickness?: number; // mm
  // Parallel axis theorem
  offsetX?: number; // mm (distance from centroid to new axis)
  offsetY?: number; // mm
  // Beam section selection
  beamSectionId?: string;
}

export interface MomentOfInertiaResult {
  Ix: number; // mm⁴ (moment of inertia about X-axis)
  Iy: number; // mm⁴ (moment of inertia about Y-axis)
  Ixy: number; // mm⁴ (product of inertia)
  area: number; // mm²
  centroidX: number; // mm
  centroidY: number; // mm
  radiusOfGyrationX: number; // mm
  radiusOfGyrationY: number; // mm
  steps: string[];
  units: {
    mm4: { Ix: number; Iy: number };
    in4: { Ix: number; Iy: number };
    cm4: { Ix: number; Iy: number };
  };
}

/**
 * Calculate moment of inertia for a rectangle
 * Formula: Ix = bh³/12, Iy = hb³/12
 */
function calculateRectangle(
  width: number,
  height: number
): {
  Ix: number;
  Iy: number;
  area: number;
} {
  const area = width * height;
  const Ix = (width * height ** 3) / 12;
  const Iy = (height * width ** 3) / 12;
  return { Ix, Iy, area };
}

/**
 * Calculate moment of inertia for a circle
 * Formula: I = πd⁴/64
 */
function calculateCircle(diameter: number): { I: number; area: number } {
  const area = (Math.PI * diameter ** 2) / 4;
  const I = (Math.PI * diameter ** 4) / 64;
  return { I, area };
}

/**
 * Calculate moment of inertia for a hollow rectangle
 */
function calculateHollowRectangle(
  width: number,
  height: number,
  innerWidth: number,
  innerHeight: number
): { Ix: number; Iy: number; area: number } {
  const outer = calculateRectangle(width, height);
  const inner = calculateRectangle(innerWidth, innerHeight);
  return {
    Ix: outer.Ix - inner.Ix,
    Iy: outer.Iy - inner.Iy,
    area: outer.area - inner.area,
  };
}

/**
 * Calculate moment of inertia for a hollow circle
 */
function calculateHollowCircle(
  outerDiameter: number,
  innerDiameter: number
): {
  I: number;
  area: number;
} {
  const outer = calculateCircle(outerDiameter);
  const inner = calculateCircle(innerDiameter);
  return {
    I: outer.I - inner.I,
    area: outer.area - inner.area,
  };
}

/**
 * Calculate moment of inertia for a triangle (base at bottom)
 * Formula: Ix = bh³/36, Iy = hb³/48
 */
function calculateTriangle(base: number, height: number): { Ix: number; Iy: number; area: number } {
  const area = (base * height) / 2;
  const Ix = (base * height ** 3) / 36;
  const Iy = (height * base ** 3) / 48;
  return { Ix, Iy, area };
}

/**
 * Calculate moment of inertia for an I-beam
 */
function calculateIBeam(
  depth: number,
  flangeWidth: number,
  flangeThickness: number,
  webThickness: number
): { Ix: number; Iy: number; area: number } {
  // I-beam = 2 flanges + web
  // Top flange
  const topFlange = calculateRectangle(flangeWidth, flangeThickness);
  const topFlangeOffset = depth / 2 - flangeThickness / 2;
  const topFlangeIx = topFlange.Ix + topFlange.area * topFlangeOffset ** 2;

  // Bottom flange
  const bottomFlange = calculateRectangle(flangeWidth, flangeThickness);
  const bottomFlangeOffset = depth / 2 - flangeThickness / 2;
  const bottomFlangeIx = bottomFlange.Ix + bottomFlange.area * bottomFlangeOffset ** 2;

  // Web
  const webHeight = depth - 2 * flangeThickness;
  const web = calculateRectangle(webThickness, webHeight);

  const Ix = topFlangeIx + bottomFlangeIx + web.Ix;
  const Iy = topFlange.Iy + bottomFlange.Iy + web.Iy;
  const area = 2 * topFlange.area + web.area;

  return { Ix, Iy, area };
}

/**
 * Calculate moment of inertia for a channel section
 */
function calculateChannel(
  depth: number,
  width: number,
  webThickness: number,
  flangeThickness: number
): { Ix: number; Iy: number; area: number } {
  // Channel = outer rectangle - 2 cutouts
  const outer = calculateRectangle(width, depth);
  const cutoutWidth = (width - webThickness) / 2;
  const cutoutHeight = depth - 2 * flangeThickness;
  const cutout = calculateRectangle(cutoutWidth, cutoutHeight);

  const Ix = outer.Ix - 2 * cutout.Ix;
  const Iy = outer.Iy - 2 * cutout.Iy;
  const area = outer.area - 2 * cutout.area;

  return { Ix, Iy, area };
}

/**
 * Calculate moment of inertia for an angle section (L-shape)
 */
function calculateAngle(
  leg1Width: number,
  leg2Width: number,
  thickness: number
): { Ix: number; Iy: number; area: number } {
  // Angle = vertical leg + horizontal leg - overlap
  const verticalLeg = calculateRectangle(thickness, leg1Width);
  const horizontalLeg = calculateRectangle(leg2Width, thickness);
  const overlap = calculateRectangle(thickness, thickness);

  // Simplified calculation (assumes equal leg angle at origin)
  const Ix = verticalLeg.Ix + horizontalLeg.Ix - overlap.Ix;
  const Iy = verticalLeg.Iy + horizontalLeg.Iy - overlap.Iy;
  const area = verticalLeg.area + horizontalLeg.area - overlap.area;

  return { Ix, Iy, area };
}

/**
 * Apply parallel axis theorem: I = I_c + Ad²
 */
function applyParallelAxisTheorem(
  Ix: number,
  Iy: number,
  area: number,
  offsetX: number,
  offsetY: number
): { Ix: number; Iy: number } {
  const newIx = Ix + area * offsetY ** 2;
  const newIy = Iy + area * offsetX ** 2;
  return { Ix: newIx, Iy: newIy };
}

/**
 * Main calculation function
 */
export function calculateMomentOfInertia(
  input: MomentOfInertiaInput
): CalculationResult<MomentOfInertiaResult> {
  const steps: string[] = [];

  // If beam section selected, use database values
  if (input.beamSectionId && input.beamSectionId !== "custom") {
    const section = getBeamSectionById(input.beamSectionId);
    if (!section)
      return {
        ok: false,
        error: `Beam section not found: ${input.beamSectionId}`,
        code: "INVALID_INPUT",
      };

    steps.push(`Using standard beam section: ${section.name}`);
    steps.push(`Standard: ${section.standard}`);

    // Convert from AISC units (in⁴) to mm⁴
    const MM4_PER_IN4 = 416231.4;
    const Ix = section.momentOfInertiaX * MM4_PER_IN4;
    const Iy = section.momentOfInertiaY * MM4_PER_IN4;
    const area = section.area * 645.16; // in² → mm²

    steps.push(`Ix = ${section.momentOfInertiaX.toFixed(2)} in⁴ = ${Ix.toFixed(0)} mm⁴`);
    steps.push(`Iy = ${section.momentOfInertiaY.toFixed(2)} in⁴ = ${Iy.toFixed(0)} mm⁴`);

    const radiusOfGyrationX = Math.sqrt(Ix / area);
    const radiusOfGyrationY = Math.sqrt(Iy / area);

    return {
      ok: true,
      value: {
        Ix,
        Iy,
        Ixy: 0,
        area,
        centroidX: 0,
        centroidY: 0,
        radiusOfGyrationX,
        radiusOfGyrationY,
        steps,
        units: {
          mm4: { Ix, Iy },
          in4: { Ix: Ix / MM4_PER_IN4, Iy: Iy / MM4_PER_IN4 },
          cm4: { Ix: Ix / 10000, Iy: Iy / 10000 },
        },
      },
    };
  }

  // Custom shape calculations
  let Ix = 0;
  let Iy = 0;
  let area = 0;

  switch (input.shape) {
    case "rectangle": {
      if (!input.width || !input.height)
        return { ok: false, error: "Rectangle requires width and height", code: "INVALID_INPUT" };
      const result = calculateRectangle(input.width, input.height);
      Ix = result.Ix;
      Iy = result.Iy;
      area = result.area;
      steps.push(`Rectangle: ${input.width}mm × ${input.height}mm`);
      steps.push(`Ix = bh³/12 = ${input.width} × ${input.height}³ / 12 = ${Ix.toFixed(0)} mm⁴`);
      steps.push(`Iy = hb³/12 = ${input.height} × ${input.width}³ / 12 = ${Iy.toFixed(0)} mm⁴`);
      break;
    }

    case "circle": {
      if (!input.diameter)
        return { ok: false, error: "Circle requires diameter", code: "INVALID_INPUT" };
      const result = calculateCircle(input.diameter);
      Ix = result.I;
      Iy = result.I;
      area = result.area;
      steps.push(`Circle: Ø${input.diameter}mm`);
      steps.push(`I = πd⁴/64 = π × ${input.diameter}⁴ / 64 = ${Ix.toFixed(0)} mm⁴`);
      break;
    }

    case "hollow-rectangle": {
      if (!input.width || !input.height || !input.innerWidth || !input.innerHeight)
        return {
          ok: false,
          error: "Hollow rectangle requires width, height, innerWidth, and innerHeight",
          code: "INVALID_INPUT",
        };
      const result = calculateHollowRectangle(
        input.width,
        input.height,
        input.innerWidth,
        input.innerHeight
      );
      Ix = result.Ix;
      Iy = result.Iy;
      area = result.area;
      steps.push(
        `Hollow Rectangle: ${input.width}×${input.height}mm, inner ${input.innerWidth}×${input.innerHeight}mm`
      );
      steps.push(`Ix = I_outer - I_inner = ${Ix.toFixed(0)} mm⁴`);
      break;
    }

    case "hollow-circle": {
      if (!input.diameter || !input.innerDiameter)
        return {
          ok: false,
          error: "Hollow circle requires diameter and innerDiameter",
          code: "INVALID_INPUT",
        };
      const result = calculateHollowCircle(input.diameter, input.innerDiameter);
      Ix = result.I;
      Iy = result.I;
      area = result.area;
      steps.push(`Hollow Circle: Ø${input.diameter}mm, inner Ø${input.innerDiameter}mm`);
      steps.push(`I = I_outer - I_inner = ${Ix.toFixed(0)} mm⁴`);
      break;
    }

    case "triangle": {
      if (!input.width || !input.height)
        return {
          ok: false,
          error: "Triangle requires width (base) and height",
          code: "INVALID_INPUT",
        };
      const result = calculateTriangle(input.width, input.height);
      Ix = result.Ix;
      Iy = result.Iy;
      area = result.area;
      steps.push(`Triangle: base ${input.width}mm, height ${input.height}mm`);
      steps.push(`Ix = bh³/36 = ${Ix.toFixed(0)} mm⁴`);
      break;
    }

    case "i-beam": {
      if (!input.depth || !input.flangeWidth || !input.flangeThickness || !input.webThickness)
        return {
          ok: false,
          error: "I-beam requires depth, flangeWidth, flangeThickness, and webThickness",
          code: "INVALID_INPUT",
        };
      const result = calculateIBeam(
        input.depth,
        input.flangeWidth,
        input.flangeThickness,
        input.webThickness
      );
      Ix = result.Ix;
      Iy = result.Iy;
      area = result.area;
      steps.push(
        `I-Beam: depth ${input.depth}mm, flange ${input.flangeWidth}×${input.flangeThickness}mm, web ${input.webThickness}mm`
      );
      steps.push(`Calculated using composite section method`);
      break;
    }

    case "channel": {
      if (
        !input.channelDepth ||
        !input.channelWidth ||
        !input.channelWebThickness ||
        !input.channelFlangeThickness
      )
        return {
          ok: false,
          error:
            "Channel requires channelDepth, channelWidth, channelWebThickness, and channelFlangeThickness",
          code: "INVALID_INPUT",
        };
      const result = calculateChannel(
        input.channelDepth,
        input.channelWidth,
        input.channelWebThickness,
        input.channelFlangeThickness
      );
      Ix = result.Ix;
      Iy = result.Iy;
      area = result.area;
      steps.push(`Channel: ${input.channelDepth}×${input.channelWidth}mm`);
      break;
    }

    case "angle": {
      if (!input.legWidth1 || !input.legWidth2 || !input.thickness)
        return {
          ok: false,
          error: "Angle requires legWidth1, legWidth2, and thickness",
          code: "INVALID_INPUT",
        };
      const result = calculateAngle(input.legWidth1, input.legWidth2, input.thickness);
      Ix = result.Ix;
      Iy = result.Iy;
      area = result.area;
      steps.push(`Angle: ${input.legWidth1}×${input.legWidth2}×${input.thickness}mm`);
      break;
    }

    default:
      return { ok: false, error: `Unknown shape: ${input.shape}`, code: "INVALID_INPUT" };
  }

  // Apply parallel axis theorem if offsets provided
  if (input.offsetX || input.offsetY) {
    const offsetX = input.offsetX || 0;
    const offsetY = input.offsetY || 0;
    const parallel = applyParallelAxisTheorem(Ix, Iy, area, offsetX, offsetY);
    steps.push(`\nApplying Parallel Axis Theorem:`);
    steps.push(`Offset: dx=${offsetX}mm, dy=${offsetY}mm`);
    steps.push(`Ix_new = Ix + A×dy² = ${parallel.Ix.toFixed(0)} mm⁴`);
    steps.push(`Iy_new = Iy + A×dx² = ${parallel.Iy.toFixed(0)} mm⁴`);
    Ix = parallel.Ix;
    Iy = parallel.Iy;
  }

  // Calculate radius of gyration: r = √(I/A)
  const radiusOfGyrationX = Math.sqrt(Ix / area);
  const radiusOfGyrationY = Math.sqrt(Iy / area);

  steps.push(`\nArea = ${area.toFixed(2)} mm²`);
  steps.push(`Radius of gyration: rx = ${radiusOfGyrationX.toFixed(2)} mm`);
  steps.push(`Radius of gyration: ry = ${radiusOfGyrationY.toFixed(2)} mm`);

  return {
    ok: true,
    value: {
      Ix,
      Iy,
      Ixy: 0, // Simplified: assume principal axes
      area,
      centroidX: 0,
      centroidY: 0,
      radiusOfGyrationX,
      radiusOfGyrationY,
      steps,
      units: {
        mm4: { Ix, Iy },
        in4: { Ix: Ix / 416231.4, Iy: Iy / 416231.4 },
        cm4: { Ix: Ix / 10000, Iy: Iy / 10000 },
      },
    },
  };
}

/**
 * Get all beam sections from database
 */
export function getBeamSections(): BeamSection[] {
  return beamSectionsData as BeamSection[];
}

/**
 * Get beam section by ID
 */
export function getBeamSectionById(id: string): BeamSection | undefined {
  return (beamSectionsData as BeamSection[]).find((section) => section.id === id);
}
