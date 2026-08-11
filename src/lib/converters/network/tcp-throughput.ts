/**
 * TCP Throughput Calculator
 * Based on the Mathis et al. formula for TCP throughput estimation
 *
 * Simplified formula: rate < (MSS/RTT) * (C/sqrt(Loss))
 * Where C = 1 (constant factor, typically between 0.87 and 1.31)
 */

export interface TcpThroughputInput {
  mss: number; // Maximum Segment Size in bytes (typically MTU - 40B for TCP/IP header)
  rtt: number; // Round Trip Time in milliseconds
  lossRate: number; // Packet loss rate as percentage (e.g., 0.0001 for 0.0001%)
  cFactor?: number; // Constant factor (default: 1)
}

export interface TcpThroughputResult {
  throughputBps: number; // Throughput in bits per second
  throughputKbps: number; // Throughput in kilobits per second
  throughputMbps: number; // Throughput in megabits per second
  throughputGbps: number; // Throughput in gigabits per second
  throughputBytesPerSec: number; // Throughput in bytes per second
  throughputMBPerSec: number; // Throughput in megabytes per second
  formula: string; // The formula used
  steps: string[]; // Calculation steps
  recommendations: string[]; // Recommendations based on results
}

export function calculateTcpThroughput(input: TcpThroughputInput): TcpThroughputResult {
  const { mss, rtt, lossRate, cFactor = 1 } = input;

  // Convert RTT from milliseconds to seconds
  const rttSeconds = rtt / 1000;

  // Convert loss rate from percentage to decimal
  // User enters as percentage (e.g., 0.0001 means 0.0001%)
  const lossDecimal = lossRate / 100;

  const steps: string[] = [];

  steps.push(`MSS = ${mss} bytes`);
  steps.push(`RTT = ${rtt} ms = ${rttSeconds} seconds`);
  steps.push(`Loss Rate = ${lossRate}% = ${lossDecimal}`);
  steps.push(`C Factor = ${cFactor}`);

  // Mathis formula: Throughput = (MSS / RTT) * (C / sqrt(Loss))
  // Result is in bytes per second
  let throughputBytesPerSec: number;

  if (lossDecimal <= 0) {
    // If no loss, throughput is theoretically infinite, but we cap at line rate
    // Use a very small loss value for calculation
    throughputBytesPerSec = (mss / rttSeconds) * (cFactor / Math.sqrt(1e-10));
    steps.push(`With zero/negligible loss, using minimum loss value of 10^-10`);
  } else {
    throughputBytesPerSec = (mss / rttSeconds) * (cFactor / Math.sqrt(lossDecimal));
  }

  steps.push(`Throughput = (MSS / RTT) × (C / √Loss)`);
  steps.push(`Throughput = (${mss} / ${rttSeconds}) × (${cFactor} / √${lossDecimal})`);
  steps.push(
    `Throughput = ${(mss / rttSeconds).toFixed(2)} × ${(cFactor / Math.sqrt(lossDecimal)).toFixed(2)}`
  );
  steps.push(`Throughput = ${throughputBytesPerSec.toFixed(2)} bytes/sec`);

  // Convert to various units
  const throughputBps = throughputBytesPerSec * 8;
  const throughputKbps = throughputBps / 1000;
  const throughputMbps = throughputKbps / 1000;
  const throughputGbps = throughputMbps / 1000;
  const throughputMBPerSec = throughputBytesPerSec / (1024 * 1024);

  // Generate recommendations
  const recommendations: string[] = [];

  if (rtt > 100) {
    recommendations.push(
      "High RTT detected. Consider using TCP window scaling or WAN optimization."
    );
  }
  if (lossRate > 0.01) {
    recommendations.push(
      "High packet loss detected. Check for network congestion or faulty equipment."
    );
  }
  if (throughputMbps < 10) {
    recommendations.push(
      "Low throughput. Consider reducing RTT or packet loss for better performance."
    );
  }
  if (mss < 1460) {
    recommendations.push("MSS is below typical value. Check for MTU issues or tunneling overhead.");
  }

  return {
    throughputBps,
    throughputKbps,
    throughputMbps,
    throughputGbps,
    throughputBytesPerSec,
    throughputMBPerSec,
    formula: "rate = (MSS/RTT) × (C/√Loss)",
    steps,
    recommendations,
  };
}
