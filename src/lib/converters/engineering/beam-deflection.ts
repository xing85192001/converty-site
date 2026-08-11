import type { CalculationResult } from "@/types";

export interface BeamDeflectionInput {
  beamType: "simply-supported" | "cantilever" | "fixed-fixed";
  loadType: "point-load" | "distributed-load";
  // Beam properties
  length: number; // m
  momentOfInertia: number; // mm⁴
  youngsModulus: number; // GPa
  // Load properties
  pointLoad?: number; // kN (at midspan for SS and FF, at free end for cantilever)
  distributedLoad?: number; // kN/m
  // Material/section selection
  materialId?: string;
  beamSectionId?: string;
}

export interface BeamDeflectionResult {
  maxDeflection: number; // mm
  maxDeflectionLocation: number; // m from left support
  maxShear: number; // kN
  maxMoment: number; // kN·m
  slopeAtEnds: {
    left: number; // radians
    right: number; // radians
  };
  // Diagram data (21 points for smooth curves)
  shearDiagram: Array<{ x: number; V: number }>; // x in m, V in kN
  momentDiagram: Array<{ x: number; M: number }>; // x in m, M in kN·m
  deflectionCurve: Array<{ x: number; y: number }>; // x in m, y in mm
  steps: string[];
  units: {
    deflection: { mm: number; in: number; cm: number };
    moment: { kNm: number; ftlb: number };
    shear: { kN: number; lb: number };
  };
  deflectionRatios: {
    l180: number; // L/180 (floors)
    l240: number; // L/240 (floors with plaster)
    l360: number; // L/360 (roofs)
    l600: number; // L/600 (special)
    actual: number; // Actual L/δ ratio
  };
}

