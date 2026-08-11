/**
 * Bandwidth-Delay Product (BDP) Calculator
 *
 * BDP = Bandwidth × RTT (bits of data in transit between hosts)
 * Throughput ≤ TCP buffer size / RTT
 * TCP window size ≥ BW × RTT
 */

export interface BandwidthDelayProductInput {
  bandwidth: number; // Bandwidth in Mbps
  rtt: number; // Round Trip Time in milliseconds
  windowSize: number; // TCP window/buffer size in KBytes
}

export interface BandwidthDelayProductResult {
  bdpBits: number; // BDP in bits
  bdpBytes: number; // BDP in bytes
  bdpKBytes: number; // BDP in kilobytes
  bdpMBytes: number; // BDP in megabytes
  maxThroughputMbps: number; // Maximum achievable throughput with current window size
  requiredWindowKB: number; // Required window size for full bandwidth utilization
  windowUtilization: number; // Percentage of window utilization
  isWindowSufficient: boolean; // Whether current window is sufficient
  steps: string[]; // Calculation steps
  recommendations: string[]; // Recommendations based on results
}

export function calculateBandwidthDelayProduct(
  input: BandwidthDelayProductInput
): BandwidthDelayProductResult {
  const { bandwidth, rtt, windowSize } = input;

  const steps: string[] = [];

  // Convert units
  const bandwidthBps = bandwidth * 1000000; // Mbps to bps
  const rttSeconds = rtt / 1000; // ms to seconds
  const windowBits = windowSize * 1024 * 8; // KBytes to bits

  steps.push(`Bandwidth = ${bandwidth} Mbps = ${bandwidthBps.toLocaleString()} bps`);
  steps.push(`RTT = ${rtt} ms = ${rttSeconds} seconds`);
  steps.push(
    `Window Size = ${windowSize} KB = ${windowSize * 1024} bytes = ${windowBits.toLocaleString()} bits`
  );

  // Calculate BDP
  // BDP (bits) = Bandwidth (bps) × RTT (seconds)
  const bdpBits = bandwidthBps * rttSeconds;
  const bdpBytes = bdpBits / 8;
  const bdpKBytes = bdpBytes / 1024;
  const bdpMBytes = bdpKBytes / 1024;

  steps.push(`BDP = Bandwidth × RTT`);
  steps.push(`BDP = ${bandwidthBps.toLocaleString()} bps × ${rttSeconds} s`);
  steps.push(`BDP = ${bdpBits.toLocaleString()} bits = ${bdpBytes.toLocaleString()} bytes`);
  steps.push(`BDP = ${bdpKBytes.toFixed(2)} KB = ${bdpMBytes.toFixed(4)} MB`);

  // Calculate maximum throughput with current window size
  // Throughput ≤ Window Size / RTT
  const maxThroughputBps = windowBits / rttSeconds;
  const maxThroughputMbps = maxThroughputBps / 1000000;

  steps.push(`Maximum Throughput = Window Size / RTT`);
  steps.push(`Maximum Throughput = ${windowBits.toLocaleString()} bits / ${rttSeconds} s`);
  steps.push(
    `Maximum Throughput = ${maxThroughputBps.toLocaleString()} bps = ${maxThroughputMbps.toFixed(2)} Mbps`
  );

  // Calculate required window size for full bandwidth utilization
  // Required Window = BDP = BW × RTT
  const requiredWindowBits = bdpBits;
  const requiredWindowKB = requiredWindowBits / 8 / 1024;

  steps.push(`Required Window Size for full utilization = BDP`);
  steps.push(`Required Window Size = ${requiredWindowKB.toFixed(2)} KB`);

  // Calculate window utilization
  const windowUtilization = Math.min((windowBits / bdpBits) * 100, 100);
  const isWindowSufficient = windowBits >= bdpBits;

  steps.push(`Window Utilization = (Current Window / Required Window) × 100`);
  steps.push(
    `Window Utilization = (${windowSize} KB / ${requiredWindowKB.toFixed(2)} KB) × 100 = ${windowUtilization.toFixed(1)}%`
  );

  // Generate recommendations
  const recommendations: string[] = [];

  if (!isWindowSufficient) {
    const deficit = requiredWindowKB - windowSize;
    recommendations.push(
      `Current window size is ${deficit.toFixed(2)} KB smaller than required for full bandwidth utilization.`
    );
    recommendations.push(`Increase TCP buffer size to at least ${Math.ceil(requiredWindowKB)} KB.`);
  } else {
    recommendations.push("Current window size is sufficient for the bandwidth-delay product.");
  }

  if (rtt > 100) {
    recommendations.push(
      "High RTT: Consider enabling TCP window scaling for long-distance connections."
    );
  }

  if (bandwidth > 100 && windowSize < 256) {
    recommendations.push(
      "High bandwidth with small window: Enable TCP window scaling (RFC 1323) for optimal performance."
    );
  }

  if (windowUtilization < 50) {
    recommendations.push(
      `Only ${windowUtilization.toFixed(0)}% of bandwidth can be utilized with current settings.`
    );
  }

  return {
    bdpBits,
    bdpBytes,
    bdpKBytes,
    bdpMBytes,
    maxThroughputMbps,
    requiredWindowKB,
    windowUtilization,
    isWindowSufficient,
    steps,
    recommendations,
  };
}
