/**
 * Engineering material properties
 * Units documented for each property
 */
export interface Material {
  /** Unique identifier (kebab-case) */
  id: string;
  /** Display name */
  name: string;
  /** Material category for grouping */
  category: "Steel" | "Aluminum" | "Wood" | "Concrete" | "Other";
  /** Young's modulus (modulus of elasticity) in GPa */
  youngsModulus: number;
  /** Yield strength in MPa */
  yieldStrength: number;
  /** Ultimate tensile strength in MPa */
  ultimateStrength: number;
  /** Density in kg/m³ */
  density: number;
  /** Poisson's ratio (dimensionless) */
  poissonsRatio: number;
}

/**
 * Structural beam section properties
 * Based on AISC Steel Manual and timber standards
 */
export interface BeamSection {
  /** Unique identifier (kebab-case) */
  id: string;
  /** Display name (e.g., "W12×26") */
  name: string;
  /** Section type */
  type: "I-Beam" | "Channel" | "HSS" | "Angle" | "Pipe" | "Rectangular";
  /** Standard reference */
  standard: "AISC" | "Timber" | "Metric";
  /** Overall depth in inches */
  depth: number;
  /** Overall width in inches */
  width: number;
  /** Web thickness in inches (0 for rectangular) */
  webThickness: number;
  /** Flange thickness in inches (0 for rectangular) */
  flangeThickness: number;
  /** Cross-sectional area in in² */
  area: number;
  /** Moment of inertia about X-axis (strong axis) in in⁴ */
  momentOfInertiaX: number;
  /** Moment of inertia about Y-axis (weak axis) in in⁴ */
  momentOfInertiaY: number;
  /** Section modulus about X-axis in in³ */
  sectionModulusX: number;
  /** Section modulus about Y-axis in in³ */
  sectionModulusY: number;
  /** Weight per linear foot in lb/ft */
  weight: number;
}

/**
 * Pipe material properties for pressure drop calculations
 * Roughness values from Moody chart / Darcy-Weisbach convention
 */
export interface PipeMaterial {
  /** Unique identifier (kebab-case) */
  id: string;
  /** Display name */
  name: string;
  /** Material category for grouping */
  category: string;
  /** Absolute roughness (Darcy-Weisbach) in mm */
  roughness: number;
  /** Maximum working pressure in bar */
  maxPressure: number;
  /** Maximum operating temperature in celsius */
  maxTemperature: number;
  /** Pipe material density in kg/m³ */
  density: number;
}

/**
 * Fluid properties for hydraulic calculations
 * Properties at specified reference temperature
 */
export interface FluidProperties {
  /** Unique identifier (kebab-case) */
  id: string;
  /** Display name including temperature reference */
  name: string;
  /** Fluid category for grouping */
  category: string;
  /** Density in kg/m³ */
  density: number;
  /** Dynamic (absolute) viscosity in Pa·s */
  dynamicViscosity: number;
  /** Kinematic viscosity in m²/s */
  kinematicViscosity: number;
  /** Reference temperature in celsius */
  temperature: number;
  /** Specific heat capacity in J/(kg·K) */
  specificHeat: number;
}