export function calculateBeamDeflection(
  input: BeamDeflectionInput
): CalculationResult<BeamDeflectionResult> {
  // Validate inputs
  if (input.length <= 0 || input.momentOfInertia <= 0 || input.youngsModulus <= 0) {
    return {
      ok: false,
      error: "Length, moment of inertia, and Young's modulus must be positive",
      code: "INVALID_INPUT",
    };
  }

  if (input.loadType === "point-load" && (!input.pointLoad || input.pointLoad <= 0)) {
    return { ok: false, error: "Point load must be positive", code: "INVALID_INPUT" };
  }

  if (
    input.loadType === "distributed-load" &&
    (!input.distributedLoad || input.distributedLoad <= 0)
  ) {
    return { ok: false, error: "Distributed load must be positive", code: "INVALID_INPUT" };
  }

  const steps: string[] = [];

  // Unit conversions
  const L_mm = input.length * 1000; // m → mm
  const E_Nmm2 = input.youngsModulus * 1000; // GPa → N/mm²
  const I_mm4 = input.momentOfInertia; // mm⁴ (already in correct unit)

  steps.push(`Given:`);
  steps.push(`  Beam type: ${input.beamType}`);
  steps.push(`  Load type: ${input.loadType}`);
  steps.push(`  Length L = ${input.length} m = ${L_mm} mm`);
  steps.push(`  Young's modulus E = ${input.youngsModulus} GPa = ${E_Nmm2} N/mm²`);
  steps.push(`  Moment of inertia I = ${I_mm4.toExponential(2)} mm⁴`);

  let P_N = 0; // Point load in N
  let w_Nmm = 0; // Distributed load in N/mm

  if (input.loadType === "point-load") {
    P_N = input.pointLoad! * 1000; // kN → N
    steps.push(`  Point load P = ${input.pointLoad} kN = ${P_N} N`);
  } else {
    w_Nmm = (input.distributedLoad! * 1000) / 1000; // kN/m → N/mm
    steps.push(`  Distributed load w = ${input.distributedLoad} kN/m = ${w_Nmm.toFixed(3)} N/mm`);
  }

  // Calculate deflection, shear, and moment based on beam and load type
  let maxDeflection_mm = 0;
  let maxDeflectionLocation_m = 0;
  let maxShear_kN = 0;
  let maxMoment_kNm = 0;
  let slopeLeft_rad = 0;
  let slopeRight_rad = 0;

  steps.push("");
  steps.push(`Formulas (Beer & Johnston, Mechanics of Materials):`);

  if (input.beamType === "simply-supported") {
    if (input.loadType === "point-load") {
      // Simply Supported + Point Load (center)
      // δ_max = PL³/(48EI) at center
      // M_max = PL/4 at center
      // V_max = P/2 at supports
      maxDeflection_mm = (P_N * L_mm ** 3) / (48 * E_Nmm2 * I_mm4);
      maxDeflectionLocation_m = input.length / 2;
      maxShear_kN = P_N / 2 / 1000; // N → kN
      maxMoment_kNm = (P_N * L_mm) / 4 / 1e6; // N·mm → kN·m
      slopeLeft_rad = (P_N * L_mm ** 2) / (16 * E_Nmm2 * I_mm4);
      slopeRight_rad = -slopeLeft_rad;

      steps.push(`  δ_max = PL³/(48EI)`);
      steps.push(`  M_max = PL/4`);
      steps.push(`  V_max = P/2`);
    } else {
      // Simply Supported + Distributed Load
      // δ_max = 5wL⁴/(384EI) at center
      // M_max = wL²/8 at center
      // V_max = wL/2 at supports
      maxDeflection_mm = (5 * w_Nmm * L_mm ** 4) / (384 * E_Nmm2 * I_mm4);
      maxDeflectionLocation_m = input.length / 2;
      maxShear_kN = (w_Nmm * L_mm) / 2 / 1000; // N → kN
      maxMoment_kNm = (w_Nmm * L_mm ** 2) / 8 / 1e6; // N·mm → kN·m
      slopeLeft_rad = (w_Nmm * L_mm ** 3) / (24 * E_Nmm2 * I_mm4);
      slopeRight_rad = -slopeLeft_rad;

      steps.push(`  δ_max = 5wL⁴/(384EI)`);
      steps.push(`  M_max = wL²/8`);
      steps.push(`  V_max = wL/2`);
    }
  } else if (input.beamType === "cantilever") {
    if (input.loadType === "point-load") {
      // Cantilever + Point Load (free end)
      // δ_max = PL³/(3EI) at free end
      // M_max = PL at fixed end
      // V_max = P
      maxDeflection_mm = (P_N * L_mm ** 3) / (3 * E_Nmm2 * I_mm4);
      maxDeflectionLocation_m = input.length;
      maxShear_kN = P_N / 1000; // N → kN
      maxMoment_kNm = (P_N * L_mm) / 1e6; // N·mm → kN·m
      slopeLeft_rad = 0; // Fixed end
      slopeRight_rad = (P_N * L_mm ** 2) / (2 * E_Nmm2 * I_mm4);

      steps.push(`  δ_max = PL³/(3EI)`);
      steps.push(`  M_max = PL`);
      steps.push(`  V_max = P`);
    } else {
      // Cantilever + Distributed Load
      // δ_max = wL⁴/(8EI) at free end
      // M_max = wL²/2 at fixed end
      // V_max = wL
      maxDeflection_mm = (w_Nmm * L_mm ** 4) / (8 * E_Nmm2 * I_mm4);
      maxDeflectionLocation_m = input.length;
      maxShear_kN = (w_Nmm * L_mm) / 1000; // N → kN
      maxMoment_kNm = (w_Nmm * L_mm ** 2) / 2 / 1e6; // N·mm → kN·m
      slopeLeft_rad = 0; // Fixed end
      slopeRight_rad = (w_Nmm * L_mm ** 3) / (6 * E_Nmm2 * I_mm4);

      steps.push(`  δ_max = wL⁴/(8EI)`);
      steps.push(`  M_max = wL²/2`);
      steps.push(`  V_max = wL`);
    }
  } else {
    // fixed-fixed
    if (input.loadType === "point-load") {
      // Fixed-Fixed + Point Load (center)
      // δ_max = PL³/(192EI) at center
      // M_max = PL/8 at supports and center
      // V_max = P/2
      maxDeflection_mm = (P_N * L_mm ** 3) / (192 * E_Nmm2 * I_mm4);
      maxDeflectionLocation_m = input.length / 2;
      maxShear_kN = P_N / 2 / 1000; // N → kN
      maxMoment_kNm = (P_N * L_mm) / 8 / 1e6; // N·mm → kN·m
      slopeLeft_rad = 0; // Fixed end
      slopeRight_rad = 0; // Fixed end

      steps.push(`  δ_max = PL³/(192EI)`);
      steps.push(`  M_max = PL/8 (at supports and center)`);
      steps.push(`  V_max = P/2`);
    } else {
      // Fixed-Fixed + Distributed Load
      // δ_max = wL⁴/(384EI) at center
      // M_max = wL²/12 at supports
      // V_max = wL/2
      maxDeflection_mm = (w_Nmm * L_mm ** 4) / (384 * E_Nmm2 * I_mm4);
      maxDeflectionLocation_m = input.length / 2;
      maxShear_kN = (w_Nmm * L_mm) / 2 / 1000; // N → kN
      maxMoment_kNm = (w_Nmm * L_mm ** 2) / 12 / 1e6; // N·mm → kN·m
      slopeLeft_rad = 0; // Fixed end
      slopeRight_rad = 0; // Fixed end

      steps.push(`  δ_max = wL⁴/(384EI)`);
      steps.push(`  M_max = wL²/12 (at supports)`);
      steps.push(`  V_max = wL/2`);
    }
  }

  steps.push("");
  steps.push(`Calculations:`);
  steps.push(`  δ_max = ${maxDeflection_mm.toFixed(3)} mm`);
  steps.push(`  M_max = ${maxMoment_kNm.toFixed(3)} kN·m`);
  steps.push(`  V_max = ${maxShear_kN.toFixed(3)} kN`);

  // Generate diagram data (21 points for smooth curves)
  const shearDiagram: Array<{ x: number; V: number }> = [];
  const momentDiagram: Array<{ x: number; M: number }> = [];
  const deflectionCurve: Array<{ x: number; y: number }> = [];

  for (let i = 0; i <= 20; i++) {
    const x_m = (input.length * i) / 20;
    const x_mm = x_m * 1000;

    let V_kN = 0;
    let M_kNm = 0;
    let y_mm = 0;

    if (input.beamType === "simply-supported") {
      if (input.loadType === "point-load") {
        // Shear: +P/2 from 0 to L/2, -P/2 from L/2 to L
        V_kN = x_m < input.length / 2 ? maxShear_kN : -maxShear_kN;
        // Moment: parabolic, max at center
        if (x_m <= input.length / 2) {
          M_kNm = ((P_N / 2) * x_mm) / 1e6;
        } else {
          M_kNm = ((P_N / 2) * (L_mm - x_mm)) / 1e6;
        }
        // Deflection: cubic, max at center
        if (x_m <= input.length / 2) {
          y_mm = (P_N * x_mm * (3 * L_mm ** 2 - 4 * x_mm ** 2)) / (48 * E_Nmm2 * I_mm4);
        } else {
          const x_from_right = L_mm - x_mm;
          y_mm =
            (P_N * x_from_right * (3 * L_mm ** 2 - 4 * x_from_right ** 2)) / (48 * E_Nmm2 * I_mm4);
        }
      } else {
        // Distributed load
        // Shear: linear from +wL/2 to -wL/2
        V_kN = (w_Nmm * (L_mm / 2 - x_mm)) / 1000;
        // Moment: parabolic, max at center
        M_kNm = (w_Nmm * x_mm * (L_mm - x_mm)) / 2 / 1e6;
        // Deflection: quartic, max at center
        y_mm =
          (w_Nmm * x_mm * (L_mm ** 3 - 2 * L_mm * x_mm ** 2 + x_mm ** 3)) / (24 * E_Nmm2 * I_mm4);
      }
    } else if (input.beamType === "cantilever") {
      if (input.loadType === "point-load") {
        // Shear: constant -P
        V_kN = -maxShear_kN;
        // Moment: linear from 0 to -PL
        M_kNm = -(P_N * (L_mm - x_mm)) / 1e6;
        // Deflection: cubic, max at free end
        y_mm = (P_N * (L_mm - x_mm) ** 2 * (3 * x_mm - (L_mm - x_mm))) / (6 * E_Nmm2 * I_mm4);
      } else {
        // Distributed load
        // Shear: linear from 0 to -wL
        V_kN = -(w_Nmm * (L_mm - x_mm)) / 1000;
        // Moment: parabolic from 0 to -wL²/2
        M_kNm = -((w_Nmm * (L_mm - x_mm) ** 2) / 2) / 1e6;
        // Deflection: quartic, max at free end
        y_mm =
          (w_Nmm *
            (L_mm - x_mm) ** 2 *
            (6 * L_mm ** 2 - 4 * L_mm * (L_mm - x_mm) + (L_mm - x_mm) ** 2)) /
          (24 * E_Nmm2 * I_mm4);
      }
    } else {
      // fixed-fixed
      if (input.loadType === "point-load") {
        // Shear: +P/2 from 0 to L/2, -P/2 from L/2 to L
        V_kN = x_m < input.length / 2 ? maxShear_kN : -maxShear_kN;
        // Moment: varies, max at supports (PL/8) and center (PL/8)
        if (x_m <= input.length / 2) {
          M_kNm = (P_N / 8) * ((4 * x_mm) / L_mm - 1) * (L_mm / 1e6);
        } else {
          M_kNm = (P_N / 8) * (3 - (4 * x_mm) / L_mm) * (L_mm / 1e6);
        }
        // Deflection: complex polynomial, max at center
        const xi = x_mm / L_mm;
        y_mm = (P_N * L_mm ** 3 * xi ** 2 * (1 - xi) ** 2) / (192 * E_Nmm2 * I_mm4);
      } else {
        // Distributed load
        // Shear: linear from +wL/2 to -wL/2
        V_kN = (w_Nmm * (L_mm / 2 - x_mm)) / 1000;
        // Moment: varies, max at supports (wL²/12)
        M_kNm =
          ((w_Nmm * L_mm) / 12) * ((6 * x_mm) / L_mm - 6 * (x_mm / L_mm) ** 2 - 1) * (L_mm / 1e6);
        // Deflection: complex polynomial, max at center
        const xi = x_mm / L_mm;
        y_mm = (w_Nmm * L_mm ** 4 * xi ** 2 * (1 - xi) ** 2) / (384 * E_Nmm2 * I_mm4);
      }
    }

    shearDiagram.push({ x: x_m, V: V_kN });
    momentDiagram.push({ x: x_m, M: M_kNm });
    deflectionCurve.push({ x: x_m, y: y_mm });
  }

  // Calculate deflection ratios
  const L_m = input.length;
  const deflectionRatios = {
    l180: (L_m * 1000) / 180, // mm
    l240: (L_m * 1000) / 240, // mm
    l360: (L_m * 1000) / 360, // mm
    l600: (L_m * 1000) / 600, // mm
    actual: (L_m * 1000) / maxDeflection_mm, // L/δ ratio
  };

  steps.push("");
  steps.push(`Deflection criteria:`);
  steps.push(`  L/180 = ${deflectionRatios.l180.toFixed(2)} mm (floors, non-critical)`);
  steps.push(`  L/240 = ${deflectionRatios.l240.toFixed(2)} mm (floors with plaster)`);
  steps.push(`  L/360 = ${deflectionRatios.l360.toFixed(2)} mm (roofs)`);
  steps.push(`  L/600 = ${deflectionRatios.l600.toFixed(2)} mm (special cases)`);
  steps.push(
    `  Actual: L/${deflectionRatios.actual.toFixed(0)} = ${maxDeflection_mm.toFixed(2)} mm`
  );

  return {
    ok: true,
    value: {
      maxDeflection: maxDeflection_mm,
      maxDeflectionLocation: maxDeflectionLocation_m,
      maxShear: maxShear_kN,
      maxMoment: maxMoment_kNm,
      slopeAtEnds: {
        left: slopeLeft_rad,
        right: slopeRight_rad,
      },
      shearDiagram,
      momentDiagram,
      deflectionCurve,
      steps,
      units: {
        deflection: {
          mm: maxDeflection_mm,
          in: maxDeflection_mm / 25.4,
          cm: maxDeflection_mm / 10,
        },
        moment: {
          kNm: maxMoment_kNm,
          ftlb: maxMoment_kNm * 737.562, // kN·m → ft·lb
        },
        shear: {
          kN: maxShear_kN,
          lb: maxShear_kN * 224.809, // kN → lb
        },
      },
      deflectionRatios,
    },
  };
}
