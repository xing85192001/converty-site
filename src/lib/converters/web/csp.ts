// Content Security Policy Generator

export interface CSPDirective {
  name: string;
  description: string;
  defaultValue: string;
  examples: string[];
}

export const CSP_DIRECTIVES: CSPDirective[] = [
  {
    name: "default-src",
    description: "Fallback for other directives",
    defaultValue: "'self'",
    examples: ["'self'", "'none'", "https:"],
  },
  {
    name: "script-src",
    description: "Valid sources for JavaScript",
    defaultValue: "'self'",
    examples: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://cdn.example.com"],
  },
  {
    name: "style-src",
    description: "Valid sources for stylesheets",
    defaultValue: "'self'",
    examples: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
  },
  {
    name: "img-src",
    description: "Valid sources for images",
    defaultValue: "'self'",
    examples: ["'self'", "data:", "https:", "blob:"],
  },
  {
    name: "font-src",
    description: "Valid sources for fonts",
    defaultValue: "'self'",
    examples: ["'self'", "https://fonts.gstatic.com", "data:"],
  },
  {
    name: "connect-src",
    description: "Valid sources for fetch, XHR, WebSocket",
    defaultValue: "'self'",
    examples: ["'self'", "https://api.example.com", "wss:"],
  },
  {
    name: "media-src",
    description: "Valid sources for audio and video",
    defaultValue: "'self'",
    examples: ["'self'", "https://media.example.com", "blob:"],
  },
  {
    name: "object-src",
    description: "Valid sources for plugins",
    defaultValue: "'none'",
    examples: ["'none'", "'self'"],
  },
  {
    name: "frame-src",
    description: "Valid sources for iframes",
    defaultValue: "'self'",
    examples: ["'self'", "'none'", "https://www.youtube.com"],
  },
  {
    name: "frame-ancestors",
    description: "Valid parents that can embed this page",
    defaultValue: "'self'",
    examples: ["'self'", "'none'", "https://parent.example.com"],
  },
  {
    name: "base-uri",
    description: "Valid URLs for <base> element",
    defaultValue: "'self'",
    examples: ["'self'", "'none'"],
  },
  {
    name: "form-action",
    description: "Valid targets for form submissions",
    defaultValue: "'self'",
    examples: ["'self'", "'none'", "https://form.example.com"],
  },
];

export interface CSPConfig {
  [directive: string]: string;
}

export interface CSPResult {
  policy: string;
  header: string;
  metaTag: string;
  reportOnly: string;
  issues: string[];
}

export function generateCSP(config: CSPConfig): CSPResult {
  const issues: string[] = [];
  const directives: string[] = [];

  // Check for security issues
  Object.entries(config).forEach(([directive, value]) => {
    if (value.includes("'unsafe-inline'") && directive.includes("script")) {
      issues.push(`Warning: 'unsafe-inline' in ${directive} weakens XSS protection`);
    }
    if (value.includes("'unsafe-eval'")) {
      issues.push(`Warning: 'unsafe-eval' in ${directive} allows eval() which is risky`);
    }
    if (value === "*" || value.includes(" *")) {
      issues.push(`Warning: Wildcard (*) in ${directive} allows any source`);
    }

    if (value.trim()) {
      directives.push(`${directive} ${value}`);
    }
  });

  const policy = directives.join("; ");

  return {
    policy,
    header: `Content-Security-Policy: ${policy}`,
    metaTag: `<meta http-equiv="Content-Security-Policy" content="${policy}">`,
    reportOnly: `Content-Security-Policy-Report-Only: ${policy}`,
    issues,
  };
}

export const CSP_PRESETS: Record<string, CSPConfig> = {
  strict: {
    "default-src": "'none'",
    "script-src": "'self'",
    "style-src": "'self'",
    "img-src": "'self'",
    "font-src": "'self'",
    "connect-src": "'self'",
    "frame-ancestors": "'none'",
    "base-uri": "'self'",
    "form-action": "'self'",
  },
  moderate: {
    "default-src": "'self'",
    "script-src": "'self' 'unsafe-inline'",
    "style-src": "'self' 'unsafe-inline'",
    "img-src": "'self' data: https:",
    "font-src": "'self' data:",
    "connect-src": "'self'",
    "frame-ancestors": "'self'",
  },
  relaxed: {
    "default-src": "'self'",
    "script-src": "'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src": "'self' 'unsafe-inline'",
    "img-src": "*",
    "font-src": "*",
    "connect-src": "*",
  },
};
