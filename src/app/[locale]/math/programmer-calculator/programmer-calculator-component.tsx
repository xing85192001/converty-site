"use client";

import { useTranslations } from "next-intl";
import { InputField, ResultGrid } from "@/components/converter";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BASE_OPTIONS,
  type Base,
  type BitwiseOp,
  calculateProgrammerCalculator,
  type ProgrammerCalculatorInput,
  type ProgrammerCalculatorResult,
  type ShiftDir,
} from "@/lib/converters/math/programmer-calculator";
import { createCalculatorStore } from "@/stores/calculator-store";

interface FormValues {
  a: string;
  aBase: Base;
  b: string;
  bBase: Base;
  bitwiseOp: BitwiseOp;
  shiftDir: ShiftDir;
  shiftAmount: number;
}

const useProgrammerCalculatorStore = createCalculatorStore<FormValues, ProgrammerCalculatorResult>({
  name: "programmer-calculator",
  initialValues: {
    a: "255",
    aBase: "dec",
    b: "15",
    bBase: "dec",
    bitwiseOp: "xor",
    shiftDir: "left",
    shiftAmount: 1,
  },
  calculate: (vals) => calculateProgrammerCalculator(vals as ProgrammerCalculatorInput),
});

function repRows(rep: { dec: string; hex: string; oct: string; bin: string }) {
  return [
    { label: "Dec", value: rep.dec },
    { label: "Hex", value: rep.hex },
    { label: "Oct", value: rep.oct },
    { label: "Bin", value: rep.bin },
  ];
}

export function ProgrammerCalculatorComponent() {
  const t = useTranslations("converter.programmer-calculator");
  const { values, setValue, result } = useProgrammerCalculatorStore();

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>{t("valueA")}</Label>
          <div className="flex gap-2">
            <InputField
              id="a"
              label=""
              type="text"
              value={values.a}
              onChange={(v) => setValue("a", v)}
            />
            <Select value={values.aBase} onValueChange={(b) => setValue("aBase", b as Base)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {BASE_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="space-y-2">
          <Label>{t("valueB")}</Label>
          <div className="flex gap-2">
            <InputField
              id="b"
              label=""
              type="text"
              value={values.b}
              onChange={(v) => setValue("b", v)}
            />
            <Select value={values.bBase} onValueChange={(b) => setValue("bBase", b as Base)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {BASE_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>{t("bitwise")}</Label>
          <Select
            value={values.bitwiseOp}
            onValueChange={(o) => setValue("bitwiseOp", o as BitwiseOp)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">{t("none")}</SelectItem>
              <SelectItem value="and">AND</SelectItem>
              <SelectItem value="or">OR</SelectItem>
              <SelectItem value="xor">XOR</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>{t("shift")}</Label>
          <div className="flex gap-2">
            <Select
              value={values.shiftDir}
              onValueChange={(s) => setValue("shiftDir", s as ShiftDir)}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">{t("none")}</SelectItem>
                <SelectItem value="left">{t("left")}</SelectItem>
                <SelectItem value="right">{t("right")}</SelectItem>
              </SelectContent>
            </Select>
            <InputField
              id="shiftAmount"
              label=""
              type="number"
              value={values.shiftAmount}
              onChange={(v) => setValue("shiftAmount", Number(v))}
            />
          </div>
        </div>
      </div>

      {result && (
        <div className="space-y-4">
          <p className="text-sm font-medium">{t("reprA")}</p>
          <ResultGrid results={repRows(result.a)} columns={4} />
          <p className="text-sm font-medium">{t("reprB")}</p>
          <ResultGrid results={repRows(result.b)} columns={4} />
          <p className="text-sm font-medium">NOT A</p>
          <ResultGrid results={repRows(result.not)} columns={4} />
          {result.bitwise && (
            <>
              <p className="text-sm font-medium">A {values.bitwiseOp.toUpperCase()} B</p>
              <ResultGrid results={repRows(result.bitwise)} columns={4} />
            </>
          )}
          {result.shifted && (
            <>
              <p className="text-sm font-medium">
                A {values.shiftDir === "left" ? "<<" : ">>"} {values.shiftAmount}
              </p>
              <ResultGrid results={repRows(result.shifted)} columns={4} />
            </>
          )}
        </div>
      )}
    </div>
  );
}
