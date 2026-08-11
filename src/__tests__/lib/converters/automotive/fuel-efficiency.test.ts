import { describe, expect, it } from "vitest";
import {
  calculateConsumption,
  calculateFuelEfficiency,
  lPer100kmToKmPerL,
  lPer100kmToMpgUS,
} from "@/lib/converters/automotive/fuel-efficiency";

describe("calculateConsumption", () => {
  it("returns 0 for distance = 0", () => {
    expect(calculateConsumption(0, 10)).toBe(0);
  });

  it("returns 0 for fuel = 0", () => {
    expect(calculateConsumption(300, 0)).toBe(0);
  });

  it("calculates 300 miles / 10 liters = 3.33 L/100km", () => {
    // 300km / 10L = 3.33 L/100km
    const result = calculateConsumption(300, 10);
    expect(result).toBeCloseTo(3.33, 1);
  });

  it("calculates correct L/100km for typical car", () => {
    // 100km / 8L = 8 L/100km
    expect(calculateConsumption(100, 8)).toBe(8);
  });
});

describe("lPer100kmToKmPerL", () => {
  it("returns 0 for lPer100km = 0", () => {
    expect(lPer100kmToKmPerL(0)).toBe(0);
  });

  it("10 L/100km = 10 km/L", () => {
    expect(lPer100kmToKmPerL(10)).toBe(10);
  });

  it("5 L/100km = 20 km/L", () => {
    expect(lPer100kmToKmPerL(5)).toBe(20);
  });
});

describe("lPer100kmToMpgUS", () => {
  it("returns 0 for lPer100km = 0", () => {
    expect(lPer100kmToMpgUS(0)).toBe(0);
  });

  it("7.84 L/100km ≈ 30 MPG (US)", () => {
    expect(lPer100kmToMpgUS(7.84)).toBeCloseTo(30, 0);
  });
});

describe("calculateFuelEfficiency", () => {
  it("returns ok: false when distanceKm = 0 in consumption mode", () => {
    const result = calculateFuelEfficiency({
      mode: "consumption",
      distanceKm: 0,
      fuelLiters: 10,
    });
    expect(result.ok).toBe(false);
  });

  it("returns ok: false when fuelLiters = 0 in consumption mode", () => {
    const result = calculateFuelEfficiency({
      mode: "consumption",
      distanceKm: 300,
      fuelLiters: 0,
    });
    expect(result.ok).toBe(false);
  });

  it("calculates consumption mode: 300km / 10L = 3.33 L/100km", () => {
    const result = calculateFuelEfficiency({
      mode: "consumption",
      distanceKm: 300,
      fuelLiters: 10,
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.lPer100km).toBeCloseTo(3.33, 1);
      expect(result.value.mpgUS).toBeGreaterThan(0);
      expect(result.value.kmPerL).toBeGreaterThan(0);
    }
  });

  it("calculates MPG conversion for 30 MPG car (7.84 L/100km)", () => {
    const result = calculateFuelEfficiency({
      mode: "consumption",
      distanceKm: 100,
      fuelLiters: 7.84,
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.mpgUS).toBeCloseTo(30, 0);
    }
  });

  it("returns ok: false for tripPlanning with no consumption", () => {
    const result = calculateFuelEfficiency({
      mode: "tripPlanning",
      consumptionLPer100km: 0,
    });
    expect(result.ok).toBe(false);
  });

  it("calculates tripPlanning mode with fuel needed", () => {
    const result = calculateFuelEfficiency({
      mode: "tripPlanning",
      consumptionLPer100km: 8,
      tripDistanceKm: 500,
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.tripFuelNeeded).toBeCloseTo(40, 1);
    }
  });

  it("identifies more efficient vehicle in comparison mode", () => {
    const result = calculateFuelEfficiency({
      mode: "comparison",
      vehicle1LPer100km: 5,
      vehicle2LPer100km: 8,
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.moreEfficientVehicle).toBe(1);
    }
  });

  it("returns rating for efficiency", () => {
    const result = calculateFuelEfficiency({
      mode: "consumption",
      distanceKm: 100,
      fuelLiters: 4,
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.rating).toBe("excellent");
    }
  });
});
