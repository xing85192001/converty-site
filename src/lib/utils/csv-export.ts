/**
 * CSV export utility for calculator results
 * Zero dependencies, uses native Blob API
 */

export interface CsvExportOptions {
  filename?: string;
  includeHeaders?: boolean;
}

export type CsvRow = Record<string, string | number | boolean | null>;

/**
 * Escape a CSV field value
 * - Handles null/undefined as empty string
 * - Prevents CSV injection attacks
 * - Properly escapes quotes, delimiters, and newlines
 */
function escapeCSV(value: string | number | boolean | null, delimiter = ","): string {
  // Handle null/undefined
  if (value === null || value === undefined) {
    return "";
  }

  const stringValue = String(value);

  // CSV injection prevention - prefix dangerous characters with single quote
  if (/^[=+\-@]/.test(stringValue)) {
    return `'${stringValue}`;
  }

  // Check if we need to wrap in quotes
  const needsQuotes =
    stringValue.includes(delimiter) ||
    stringValue.includes('"') ||
    stringValue.includes("\n") ||
    stringValue.includes("\r");

  if (needsQuotes) {
    // Double any internal quotes and wrap in quotes
    return `"${stringValue.replace(/"/g, '""')}"`;
  }

  return stringValue;
}

/**
 * Download a Blob as a file
 */
function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.style.display = "none";

  document.body.appendChild(anchor);
  anchor.click();

  // Cleanup - use setTimeout for cross-browser compatibility
  setTimeout(() => {
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  }, 100);
}

/**
 * Export data to CSV file
 * @param data Array of objects representing CSV rows
 * @param options Export configuration
 */
export function exportToCsv(data: CsvRow[], options: CsvExportOptions = {}): void {
  const { filename = "export.csv", includeHeaders = true } = options;

  // Early return if no data
  if (!data || data.length === 0) {
    console.warn("exportToCsv: No data to export");
    return;
  }

  // Extract headers from first row
  const headers = Object.keys(data[0]);
  const delimiter = ",";

  // Build CSV content
  const lines: string[] = [];

  // Add headers if requested
  if (includeHeaders) {
    lines.push(headers.map((h) => escapeCSV(h, delimiter)).join(delimiter));
  }

  // Add data rows
  for (const row of data) {
    const values = headers.map((header) => escapeCSV(row[header], delimiter));
    lines.push(values.join(delimiter));
  }

  // Join lines with CRLF (Excel standard)
  const csvContent = lines.join("\r\n");

  // Add UTF-8 BOM for Excel compatibility
  const BOM = "\uFEFF";
  const blob = new Blob([BOM + csvContent], { type: "text/csv;charset=utf-8;" });

  // Trigger download
  downloadBlob(blob, filename);
}
