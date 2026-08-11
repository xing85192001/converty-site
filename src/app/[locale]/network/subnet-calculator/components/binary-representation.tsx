"use client";

import ipaddr from "ipaddr.js";
import { useTranslations } from "next-intl";
import type { SubnetResult } from "@/lib/converters/network/types";
import { cn } from "@/lib/utils";

interface BinaryRepresentationProps {
  result: SubnetResult;
}

/**
 * Convert IP address to binary array
 *
 * Converts IPv4 or IPv6 address to array of individual binary digits.
 * IPv4: 32 bits (4 octets × 8 bits)
 * IPv6: 128 bits (8 parts × 16 bits)
 */
function convertToBinary(addr: ipaddr.IPv4 | ipaddr.IPv6, ipVersion: 4 | 6): string[] {
  if (ipVersion === 4) {
    const octets = (addr as ipaddr.IPv4).octets;
    return octets.flatMap((octet) => octet.toString(2).padStart(8, "0").split(""));
  }
  const parts = (addr as ipaddr.IPv6).parts;
  return parts.flatMap((part) => part.toString(2).padStart(16, "0").split(""));
}

/**
 * BinaryRepresentation component
 *
 * Displays IP address and subnet mask in binary format with highlighted
 * network vs host portions.
 *
 * Features:
 * - Binary display with bit-level highlighting
 * - Color-coded network bits (blue) vs host bits (green)
 * - Subnet mask binary display (IPv4 only)
 * - Bit position markers for octet/group boundaries
 * - Responsive flex-wrap layout
 * - Full accessibility with ARIA labels
 */
export function BinaryRepresentation({ result }: BinaryRepresentationProps) {
  const t = useTranslations("calculator.subnet.binary");

  // Parse IP address to binary (strip CIDR notation if present)
  const cleanAddress = result.networkAddress.split("/")[0];
  const parsedAddr = ipaddr.parse(cleanAddress);
  const ipBits = convertToBinary(parsedAddr, result.ipVersion);

  // Generate subnet mask bits (IPv4 only)
  const totalBits = result.ipVersion === 4 ? 32 : 128;
  const maskBits =
    result.ipVersion === 4
      ? Array.from({ length: totalBits }, (_, i) => (i < result.cidr ? "1" : "0"))
      : null;

  // Calculate bit position markers
  const getBitPositionMarkers = () => {
    if (result.ipVersion === 4) {
      // IPv4: Show octet boundaries (0-7, 8-15, 16-23, 24-31)
      return [
        { start: 0, end: 7 },
        { start: 8, end: 15 },
        { start: 16, end: 23 },
        { start: 24, end: 31 },
      ];
    }
    // IPv6: Show 16-bit group boundaries
    return [
      { start: 0, end: 15 },
      { start: 16, end: 31 },
      { start: 32, end: 47 },
      { start: 48, end: 63 },
      { start: 64, end: 79 },
      { start: 80, end: 95 },
      { start: 96, end: 111 },
      { start: 112, end: 127 },
    ];
  };

  const bitMarkers = getBitPositionMarkers();

  return (
    <div className="space-y-6">
      {/* IP Address Binary */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium">{t("ip-address")}</h3>
        <div className="flex flex-wrap gap-1" role="list" aria-label={t("ip-binary-label")}>
          {ipBits.map((bit, index) => {
            const isNetworkBit = index < result.cidr;
            return (
              <span
                key={`ip-bit-${index}-${bit}`}
                className={cn(
                  "px-1 py-0.5 rounded font-mono text-xs",
                  isNetworkBit
                    ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                    : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                )}
                role="listitem"
                aria-label={`${t("bit")} ${index}: ${bit} (${isNetworkBit ? t("network") : t("host")})`}
              >
                {bit}
              </span>
            );
          })}
        </div>

        {/* Bit position markers */}
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          {bitMarkers.map((marker) => (
            <span key={`marker-${marker.start}`}>
              {marker.start}-{marker.end}
            </span>
          ))}
        </div>
      </div>

      {/* Subnet Mask Binary (IPv4 only) */}
      {result.ipVersion === 4 && maskBits && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium">{t("subnet-mask")}</h3>
          <div className="flex flex-wrap gap-1" role="list" aria-label={t("mask-binary-label")}>
            {maskBits.map((bit, index) => {
              const isOne = bit === "1";
              return (
                <span
                  key={`mask-${result.cidr}-bit-${index}`}
                  className={cn(
                    "px-1 py-0.5 rounded font-mono text-xs",
                    isOne
                      ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                      : "bg-gray-100 text-gray-700 dark:bg-gray-800/30 dark:text-gray-400"
                  )}
                  role="listitem"
                  aria-label={`${t("mask-bit")} ${index}: ${bit}`}
                >
                  {bit}
                </span>
              );
            })}
          </div>

          {/* Bit position markers */}
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            {bitMarkers.map((marker) => (
              <span key={`mask-marker-${marker.start}`}>
                {marker.start}-{marker.end}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
