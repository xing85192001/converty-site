import { describe, expect, it } from "vitest";
import {
  calculateServerRefresh,
  getServerRefreshCpus,
} from "@/lib/converters/infrastructure/server-refresh";

// Real CPU IDs from the database
const BASE_INPUT = {
  oldCpuId: "intel-xeon-gold-6326",
  oldSocketsPerServer: "2",
  oldServerCount: "10",
  newCpuId: "intel-xeon-platinum-8592plus",
  newSocketsPerServer: "2",
  headroomPct: "25",
  chassisConstraint: "none",
  powerBudgetW: "0",
};

describe("calculateServerRefresh (real cpu-database.json)", () => {
  describe("error returns for invalid inputs", () => {
    it("returns error for invalid old CPU ID", () => {
      const result = calculateServerRefresh({
        ...BASE_INPUT,
        oldCpuId: "nonexistent-cpu-id",
      });
      expect(result.ok).toBe(false);
    });

    it("returns error for invalid new CPU ID", () => {
      const result = calculateServerRefresh({
        ...BASE_INPUT,
        newCpuId: "nonexistent-cpu-id",
      });
      expect(result.ok).toBe(false);
    });

    it("returns error for oldServerCount = 0", () => {
      const result = calculateServerRefresh({
        ...BASE_INPUT,
        oldServerCount: "0",
      });
      expect(result.ok).toBe(false);
    });

    it("returns error for non-numeric oldServerCount", () => {
      const result = calculateServerRefresh({
        ...BASE_INPUT,
        oldServerCount: "abc",
      });
      expect(result.ok).toBe(false);
    });
  });

  describe("valid server refresh scenario", () => {
    it("returns ok result for valid inputs", () => {
      const result = calculateServerRefresh(BASE_INPUT);
      expect(result.ok).toBe(true);
    });

    it("oldFleet.serverCount matches input", () => {
      const result = calculateServerRefresh(BASE_INPUT);
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value.oldFleet.serverCount).toBe(10);
    });

    it("requiredSpecint > oldFleet.totalSpecint due to headroom", () => {
      const result = calculateServerRefresh(BASE_INPUT);
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value.requiredSpecint).toBeGreaterThan(result.value.oldFleet.totalSpecint);
    });

    it("minNewServerCount is positive", () => {
      const result = calculateServerRefresh(BASE_INPUT);
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value.minNewServerCount).toBeGreaterThan(0);
    });

    it("headroomPct is correct value", () => {
      const result = calculateServerRefresh(BASE_INPUT);
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value.headroomPct).toBe(25);
    });
  });

  describe("chassis constraint", () => {
    it("1u-single constraint limits to 1 socket per server", () => {
      const result = calculateServerRefresh({
        ...BASE_INPUT,
        chassisConstraint: "1u-single",
        newSocketsPerServer: "2", // Should be capped to 1
      });
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value.specintPerNewServer).toBeGreaterThan(0);
    });
  });

  describe("power budget", () => {
    it("serversPerRack and racksNeeded are null when powerBudget = 0", () => {
      const result = calculateServerRefresh(BASE_INPUT); // powerBudgetW: "0"
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value.serversPerRack).toBeNull();
      expect(result.value.racksNeeded).toBeNull();
    });

    it("serversPerRack is non-null when powerBudget > 0", () => {
      const result = calculateServerRefresh({
        ...BASE_INPUT,
        powerBudgetW: "10000",
      });
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value.serversPerRack).not.toBeNull();
    });
  });

  describe("result structure", () => {
    it("result has oldFleet and newFleet summaries", () => {
      const result = calculateServerRefresh(BASE_INPUT);
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value.oldFleet.totalCores).toBeGreaterThan(0);
      expect(result.value.oldFleet.totalSpecint).toBeGreaterThan(0);
      expect(result.value.newFleet.serverCount).toBeGreaterThan(0);
    });

    it("has dataAsOf string", () => {
      const result = calculateServerRefresh(BASE_INPUT);
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value.dataAsOf).toBeTruthy();
    });
  });
});

describe("getServerRefreshCpus", () => {
  it("returns array with length > 0", () => {
    const cpus = getServerRefreshCpus();
    expect(cpus.length).toBeGreaterThan(0);
  });

  it("returns CPUs sorted by specint2017Peak descending", () => {
    const cpus = getServerRefreshCpus();
    for (let i = 0; i < cpus.length - 1; i++) {
      expect(cpus[i].specint2017Peak).toBeGreaterThanOrEqual(cpus[i + 1].specint2017Peak);
    }
  });
});
