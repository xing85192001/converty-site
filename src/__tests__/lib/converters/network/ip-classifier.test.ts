import { describe, expect, it } from "vitest";
import { classifyIPAddress } from "@/lib/converters/network/ip-classifier";

describe("classifyIPAddress", () => {
  describe("invalid inputs throw", () => {
    it("throws for non-IP string", () => {
      expect(() => classifyIPAddress("not-an-ip")).toThrow();
    });

    it("throws for empty string", () => {
      expect(() => classifyIPAddress("")).toThrow();
    });

    it("throws for malformed IP", () => {
      expect(() => classifyIPAddress("256.0.0.1")).toThrow();
    });
  });

  describe("private addresses", () => {
    it("classifies 192.168.1.1 as private", () => {
      const result = classifyIPAddress("192.168.1.1");
      expect(result.isPrivate).toBe(true);
      expect(result.isPublic).toBe(false);
    });

    it("classifies 10.0.0.1 as private (Class A)", () => {
      const result = classifyIPAddress("10.0.0.1");
      expect(result.isPrivate).toBe(true);
      expect(result.isPublic).toBe(false);
    });

    it("classifies 172.16.0.1 as private (Class B private)", () => {
      const result = classifyIPAddress("172.16.0.1");
      expect(result.isPrivate).toBe(true);
    });
  });

  describe("public addresses", () => {
    it("classifies 8.8.8.8 as public", () => {
      const result = classifyIPAddress("8.8.8.8");
      expect(result.isPublic).toBe(true);
      expect(result.isPrivate).toBe(false);
    });

    it("classifies 1.1.1.1 as public", () => {
      const result = classifyIPAddress("1.1.1.1");
      expect(result.isPublic).toBe(true);
    });
  });

  describe("special addresses", () => {
    it("classifies 127.0.0.1 as loopback/special", () => {
      const result = classifyIPAddress("127.0.0.1");
      expect(result.isSpecial).toBe(true);
      expect(result.isPublic).toBe(false);
    });
  });

  describe("IP classes", () => {
    it("classifies 8.8.8.8 as class A", () => {
      const result = classifyIPAddress("8.8.8.8");
      expect(result.ipClass).toBe("A");
    });

    it("classifies 192.168.1.1 as class C", () => {
      const result = classifyIPAddress("192.168.1.1");
      expect(result.ipClass).toBe("C");
    });

    it("classifies 172.16.0.1 as class B", () => {
      const result = classifyIPAddress("172.16.0.1");
      expect(result.ipClass).toBe("B");
    });

    it("classifies 224.0.0.1 as class D (multicast)", () => {
      const result = classifyIPAddress("224.0.0.1");
      expect(result.ipClass).toBe("D");
    });
  });

  describe("IPv4 metadata", () => {
    it("sets ipVersion to 4 for IPv4", () => {
      const result = classifyIPAddress("8.8.8.8");
      expect(result.ipVersion).toBe(4);
    });

    it("includes rangeType string", () => {
      const result = classifyIPAddress("8.8.8.8");
      expect(typeof result.rangeType).toBe("string");
    });

    it("includes rangeDescription string", () => {
      const result = classifyIPAddress("192.168.1.1");
      expect(typeof result.rangeDescription).toBe("string");
      expect(result.rangeDescription.length).toBeGreaterThan(0);
    });

    it("returns normalized IP", () => {
      const result = classifyIPAddress("8.8.8.8");
      expect(result.normalizedIP).toBe("8.8.8.8");
    });
  });

  describe("IPv6 addresses", () => {
    it("classifies ::1 loopback with no IP class", () => {
      const result = classifyIPAddress("::1");
      expect(result.ipClass).toBeNull();
      expect(result.ipVersion).toBe(6);
    });

    it("classifies 2001:db8::1 as IPv6 version 6", () => {
      const result = classifyIPAddress("2001:db8::1");
      expect(result.ipVersion).toBe(6);
    });
  });
});
