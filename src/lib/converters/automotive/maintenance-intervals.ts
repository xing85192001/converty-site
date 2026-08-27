// src/lib/converters/automotive/maintenance-intervals.ts

import maintenanceData from "@/lib/data/maintenance-intervals.json";

/**
 * Service interval definition from data file
 */
export interface ServiceInterval {
  id: string;
  name: string;
  intervalKm: number | null;
  intervalMonths: number | null;
  priority: number;
  category: string;
  description: string;
}

/**
 * Service status for a tracked item
 */
export type ServiceStatus = "ok" | "due_soon" | "due" | "overdue" | "critical";

/**
 * Calculated service due information
 */
export interface ServiceDue {
  service: ServiceInterval;
  status: ServiceStatus;

  // Last service info
  lastServiceKm: number | null;
  lastServiceDate: Date | null;

  // Next service calculations
  nextDueKm: number | null;
  nextDueDate: Date | null;

  // Remaining until due
  kmRemaining: number | null;
  daysRemaining: number | null;
  monthsRemaining: number | null;

  // Progress percentage (100% = due now)
  progressPercent: number;

  // Urgency message
  urgencyMessage: string;
}

/**
 * Swiss MFK inspection result
 */
export interface MFKInspectionDue {
  dueDate: Date;
  daysRemaining: number;
  monthsRemaining: number;
  status: ServiceStatus;
  isFirstInspection: boolean;
  message: string;
}

/**
 * Full service schedule result
 */
export interface ServiceScheduleResult {
  currentOdometerKm: number;
  averageKmPerMonth: number;
  vehicleAgeMonths: number;

  // All services with status
  services: ServiceDue[];

  // Grouped by status
  overdue: ServiceDue[];
  dueSoon: ServiceDue[];
  upcoming: ServiceDue[];

  // MFK inspection
  mfkInspection: MFKInspectionDue | null;

  // Summary
  totalServices: number;
  overdueCount: number;
  dueSoonCount: number;
}

// Load service intervals from data
const serviceIntervals: Record<string, ServiceInterval> = maintenanceData.intervals;
const mfkConfig = maintenanceData.swissMFK;

/**
 * Get all available service types
 */
export function getServiceTypes(): ServiceInterval[] {
  return Object.values(serviceIntervals);
}

/**
 * Get service by ID
 */
export function getServiceById(id: string): ServiceInterval | undefined {
  return serviceIntervals[id];
}

/**
 * Calculate service status based on remaining km/time
 */
function calculateStatus(
  kmRemaining: number | null,
  daysRemaining: number | null,
  _priority: number
): ServiceStatus {
  // Check km-based status
  if (kmRemaining !== null) {
    if (kmRemaining < -5000) return "critical";
    if (kmRemaining < 0) return "overdue";
    if (kmRemaining < 1000) return "due";
    if (kmRemaining < 3000) return "due_soon";
  }

  // Check time-based status
  if (daysRemaining !== null) {
    if (daysRemaining < -90) return "critical";
    if (daysRemaining < 0) return "overdue";
    if (daysRemaining < 30) return "due";
    if (daysRemaining < 60) return "due_soon";
  }

  return "ok";
}

/**
 * Calculate urgency message
 */
function getUrgencyMessage(
  status: ServiceStatus,
  kmRemaining: number | null,
  daysRemaining: number | null
): string {
  switch (status) {
    case "critical":
      return "CRITICAL - Service significantly overdue!";
    case "overdue":
      return "OVERDUE - Schedule service immediately";
    case "due":
      return "Due now - Schedule service soon";
    case "due_soon":
      if (kmRemaining !== null && kmRemaining < 3000) {
        return `Due in ${Math.round(kmRemaining)} km`;
      }
      if (daysRemaining !== null && daysRemaining < 60) {
        return `Due in ${Math.round(daysRemaining)} days`;
      }
      return "Due soon";
    default:
      return "OK";
  }
}

/**
 * Calculate when a service is next due
 */
