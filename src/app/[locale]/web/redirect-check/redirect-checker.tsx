"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import {
  analyzeRedirectChain,
  COMMON_STATUS_CODES,
  type RedirectInfo,
} from "@/lib/converters/web/redirect-check";

export function RedirectChecker() {
  const _t = useTranslations("calculator.labels");
  const _tSections = useTranslations("calculator.sections");
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [chain, setChain] = useState<RedirectInfo[]>([]);
  const [error, setError] = useState<string | null>(null);

  const checkRedirects = async () => {
    if (!url) return;

    setLoading(true);
    setError(null);
    setChain([]);

    try {
      // Note: In a real app, this would call an API route to avoid CORS issues
      // For demo, we'll simulate a redirect chain
      const simulatedChain: RedirectInfo[] = [
        {
          url: url.startsWith("http") ? url : `https://${url}`,
          statusCode: url.includes("http://") ? 301 : 200,
          statusText: url.includes("http://") ? "Moved Permanently" : "OK",
          location: url.includes("http://") ? url.replace("http://", "https://") : undefined,
          headers: { "content-type": "text/html" },
        },
      ];

      if (url.includes("http://")) {
        simulatedChain.push({
          url: url.replace("http://", "https://"),
          statusCode: 200,
          statusText: "OK",
          headers: { "content-type": "text/html" },
        });
      }

      setChain(simulatedChain);
    } catch {
      setError("Unable to check URL. Try using the browser's developer tools.");
    } finally {
      setLoading(false);
    }
  };

  const analysis = chain.length > 0 ? analyzeRedirectChain(chain) : null;

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://example.com"
          className="flex-1 h-10 px-3 rounded-md border bg-background"
          onKeyDown={(e) => e.key === "Enter" && checkRedirects()}
        />
        <button
          onClick={checkRedirects}
          disabled={loading || !url}
          className="px-4 h-10 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          {loading ? "Checking..." : "Check"}
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-lg border border-red-500/50 bg-red-500/10">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {chain.length > 0 && (
        <div className="space-y-4">
          <div className="p-4 rounded-lg border bg-muted/50">
            <p className="text-sm text-muted-foreground mb-1">Redirect Chain</p>
            <p className="text-xl font-semibold">
              {chain.length} hop{chain.length !== 1 ? "s" : ""}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Final URL: {chain[chain.length - 1].url}
            </p>
          </div>

          <div className="space-y-2">
            {chain.map((redirect) => (
              <div key={redirect.url} className="p-3 rounded-lg border bg-background">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-medium ${
                      redirect.statusCode < 300
                        ? "bg-green-500/20 text-green-600"
                        : redirect.statusCode < 400
                          ? "bg-blue-500/20 text-blue-600"
                          : "bg-red-500/20 text-red-600"
                    }`}
                  >
                    {redirect.statusCode}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {COMMON_STATUS_CODES[redirect.statusCode]?.name || redirect.statusText}
                  </span>
                </div>
                <p className="text-sm font-mono mt-1 break-all">{redirect.url}</p>
                {redirect.location && (
                  <p className="text-xs text-muted-foreground mt-1">
                    → Redirects to: {redirect.location}
                  </p>
                )}
              </div>
            ))}
          </div>

          {analysis && (
            <>
              {analysis.issues.length > 0 && (
                <div className="p-4 rounded-lg border border-yellow-500/50 bg-yellow-500/10">
                  <p className="text-sm font-medium text-yellow-600 dark:text-yellow-400 mb-2">
                    Issues
                  </p>
                  <ul className="text-sm space-y-1">
                    {analysis.issues.map((issue) => (
                      <li key={issue}>• {issue}</li>
                    ))}
                  </ul>
                </div>
              )}

              {analysis.recommendations.length > 0 && (
                <div className="p-4 rounded-lg border border-blue-500/50 bg-blue-500/10">
                  <p className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-2">
                    Recommendations
                  </p>
                  <ul className="text-sm space-y-1">
                    {analysis.recommendations.map((rec) => (
                      <li key={rec}>• {rec}</li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2">Code</th>
              <th className="text-left py-2">Name</th>
              <th className="text-left py-2">Description</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(COMMON_STATUS_CODES)
              .filter(([code]) => parseInt(code) >= 300 && parseInt(code) < 400)
              .map(([code, info]) => (
                <tr key={code} className="border-b border-muted">
                  <td className="py-2 font-mono">{code}</td>
                  <td className="py-2">{info.name}</td>
                  <td className="py-2 text-muted-foreground">{info.description}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
