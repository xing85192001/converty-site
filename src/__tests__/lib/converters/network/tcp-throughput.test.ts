import { describe, expect, it } from "vitest";
import { calculateTcpThroughput } from "@/lib/converters/network/tcp-throughput";

describe("calculateTcpThroughput", () => {
  describe("zero/invalid loss rate handling", () => {
    it("returns result even with zero loss rate (uses minimum loss internally)", () => {
      const result = calculateTcpThroughput({
        mss: 1460,
        rtt: 100,
        lossRate: 0,
      });
      // Does not return null — uses minimum loss value
      expect(result).not.toBeNull();
      expect(result.throughputMbps).toBeGreaterThan(0);
    });
  });

  describe("basic throughput calculation", () => {
    it("returns throughput in multiple units", () => {
      const result = calculateTcpThroughput({
        mss: 1460,
        rtt: 100,
        lossRate: 0.01,
      });
      expect(result.throughputBps).toBeGreaterThan(0);
      expect(result.throughputKbps).toBeGreaterThan(0);
      expect(result.throughputMbps).toBeGreaterThan(0);
      expect(result.throughputGbps).toBeGreaterThan(0);
      expect(result.throughputBytesPerSec).toBeGreaterThan(0);
      expect(result.throughputMBPerSec).toBeGreaterThan(0);
    });

    it("throughputBps is 8x throughputBytesPerSec", () => {
      const result = calculateTcpThroughput({
        mss: 1460,
        rtt: 100,
        lossRate: 0.01,
      });
      expect(result.throughputBps).toBeCloseTo(result.throughputBytesPerSec * 8, 5);
    });

    it("larger window size (larger MSS) produces higher throughput", () => {
      const low = calculateTcpThroughput({ mss: 512, rtt: 100, lossRate: 0.01 });
      const high = calculateTcpThroughput({ mss: 1460, rtt: 100, lossRate: 0.01 });
      expect(high.throughputMbps).toBeGreaterThan(low.throughputMbps);
    });

    it("lower packet loss produces higher throughput", () => {
      const lowLoss = calculateTcpThroughput({ mss: 1460, rtt: 100, lossRate: 0.001 });
      const highLoss = calculateTcpThroughput({ mss: 1460, rtt: 100, lossRate: 1 });
      expect(lowLoss.throughputMbps).toBeGreaterThan(highLoss.throughputMbps);
    });

    it("lower RTT produces higher throughput", () => {
      const lowRtt = calculateTcpThroughput({ mss: 1460, rtt: 10, lossRate: 0.01 });
      const highRtt = calculateTcpThroughput({ mss: 1460, rtt: 100, lossRate: 0.01 });
      expect(lowRtt.throughputMbps).toBeGreaterThan(highRtt.throughputMbps);
    });

    it("includes formula string", () => {
      const result = calculateTcpThroughput({ mss: 1460, rtt: 100, lossRate: 0.01 });
      expect(typeof result.formula).toBe("string");
      expect(result.formula.length).toBeGreaterThan(0);
    });

    it("includes steps array", () => {
      const result = calculateTcpThroughput({ mss: 1460, rtt: 100, lossRate: 0.01 });
      expect(result.steps.length).toBeGreaterThan(0);
    });

    it("includes recommendations array", () => {
      const result = calculateTcpThroughput({ mss: 1460, rtt: 100, lossRate: 0.01 });
      expect(Array.isArray(result.recommendations)).toBe(true);
    });
  });

  describe("custom cFactor", () => {
    it("doubling cFactor doubles throughput", () => {
      const base = calculateTcpThroughput({ mss: 1460, rtt: 100, lossRate: 0.01, cFactor: 1 });
      const doubled = calculateTcpThroughput({
        mss: 1460,
        rtt: 100,
        lossRate: 0.01,
        cFactor: 2,
      });
      expect(doubled.throughputMbps).toBeCloseTo(base.throughputMbps * 2, 5);
    });
  });
});
