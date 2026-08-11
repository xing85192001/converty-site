"use client";

interface CalculatorSkeletonProps {
  inputCount?: number;
  showResults?: boolean;
}

export function CalculatorSkeleton({
  inputCount = 3,
  showResults = true,
}: CalculatorSkeletonProps) {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Input field skeletons */}
      {Array.from({ length: inputCount }, (_, i) => i).map((i) => (
        <div key={`skeleton-input-${i}`} className="space-y-2">
          <div className="h-4 w-24 bg-muted rounded" />
          <div className="h-10 w-full bg-muted rounded" />
        </div>
      ))}

      {/* Results skeleton */}
      {showResults && (
        <div className="mt-8 space-y-4">
          <div className="h-6 w-32 bg-muted rounded" />
          <div className="grid grid-cols-2 gap-4">
            <div className="h-16 bg-muted rounded" />
            <div className="h-16 bg-muted rounded" />
          </div>
        </div>
      )}
    </div>
  );
}
