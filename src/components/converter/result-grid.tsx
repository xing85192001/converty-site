import { cn } from "@/lib/utils";

interface ResultItem {
  label: string;
  value: string | number;
  unit?: string;
}

interface ResultGridProps {
  results: ResultItem[];
  columns?: 2 | 3 | 4;
  className?: string;
}

export function ResultGrid({ results, columns = 2, className }: ResultGridProps) {
  return (
    <div
      className={cn(
        "grid gap-4",
        columns === 2 && "grid-cols-1 sm:grid-cols-2",
        columns === 3 && "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
        columns === 4 && "grid-cols-2 sm:grid-cols-4",
        className
      )}
    >
      {results.map((result) => (
        <div key={result.label} className="rounded-lg border bg-card p-4 text-card-foreground">
          <p className="text-sm font-medium text-muted-foreground mb-1">{result.label}</p>
          <p className="text-lg font-semibold font-mono">
            {result.value}
            {result.unit && (
              <span className="ml-1 text-sm font-normal text-muted-foreground">{result.unit}</span>
            )}
          </p>
        </div>
      ))}
    </div>
  );
}
