// Redirect Check - Analyze HTTP redirect chains

export interface RedirectInfo {
  url: string;
  statusCode: number;
  statusText: string;
  location?: string;
  headers: Record<string, string>;
}

export interface RedirectResult {
  chain: RedirectInfo[];
  finalUrl: string;
  totalRedirects: number;
  totalTime: number;
  issues: string[];
  recommendations: string[];
}

export function analyzeRedirectChain(chain: RedirectInfo[]): {
  issues: string[];
  recommendations: string[];
} {
  const issues: string[] = [];
  const recommendations: string[] = [];

  if (chain.length > 3) {
    issues.push(`Too many redirects (${chain.length}). This slows page load.`);
    recommendations.push("Reduce redirect chain to 1-2 hops maximum");
  }

  chain.forEach((redirect, index) => {
    // Check for HTTP to HTTPS upgrade
    if (redirect.url.startsWith("http://") && redirect.location?.startsWith("https://")) {
      recommendations.push(
        `Redirect ${index + 1}: HTTP to HTTPS upgrade detected. Consider using HSTS.`
      );
    }

    // Check for www/non-www consistency
    const hasWww = redirect.url.includes("://www.");
    const locationHasWww = redirect.location?.includes("://www.");
    if (hasWww !== locationHasWww && redirect.location) {
      recommendations.push(
        `Redirect ${index + 1}: www/non-www change. Set a canonical preference.`
      );
    }

    // Check for 302 vs 301
    if (redirect.statusCode === 302) {
      issues.push(
        `Redirect ${index + 1}: Using 302 (temporary). Consider 301 for SEO if permanent.`
      );
    }

    // Check for redirect loops potential
    if (chain.filter((r) => r.url === redirect.url).length > 1) {
      issues.push(`Potential redirect loop detected at ${redirect.url}`);
    }
  });

  return { issues, recommendations };
}

export const COMMON_STATUS_CODES: Record<number, { name: string; description: string }> = {
  200: { name: "OK", description: "Request succeeded" },
  201: { name: "Created", description: "Resource created successfully" },
  301: {
    name: "Moved Permanently",
    description: "Resource has moved permanently (cached by browsers)",
  },
  302: { name: "Found", description: "Temporary redirect (not cached)" },
  303: { name: "See Other", description: "Redirect after POST (use GET)" },
  304: { name: "Not Modified", description: "Cached version is still valid" },
  307: { name: "Temporary Redirect", description: "Temporary redirect (preserves method)" },
  308: { name: "Permanent Redirect", description: "Permanent redirect (preserves method)" },
  400: { name: "Bad Request", description: "Invalid request syntax" },
  401: { name: "Unauthorized", description: "Authentication required" },
  403: { name: "Forbidden", description: "Access denied" },
  404: { name: "Not Found", description: "Resource not found" },
  500: { name: "Internal Server Error", description: "Server error" },
  502: { name: "Bad Gateway", description: "Invalid response from upstream" },
  503: { name: "Service Unavailable", description: "Server temporarily unavailable" },
  504: { name: "Gateway Timeout", description: "Upstream server timeout" },
};
