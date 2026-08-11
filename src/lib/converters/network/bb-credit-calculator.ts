/**
 * BB Credit (Buffer-to-Buffer Credit) Calculator for Fibre Channel ISL links
 *
 * BB credits control flow on FC links. ISL links over long distances need extra
 * credits to keep the pipe full and prevent back-pressure stalls.
 *
 * Formula:
 *   RTT = (2 × distance_km × 1000 m) / (2 × 10^8 m/s) = distance_km / 100,000 s
 *   bytes_in_flight = RTT × (speed_Gbps × 10^9 / 8)
 *                   = distance_km × speed_Gbps × 1250
 *   bb_credits_min  = ceil(bytes_in_flight / FC_FRAME_SIZE)
 *                   = ceil(distance_km × speed_Gbps × 1250 / 2148)
 */

import type { CalculationResult } from "@/types";

/** Standard FC frame payload + overhead = 2148 bytes */
const FC_FRAME_SIZE_BYTES = 2148;

/** Speed of light in fiber-optic cable ≈ 200,000 km/s (2/3 of c in vacuum) */
const SPEED_OF_LIGHT_IN_FIBER_KM_PER_S = 200_000;

/** Recommended safety margin above minimum (20%) */
const SAFETY_MARGIN = 1.2;

/** Supported Fibre Channel line rates in Gbps */
export type FCSpeed = 4 | 8 | 16 | 32 | 64 | 128;

export const FC_SPEEDS: FCSpeed[] = [4, 8, 16, 32, 64, 128];

export interface BBCreditInput {
  /** Cable / dark fibre distance in kilometres */
  distanceKm: number;
  /** Fibre Channel line rate in Gbps */
  speedGbps: FCSpeed;
  /** Port identifier string used in generated CLI commands, e.g. "1/1" or "3" */
  portId: string;
}

export interface BBCreditResult {
  /** Minimum BB credits required by physics */
  minCredits: number;
  /** Recommended value with 20% safety margin */
  recommendedCredits: number;
  /** Round-trip time in microseconds */
  rttMicroseconds: number;
  /** Data bytes in flight during one RTT */
  bytesInFlight: number;
  /** Brocade FOS — portcfgex syntax (modern) */
  brocadePortcfgex: string;
  /** Brocade FOS — portcfglongdistance syntax (legacy) */
  brocadePortcfgld: string;
  /** Cisco MDS NX-OS — switchport fcrxbbcredit syntax */
  mdsFcrxbbcredit: string;
  /** Cisco MDS NX-OS — switchport buf-size syntax */
  mdsBufSize: string;
  /** Human-readable calculation steps for display */
  steps: string[];
}

/**
 * Calculate the BB credits required for a Fibre Channel ISL link.
 *
 * @param input - Distance, FC speed, and port identifier
 * @returns Calculation result with vendor CLI commands, or null for invalid input
 *
 * @example
 * ```typescript
 * const result = calculateBBCredits({ distanceKm: 10, speedGbps: 8, portId: "1/1" });
 * // result.minCredits ≈ 47
 * // result.recommendedCredits ≈ 57
 * ```
 */
export function calculateBBCredits(input: BBCreditInput): CalculationResult<BBCreditResult> {
  const { distanceKm, speedGbps, portId } = input;

  if (distanceKm <= 0 || speedGbps <= 0) {
    return { ok: false, error: "Distance and speed must be positive", code: "INVALID_INPUT" };
  }

  const steps: string[] = [];

  // Step 1: Round-trip time
  // RTT = (2 × distance) / speed_of_light  [no ×2 in denominator — that's the round-trip factor]
  const rttSeconds = (2 * distanceKm) / SPEED_OF_LIGHT_IN_FIBER_KM_PER_S;
  const rttMicroseconds = rttSeconds * 1_000_000;
  steps.push(
    `RTT = 2 × ${distanceKm} km / ${SPEED_OF_LIGHT_IN_FIBER_KM_PER_S.toLocaleString()} km/s`
  );
  steps.push(`RTT = ${rttMicroseconds.toFixed(2)} µs`);

  // Step 2: Bytes in flight
  const lineRateBytesPerSecond = (speedGbps * 1e9) / 8;
  const bytesInFlight = rttSeconds * lineRateBytesPerSecond;
  steps.push(
    `Bytes in flight = RTT × line rate = ${rttMicroseconds.toFixed(2)} µs × ${speedGbps} Gbps / 8`
  );
  steps.push(`Bytes in flight = ${Math.round(bytesInFlight).toLocaleString()} bytes`);

  // Step 3: Minimum credits
  const minCredits = Math.ceil(bytesInFlight / FC_FRAME_SIZE_BYTES);
  steps.push(
    `Min credits = ⌈bytes in flight / FC frame size⌉ = ⌈${Math.round(bytesInFlight).toLocaleString()} / ${FC_FRAME_SIZE_BYTES}⌉`
  );
  steps.push(`Min credits = ${minCredits}`);

  // Step 4: Recommended credits (+20%)
  const recommendedCredits = Math.ceil(minCredits * SAFETY_MARGIN);
  steps.push(
    `Recommended = ⌈${minCredits} × ${SAFETY_MARGIN}⌉ = ${recommendedCredits} (${(SAFETY_MARGIN - 1) * 100}% margin)`
  );

  // Generate CLI commands
  const portStr = portId.trim() || "1/1";
  const creditValue = recommendedCredits;

  const brocadePortcfgex = `portcfgex ${portStr} -buffers ${creditValue}`;

  const brocadePortcfgld = `portcfglongdistance ${portStr} LE ${creditValue}`;

  const mdsFcrxbbcredit = [
    `interface fc${portStr}`,
    `  switchport fcrxbbcredit ${creditValue}`,
  ].join("\n");

  const mdsBufSize = [`interface fc${portStr}`, `  switchport buf-size ${creditValue}`].join("\n");

  return {
    ok: true,
    value: {
      minCredits,
      recommendedCredits,
      rttMicroseconds,
      bytesInFlight,
      brocadePortcfgex,
      brocadePortcfgld,
      mdsFcrxbbcredit,
      mdsBufSize,
      steps,
    },
  };
}
