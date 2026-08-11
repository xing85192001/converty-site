import { describe, expect, it } from "vitest";
import { calculateCIDRRange, checkIPInRange } from "@/lib/converters/network/cidr-range";

describe("calculateCIDRRange", () => {
  describe("invalid inputs throw", () => {
    it("throws for CIDR without slash", () => {
      expect(() => calculateCIDRRange("not-valid")).toThrow();
    });

    it("throws for non-numeric prefix", () => {
      expect(() => calculateCIDRRange("192.168.1.0/abc")).toThrow();
    });

    it("throws for invalid IP in CIDR", () => {
      expect(() => calculateCIDRRange("999.168.1.0/24")).toThrow();
    });
  });

  describe("IPv4 /24 network", () => {
    it("returns non-null result for valid CIDR", () => {
      const result = calculateCIDRRange("192.168.1.0/24");
      expect(result).not.toBeNull();
    });

    it("sets networkAddress correctly", () => {
      const result = calculateCIDRRange("192.168.1.0/24");
      expect(result.networkAddress).toBe("192.168.1.0");
    });

    it("sets broadcastAddress correctly", () => {
      const result = calculateCIDRRange("192.168.1.0/24");
      expect(result.broadcastAddress).toBe("192.168.1.255");
    });

    it("sets firstUsable host correctly", () => {
      const result = calculateCIDRRange("192.168.1.0/24");
      expect(result.firstUsable).toBe("192.168.1.1");
    });

    it("sets lastUsable host correctly", () => {
      const result = calculateCIDRRange("192.168.1.0/24");
      expect(result.lastUsable).toBe("192.168.1.254");
    });

    it("has 254 usable hosts for /24", () => {
      const result = calculateCIDRRange("192.168.1.0/24");
      expect(result.usableHosts).toBe(254n);
    });

    it("has ipVersion 4 for IPv4 CIDR", () => {
      const result = calculateCIDRRange("192.168.1.0/24");
      expect(result.ipVersion).toBe(4);
    });

    it("preserves cidrInput", () => {
      const result = calculateCIDRRange("192.168.1.0/24");
      expect(result.cidrInput).toBe("192.168.1.0/24");
    });
  });

  describe("IPv4 /25 network", () => {
    it("has 126 usable hosts for /25", () => {
      const result = calculateCIDRRange("192.168.1.0/25");
      expect(result.usableHosts).toBe(126n);
    });
  });

  describe("IPv6 CIDR", () => {
    it("returns result for valid IPv6 CIDR", () => {
      const result = calculateCIDRRange("2001:db8::/32");
      expect(result).not.toBeNull();
    });

    it("has ipVersion 6 for IPv6 CIDR", () => {
      const result = calculateCIDRRange("2001:db8::/32");
      expect(result.ipVersion).toBe(6);
    });

    it("has null broadcastAddress for IPv6", () => {
      const result = calculateCIDRRange("2001:db8::/64");
      expect(result.broadcastAddress).toBeNull();
    });
  });
});

describe("checkIPInRange", () => {
  it("returns isInRange true for IP in range", () => {
    const result = checkIPInRange("192.168.1.50", "192.168.1.0/24");
    expect(result.isInRange).toBe(true);
  });

  it("returns isInRange false for IP outside range", () => {
    const result = checkIPInRange("192.168.2.1", "192.168.1.0/24");
    expect(result.isInRange).toBe(false);
  });

  it("throws on IPv4/IPv6 version mismatch", () => {
    expect(() => checkIPInRange("192.168.1.1", "2001:db8::/32")).toThrow();
  });
});
