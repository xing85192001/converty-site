"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { InputField, ResultGrid } from "@/components/converter";
import {
	convertToAllSpeeds,
	SPEED_UNITS,
	type SpeedUnit,
} from "@/lib/converters/physics/speed";

const UNIT_OPTIONS = SPEED_UNITS.map((u) => ({
	value: u.id,
	label: u.symbol,
}));

export function SpeedConverter() {
	const t = useTranslations("calculator.labels");
	const _tResults = useTranslations("calculator.results");
	const [value, setValue] = useState("100");
	const [unit, setUnit] = useState<SpeedUnit>("kmh");

	const numValue = parseFloat(value) || 0;
	const result = numValue > 0 ? convertToAllSpeeds(numValue, unit) : null;

	const formatValue = (val: number): string => {
		if (val === 0) return "0";
		if (val >= 10000) return val.toFixed(0);
		if (val >= 100) return val.toFixed(1);
		if (val >= 1) return val.toFixed(2);
		return val.toFixed(4);
	};

	return (
		<div className="space-y-6">
			<InputField
				id="value"
				label={t("value")}
				value={value}
				onChange={setValue}
				units={UNIT_OPTIONS}
				selectedUnit={unit}
				onUnitChange={(u) => setUnit(u as SpeedUnit)}
				min={0}
				step="any"
			/>

			{result && (
				<ResultGrid
					results={[
						{
							label: _tResults("metersPerSecond"),
							value: formatValue(result.ms),
							unit: "m/s",
						},
						{
							label: _tResults("kilometersPerHour"),
							value: formatValue(result.kmh),
							unit: "km/h",
						},
						{
							label: _tResults("milesPerHour"),
							value: formatValue(result.mph),
							unit: "mph",
						},
						{
							label: _tResults("knots"),
							value: formatValue(result.knot),
							unit: "kn",
						},
						{
							label: _tResults("feetPerSecond"),
							value: formatValue(result.fts),
							unit: "ft/s",
						},
						{
							label: _tResults("mach"),
							value: formatValue(result.mach),
							unit: "Mach",
						},
					]}
					columns={2}
				/>
			)}
		</div>
	);
}
