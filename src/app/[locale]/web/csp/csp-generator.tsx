"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { CSP_DIRECTIVES, CSP_PRESETS, type CSPConfig, generateCSP } from "@/lib/converters/web/csp";

export function CSPGenerator() {
  const _t = useTranslations("calculator.labels");
  const tSections = useTranslations("calculator.sections");
  const [config, setConfig] = useState<CSPConfig>(CSP_PRESETS.moderate);
  const [preset, setPreset] = useState<string>("moderate");

  const result = generateCSP(config);

  const handlePresetChange = (presetName: string) => {
    setPreset(presetName);
    if (CSP_PRESETS[presetName]) {
      setConfig(CSP_PRESETS[presetName]);
    }
  };

  const handleDirectiveChange = (name: string, value: string) => {
    setPreset("custom");
    setConfig((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Preset</label>
          <select
            value={preset}
            onChange={(e) => handlePresetChange(e.target.value)}
            className="w-full h-10 px-3 rounded-md border bg-background"
          >
            <option value="strict">Strict (Most Secure)</option>
            <option value="moderate">Moderate (Balanced)</option>
            <option value="relaxed">Relaxed (Legacy Support)</option>
            <option value="custom">Custom</option>
          </select>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {CSP_DIRECTIVES.map((directive) => (
            <div key={directive.name} className="space-y-1">
              <label className="text-sm font-medium">{directive.name}</label>
              <input
                type="text"
                value={config[directive.name] || ""}
                onChange={(e) => handleDirectiveChange(directive.name, e.target.value)}
                placeholder={directive.defaultValue}
                className="w-full h-10 px-3 rounded-md border bg-background text-sm font-mono"
              />
              <p className="text-xs text-muted-foreground">{directive.description}</p>
            </div>
          ))}
        </div>
      </div>

      {result.issues.length > 0 && (
        <div className="p-4 rounded-lg border border-yellow-500/50 bg-yellow-500/10">
          <p className="text-sm font-medium text-yellow-600 dark:text-yellow-400 mb-2">
            Security Issues
          </p>
          <ul className="text-sm space-y-1">
            {result.issues.map((issue) => (
              <li key={issue}>• {issue}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="space-y-4">
        <div className="space-y-2">
          <p className="text-sm font-medium">{tSections("output")}</p>
          <pre className="p-3 rounded-lg bg-muted text-sm font-mono overflow-x-auto whitespace-pre-wrap break-all">
            {result.header}
          </pre>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium">Meta Tag</p>
          <pre className="p-3 rounded-lg bg-muted text-sm font-mono overflow-x-auto whitespace-pre-wrap break-all">
            {result.metaTag}
          </pre>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium">Report-Only Header (for testing)</p>
          <pre className="p-3 rounded-lg bg-muted text-sm font-mono overflow-x-auto whitespace-pre-wrap break-all">
            {result.reportOnly}
          </pre>
        </div>
      </div>
    </div>
  );
}
