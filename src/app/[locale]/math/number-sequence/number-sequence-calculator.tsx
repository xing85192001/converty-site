"use client";

import { useTranslations } from "next-intl";
import { useCallback, useState } from "react";
import { formatStep } from "@/components/calc-steps";
import { ResultGrid } from "@/components/converter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { T } from "@/components/ui/t";
import {
	calculateNumberSequence,
	type NumberSequenceInput,
	type NumberSequenceResult,
} from "@/lib/converters/math/number-sequence";

type Mode = NumberSequenceInput["mode"];

const modes: { value: Mode; labelKey: string }[] = [
	{ value: "arithmetic", labelKey: "arithmeticSequence" },
	{ value: "geometric", labelKey: "geometricSequence" },
	{ value: "fibonacci", labelKey: "fibonacciSequence" },
	{ value: "custom", labelKey: "analyzeCustomSequence" },
	{ value: "findPattern", labelKey: "findPattern" },
];

export function NumberSequenceCalculator() {
	const t = useTranslations("calculator.labels");
	const tResults = useTranslations("calculator.results");
	const tMath = useTranslations("calculator.math");
	const tSteps = useTranslations("calculator.math.numberSequence");

	const [mode, setMode] = useState<Mode>("arithmetic");
	const [firstTerm, setFirstTerm] = useState(1);
	const [commonDifference, setCommonDifference] = useState(2);
	const [commonRatio, setCommonRatio] = useState(2);
	const [numberOfTerms, setNumberOfTerms] = useState(10);
	const [findNthTerm, setFindNthTerm] = useState<number | undefined>(undefined);
	const [customTerms, setCustomTerms] = useState("1, 3, 5, 7, 9");
	const [result, setResult] = useState<NumberSequenceResult | null>(null);

	const needsFirstTerm = mode === "arithmetic" || mode === "geometric";
	const needsDifference = mode === "arithmetic";
	const needsRatio = mode === "geometric";
	const needsCustomTerms = mode === "custom" || mode === "findPattern";

	const calculate = useCallback(() => {
		const terms = needsCustomTerms
			? customTerms
					.split(",")
					.map((s) => parseFloat(s.trim()))
					.filter((n) => !Number.isNaN(n))
			: undefined;

		const input: NumberSequenceInput = {
			mode,
			firstTerm: needsFirstTerm ? firstTerm : undefined,
			commonDifference: needsDifference ? commonDifference : undefined,
			commonRatio: needsRatio ? commonRatio : undefined,
			numberOfTerms,
			findNthTerm: findNthTerm || undefined,
			terms,
		};

		const calcResult = calculateNumberSequence(input);
		setResult(calcResult.ok ? calcResult.value : null);
	}, [
		mode,
		firstTerm,
		commonDifference,
		commonRatio,
		numberOfTerms,
		findNthTerm,
		customTerms,
		needsFirstTerm,
		needsDifference,
		needsRatio,
		needsCustomTerms,
	]);

	const tUi = useTranslations("ui");
	return (
		<div className="space-y-6">
			<Card>
				<CardHeader>
					<CardTitle>{tMath("numberSequence.name")}</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="space-y-2">
						<Label>{t("sequenceType")}</Label>
						<Select
							value={mode}
							onValueChange={(v) => {
								setMode(v as Mode);
								setResult(null);
							}}
						>
							<SelectTrigger>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{modes.map((m) => (
									<SelectItem key={m.value} value={m.value}>
										{tResults(m.labelKey)}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					{needsFirstTerm && (
						<div className="space-y-2">
							<Label>{t("firstTerm")}</Label>
							<Input
								type="number"
								value={firstTerm}
								onChange={(e) => {
									setFirstTerm(Number(e.target.value));
									setResult(null);
								}}
							/>
						</div>
					)}

					{needsDifference && (
						<div className="space-y-2">
							<Label>{t("commonDifference")}</Label>
							<Input
								type="number"
								value={commonDifference}
								onChange={(e) => {
									setCommonDifference(Number(e.target.value));
									setResult(null);
								}}
							/>
						</div>
					)}

					{needsRatio && (
						<div className="space-y-2">
							<Label>{t("commonRatio")}</Label>
							<Input
								type="number"
								step="0.1"
								value={commonRatio}
								onChange={(e) => {
									setCommonRatio(Number(e.target.value));
									setResult(null);
								}}
							/>
						</div>
					)}

					{needsCustomTerms && (
						<div className="space-y-2">
							<Label>{tMath("enterNumbers")}</Label>
							<Input
								type="text"
								value={customTerms}
								onChange={(e) => {
									setCustomTerms(e.target.value);
									setResult(null);
								}}
								placeholder="1, 3, 5, 7, 9"
							/>
						</div>
					)}

					<div className="space-y-2">
						<Label>{t("numberOfTerms")}</Label>
						<Input
							type="number"
							min={1}
							max={100}
							value={numberOfTerms}
							onChange={(e) => {
								setNumberOfTerms(Number(e.target.value));
								setResult(null);
							}}
						/>
					</div>

					<div className="space-y-2">
						<Label>{t("findNthTerm")}</Label>
						<Input
							type="number"
							min={1}
							value={findNthTerm || ""}
							onChange={(e) => {
								setFindNthTerm(
									e.target.value ? Number(e.target.value) : undefined,
								);
								setResult(null);
							}}
							placeholder={tUi("e-g-50-for-50th-term")}
						/>
					</div>

					<button
						type="button"
						onClick={calculate}
						className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
					>
						{t("calculate")}
					</button>
				</CardContent>
			</Card>

			{result && (
				<>
					<Card>
						<CardHeader>
							<CardTitle>{result.sequenceType}</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div>
								<Label className="text-muted-foreground">Formula</Label>
								<p className="text-lg font-mono">{result.formula}</p>
							</div>
							<div>
								<Label className="text-muted-foreground">
									<T k="ui.nth-term-formula" />
								</Label>
								<p className="text-lg font-mono">{result.nthTermFormula}</p>
							</div>
							{result.sumFormula && (
								<div>
									<Label className="text-muted-foreground">
										<T k="ui.sum-formula" />
									</Label>
									<p className="text-lg font-mono">{result.sumFormula}</p>
								</div>
							)}
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>{tMath("sequence")}</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="font-mono text-sm break-all">
								{result.sequence.slice(0, 20).join(", ")}
								{result.sequence.length > 20 && "..."}
							</p>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>{tMath("result")}</CardTitle>
						</CardHeader>
						<CardContent>
							<ResultGrid
								results={[
									{
										label: tMath("firstTerm"),
										value: result.firstTerm.toString(),
									},
									...(result.commonDifference !== undefined
										? [
												{
													label: tMath("commonDifference"),
													value: result.commonDifference.toString(),
												},
											]
										: []),
									...(result.commonRatio !== undefined
										? [
												{
													label: tMath("commonRatio"),
													value: result.commonRatio.toFixed(6),
												},
											]
										: []),
									{
										label: tMath("sumOfTerms"),
										value: result.sum.toLocaleString(),
									},
									...(result.nthTerm !== undefined
										? [
												{
													label: tMath("nthTerm"),
													value: result.nthTerm.toLocaleString(),
												},
											]
										: []),
									...(result.isConvergent !== undefined
										? [
												{
													label: tResults("convergent"),
													value: result.isConvergent ? "Yes" : "No",
												},
											]
										: []),
									...(result.limit !== undefined
										? [
												{
													label: tResults("limitSInf"),
													value: result.limit.toFixed(6),
												},
											]
										: []),
								]}
							/>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>{tMath("steps")}</CardTitle>
						</CardHeader>
						<CardContent>
							<ul className="space-y-1 text-sm font-mono">
								{result.steps.map((step, index) => (
									<li key={index} className="text-muted-foreground">
										{formatStep(step, tSteps, "calculator.math.numberSequence")}
									</li>
								))}
							</ul>
						</CardContent>
					</Card>
				</>
			)}
		</div>
	);
}
