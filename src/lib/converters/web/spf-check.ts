// SPF (Sender Policy Framework) Check

export interface SPFMechanism {
  type: "all" | "ip4" | "ip6" | "a" | "mx" | "ptr" | "exists" | "include" | "redirect";
  qualifier: "+" | "-" | "~" | "?";
  value?: string;
}

export interface SPFResult {
  isValid: boolean;
  version: string;
  mechanisms: SPFMechanism[];
  lookupCount: number;
  issues: string[];
  recommendations: string[];
  raw: string;
}

export function parseSPF(record: string): SPFResult {
  const issues: string[] = [];
  const recommendations: string[] = [];
  const mechanisms: SPFMechanism[] = [];
  let lookupCount = 0;

  const trimmed = record.trim();

  // Check version
  if (!trimmed.startsWith("v=spf1")) {
    issues.push("SPF record must start with 'v=spf1'");
    return {
      isValid: false,
      version: "",
      mechanisms: [],
      lookupCount: 0,
      issues,
      recommendations,
      raw: record,
    };
  }

  const parts = trimmed.split(/\s+/);

  parts.forEach((part) => {
    if (part === "v=spf1") return;

    let qualifier: "+" | "-" | "~" | "?" = "+";
    let mechanism = part;

    if (["+", "-", "~", "?"].includes(part[0])) {
      qualifier = part[0] as "+" | "-" | "~" | "?";
      mechanism = part.slice(1);
    }

    const [type, value] = mechanism.includes(":")
      ? (mechanism.split(":", 2) as [string, string])
      : mechanism.includes("=")
        ? (mechanism.split("=", 2) as [string, string])
        : [mechanism, undefined];

    // Count DNS lookups
    if (["a", "mx", "ptr", "exists", "include", "redirect"].includes(type)) {
      lookupCount++;
    }

    mechanisms.push({
      type: type as SPFMechanism["type"],
      qualifier,
      value,
    });
  });

  // Check for issues
  if (lookupCount > 10) {
    issues.push(`Too many DNS lookups (${lookupCount}/10). SPF will fail.`);
  } else if (lookupCount > 7) {
    recommendations.push(`DNS lookups at ${lookupCount}/10. Consider reducing.`);
  }

  const allMechanism = mechanisms.find((m) => m.type === "all");
  if (!allMechanism) {
    recommendations.push("Add an 'all' mechanism to specify default behavior");
  } else if (allMechanism.qualifier === "+") {
    issues.push("Using '+all' allows anyone to send as your domain!");
  } else if (allMechanism.qualifier === "?") {
    recommendations.push("'?all' is neutral. Consider '-all' or '~all' for better protection.");
  }

  const hasPTR = mechanisms.some((m) => m.type === "ptr");
  if (hasPTR) {
    issues.push("'ptr' mechanism is deprecated and slow. Avoid using it.");
  }

  return {
    isValid: issues.filter((i) => i.includes("must") || i.includes("will fail")).length === 0,
    version: "spf1",
    mechanisms,
    lookupCount,
    issues,
    recommendations,
    raw: record,
  };
}

export const SPF_QUALIFIERS: Record<string, { name: string; result: string }> = {
  "+": { name: "Pass", result: "Allow (default if no qualifier)" },
  "-": { name: "Fail", result: "Reject the email" },
  "~": { name: "SoftFail", result: "Accept but mark suspicious" },
  "?": { name: "Neutral", result: "No policy statement" },
};

export const SPF_MECHANISMS: Record<string, string> = {
  all: "Match all senders",
  ip4: "Match IPv4 address or range",
  ip6: "Match IPv6 address or range",
  a: "Match A record of domain",
  mx: "Match MX record of domain",
  ptr: "Match PTR record (deprecated)",
  exists: "Match if domain has A record",
  include: "Include another domain's SPF",
  redirect: "Use another domain's SPF entirely",
};
