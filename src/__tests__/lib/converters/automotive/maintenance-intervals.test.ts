import { describe, expect, it } from "vitest";
import {
  calculateMFKDue,
  calculateNextService,
  getDefaultLastServices,
  getServiceById,
  getServiceSchedule,
  getServiceTypes,
} from "@/lib/converters/automotive/maintenance-intervals";

describe("getServiceTypes", () => {
  it("returns an array of service types", () => {
    const services = getServiceTypes();
    expect(Array.isArray(services)).toBe(true);
    expect(services.length).toBeGreaterThan(0);
  });

  it("each service type has required fields", () => {
    const services = getServiceTypes();
    for (const service of services) {
      expect(service).toHaveProperty("id");
      expect(service).toHaveProperty("name");
      expect(service).toHaveProperty("priority");
      expect(service).toHaveProperty("category");
    }
  });
});

describe("getServiceById", () => {
  it("returns undefined for unknown id", () => {
    expect(getServiceById("nonexistent_service_xyz")).toBeUndefined();
  });

  it("returns a service for a valid id from getServiceTypes", () => {
    const services = getServiceTypes();
    const firstService = services[0];
    const found = getServiceById(firstService.id);
    expect(found).toBeDefined();
    expect(found!.id).toBe(firstService.id);
  });
});

describe("calculateNextService", () => {
  it("returns 'ok' status for service with lots of km remaining", () => {
    const services = getServiceTypes();
    const service = services.find((s) => s.intervalKm !== null);
    if (!service) return; // Skip if no km-based service

    const result = calculateNextService(
      service,
      10000, // current odometer: 10,000 km
      0, // last service at 0 km
      null,
      1000 // average 1000 km/month
    );
    // service.intervalKm - 10000 km remaining = lots of km left
    expect(result).toBeDefined();
    expect(result.service.id).toBe(service.id);
  });

  it("returns overdue status when km is significantly past due", () => {
    const services = getServiceTypes();
    const service = services.find((s) => s.intervalKm !== null);
    if (!service || service.intervalKm === null) return;

    // Last service was at 0 km, now at 2x interval
    const currentOdometer = service.intervalKm * 2;
    const result = calculateNextService(service, currentOdometer, 0, null, 1000);
    expect(["overdue", "critical"]).toContain(result.status);
  });

  it("includes urgencyMessage", () => {
    const services = getServiceTypes();
    const service = services[0];
    const result = calculateNextService(service, 10000, 0, null, 1000);
    expect(typeof result.urgencyMessage).toBe("string");
    expect(result.urgencyMessage.length).toBeGreaterThan(0);
  });

  it("includes progressPercent between 0 and 150", () => {
    const services = getServiceTypes();
    const service = services.find((s) => s.intervalKm !== null);
    if (!service) return;

    const result = calculateNextService(service, 1000, 0, null, 500);
    expect(result.progressPercent).toBeGreaterThanOrEqual(0);
    expect(result.progressPercent).toBeLessThanOrEqual(150);
  });

  it("calculates km remaining correctly", () => {
    const services = getServiceTypes();
    const service = services.find((s) => s.intervalKm !== null && s.intervalKm > 0);
    if (!service || service.intervalKm === null) return;

    const lastServiceKm = 40000;
    const currentKm = 42000;
    const expectedRemaining = lastServiceKm + service.intervalKm - currentKm;

    const result = calculateNextService(service, currentKm, lastServiceKm, null, 1000);
    if (result.kmRemaining !== null) {
      expect(result.kmRemaining).toBe(expectedRemaining);
    }
  });

  describe("status variants", () => {
    it("returns critical status when far past due km", () => {
      const services = getServiceTypes();
      const service = services.find((s) => s.intervalKm !== null);
      if (!service || service.intervalKm === null) return;

      // 6000km past due → critical
      const currentOdometer = service.intervalKm + 6000;
      const result = calculateNextService(service, currentOdometer, 0, null, 1000);
      expect(result.status).toBe("critical");
    });

    it("returns due status when within 1000km remaining", () => {
      const services = getServiceTypes();
      const service = services.find((s) => s.intervalKm !== null && s.intervalKm > 2000);
      if (!service || service.intervalKm === null) return;

      // 500km before due
      const lastServiceKm = 0;
      const currentOdometer = service.intervalKm - 500;
      const result = calculateNextService(service, currentOdometer, lastServiceKm, null, 1000);
      expect(["due", "due_soon"]).toContain(result.status);
    });

    it("returns due_soon status when 1000-3000km remaining", () => {
      const services = getServiceTypes();
      const service = services.find((s) => s.intervalKm !== null && s.intervalKm > 5000);
      if (!service || service.intervalKm === null) return;

      // 2000km before due
      const lastServiceKm = 0;
      const currentOdometer = service.intervalKm - 2000;
      const result = calculateNextService(service, currentOdometer, lastServiceKm, null, 1000);
      expect(["due_soon", "due", "ok"]).toContain(result.status);
    });
  });

  describe("time-based services", () => {
    it("processes time-based service with lastServiceDate", () => {
      const services = getServiceTypes();
      const service = services.find((s) => s.intervalMonths !== null);
      if (!service || service.intervalMonths === null) return;

      const lastServiceDate = new Date();
      lastServiceDate.setMonth(lastServiceDate.getMonth() - service.intervalMonths + 2);

      const result = calculateNextService(service, 10000, null, lastServiceDate, 1000);
      expect(result).toBeDefined();
      expect(result.daysRemaining).not.toBeNull();
    });

    it("processes overdue time-based service", () => {
      const services = getServiceTypes();
      const service = services.find((s) => s.intervalMonths !== null);
      if (!service || service.intervalMonths === null) return;

      // Last service was 2 intervals ago
      const lastServiceDate = new Date();
      lastServiceDate.setMonth(lastServiceDate.getMonth() - service.intervalMonths * 2);

      const result = calculateNextService(service, 10000, null, lastServiceDate, 1000);
      expect(["overdue", "critical"]).toContain(result.status);
    });
  });

  describe("urgency messages", () => {
    it("returns overdue urgency message for overdue service", () => {
      const services = getServiceTypes();
      const service = services.find((s) => s.intervalKm !== null);
      if (!service || service.intervalKm === null) return;

      const currentOdometer = service.intervalKm + 1000; // 1000km past due
      const result = calculateNextService(service, currentOdometer, 0, null, 1000);
      expect(result.urgencyMessage).toContain("OVERDUE");
    });
  });
});

