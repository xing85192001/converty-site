/**
 * Periodic Table Grid Visualization
 * 18-column grid layout for 118 elements
 */

import { useTranslations } from "next-intl";
import type { Element } from "@/lib/converters/chemistry/periodic-table-lookup";

interface PeriodicTableGridProps {
  elements: Element[];
  selectedElement: Element | null;
  onSelectElement: (element: Element) => void;
}

// Category color mapping
const categoryColors: Record<string, string> = {
  "alkali metal": "bg-red-500/20 border-red-500/40 hover:bg-red-500/30",
  "alkaline earth metal": "bg-orange-500/20 border-orange-500/40 hover:bg-orange-500/30",
  "transition metal": "bg-yellow-500/20 border-yellow-500/40 hover:bg-yellow-500/30",
  "post-transition metal": "bg-lime-500/20 border-lime-500/40 hover:bg-lime-500/30",
  metalloid: "bg-green-500/20 border-green-500/40 hover:bg-green-500/30",
  nonmetal: "bg-cyan-500/20 border-cyan-500/40 hover:bg-cyan-500/30",
  halogen: "bg-blue-500/20 border-blue-500/40 hover:bg-blue-500/30",
  "noble gas": "bg-purple-500/20 border-purple-500/40 hover:bg-purple-500/30",
  lanthanide: "bg-pink-500/20 border-pink-500/40 hover:bg-pink-500/30",
  actinide: "bg-rose-500/20 border-rose-500/40 hover:bg-rose-500/30",
};

export function PeriodicTableGrid({
  elements,
  selectedElement,
  onSelectElement,
}: PeriodicTableGridProps) {
  const t = useTranslations("calculator.chemistry");

  // Create a map of elements by position
  const elementMap = new Map<string, Element>();
  elements.forEach((element) => {
    if (element.period && element.group) {
      const key = `${element.period}-${element.group}`;
      elementMap.set(key, element);
    }
  });

  // Lanthanides and actinides (separate rows)
  const lanthanides = elements
    .filter((e) => e.category === "lanthanide")
    .sort((a, b) => a.atomicNumber - b.atomicNumber);

  const actinides = elements
    .filter((e) => e.category === "actinide")
    .sort((a, b) => a.atomicNumber - b.atomicNumber);

  const renderElement = (element: Element | undefined, isPlaceholder = false) => {
    if (!element) {
      return <div className="aspect-square" />;
    }

    const isSelected = selectedElement?.atomicNumber === element.atomicNumber;
    const colorClass = categoryColors[element.category] || "bg-muted/20 border-muted-foreground/20";

    return (
      <button
        onClick={() => onSelectElement(element)}
        className={`
          aspect-square border rounded-md transition-all p-1 flex flex-col items-center justify-center
          ${colorClass}
          ${isSelected ? "ring-2 ring-primary scale-105" : ""}
          ${isPlaceholder ? "opacity-50" : "cursor-pointer"}
        `}
        disabled={isPlaceholder}
      >
        <div className="text-[8px] sm:text-[10px] font-medium opacity-70">
          {element.atomicNumber}
        </div>
        <div className="text-xs sm:text-sm md:text-base font-bold">{element.symbol}</div>
        <div className="text-[6px] sm:text-[8px] truncate max-w-full px-0.5 hidden sm:block">
          {element.name}
        </div>
      </button>
    );
  };

  return (
    <div className="space-y-4">
      {/* Main periodic table (periods 1-7, groups 1-18) */}
      <div className="overflow-x-auto pb-4">
        <div className="min-w-[800px]">
          {/* Grid with 18 columns */}
          <div className="grid grid-cols-18 gap-0.5 sm:gap-1">
            {/* Period 1: H and He only */}
            {renderElement(elementMap.get("1-1"))}
            {Array.from({ length: 16 }, (_, i) => (
              <div key={`p1-empty-${i}`} className="aspect-square" />
            ))}
            {renderElement(elementMap.get("1-18"))}

            {/* Period 2: Li to Ne */}
            {renderElement(elementMap.get("2-1"))}
            {renderElement(elementMap.get("2-2"))}
            {Array.from({ length: 10 }, (_, i) => (
              <div key={`p2-empty-${i}`} className="aspect-square" />
            ))}
            {Array.from({ length: 6 }, (_, i) => renderElement(elementMap.get(`2-${i + 13}`)))}

            {/* Period 3: Na to Ar */}
            {renderElement(elementMap.get("3-1"))}
            {renderElement(elementMap.get("3-2"))}
            {Array.from({ length: 10 }, (_, i) => (
              <div key={`p3-empty-${i}`} className="aspect-square" />
            ))}
            {Array.from({ length: 6 }, (_, i) => renderElement(elementMap.get(`3-${i + 13}`)))}

            {/* Period 4: K to Kr */}
            {Array.from({ length: 18 }, (_, i) => renderElement(elementMap.get(`4-${i + 1}`)))}

            {/* Period 5: Rb to Xe */}
            {Array.from({ length: 18 }, (_, i) => renderElement(elementMap.get(`5-${i + 1}`)))}

            {/* Period 6: Cs to Rn (with lanthanide placeholder at group 3) */}
            {Array.from({ length: 18 }, (_, group) => {
              if (group === 2) {
                // Group 3 placeholder for lanthanides
                const la = elements.find((e) => e.symbol === "La");
                return renderElement(la, true);
              }
              return renderElement(elementMap.get(`6-${group + 1}`));
            })}

            {/* Period 7: Fr to Og (with actinide placeholder at group 3) */}
            {Array.from({ length: 18 }, (_, group) => {
              if (group === 2) {
                // Group 3 placeholder for actinides
                const ac = elements.find((e) => e.symbol === "Ac");
                return renderElement(ac, true);
              }
              return renderElement(elementMap.get(`7-${group + 1}`));
            })}
          </div>

          {/* Lanthanides row */}
          <div className="mt-4 ml-[calc(2*100%/18)] grid grid-cols-15 gap-0.5 sm:gap-1">
            {lanthanides.map((element) => (
              <div key={element.atomicNumber}>{renderElement(element)}</div>
            ))}
          </div>

          {/* Actinides row */}
          <div className="ml-[calc(2*100%/18)] grid grid-cols-15 gap-0.5 sm:gap-1">
            {actinides.map((element) => (
              <div key={element.atomicNumber}>{renderElement(element)}</div>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="border rounded-lg p-4">
        <p className="text-sm font-medium mb-3">{t("categoryLegend")}</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 text-xs">
          {Object.entries(categoryColors).map(([category, colorClass]) => (
            <div key={category} className="flex items-center gap-2">
              <div className={`w-4 h-4 border rounded ${colorClass}`} />
              <span className="capitalize">{t(`categories.${category.replace(/\s+/g, "-")}`)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Mobile view note */}
      <p className="text-xs text-muted-foreground text-center sm:hidden">{t("scrollHint")}</p>
    </div>
  );
}
