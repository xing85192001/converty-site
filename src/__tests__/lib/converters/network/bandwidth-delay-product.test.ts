import { describe, expect, it } from "vitest";
import { calculateBandwidthDelayProduct } from "@/lib/converters/network/bandwidth-delay-product";

describe("calculateBandwidthDelayProduct", () => {
  describe("basic BDP calculations", () => {
    it("calculates BDP for 1 Gbps and 100ms RTT", () => {
      const result = calculateBandwidthDelayProduct({
        bandwidth: 1000,
        rtt: 100,
        windowSize: 64,
      });
      // BDP = 1000 Mbps * 0.1s = 100 Mbits = 12,500,000 bytes
      // In KBytes (1024-based): 12207 KB; in MBytes: ~11.92 MB
      expect(result.bdpBits).toBeCloseTo(100_000_000, -3);
    });

    it("calculates BDP bits correctly", () => {
      // 100 Mbps * 10ms = 1 Mbit BDP
      const result = calculateBandwidthDelayProduct({
        bandwidth: 100,
        rtt: 10,
        windowSize: 64,
      });
      expect(result.bdpBits).toBeCloseTo(1_000_000, -2);
    });

    it("calculates BDP bytes as bdpBits / 8", () => {
      const result = calculateBandwidthDelayProduct({
        bandwidth: 100,
        rtt: 10,
        windowSize: 64,
      });
      expect(result.bdpBytes).toBeCloseTo(result.bdpBits / 8, 5);
    });

    it("larger bandwidth produces larger BDP", () => {
      const low = calculateBandwidthDelayProduct({ bandwidth: 100, rtt: 50, windowSize: 64 });
      const high = calculateBandwidthDelayProduct({ bandwidth: 1000, rtt: 50, windowSize: 64 });
      expect(high.bdpBits).toBeGreaterThan(low.bdpBits);
    });

    it("larger RTT produces larger BDP", () => {
      const low = calculateBandwidthDelayProduct({ bandwidth: 100, rtt: 10, windowSize: 64 });
      const high = calculateBandwidthDelayProduct({ bandwidth: 100, rtt: 100, windowSize: 64 });
      expect(high.bdpBits).toBeGreaterThan(low.bdpBits);
    });
  });

  describe("window analysis", () => {
    it("marks window as sufficient when windowSize >= BDP", () => {
      // Small BDP: 1 Mbps * 1ms = 0.125 KB -- tiny window is sufficient
      const result = calculateBandwidthDelayProduct({
        bandwidth: 1,
        rtt: 1,
        windowSize: 64,
      });
      expect(result.isWindowSufficient).toBe(true);
    });

    it("marks window as insufficient when windowSize < BDP", () => {
      // Large BDP: 10 Gbps * 100ms = 125 MB >> 64 KB window
      const result = calculateBandwidthDelayProduct({
        bandwidth: 10000,
        rtt: 100,
        windowSize: 64,
      });
      expect(result.isWindowSufficient).toBe(false);
    });

    it("windowUtilization is capped at 100", () => {
      const result = calculateBandwidthDelayProduct({
        bandwidth: 1,
        rtt: 1,
        windowSize: 64,
      });
      expect(result.windowUtilization).toBeLessThanOrEqual(100);
    });

    it("calculates maxThroughputMbps as windowBits / rttSeconds / 1e6", () => {
      const result = calculateBandwidthDelayProduct({
        bandwidth: 100,
        rtt: 100,
        windowSize: 64,
      });
      // Window 64 KB = 65536 bytes = 524288 bits; RTT 0.1s → 5.24 Mbps
      expect(result.maxThroughputMbps).toBeCloseTo(5.24, 1);
    });
  });

  describe("steps and recommendations", () => {
    it("returns non-empty steps array", () => {
      const result = calculateBandwidthDelayProduct({
        bandwidth: 100,
        rtt: 50,
        windowSize: 64,
      });
      expect(result.steps.length).toBeGreaterThan(0);
    });

    it("returns non-empty recommendations array", () => {
      const result = calculateBandwidthDelayProduct({
        bandwidth: 100,
        rtt: 50,
        windowSize: 64,
      });
      expect(result.recommendations.length).toBeGreaterThan(0);
    });
  });
});
