import { describe, expect, it } from "vitest";
import { aggregateNetworks } from "@/lib/converters/network/supernetting";

describe("aggregateNetworks", () => {
  describe("invalid inputs return error result", () => {
    it("returns failure for fewer than 2 networks", () => {
      const result = aggregateNetworks(["192.168.0.0/24"]);
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toBeDefined();
      }
    });

    it("returns failure for non-power-of-2 network count (3)", () => {
      const result = aggregateNetworks(["192.168.0.0/24", "192.168.1.0/24", "192.168.2.0/24"]);
      expect(result.ok).toBe(false);
    });

    it("returns failure for network without CIDR notation", () => {
      const result = aggregateNetworks(["192.168.0.0", "192.168.1.0"]);
      expect(result.ok).toBe(false);
    });

    it("returns failure for invalid IP in network list", () => {
      const result = aggregateNetworks(["invalid/24", "192.168.1.0/24"]);
      expect(result.ok).toBe(false);
    });

    it("returns failure for mixed IP versions", () => {
      const result = aggregateNetworks(["192.168.0.0/24", "2001:db8::/32"]);
      expect(result.ok).toBe(false);
    });

    it("returns failure for different CIDR prefixes", () => {
      const result = aggregateNetworks(["192.168.0.0/24", "192.168.0.0/25"]);
      expect(result.ok).toBe(false);
    });
  });

  describe("successful aggregation", () => {
    it("aggregates two /24 networks into /23", () => {
      const result = aggregateNetworks(["192.168.0.0/24", "192.168.1.0/24"]);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.supernet).not.toBeNull();
        expect(result.value.supernet.networkAddress).toBe("192.168.0.0");
      }
    });

    it("supernet has correct prefix length /23 from two /24", () => {
      const result = aggregateNetworks(["192.168.0.0/24", "192.168.1.0/24"]);
      expect(result.ok).toBe(true);
      if (result.ok) {
        // The supernet should cover both /24 blocks
        expect(result.value.supernet.totalHosts).toBeGreaterThan(254n);
      }
    });

    it("aggregates four /24 networks into /22", () => {
      const result = aggregateNetworks([
        "192.168.0.0/24",
        "192.168.1.0/24",
        "192.168.2.0/24",
        "192.168.3.0/24",
      ]);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.supernet.networkAddress).toBe("192.168.0.0");
      }
    });

    it("returns original networks list", () => {
      const result = aggregateNetworks(["192.168.0.0/24", "192.168.1.0/24"]);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.originalNetworks).toHaveLength(2);
      }
    });
  });

  describe("non-contiguous networks fail gracefully", () => {
    it("returns failure for non-contiguous networks", () => {
      // 192.168.0.0/24 and 192.168.2.0/24 have a gap
      const result = aggregateNetworks(["192.168.0.0/24", "192.168.2.0/24"]);
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toBeDefined();
      }
    });
  });

  describe("boundary alignment", () => {
    it("returns failure when first network is not on supernet boundary", () => {
      // 192.168.1.0/24 and 192.168.2.0/24: first must be on /23 boundary (192.168.0.0)
      const result = aggregateNetworks(["192.168.1.0/24", "192.168.2.0/24"]);
      expect(result.ok).toBe(false);
    });
  });
});
