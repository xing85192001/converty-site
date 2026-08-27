"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export interface UnitOption {
  value: string;
  label: string;
}

interface InputFieldProps {
  id: string;
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  unit?: string;
  units?: UnitOption[];
  selectedUnit?: string;
  onUnitChange?: (unit: string) => void;
  type?: "text" | "number" | "date" | "time" | "datetime-local";
  min?: number | string;
  max?: number | string;
  step?: number | string;
  placeholder?: string;
  helperText?: string;
  error?: string;
  className?: string;
}

export function InputField({
  id,
  label,
  value,
  onChange,
  unit,
  units,
  selectedUnit,
  onUnitChange,
  type = "number",
  min,
  max,
  step,
  placeholder,
  helperText,
  error,
  className,
}: InputFieldProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={id}>{label}</Label>
      <div className="flex gap-2">
        <Input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          min={min}
          max={max}
          step={step}
          placeholder={placeholder}
          className={cn(error && "border-destructive")}
        />
        {units && onUnitChange ? (
          <Select value={selectedUnit} onValueChange={onUnitChange}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {units.map((u) => (
                <SelectItem key={u.value} value={u.value}>
                  {u.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : unit ? (
          <span className="flex items-center px-3 text-sm text-muted-foreground bg-muted rounded-md border min-w-[60px] justify-center">
            {unit}
          </span>
        ) : null}
      </div>
      {helperText && !error && <p className="text-sm text-muted-foreground">{helperText}</p>}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
