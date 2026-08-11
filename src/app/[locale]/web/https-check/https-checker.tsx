"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import {
  analyzeSecurityHeaders,
  SECURITY_HEADERS,
  TLS_VERSIONS,
} from "@/lib/converters/web/https-check";

export function HTTPSChecker() {
  const _t = useTranslations("calculator.labels");
  const _tSections = useTranslations("calculator.sections");
  const [headers, setHeaders] = useState<Record<string, string>>({
    "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
    "Content-Security-Policy": "default-src 'self'",
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Referrer-Policy": "strict-origin-when-cross-origin",
  });

  const analysis = analyzeSecurityHeaders(headers);
  const goodCount = analysis.filter((h) => h.status === "good").length;
  const warningCount = analysis.filter((h) => h.status === "warning").length;
  const missingCount = analysis.filter((h) => h.status === "missing").length;

  const handleHeaderChange = (name: string, value: string) => {
    setHeaders((prev) => ({ ...prev, [name.toLowerCase()]: value }));
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="p-4 rounded-lg border bg-green-500/10 border-green-500/50">
          <p className="text-sm text-muted-foreground">Good</p>
          <p className="text-2xl font-semibold text-green-600">{goodCount}</p>
        </div>
        <div className="p-4 rounded-lg border bg-yellow-500/10 border-yellow-500/50">
          <p className="text-sm text-muted-foreground">Warnings</p>
          <p className="text-2xl font-semibold text-yellow-600">{warningCount}</p>
        </div>
        <div className="p-4 rounded-lg border bg-red-500/10 border-red-500/50">
          <p className="text-sm text-muted-foreground">Missing</p>
          <p className="text-2xl font-semibold text-red-600">{missingCount}</p>
        </div>
      </div>

      <div className="space-y-4">
        <p className="text-sm font-medium">Security Headers</p>
        {SECURITY_HEADERS.map((header) => {
          const status = analysis.find((a) => a.name === header.name);
          return (
            <div key={header.name} className="p-4 rounded-lg border bg-background space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium">{header.name}</span>
                <span
                  className={`px-2 py-0.5 rounded text-xs font-medium ${
                    status?.status === "good"
                      ? "bg-green-500/20 text-green-600"
                      : status?.status === "warning"
                        ? "bg-yellow-500/20 text-yellow-600"
                        : status?.status === "missing"
                          ? "bg-red-500/20 text-red-600"
                          : "bg-gray-500/20 text-gray-600"
                  }`}
                >
                  {status?.status || "unknown"}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">{header.description}</p>
              <input
                type="text"
                value={headers[header.name.toLowerCase()] || headers[header.name] || ""}
                onChange={(e) => handleHeaderChange(header.name, e.target.value)}
                placeholder={header.recommended}
                className="w-full h-10 px-3 rounded-md border bg-muted/50 text-sm font-mono"
              />
              <p className="text-xs text-muted-foreground">
                Recommended: <code className="bg-muted px-1 rounded">{header.recommended}</code>
              </p>
            </div>
          );
        })}
      </div>

      <div className="space-y-4">
        <p className="text-sm font-medium">TLS Version Reference</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Version</th>
                <th className="text-left py-2">Status</th>
                <th className="text-left py-2">Notes</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(TLS_VERSIONS).map(([version, info]) => (
                <tr key={version} className="border-b border-muted">
                  <td className="py-2 font-mono">{version}</td>
                  <td className="py-2">
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-medium ${
                        info.secure
                          ? "bg-green-500/20 text-green-600"
                          : "bg-red-500/20 text-red-600"
                      }`}
                    >
                      {info.secure ? "Secure" : "Insecure"}
                    </span>
                  </td>
                  <td className="py-2 text-muted-foreground">{info.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
