// HTTPS Configuration Check

export interface CertificateInfo {
  issuer: string;
  subject: string;
  validFrom: Date;
  validTo: Date;
  daysUntilExpiry: number;
  serialNumber: string;
  fingerprint: string;
  keySize: number;
  signatureAlgorithm: string;
}

export interface SecurityHeader {
  name: string;
  value: string | null;
  status: "good" | "warning" | "missing" | "bad";
  recommendation: string;
}

export interface HTTPSResult {
  isSecure: boolean;
  certificate?: CertificateInfo;
  securityHeaders: SecurityHeader[];
  tlsVersion: string;
  cipherSuite: string;
  grade: "A+" | "A" | "B" | "C" | "D" | "F";
  issues: string[];
  recommendations: string[];
}

export const SECURITY_HEADERS: {
  name: string;
  description: string;
  recommended: string;
  impact: string;
}[] = [
  {
    name: "Strict-Transport-Security",
    description: "Enforces HTTPS connections",
    recommended: "max-age=31536000; includeSubDomains; preload",
    impact: "Prevents downgrade attacks and cookie hijacking",
  },
  {
    name: "Content-Security-Policy",
    description: "Controls resource loading",
    recommended: "default-src 'self'",
    impact: "Prevents XSS and data injection attacks",
  },
  {
    name: "X-Content-Type-Options",
    description: "Prevents MIME type sniffing",
    recommended: "nosniff",
    impact: "Prevents MIME confusion attacks",
  },
  {
    name: "X-Frame-Options",
    description: "Controls iframe embedding",
    recommended: "DENY or SAMEORIGIN",
    impact: "Prevents clickjacking attacks",
  },
  {
    name: "X-XSS-Protection",
    description: "Browser XSS filter (legacy)",
    recommended: "1; mode=block",
    impact: "Enables browser XSS filter (modern browsers ignore)",
  },
  {
    name: "Referrer-Policy",
    description: "Controls referrer information",
    recommended: "strict-origin-when-cross-origin",
    impact: "Prevents leaking sensitive URL data",
  },
  {
    name: "Permissions-Policy",
    description: "Controls browser features",
    recommended: "geolocation=(), microphone=(), camera=()",
    impact: "Restricts access to sensitive APIs",
  },
];

export function analyzeSecurityHeaders(headers: Record<string, string | null>): SecurityHeader[] {
  return SECURITY_HEADERS.map((header) => {
    const value = headers[header.name.toLowerCase()] || headers[header.name] || null;

    if (!value) {
      return {
        name: header.name,
        value: null,
        status: "missing" as const,
        recommendation: `Add ${header.name}: ${header.recommended}`,
      };
    }

    // Check header quality
    let status: "good" | "warning" | "bad" = "good";
    let recommendation = "Header is properly configured";

    if (header.name === "Strict-Transport-Security") {
      const maxAge = parseInt(value.match(/max-age=(\d+)/)?.[1] || "0");
      if (maxAge < 31536000) {
        status = "warning";
        recommendation = "Consider max-age of at least 1 year (31536000)";
      }
      if (!value.includes("includeSubDomains")) {
        status = "warning";
        recommendation = "Add includeSubDomains for complete protection";
      }
    }

    if (header.name === "X-Frame-Options" && value === "ALLOW-FROM") {
      status = "warning";
      recommendation = "ALLOW-FROM is deprecated. Use CSP frame-ancestors instead.";
    }

    return {
      name: header.name,
      value,
      status,
      recommendation,
    };
  });
}

export const TLS_VERSIONS: Record<string, { secure: boolean; notes: string }> = {
  "TLS 1.3": { secure: true, notes: "Most secure, recommended" },
  "TLS 1.2": { secure: true, notes: "Secure with proper cipher suites" },
  "TLS 1.1": { secure: false, notes: "Deprecated, should be disabled" },
  "TLS 1.0": { secure: false, notes: "Insecure, must be disabled" },
  "SSL 3.0": { secure: false, notes: "Severely broken, never use" },
};
