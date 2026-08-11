"use client";

import type React from "react";
import { ErrorBoundary } from "react-error-boundary";
import { CalculatorErrorFallback } from "./calculator-error-fallback";

interface CalculatorErrorBoundaryProps {
  children: React.ReactNode;
}

export function CalculatorErrorBoundary({ children }: CalculatorErrorBoundaryProps) {
  return <ErrorBoundary FallbackComponent={CalculatorErrorFallback}>{children}</ErrorBoundary>;
}
