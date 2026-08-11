"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { InputField, ResultGrid } from "@/components/converter";
import { calculateBPM, getTempoMarking } from "@/lib/converters/music/bpm";

export function BPMCalculator() {
  const t = useTranslations("calculator.labels");
  const tMusic = useTranslations("calculator.music");
  const [bpm, setBpm] = useState("120");

  const numBpm = parseFloat(bpm) || 0;
  const calcResult = calculateBPM(numBpm);
  const result = calcResult.ok ? calcResult.value : null;
  const tempoMarkingKey = numBpm > 0 ? getTempoMarking(numBpm) : "";

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <InputField
          id="bpm"
          label={t("tempo")}
          value={bpm}
          onChange={setBpm}
          unit="BPM"
          min={1}
          max={999}
          step={1}
          placeholder={tMusic("enterBpm")}
        />
        {tempoMarkingKey && (
          <div className="flex items-end">
            <div className="p-3 rounded-md border bg-muted/50 w-full">
              <p className="text-sm text-muted-foreground">{tMusic("tempoMarking")}</p>
              <p className="text-lg font-medium">{tMusic(`tempoMarkings.${tempoMarkingKey}`)}</p>
            </div>
          </div>
        )}
      </div>

      {result && (
        <div className="space-y-6">
          <ResultGrid
            results={[
              { label: tMusic("frequency"), value: result.hz, unit: "Hz" },
              { label: tMusic("beatDuration"), value: result.msPerBeat, unit: "ms" },
              { label: tMusic("beatsPerSecond"), value: result.beatsPerSec, unit: "bps" },
              { label: tMusic("bar4_4"), value: result.barLength4_4, unit: "ms" },
            ]}
            columns={2}
          />

          <div className="space-y-2">
            <h3 className="font-medium">{tMusic("noteDurations")}</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 font-medium">
                      {tMusic("noteTableHeaders.note")}
                    </th>
                    <th className="text-left py-2 font-medium">
                      {tMusic("noteTableHeaders.symbol")}
                    </th>
                    <th className="text-right py-2 font-medium">
                      {tMusic("noteTableHeaders.beats")}
                    </th>
                    <th className="text-right py-2 font-medium">
                      {tMusic("noteTableHeaders.duration")}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {result.noteValues.map((note) => (
                    <tr key={note.nameKey} className="border-b border-muted">
                      <td className="py-2">{tMusic(`notes.${note.nameKey}`)}</td>
                      <td className="py-2 font-mono">{note.symbol}</td>
                      <td className="py-2 text-right font-mono">{note.beats}</td>
                      <td className="py-2 text-right font-mono">{note.durationMs.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
