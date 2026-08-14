import fluidsData from "@/data/engineering/fluids.json";
import pipeMaterialsData from "@/data/engineering/pipe-materials.json";
import type { CalcStep } from "@/lib/calc-step";
import type { CalculationResult } from "@/types";
import type { FluidProperties, PipeMaterial } from "./types";

/**
 * Input for pipe flow / pressure drop calculations
 */
export interface PipeFlowInput {
  /** Pipe inner diameter in mm */
  diameter: number;
  /** Pipe length in m */
  length: number;
  /** Flow velocity in m/s */
  velocity: number;
  /** Pipe material ID from database */
  pipeMaterialId: string;
  /** Fluid ID from database */
  fluidId: string;
  /** Custom pipe roughness in mm (used if no material selected) */
  customRoughness: number;
  /** Custom fluid density in kg/m³ (used if no fluid selected) */
  customDensity: number;
  /** Custom dynamic viscosity in Pa·s (used if no fluid selected) */
  customViscosity: number;
}

/**
 * Result of pipe flow calculations
 */
export interface PipeFlowResult {
  /** Reynolds number (dimensionless) */
  reynoldsNumber: number;
  /** Flow regime */
  flowRegime: "laminar" | "transitional" | "turbulent";
  /** Darcy friction factor (dimensionless) */
  frictionFactor: number;
  /** Pressure drop in Pa */
  pressureDrop: number;
  /** Pressure drop in bar */
  pressureDropBar: number;
  /** Head loss in m */
  headLoss: number;
  /** Flow rate in m³/s */
  flowRate: number;
  /** Flow rate in L/min */
  flowRateLpm: number;
  /** Relative roughness ε/D (dimensionless) */
  relativeRoughness: number;
  /** Pipe material name */
  pipeMaterialName: string | null;
  /** Fluid name */
  fluidName: string | null;
  /** Iterations for Colebrook-White convergence */
  iterations: number;
  /** Step-by-step calculation breakdown */
  steps: CalcStep[];
  /** Pressure in additional units */
  pressureUnits: {
    pa: number;
    kpa: number;
    bar: number;
    psi: number;
    mH2O: number;
  };
}

/**
 * Calculate pipe flow pressure drop using Darcy-Weisbach equation
 *
 * Formula references:
 * - Reynolds number: Re = ρvD/μ
 * - Darcy-Weisbach: ΔP = f(L/D)(ρv²/2)
 * - Laminar (Re < 2300): f = 64/Re
 * - Turbulent: Colebrook-White equation (implicit, iterative)
 *   1/√f = -2 log₁₀(ε/(3.7D) + 2.51/(Re√f))
 * - Swamee-Jain (explicit approximation for initial guess):
 *   f = 0.25 / [log₁₀(ε/(3.7D) + 5.74/Re⁰·⁹)]²
 * - Head loss: hL = ΔP/(ρg)
 */
