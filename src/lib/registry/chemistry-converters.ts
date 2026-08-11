import { Beaker, Droplet, FlaskConical, FlaskRound, type LucideIcon, Table2 } from "lucide-react";

export interface ConverterMeta {
  id: string;
  slug: string;
  category: string;
  subcategory?: string;
  keywords: string[];
  icon: LucideIcon;
  featured?: boolean;
}

export const chemistryConverters: Record<string, ConverterMeta> = {
  "molecular-weight": {
    id: "molecular-weight",
    slug: "molecular-weight",
    category: "chemistry",
    subcategory: "general",
    keywords: ["molecular", "weight", "molar", "mass", "formula", "compound", "chemistry"],
    icon: FlaskRound,
    featured: false,
  },
  molarity: {
    id: "molarity",
    slug: "molarity",
    category: "chemistry",
    subcategory: "solutions",
    keywords: ["molarity", "concentration", "molar", "solution", "moles", "chemistry"],
    icon: Beaker,
    featured: false,
  },
  dilution: {
    id: "dilution",
    slug: "dilution",
    category: "chemistry",
    subcategory: "solutions",
    keywords: ["dilution", "concentration", "solution", "chemistry", "serial", "dilute"],
    icon: Droplet,
    featured: false,
  },
  stoichiometry: {
    id: "stoichiometry",
    slug: "stoichiometry",
    category: "chemistry",
    subcategory: "reactions",
    keywords: ["stoichiometry", "limiting", "reactant", "yield", "reaction", "chemistry", "moles"],
    icon: FlaskConical,
    featured: false,
  },
  "ph-calculator": {
    id: "ph-calculator",
    slug: "ph-calculator",
    category: "chemistry",
    subcategory: "solutions",
    keywords: ["ph", "poh", "acid", "base", "buffer", "henderson", "hasselbalch", "chemistry"],
    icon: Beaker,
    featured: false,
  },
  "periodic-table": {
    id: "periodic-table",
    slug: "periodic-table",
    category: "chemistry",
    subcategory: "reference",
    keywords: ["periodic", "table", "elements", "chemistry", "atomic", "number", "reference"],
    icon: Table2,
    featured: false,
  },
};
