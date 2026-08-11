"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { parseSPF, SPF_MECHANISMS, SPF_QUALIFIERS } from "@/lib/converters/web/spf-check";

export function SPFChecker() {
  const _t = useTranslations("calculator.labels");
  const _tSections = useTranslations("calculator.sections");
  const [record, setRecord] = useState("v=spf1 include:_spf.google.com ~all");

  const result = parseSPF(record);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <label className="text-sm font-medium">SPF Record</label>
        <input
          type="text"
          value={record}
          onChange={(e) => setRecord(e.target.value)}
          placeholder="v=spf1 include:example.com ~all"
          className="w-full h-10 px-3 rounded-md border bg-background font-mono text-sm"
        />
        <p className="text-xs text-muted-foreground">
          Enter an SPF record to analyze (usually found in DNS TXT records)
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="p-4 rounded-lg border bg-muted/50">
          <p className="text-sm text-muted-foreground">Status</p>
          <p
            className={`text-xl font-semibold ${result.isValid ? "text-green-600" : "text-red-600"}`}
          >
            {result.isValid ? "Valid" : "Invalid"}
          </p>
        </div>
        <div className="p-4 rounded-lg border bg-muted/50">
          <p className="text-sm text-muted-foreground">DNS Lookups</p>
          <p
            className={`text-xl font-semibold ${result.lookupCount > 10 ? "text-red-600" : result.lookupCount > 7 ? "text-yellow-600" : ""}`}
          >
            {result.lookupCount} / 10
          </p>
        </div>
        <div className="p-4 rounded-lg border bg-muted/50">
          <p className="text-sm text-muted-foreground">Mechanisms</p>
          <p className="text-xl font-semibold">{result.mechanisms.length}</p>
        </div>
      </div>

      {result.mechanisms.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium">Parsed Mechanisms</p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Qualifier</th>
                  <th className="text-left py-2">Type</th>
                  <th className="text-left py-2">Value</th>
                  <th className="text-left py-2">Result</th>
                </tr>
              </thead>
              <tbody>
                {result.mechanisms.map((mech) => (
                  <tr
                    key={`${mech.type}-${mech.value || "none"}-${mech.qualifier}`}
                    className="border-b border-muted"
                  >
                    <td className="py-2">
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-medium ${
                          mech.qualifier === "+"
                            ? "bg-green-500/20 text-green-600"
                            : mech.qualifier === "-"
                              ? "bg-red-500/20 text-red-600"
                              : mech.qualifier === "~"
                                ? "bg-yellow-500/20 text-yellow-600"
                                : "bg-gray-500/20 text-gray-600"
                        }`}
                      >
                        {mech.qualifier} {SPF_QUALIFIERS[mech.qualifier]?.name}
                      </span>
                    </td>
                    <td className="py-2 font-mono">{mech.type}</td>
                    <td className="py-2 font-mono text-muted-foreground">{mech.value || "-"}</td>
                    <td className="py-2 text-muted-foreground">
                      {SPF_QUALIFIERS[mech.qualifier]?.result}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {result.issues.length > 0 && (
        <div className="p-4 rounded-lg border border-red-500/50 bg-red-500/10">
          <p className="text-sm font-medium text-red-600 dark:text-red-400 mb-2">Issues</p>
          <ul className="text-sm space-y-1">
            {result.issues.map((issue) => (
              <li key={issue}>• {issue}</li>
            ))}
          </ul>
        </div>
      )}

      {result.recommendations.length > 0 && (
        <div className="p-4 rounded-lg border border-blue-500/50 bg-blue-500/10">
          <p className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-2">
            Recommendations
          </p>
          <ul className="text-sm space-y-1">
            {result.recommendations.map((rec) => (
              <li key={rec}>• {rec}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="space-y-4">
        <p className="text-sm font-medium">SPF Mechanisms Reference</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Mechanism</th>
                <th className="text-left py-2">Description</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(SPF_MECHANISMS).map(([mech, desc]) => (
                <tr key={mech} className="border-b border-muted">
                  <td className="py-2 font-mono">{mech}</td>
                  <td className="py-2 text-muted-foreground">{desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
