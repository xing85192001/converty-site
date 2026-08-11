import { describe, expect, it } from "vitest";
import { parseSPF, SPF_MECHANISMS, SPF_QUALIFIERS } from "@/lib/converters/web/spf-check";

describe("parseSPF", () => {
  it("parses valid SPF record with include and -all", () => {
    const result = parseSPF("v=spf1 include:example.com -all");
    expect(result.isValid).toBe(true);
    expect(result.version).toBe("spf1");
    expect(result.mechanisms.length).toBeGreaterThan(0);
    const includeMech = result.mechanisms.find((m) => m.type === "include");
    expect(includeMech).toBeDefined();
    expect(includeMech!.value).toBe("example.com");
    const allMech = result.mechanisms.find((m) => m.type === "all");
    expect(allMech!.qualifier).toBe("-");
  });

  it("returns invalid for record not starting with v=spf1", () => {
    const result = parseSPF("invalid spf record");
    expect(result.isValid).toBe(false);
    expect(result.issues.length).toBeGreaterThan(0);
  });

  it("extracts include mechanism correctly", () => {
    const result = parseSPF("v=spf1 include:_spf.google.com ~all");
    const includeMech = result.mechanisms.find((m) => m.type === "include");
    expect(includeMech).toBeDefined();
    expect(includeMech!.value).toBe("_spf.google.com");
  });

  it("counts DNS lookups for include and mx", () => {
    const result = parseSPF("v=spf1 mx include:example.com -all");
    expect(result.lookupCount).toBe(2);
  });

  it("warns when using +all", () => {
    const result = parseSPF("v=spf1 +all");
    const hasAllWarning = result.issues.some((i) => i.includes("+all"));
    expect(hasAllWarning).toBe(true);
    // isValid only checks for "must" or "will fail" — +all warning doesn't trigger that
  });

  it("warns when using ptr mechanism (deprecated)", () => {
    const result = parseSPF("v=spf1 ptr -all");
    const hasPtrIssue = result.issues.some((i) => i.includes("ptr"));
    expect(hasPtrIssue).toBe(true);
  });

  it("parses ip4 mechanism", () => {
    const result = parseSPF("v=spf1 ip4:192.168.1.0/24 -all");
    const ip4Mech = result.mechanisms.find((m) => m.type === "ip4");
    expect(ip4Mech).toBeDefined();
    expect(ip4Mech!.value).toBe("192.168.1.0/24");
  });

  it("warns about no all mechanism", () => {
    const result = parseSPF("v=spf1 include:example.com");
    const hasAllRec = result.recommendations.some((r) => r.includes("all"));
    expect(hasAllRec).toBe(true);
  });
});

describe("SPF_QUALIFIERS", () => {
  it("has pass qualifier for +", () => {
    expect(SPF_QUALIFIERS["+"]).toBeDefined();
    expect(SPF_QUALIFIERS["+"].name).toBe("Pass");
  });

  it("has fail qualifier for -", () => {
    expect(SPF_QUALIFIERS["-"]).toBeDefined();
    expect(SPF_QUALIFIERS["-"].name).toBe("Fail");
  });
});

describe("SPF_MECHANISMS", () => {
  it("has include mechanism description", () => {
    expect(SPF_MECHANISMS.include).toBeDefined();
    expect(SPF_MECHANISMS.include.length).toBeGreaterThan(0);
  });
});