export function calculatePipeFlow(input: PipeFlowInput): CalculationResult<PipeFlowResult> {
  const {
    diameter,
    length,
    velocity,
    pipeMaterialId,
    fluidId,
    customRoughness,
    customDensity,
    customViscosity,
  } = input;

  // Validation
  if (diameter <= 0 || length <= 0 || velocity <= 0) {
    return {
      ok: false,
      error: "Diameter, length, and velocity must be positive",
      code: "INVALID_INPUT",
    };
  }

  const steps: CalcStep[] = [];

  // Get pipe material properties
  let roughness_mm = customRoughness;
  let pipeMaterialName: string | null = null;

  if (pipeMaterialId) {
    const pipeMat = getPipeMaterialById(pipeMaterialId);
    if (pipeMat) {
      roughness_mm = pipeMat.roughness;
      pipeMaterialName = pipeMat.name;
      steps.push({
        key: "pipeMaterialInfo",
        params: { name: pipeMat.name, roughness: roughness_mm },
      });
    }
  }

  // Get fluid properties
  let density = customDensity;
  let viscosity = customViscosity;
  let fluidName: string | null = null;

  if (fluidId) {
    const fluid = getFluidById(fluidId);
    if (fluid) {
      density = fluid.density;
      viscosity = fluid.dynamicViscosity;
      fluidName = fluid.name;
      steps.push({
        key: "fluidInfo",
        params: { name: fluid.name, density, viscosity },
      });
    }
  }

  if (roughness_mm < 0 || density <= 0 || viscosity <= 0) {
    return {
      ok: false,
      error: "Roughness must be non-negative; density and viscosity must be positive",
      code: "INVALID_INPUT",
    };
  }

  const D_m = diameter / 1000; // mm → m

  steps.push({ key: "givenTitle" });
  steps.push({ key: "givenDiameter", params: { diameter, D_m } });
  steps.push({ key: "givenLength", params: { length } });
  steps.push({ key: "givenVelocity", params: { velocity } });

  // Reynolds number: Re = ρvD/μ
  const Re = (density * velocity * D_m) / viscosity;
  steps.push({
    key: "reynoldsNumber",
    params: { density, velocity, D_m, viscosity, re: Re.toFixed(0) },
  });

  // Determine flow regime
  let flowRegime: "laminar" | "transitional" | "turbulent";
  if (Re < 2300) {
    flowRegime = "laminar";
    steps.push({ key: "flowRegimeLaminar", params: { re: Re.toFixed(0) } });
  } else if (Re < 4000) {
    flowRegime = "transitional";
    steps.push({ key: "flowRegimeTransitional", params: { re: Re.toFixed(0) } });
  } else {
    flowRegime = "turbulent";
    steps.push({ key: "flowRegimeTurbulent", params: { re: Re.toFixed(0) } });
  }

  // Relative roughness
  const epsilon_m = roughness_mm / 1000; // mm → m
  const relativeRoughness = epsilon_m / D_m;
  steps.push({
    key: "relativeRoughness",
    params: {
      epsilon: epsilon_m.toExponential(3),
      D_m,
      value: relativeRoughness.toExponential(4),
    },
  });

  // Calculate friction factor
  let f: number;
  let iterations = 0;

  if (Re < 2300) {
    // Laminar flow: f = 64/Re
    f = 64 / Re;
    steps.push({
      key: "frictionFactorLaminar",
      params: { re: Re.toFixed(0), f: f.toFixed(6) },
    });
  } else {
    // Turbulent flow: Colebrook-White iterative solution
    // Initial guess: Swamee-Jain approximation
    const sj_term = relativeRoughness / 3.7 + 5.74 / Re ** 0.9;
    f = 0.25 / Math.log10(sj_term) ** 2;
    steps.push({ key: "swameeJainInitial", params: { f: f.toFixed(6) } });

    // Iterative Colebrook-White: 1/√f = -2 log₁₀(ε/(3.7D) + 2.51/(Re√f))
    const MAX_ITER = 50;
    const TOLERANCE = 1e-8;

    for (let i = 0; i < MAX_ITER; i++) {
      iterations = i + 1;
      const sqrt_f = Math.sqrt(f);
      const rhs = -2 * Math.log10(relativeRoughness / 3.7 + 2.51 / (Re * sqrt_f));
      const f_new = 1 / (rhs * rhs);

      if (Math.abs(f_new - f) < TOLERANCE) {
        f = f_new;
        break;
      }
      f = f_new;
    }

    steps.push({
      key: "colebrookConverged",
      params: { f: f.toFixed(6), iterations },
    });
  }

  // Darcy-Weisbach: ΔP = f × (L/D) × (ρv²/2)
  const pressureDrop = f * (length / D_m) * ((density * velocity * velocity) / 2);
  steps.push({
    key: "pressureDrop",
    params: {
      f: f.toFixed(6),
      length,
      D_m,
      density,
      velocity,
      pressureDrop: pressureDrop.toFixed(1),
    },
  });

  // Head loss: hL = ΔP/(ρg)
  const g = 9.80665; // m/s²
  const headLoss = pressureDrop / (density * g);
  steps.push({
    key: "headLoss",
    params: {
      pressureDrop: pressureDrop.toFixed(1),
      density,
      g,
      headLoss: headLoss.toFixed(3),
    },
  });

  // Flow rate
  const A_m2 = (Math.PI * D_m * D_m) / 4;
  const flowRate = velocity * A_m2; // m³/s
  const flowRateLpm = flowRate * 60000; // m³/s → L/min
  steps.push({
    key: "flowRate",
    params: {
      velocity,
      area: A_m2.toExponential(4),
      flowRate: flowRate.toExponential(4),
      flowRateLpm: flowRateLpm.toFixed(1),
    },
  });

  // Pressure in multiple units
  const pressureUnits = {
    pa: pressureDrop,
    kpa: pressureDrop / 1000,
    bar: pressureDrop / 100000,
    psi: pressureDrop * 0.000145038, // 1 Pa = 0.000145038 psi
    mH2O: headLoss,
  };

  return {
    ok: true,
    value: {
      reynoldsNumber: Re,
      flowRegime,
      frictionFactor: f,
      pressureDrop,
      pressureDropBar: pressureDrop / 100000,
      headLoss,
      flowRate,
      flowRateLpm,
      relativeRoughness,
      pipeMaterialName,
      fluidName,
      iterations,
      steps,
      pressureUnits,
    },
  };
}

/**
 * Get all available pipe materials
 */
export function getPipeMaterials(): PipeMaterial[] {
  return pipeMaterialsData as PipeMaterial[];
}

/**
 * Get pipe material by ID
 */
export function getPipeMaterialById(id: string): PipeMaterial | undefined {
  return getPipeMaterials().find((m) => m.id === id);
}

/**
 * Get all available fluids
 */
export function getFluids(): FluidProperties[] {
  return fluidsData as FluidProperties[];
}

/**
 * Get fluid by ID
 */
export function getFluidById(id: string): FluidProperties | undefined {
  return getFluids().find((f) => f.id === id);
}
