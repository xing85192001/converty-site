import {
  Atom,
  Bitcoin,
  Calculator,
  Calendar,
  Camera,
  Car,
  Database,
  DollarSign,
  FlaskConical,
  Globe,
  Hammer,
  Heart,
  Home,
  type LucideIcon,
  Music,
  Network,
  Palette,
  Server,
  UtensilsCrossed,
  Video,
} from "lucide-react";

export interface Subcategory {
  id: string;
  name: string;
  description?: string;
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon: LucideIcon;
  subcategories?: Subcategory[];
}

export const categories: Category[] = [
  {
    id: "color",
    slug: "color",
    name: "Color",
    description: "Color conversion and palettes",
    icon: Palette,
  },
  {
    id: "cooking",
    slug: "cooking",
    name: "Cooking",
    description: "Recipe scaling and nutrition calculators",
    icon: UtensilsCrossed,
    subcategories: [
      { id: "units", name: "Unit Conversion" },
      { id: "recipes", name: "Recipe Tools" },
      { id: "nutrition", name: "Nutrition" },
      { id: "cost", name: "Food Cost" },
    ],
  },
  {
    id: "automotive",
    slug: "automotive",
    name: "Automotive",
    description: "Vehicle calculators for fuel, tires, maintenance, and financing",
    icon: Car,
    subcategories: [
      { id: "fuel", name: "Fuel & Efficiency" },
      { id: "tires", name: "Tires & Wheels" },
      { id: "maintenance", name: "Maintenance" },
      { id: "financing", name: "Financing" },
    ],
  },
  {
    id: "chemistry",
    slug: "chemistry",
    name: "Chemistry",
    description: "Chemical calculations and molecular tools",
    icon: FlaskConical,
    subcategories: [
      { id: "general", name: "General", description: "Basic chemistry calculations" },
      { id: "solutions", name: "Solutions", description: "Solution concentration and dilution" },
      { id: "reactions", name: "Reactions", description: "Chemical reactions and stoichiometry" },
      { id: "reference", name: "Reference", description: "Periodic table and compound data" },
    ],
  },
  {
    id: "crypto",
    slug: "crypto",
    name: "Crypto",
    description: "Cryptocurrency and blockchain tools",
    icon: Bitcoin,
    subcategories: [
      { id: "hashing", name: "Hashing" },
      { id: "wallet", name: "Wallet" },
      { id: "exchange", name: "Exchange" },
      { id: "mining", name: "Mining" },
    ],
  },
  {
    id: "data",
    slug: "data",
    name: "Data",
    description: "Bandwidth and file size calculators",
    icon: Database,
    subcategories: [
      { id: "storage", name: "Storage & Files", description: "File size and data storage" },
      { id: "network", name: "Network", description: "Bandwidth, throughput, and network tools" },
    ],
  },
  {
    id: "datetime",
    slug: "datetime",
    name: "Date & Time",
    description: "Date, time, and duration calculators",
    icon: Calendar,
    subcategories: [
      { id: "date-time", name: "Date & Time", description: "Date and time calculations" },
    ],
  },
  {
    id: "engineering",
    slug: "engineering",
    name: "Engineering",
    description: "Structural calculations, material properties, and beam analysis",
    icon: Hammer,
    subcategories: [
      { id: "structural", name: "Structural", description: "Beam and structural calculations" },
      {
        id: "materials",
        name: "Materials",
        description: "Material properties and stress analysis",
      },
      { id: "hydraulics", name: "Hydraulics", description: "Fluid flow and pipe calculations" },
      { id: "conversion", name: "Conversion", description: "Engineering unit conversion" },
    ],
  },
  {
    id: "finance",
    slug: "finance",
    name: "Finance",
    description: "Financial calculators and converters",
    icon: DollarSign,
    subcategories: [
      { id: "loans", name: "Loans & Mortgages", description: "Mortgage, auto, personal loans" },
      { id: "interest", name: "Interest & APR", description: "Interest rate calculations" },
      { id: "investments", name: "Retirement & Investments", description: "Investment planning" },
      { id: "taxes", name: "Income & Taxes", description: "Tax calculators" },
      { id: "business", name: "Business", description: "Profit, break-even, margins" },
      { id: "everyday", name: "Everyday", description: "Tips, discounts, shopping" },
      { id: "conversion", name: "Conversion", description: "Currency and unit conversion" },
    ],
  },
  {
    id: "realestate",
    slug: "realestate",
    name: "Real Estate",
    description: "Property valuation and mortgage calculators",
    icon: Home,
    subcategories: [
      { id: "loans", name: "Loans & Mortgages", description: "Swiss mortgage calculators" },
      { id: "valuation", name: "Property Valuation", description: "Property value assessment" },
      { id: "investment", name: "Investment Analysis", description: "Rental yield and ROI" },
    ],
  },
  {
    id: "health",
    slug: "health",
    name: "Health",
    description: "Health and fitness calculators",
    icon: Heart,
    subcategories: [
      { id: "body", name: "Body Composition", description: "BMI, body fat, ideal weight" },
      { id: "nutrition", name: "Nutrition", description: "Calories, macros, diet" },
      { id: "fitness", name: "Fitness", description: "Exercise and workout calculators" },
      { id: "pregnancy", name: "Pregnancy & Fertility", description: "Pregnancy tracking" },
      { id: "medical", name: "Medical", description: "Medical calculators" },
    ],
  },
  {
    id: "infrastructure",
    slug: "infrastructure",
    name: "Infrastructure",
    description: "Virtualization, Kubernetes, and datacenter tools",
    icon: Server,
    subcategories: [
      { id: "vmware", name: "VMware", description: "vSphere and ESX calculators" },
      { id: "hyperv", name: "Hyper-V", description: "Microsoft Hyper-V and Windows Server" },
      { id: "kubernetes", name: "Kubernetes", description: "K8s capacity planning" },
      { id: "cost", name: "Cost Analysis", description: "TCO and licensing calculators" },
      {
        id: "cpu",
        name: "CPU Performance",
        description: "CPU benchmarks and server refresh planning",
      },
    ],
  },
  {
    id: "math",
    slug: "math",
    name: "Math",
    description: "Mathematical calculators",
    icon: Calculator,
    subcategories: [
      { id: "basic", name: "Basic Math", description: "Basic arithmetic operations" },
      { id: "algebra", name: "Algebra", description: "Algebraic calculations" },
      { id: "geometry", name: "Geometry", description: "Shapes and measurements" },
      { id: "statistics", name: "Statistics", description: "Statistical analysis" },
      { id: "numbers", name: "Number Systems", description: "Binary, hex, and more" },
      { id: "advanced", name: "Advanced", description: "Advanced mathematics" },
    ],
  },
  {
    id: "music",
    slug: "music",
    name: "Music",
    description: "Music theory and audio tools",
    icon: Music,
  },
  {
    id: "network",
    slug: "network",
    name: "Network",
    description: "Network calculators and IP address tools",
    icon: Network,
    subcategories: [
      { id: "subnet", name: "Subnetting", description: "Subnet and CIDR calculators" },
      { id: "ip", name: "IP Address", description: "IP address tools and utilities" },
    ],
  },
  {
    id: "photo",
    slug: "photo",
    name: "Photo",
    description: "Photography calculators",
    icon: Camera,
    subcategories: [
      { id: "dof", name: "Depth of Field", description: "DoF and focus calculations" },
      { id: "exposure", name: "Exposure & Light", description: "Exposure values and lighting" },
      { id: "resolution", name: "Resolution & Format", description: "Pixels, DPI, and formats" },
      { id: "composition", name: "Composition & Framing", description: "Framing and lens tools" },
      { id: "astro", name: "Astrophotography", description: "Night sky and star photography" },
      { id: "optics", name: "Optics", description: "Diffraction and optical effects" },
    ],
  },
  {
    id: "physics",
    slug: "physics",
    name: "Physics",
    description: "Physics and unit converters",
    icon: Atom,
  },
  {
    id: "video",
    slug: "video",
    name: "Video",
    description: "Video and media calculators",
    icon: Video,
  },
  {
    id: "web",
    slug: "web",
    name: "Web",
    description: "Web development tools",
    icon: Globe,
  },
];

export function getCategoryById(id: string): Category | undefined {
  return categories.find((c) => c.id === id);
}

export function getCategoryBySlug(slug: string): Category | undefined {
  return categories.find((c) => c.slug === slug);
}

export function getSubcategoryById(
  categoryId: string,
  subcategoryId: string
): Subcategory | undefined {
  const category = getCategoryById(categoryId);
  return category?.subcategories?.find((s) => s.id === subcategoryId);
}

export function getSubcategoriesByCategoryId(categoryId: string): Subcategory[] {
  const category = getCategoryById(categoryId);
  return category?.subcategories ?? [];
}
