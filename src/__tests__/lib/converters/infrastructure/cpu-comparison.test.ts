import { describe, expect, it } from "vitest";
import {
  calculateCpuComparison,
  getFilteredCpus,
} from "@/lib/converters/infrastructure/cpu-comparison";

describe("calculateCpuComparison (real cpu-database.json)", () => {
  describe("error returns for invalid inputs", () => {
    it("returns error for fewer than 2 CPU IDs", () => {
      const result = calculateCpuComparison({
        cpuIds: "intel-xeon-platinum-8592plus",
        vendor: "all",
        generation: "all",
      });
      expect(result.ok).toBe(false);
    });

    it("returns error for empty cpuIds string", () => {
      const result = calculateCpuComparison({
        cpuIds: "",
        vendor: "all",
        generation: "all",
      });
      expect(result.ok).toBe(false);
    });

    it("returns error for single invalid CPU ID", () => {
      const result = calculateCpuComparison({
        cpuIds: "nonexistent-cpu-id",
        vendor: "all",
        generation: "all",
      });
      expect(result.ok).toBe(false);
    });
  });

  describe("comparison with 2 valid CPU IDs", () => {
    it("returns comparison for 2 valid CPU IDs", () => {
      const result = calculateCpuComparison({
        cpuIds: "intel-xeon-platinum-8592plus,amd-epyc-9654",
        vendor: "all",
        generation: "all",
      });
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value.rows).toHaveLength(2);
    });

    it("first CPU always has sizingRatioVsFirst = 1.0", () => {
      const result = calculateCpuComparison({
        cpuIds: "intel-xeon-platinum-8592plus,amd-epyc-9654",
        vendor: "all",
        generation: "all",
      });
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value.rows[0].sizingRatioVsFirst).toBe(1.0);
    });

    it("result includes dataAsOf and baselineCpuId", () => {
      const result = calculateCpuComparison({
        cpuIds: "intel-xeon-platinum-8592plus,amd-epyc-9654",
        vendor: "all",
        generation: "all",
      });
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value.dataAsOf).toBeTruthy();
      expect(result.value.baselineCpuId).toBe("intel-xeon-platinum-8592plus");
    });

    it("each row has required performance fields", () => {
      const result = calculateCpuComparison({
        cpuIds: "intel-xeon-platinum-8592plus,amd-epyc-9654",
        vendor: "all",
        generation: "all",
      });
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      for (const row of result.value.rows) {
        expect(row.cores).toBeGreaterThan(0);
        expect(row.specint2017Peak).toBeGreaterThan(0);
        expect(row.perfPerCore).toBeGreaterThan(0);
        expect(row.perfPerWatt).toBeGreaterThan(0);
      }
    });
  });
});

describe("getFilteredCpus (real cpu-database.json)", () => {
  it("getFilteredCpus('all','all') returns array with length > 0", () => {
    const cpus = getFilteredCpus("all", "all");
    expect(cpus.length).toBeGreaterThan(0);
  });

  it("getFilteredCpus('intel','all') returns only intel CPUs", () => {
    const cpus = getFilteredCpus("intel", "all");
    expect(cpus.length).toBeGreaterThan(0);
    for (const cpu of cpus) {
      expect(cpu.vendor).toBe("intel");
    }
  });

  it("getFilteredCpus('amd','all') returns only AMD CPUs", () => {
    const cpus = getFilteredCpus("amd", "all");
    expect(cpus.length).toBeGreaterThan(0);
    for (const cpu of cpus) {
      expect(cpu.vendor).toBe("amd");
    }
  });

  it("filter by generation 'current' returns subset of all", () => {
    const all = getFilteredCpus("all", "all");
    const current = getFilteredCpus("all", "current");
    expect(current.length).toBeLessThanOrEqual(all.length);
    for (const cpu of current) {
      expect(cpu.generation).toBe("current");
    }
  });

  it("each CPU has id, name, vendor, specint2017Peak", () => {
    const cpus = getFilteredCpus("all", "all");
    for (const cpu of cpus.slice(0, 3)) {
      expect(cpu.id).toBeTruthy();
      expect(cpu.name).toBeTruthy();
      expect(cpu.vendor).toBeTruthy();
      expect(cpu.specint2017Peak).toBeGreaterThan(0);
    }
  });
});
