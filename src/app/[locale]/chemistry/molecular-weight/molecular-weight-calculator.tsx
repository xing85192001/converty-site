"use client";

import { useTranslations } from "next-intl";
import { InputField, OutputDisplay } from "@/components/converter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import commonCompounds from "@/data/chemistry/common-compounds.json";
import {
  calculateMolecularWeight,
  type MolecularWeightInput,
  type MolecularWeightResult,
} from "@/lib/converters/chemistry/molecular-weight";
import { createCalculatorStore } from "@/stores/calculator-store";

const useMolecularWeightStore = createCalculatorStore<MolecularWeightInput, MolecularWeightResult>({
  name: "molecular-weight",
  initialValues: {
    formula: "H2O",
  },
  calculate: calculateMolecularWeight,
});

export default function MolecularWeightCalculator() {
  const t = useTranslations("calculator.chemistry");
  const tSections = useTranslations("calculator.sections");

  const { values, setValue, result, calculationError } = useMolecularWeightStore();

  const handleCompoundChange = (compoundId: string) => {
    if (compoundId === "custom") return;
    const compound = commonCompounds.find((c) => c.id === compoundId);
    if (compound) {
      setValue("formula", compound.formula);
    }
  };

  return (
    <div className="space-y-6">
      {/* Common Compounds */}
      <Card>
        <CardHeader>
          <CardTitle>{t("commonCompounds")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="compound">{t("selectCompound")}</Label>
            <Select onValueChange={handleCompoundChange}>
              <SelectTrigger id="compound">
                <SelectValue placeholder={t("customFormula")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="custom">{t("customFormula")}</SelectItem>
                {commonCompounds.map((compound) => (
                  <SelectItem key={compound.id} value={compound.id}>
                    {compound.name} ({compound.formula})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Input */}
      <Card>
        <CardHeader>
          <CardTitle>{tSections("input")}</CardTitle>
        </CardHeader>
        <CardContent>
          <InputField
            id="formula"
            label={t("labels.formula")}
            value={values.formula}
            onChange={(v) => setValue("formula", v)}
            placeholder="H2O, Ca(OH)2, CuSO4·5H2O"
          />
          <p className="mt-2 text-sm text-muted-foreground">
            {t("formulaExamples")}: H₂O, Ca(OH)₂, Fe₂(SO₄)₃, CuSO₄·5H₂O
          </p>
        </CardContent>
      </Card>

      {/* Results */}
      {result && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>{tSections("results")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <OutputDisplay
                label={t("labels.molarMass")}
                value={result.formatted}
                unit="g/mol"
                size="lg"
              />

              <div className="rounded-lg border bg-muted/50 p-4">
                <p className="text-sm font-medium text-muted-foreground mb-2">{t("totalAtoms")}</p>
                <p className="text-2xl font-semibold">{result.totalAtoms}</p>
              </div>
            </CardContent>
          </Card>

          {/* Element Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>{t("elementBreakdown")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {result.elements.map((element, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between rounded-lg border bg-card p-3"
                  >
                    <div className="flex-1">
                      <p className="font-medium">
                        {element.name} ({element.symbol})
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {element.count} × {element.atomicMass.toFixed(4)} g/mol
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{element.totalMass.toFixed(3)} g/mol</p>
                      <p className="text-sm text-muted-foreground">
                        {element.percentage.toFixed(2)}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Calculation Steps */}
          {result.steps.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>{t("calculationSteps")}</CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="list-decimal list-inside space-y-2 text-sm">
                  {result.steps.map((step, index) => (
                    <li key={index} className="text-muted-foreground">
                      {step}
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {!result && values.formula && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground text-center">{t("invalidFormula")}</p>
          </CardContent>
        </Card>
      )}

      {calculationError && <p className="mt-2 text-sm text-destructive">{calculationError}</p>}
    </div>
  );
}
