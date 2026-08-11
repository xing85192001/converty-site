/**
 * Periodic table element
 */
export interface Element {
  atomicNumber: number;
  symbol: string;
  name: string;
  atomicMass: number;
  group: number;
  period: number;
  block: "s" | "p" | "d" | "f";
  category:
    | "nonmetal"
    | "noble gas"
    | "alkali metal"
    | "alkaline earth metal"
    | "metalloid"
    | "halogen"
    | "post-transition metal"
    | "transition metal"
    | "lanthanide"
    | "actinide";
  electronConfiguration?: string;
  oxidationStates?: string;
  electronegativity?: number;
  density?: number;
  meltingPoint?: number;
  boilingPoint?: number;
  metalType?: "metal" | "nonmetal" | "metalloid";
}

/**
 * Common chemical compound
 */
export interface Compound {
  id: string;
  name: string;
  formula: string;
  category:
    | "Solvent"
    | "Salt"
    | "Acid"
    | "Base"
    | "Organic"
    | "Gas"
    | "Oxide"
    | "Hydrate"
    | "Peroxide";
}

/**
 * Element composition in a compound
 * Maps element symbol to count
 */
export interface ElementComposition {
  [symbol: string]: number;
}
