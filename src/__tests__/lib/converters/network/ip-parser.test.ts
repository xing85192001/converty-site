import { describe, expect, it } from "vitest";
import { parseIPInput, validateIPAddress } from "@/lib/converters/network/ip-parser";

describe("parseIPInput", () => {
  describe("invalid inputs throw", () => {
    it("throws for garbage CIDR input", () => {
      expect(() => parseIPInput("garbage/24")).toThrow();
    });

    it("throws for IP without CIDR and no subnet mask", () => {
      expect(() => parseIPInput("192.168.1.1")).toThrow();
    });

    it("throws for invalid CIDR notation", () => {
      expect(() => parseIPInput("192.168.1.0/abc")).toThrow();
    });

    it("throws for out-of-range CIDR prefix", () => {
      expect(() => parseIPInput("192.168.1.0/33")).toThrow();
    });
  });

  describe("CIDR notation parsing", () => {
    it("parses IPv4 CIDR format", () => {
      const result = parseIPInput("192.168.1.0/24");
      expect(result.ipAddress).toBe("192.168.1.0");
      expect(result.cidr).toBe(24);
      expect(result.format).toBe("cidr");
    });

    it("parses IPv6 CIDR format", () => {
      const result = parseIPInput("2001:db8::/32");
      expect(result.cidr).toBe(32);
      expect(result.format).toBe("cidr");
    });

    it("parses /0 CIDR prefix", () => {
      const result = parseIPInput("0.0.0.0/0");
      expect(result.cidr).toBe(0);
    });

    it("parses /32 CIDR prefix", () => {
      const result = parseIPInput("192.168.1.1/32");
      expect(result.cidr).toBe(32);
    });
  });

  describe("subnet mask notation", () => {
    it("parses IPv4 with subnet mask", () => {
      const result = parseIPInput("192.168.1.0", "255.255.255.0");
      expect(result.ipAddress).toBe("192.168.1.0");
      expect(result.cidr).toBe(24);
      expect(result.format).toBe("mask");
    });

    it("parses /16 subnet mask", () => {
      const result = parseIPInput("10.0.0.0", "255.255.0.0");
      expect(result.cidr).toBe(16);
    });

    it("throws for invalid subnet mask", () => {
      expect(() => parseIPInput("192.168.1.0", "not-a-mask")).toThrow();
    });
  });
});

describe("validateIPAddress", () => {
  it("validates 192.168.1.1 as IPv4", () => {
    const result = validateIPAddress("192.168.1.1");
    expect(result.valid).toBe(true);
    expect(result.version).toBe(4);
  });

  it("validates 2001:db8::1 as IPv6", () => {
    const result = validateIPAddress("2001:db8::1");
    expect(result.valid).toBe(true);
    expect(result.version).toBe(6);
  });

  it("validates ::1 loopback as IPv6", () => {
    const result = validateIPAddress("::1");
    expect(result.valid).toBe(true);
    expect(result.version).toBe(6);
  });

  it("returns valid false for invalid IP", () => {
    const result = validateIPAddress("invalid");
    expect(result.valid).toBe(false);
    expect(result.version).toBeNull();
  });

  it("returns error message for invalid IP", () => {
    const result = validateIPAddress("garbage");
    expect(result.error).toBeDefined();
  });
});