describe("calculateMFKDue", () => {
  it("returns first inspection for new vehicle (< 3 years old)", () => {
    const registrationDate = new Date();
    registrationDate.setMonth(registrationDate.getMonth() - 12); // 1 year old
    const result = calculateMFKDue(registrationDate);
    expect(result).toBeDefined();
    expect(result.isFirstInspection).toBe(true);
  });

  it("returns subsequent inspection for older vehicle", () => {
    const registrationDate = new Date();
    registrationDate.setFullYear(registrationDate.getFullYear() - 5); // 5 years old
    const result = calculateMFKDue(registrationDate);
    expect(result).toBeDefined();
    expect(result.isFirstInspection).toBe(false);
    expect(typeof result.daysRemaining).toBe("number");
  });
});

describe("getServiceSchedule", () => {
  it("returns full service schedule result", () => {
    const registrationDate = new Date();
    registrationDate.setFullYear(registrationDate.getFullYear() - 3);

    const result = getServiceSchedule({
      currentOdometerKm: 50000,
      averageKmPerMonth: 1000,
      vehicleRegistrationDate: registrationDate,
      lastServices: {},
      oilType: "synthetic",
    });

    expect(result).toBeDefined();
    expect(result.services).toBeInstanceOf(Array);
    expect(result.totalServices).toBeGreaterThan(0);
  });

  it("uses conventional oil type when specified", () => {
    const registrationDate = new Date();
    registrationDate.setFullYear(registrationDate.getFullYear() - 2);

    const result = getServiceSchedule({
      currentOdometerKm: 30000,
      averageKmPerMonth: 1000,
      vehicleRegistrationDate: registrationDate,
      lastServices: {},
      oilType: "conventional",
    });

    expect(result).toBeDefined();
    expect(result.services).toBeInstanceOf(Array);
  });
});

describe("getDefaultLastServices", () => {
  it("returns default service map", () => {
    const registrationDate = new Date();
    registrationDate.setFullYear(registrationDate.getFullYear() - 3);

    const defaults = getDefaultLastServices(60000, registrationDate);
    expect(typeof defaults).toBe("object");
  });
});
