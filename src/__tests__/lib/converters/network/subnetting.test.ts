import { describe, expect, it } from "vitest";
import { divideSubnet } from "@/lib/converters/network/subnetting";

describe("divideSubnet", () => {
  describe("invalid inputs throw", () => {
    it("throws for invalid network address", () => {
      expect(() => divideSubnet("invalid", 24, 4)).toThrow();
    });

    it("throws for non-power-of-2 divisions (3)", () => {
      expect(() => divideSubnet("192.168.1.0", 24, 3)).toThrow();
    });

    it("throws for non-power-of-2 divisions (1)", () => {
      expect(() => divideSubnet("192.168.1.0", 24, 1)).toThrow();
    });

    it("throws when new CIDR exceeds maximum (IPv4 /31 into 4)", () => {
      // /31 + 2 bits = /33 which exceeds /32 max
      expect(() => divideSubnet("192.168.1.0", 31, 4)).toThrow();
    });
  });

  describe("dividing /24 into 4 /26 subnets", () => {
    it("returns 4 child subnets", () => {
      const result = divideSubnet("192.168.1.0", 24, 4);
      expect(result.children).toHaveLength(4);
    });

    it("sets newCidr to 26", () => {
      const result = divideSubnet("192.168.1.0", 24, 4);
      expect(result.newCidr).toBe(26);
    });

    it("sets divisions to 4", () => {
      const result = divideSubnet("192.168.1.0", 24, 4);
      expect(result.divisions).toBe(4);
    });

    it("first child starts at network address", () => {
      const result = divideSubnet("192.168.1.0", 24, 4);
      expect(result.children[0].networkAddress).toBe("192.168.1.0");
    });

    it("second child starts at .64", () => {
      const result = divideSubnet("192.168.1.0", 24, 4);
      expect(result.children[1].networkAddress).toBe("192.168.1.64");
    });

    it("third child starts at .128", () => {
      const result = divideSubnet("192.168.1.0", 24, 4);
      expect(result.children[2].networkAddress).toBe("192.168.1.128");
    });

    it("fourth child starts at .192", () => {
      const result = divideSubnet("192.168.1.0", 24, 4);
      expect(result.children[3].networkAddress).toBe("192.168.1.192");
    });

    it("parent subnet preserves original network", () => {
      const result = divideSubnet("192.168.1.0", 24, 4);
      expect(result.parent.networkAddress).toBe("192.168.1.0");
    });
  });

  describe("dividing /24 into 2 /25 subnets", () => {
    it("returns 2 child subnets", () => {
      const result = divideSubnet("192.168.1.0", 24, 2);
      expect(result.children).toHaveLength(2);
    });

    it("sets newCidr to 25", () => {
      const result = divideSubnet("192.168.1.0", 24, 2);
      expect(result.newCidr).toBe(25);
    });
  });

  describe("IPv6 subnetting", () => {
    it("divides IPv6 /32 into 4 /34 subnets", () => {
      const result = divideSubnet("2001:db8::", 32, 4);
      expect(result.children).toHaveLength(4);
      expect(result.newCidr).toBe(34);
    });
  });
});