export function calculateNextService(
  service: ServiceInterval,
  currentOdometerKm: number,
  lastServiceKm: number | null,
  lastServiceDate: Date | null,
  averageKmPerMonth: number
): ServiceDue {
  const today = new Date();

  let nextDueKm: number | null = null;
  let nextDueDate: Date | null = null;
  let kmRemaining: number | null = null;
  let daysRemaining: number | null = null;
  let monthsRemaining: number | null = null;
  let progressPercent = 0;

  // Calculate km-based due
  if (service.intervalKm !== null && lastServiceKm !== null) {
    nextDueKm = lastServiceKm + service.intervalKm;
    kmRemaining = nextDueKm - currentOdometerKm;

    // Estimate date based on average km/month
    if (averageKmPerMonth > 0 && kmRemaining > 0) {
      const monthsToNextKm = kmRemaining / averageKmPerMonth;
      nextDueDate = new Date(today);
      nextDueDate.setMonth(nextDueDate.getMonth() + Math.ceil(monthsToNextKm));
      daysRemaining = Math.round((nextDueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      monthsRemaining = Math.round(monthsToNextKm * 10) / 10;
    }

    // Progress based on km
    const kmSinceService = currentOdometerKm - lastServiceKm;
    progressPercent = Math.min(150, (kmSinceService / service.intervalKm) * 100);
  }

  // Calculate time-based due
  if (service.intervalMonths !== null && lastServiceDate !== null) {
    const timeDueDate = new Date(lastServiceDate);
    timeDueDate.setMonth(timeDueDate.getMonth() + service.intervalMonths);

    // Use earlier of km-based or time-based due date
    if (nextDueDate === null || timeDueDate < nextDueDate) {
      nextDueDate = timeDueDate;
    }

    const timeDaysRemaining = Math.round(
      (timeDueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Use more urgent of km or time remaining
    if (daysRemaining === null || timeDaysRemaining < daysRemaining) {
      daysRemaining = timeDaysRemaining;
      monthsRemaining = Math.round((timeDaysRemaining / 30) * 10) / 10;
    }

    // Progress based on time
    const monthsSinceService =
      (today.getTime() - lastServiceDate.getTime()) / (1000 * 60 * 60 * 24 * 30);
    const timeProgress = (monthsSinceService / service.intervalMonths) * 100;
    progressPercent = Math.max(progressPercent, Math.min(150, timeProgress));
  }

  const status = calculateStatus(kmRemaining, daysRemaining, service.priority);
  const urgencyMessage = getUrgencyMessage(status, kmRemaining, daysRemaining);

  return {
    service,
    status,
    lastServiceKm,
    lastServiceDate,
    nextDueKm,
    nextDueDate,
    kmRemaining,
    daysRemaining,
    monthsRemaining,
    progressPercent,
    urgencyMessage,
  };
}

/**
 * Calculate Swiss MFK inspection due date
 */
export function calculateMFKDue(registrationDate: Date): MFKInspectionDue {
  const today = new Date();
  const vehicleAgeMonths = Math.floor(
    (today.getTime() - registrationDate.getTime()) / (1000 * 60 * 60 * 24 * 30)
  );

  let nextDueDate: Date;
  let isFirstInspection = false;

  if (vehicleAgeMonths < mfkConfig.firstInspectionMonths) {
    // First inspection after 3 years
    nextDueDate = new Date(registrationDate);
    nextDueDate.setMonth(nextDueDate.getMonth() + mfkConfig.firstInspectionMonths);
    isFirstInspection = true;
  } else {
    // Calculate based on 2-year cycle (or 1-year for old vehicles)
    const monthsSinceFirst = vehicleAgeMonths - mfkConfig.firstInspectionMonths;
    const vehicleAgeYears = vehicleAgeMonths / 12;

    let inspectionInterval = mfkConfig.subsequentInspectionMonths;
    if (vehicleAgeYears >= mfkConfig.oldVehicleAgeYears) {
      inspectionInterval = mfkConfig.oldVehicleInspectionMonths;
    }

    const cycleCount = Math.floor(monthsSinceFirst / inspectionInterval);
    nextDueDate = new Date(registrationDate);
    nextDueDate.setMonth(
      nextDueDate.getMonth() +
        mfkConfig.firstInspectionMonths +
        (cycleCount + 1) * inspectionInterval
    );
  }

  const daysRemaining = Math.round(
    (nextDueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );
  const monthsRemaining = Math.round((daysRemaining / 30) * 10) / 10;

  let status: ServiceStatus;
  if (daysRemaining < -30) status = "critical";
  else if (daysRemaining < 0) status = "overdue";
  else if (daysRemaining < 30) status = "due";
  else if (daysRemaining < 60) status = "due_soon";
  else status = "ok";

  let message: string;
  if (status === "critical" || status === "overdue") {
    message = "MFK inspection overdue!";
  } else if (isFirstInspection) {
    message = `First MFK inspection due in ${monthsRemaining} months`;
  } else {
    message = `Next MFK inspection due in ${monthsRemaining} months`;
  }

  return {
    dueDate: nextDueDate,
    daysRemaining,
    monthsRemaining,
    status,
    isFirstInspection,
    message,
  };
}

/**
 * Input for service schedule calculation
 */
export interface ServiceScheduleInput {
  currentOdometerKm: number;
  averageKmPerMonth: number;
  vehicleRegistrationDate: Date;

  // Last service records (service ID -> { km, date })
  lastServices: Record<string, { km: number | null; date: Date | null }>;

  // Which oil type to track
  oilType?: "synthetic" | "conventional";
}

/**
 * Calculate full service schedule
 */
export function getServiceSchedule(input: ServiceScheduleInput): ServiceScheduleResult {
  const {
    currentOdometerKm,
    averageKmPerMonth,
    vehicleRegistrationDate,
    lastServices,
    oilType = "synthetic",
  } = input;

  const today = new Date();
  const vehicleAgeMonths = Math.floor(
    (today.getTime() - vehicleRegistrationDate.getTime()) / (1000 * 60 * 60 * 24 * 30)
  );

  // Get services to track (use correct oil type)
  const servicesToTrack = Object.values(serviceIntervals).filter((s) => {
    if (s.id === "oil_synthetic") return oilType === "synthetic";
    if (s.id === "oil_conventional") return oilType === "conventional";
    return true;
  });

  // Calculate each service
  const services: ServiceDue[] = servicesToTrack.map((service) => {
    const lastService = lastServices[service.id] || { km: null, date: null };
    return calculateNextService(
      service,
      currentOdometerKm,
      lastService.km,
      lastService.date,
      averageKmPerMonth
    );
  });

  // Sort by urgency (status priority, then by remaining km/days)
  const statusPriority: Record<ServiceStatus, number> = {
    critical: 0,
    overdue: 1,
    due: 2,
    due_soon: 3,
    ok: 4,
  };

  services.sort((a, b) => {
    const statusDiff = statusPriority[a.status] - statusPriority[b.status];
    if (statusDiff !== 0) return statusDiff;

    // Then by service priority
    return a.service.priority - b.service.priority;
  });

  // Group by status
  const overdue = services.filter((s) => s.status === "critical" || s.status === "overdue");
  const dueSoon = services.filter((s) => s.status === "due" || s.status === "due_soon");
  const upcoming = services.filter((s) => s.status === "ok");

  // Calculate MFK
  const mfkInspection = calculateMFKDue(vehicleRegistrationDate);

  return {
    currentOdometerKm,
    averageKmPerMonth,
    vehicleAgeMonths,
    services,
    overdue,
    dueSoon,
    upcoming,
    mfkInspection,
    totalServices: services.length,
    overdueCount: overdue.length,
    dueSoonCount: dueSoon.length,
  };
}

/**
 * Get default last service assumptions for a vehicle
 */
export function getDefaultLastServices(
  currentOdometerKm: number,
  vehicleRegistrationDate: Date
): Record<string, { km: number | null; date: Date | null }> {
  const today = new Date();
  const vehicleAgeMonths = Math.floor(
    (today.getTime() - vehicleRegistrationDate.getTime()) / (1000 * 60 * 60 * 24 * 30)
  );

  // Estimate last service based on typical intervals
  // Assume services were done at regular intervals
  const defaults: Record<string, { km: number | null; date: Date | null }> = {};

  for (const service of Object.values(serviceIntervals)) {
    if (service.intervalKm !== null) {
      // Estimate last service km
      const intervalsPassed = Math.floor(currentOdometerKm / service.intervalKm);
      const lastKm = intervalsPassed * service.intervalKm;
      defaults[service.id] = {
        km: lastKm > 0 ? lastKm : null,
        date: null, // Will be estimated based on km
      };
    } else if (service.intervalMonths !== null) {
      // Time-based services
      const intervalsPassed = Math.floor(vehicleAgeMonths / service.intervalMonths);
      if (intervalsPassed > 0) {
        const lastDate = new Date(vehicleRegistrationDate);
        lastDate.setMonth(lastDate.getMonth() + intervalsPassed * service.intervalMonths);
        defaults[service.id] = { km: null, date: lastDate };
      }
    }
  }

  return defaults;
}
