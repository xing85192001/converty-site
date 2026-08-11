import { describe, expect, it } from "vitest";
import { calculateSubnet } from "@/lib/converters/network/subnet-calculator";

describe("calculateSubnet", () => {
  describe("IPv4 standard subnets", () => {
    it("calculates /24 network address", () => {
      const result = calculateSubnet("192.168.1.0", 24);
      expect(result.networkAddress).toBe("192.168.1.0");
    });

    it("calculates /24 broadcast address", () => {
      const result = calculateSubnet("192.168.1.0", 24);
      expect(result.broadcastAddress).toBe("192.168.1.255");
    });

    it("calculates /24 usable hosts as BigInt 254n", () => {
      const result = calculateSubnet("192.168.1.0", 24);
      expect(result.usableHosts).toBe(254n);
    });

    it("calculates /24 first and last usable", () => {
      const result = calculateSubnet("192.168.1.0", 24);
      expect(result.firstUsable).toBe("192.168.1.1");
      expect(result.lastUsable).toBe("192.168.1.254");
    });

    it("calculates /16 subnet correctly", () => {
      const result = calculateSubnet("10.0.0.0", 16);
      expect(result.networkAddress).toBe("10.0.0.0");
      expect(result.usableHosts).toBe(65534n);
    });

    it("handles /31 point-to-point (RFC 3021)", () => {
      const result = calculateSubnet("10.0.0.0", 31);
      expect(result.usableHosts).toBe(2n);
    });

    it("handles /32 single host", () => {
      const result = calculateSubnet("192.168.1.1", 32);
      expect(result.usableHosts).toBe(1n);
      expect(result.firstUsable).toBe("192.168.1.1");
    });

    it("sets ipVersion to 4 for IPv4", () => {
      const result = calculateSubnet("192.168.1.0", 24);
      expect(result.ipVersion).toBe(4);
    });
  });

  describe("IPv6 subnets", () => {
    it("calculates /64 subnet size", () => {
      const result = calculateSubnet("2001:db8::", 64);
      expect(result.ipVersion).toBe(6);
      expect(result.totalHosts).toBe(BigInt(2) ** BigInt(64));
    });

    it("has null broadcastAddress for IPv6", () => {
      const result = calculateSubnet("2001:db8::", 64);
      expect(result.broadcastAddress).toBeNull();
    });

    it("has null subnetMask for IPv6", () => {
      const result = calculateSubnet("2001:db8::", 64);
      expect(result.subnetMask).toBeNull();
    });

    it("handles /128 single IPv6 address", () => {
      const result = calculateSubnet("2001:db8::1", 128);
      expect(result.usableHosts).toBe(1n);
    });
  });

  describe("invalid inputs throw", () => {
    it("throws for invalid IP address string", () => {
      expect(() => calculateSubnet("invalid", 24)).toThrow();
    });

    it("throws for malformed IP", () => {
      expect(() => calculateSubnet("256.0.0.1", 24)).toThrow();
    });
  });
});
