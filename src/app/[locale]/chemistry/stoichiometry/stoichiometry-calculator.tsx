"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { InputField } from "@/components/converter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  calculateStoichiometry,
  type StoichiometryInput,
  type StoichiometryResult,
} from "@/lib/converters/chemistry/stoichiometry";

export default function StoichiometryCalculator() {
  const t = useTranslations("calculator.chemistry");
  const tSections = useTranslations("calculator.sections");

  const [equation, setEquation] = useState("2H2 + O2 → 2H2O");
  const [reactantMasses, setReactantMasses] = useState<Record<string, string>>({
    H2: "4",
    O2: "32",
  });
  const [result, setResult] = useState<StoichiometryResult | null>(null);
  const [calcError, setCalcError] = useState<string | null>(null);

  const handleCalculate = () => {
    const masses: Record<string, number> = {};
    for (const [formula, value] of Object.entries(reactantMasses)) {
      const num = parseFloat(value);
      if (num > 0) {
        masses[formula] = num;
      }
    }

    const input: StoichiometryInput = {
      equation,
      reactantMasses: masses,
    };

    const calcResult = calculateStoichiometry(input);
    if (calcResult.ok) {
      setResult(calcResult.value);
      setCalcError(null);
    } else {
      setResult(null);
      setCalcError(calcResult.error);
    }
  };

  const addReactant = () => {
    const newKey = `Reactant${Object.keys(reactantMasses).length + 1}`;
    setReactantMasses({ ...reactantMasses, [newKey]: "0" });
  };

  const removeReactant = (formula: string) => {
    const newMasses = { ...reactantMasses };
    delete newMasses[formula];
    setReactantMasses(newMasses);
  };

  const updateReactant = (oldFormula: string, newFormula: string, mass: string) => {
    const newMasses = { ...reactantMasses };
    delete newMasses[oldFormula];
    newMasses[newFormula] = mass;
    setReactantMasses(newMasses);
  };

  return (
    <div className="space-y-6">
      {/* Equation Input */}
      <Card>
        <CardHeader>
          <CardTitle>{t("chemicalEquation")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <InputField
            id="equation"
            label={t("labels.equation")}
            value={equation}
            onChange={setEquation}
            placeholder="2H2 + O2 → 2H2O"
          />
          <p className="text-sm text-muted-foreground">{t("equationHelp")}: →, --, =</p>
        </CardContent>
      </Card>

      {/* Reactant Masses */}
      <Card>
        <CardHeader>
          <CardTitle>{t("reactantMasses")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(reactantMasses).map(([formula, mass]) => (
              <div key={formula} className="flex gap-2">
                <div className="flex-1">
                  <InputField
                    id={`formula-${formula}`}
                    label={t("labels.formula")}
                    value={formula}
                    onChange={(v) => updateReactant(formula, v, mass)}
                  />
                </div>
                <div className="flex-1">
                  <InputField
                    id={`mass-${formula}`}
                    label={t("labels.mass")}
                    value={mass}
                    onChange={(v) => updateReactant(formula, formula, v)}
                    unit="g"
                    min={0}
                    step="0.001"
                  />
                </div>
                <Button variant="outline" onClick={() => removeReactant(formula)} className="mt-8">
                  {t("remove")}
                </Button>
              </div>
            ))}
            <Button onClick={addReactant} variant="outline">
              {t("addReactant")}
            </Button>
            <Button onClick={handleCalculate} className="w-full">
              {t("calculate")}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {calcError && <p className="mt-2 text-sm text-destructive">{calcError}</p>}

      {/* Results */}
      {result && (
        <>
          {/* Limiting Reactant */}
          <Card>
            <CardHeader>
              <CardTitle>{tSections("results")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border bg-primary/5 border-primary/20 p-4">
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  {t("limitingReactant")}
                </p>
                <p className="text-2xl font-bold text-primary">{result.limitingReactant}</p>
              </div>

              <div className="space-y-3">
                <p className="text-sm font-semibold">{t("reactantsUsed")}:</p>
                {result.reactants.map((reactant) => (
                  <div key={reactant.formula} className="rounded-lg border bg-card p-3 space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">{reactant.formula}</p>
                      {reactant.isLimiting && (
                        <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded">
                          {t("limiting")}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {t("massGiven")}: {reactant.massGiven.toFixed(3)} g
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {t("molesAvailable")}: {reactant.molesAvailable.toFixed(6)} mol
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {t("molesRequired")}: {reactant.molesRequired.toFixed(6)} mol
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Products */}
          <Card>
            <CardHeader>
              <CardTitle>{t("theoreticalYield")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                {result.products.map((product) => (
                  <div key={product.formula} className="rounded-lg border bg-muted/50 p-4">
                    <p className="text-sm font-medium text-muted-foreground mb-2">
                      {product.formula}
                    </p>
                    <p className="text-2xl font-semibold">{product.massProduced.toFixed(3)} g</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {product.molesProduced.toFixed(6)} mol
                    </p>
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
    </div>
  );
}
