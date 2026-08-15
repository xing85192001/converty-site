export function imageDataToBmp(imageData: ImageData): Uint8Array {
  const { width, height } = imageData;
  const rowSize = Math.ceil((width * 3) / 4) * 4;
  const dataSize = rowSize * height;
  const fileSize = 14 + 40 + dataSize;
  const out = new Uint8Array(fileSize);
  const view = new DataView(out.buffer);

  out[0] = 0x42; // 'B'
  out[1] = 0x4d; // 'M'
  view.setUint32(2, fileSize, true);
  view.setUint32(6, 0, true);
  view.setUint32(10, 54, true);

  view.setUint32(14, 40, true);
  view.setInt32(18, width, true);
  view.setInt32(22, height, true);
  view.setUint16(26, 1, true);
  view.setUint16(28, 24, true);
  view.setUint32(30, 0, true);
  view.setUint32(34, dataSize, true);
  view.setUint32(38, 2835, true);
  view.setUint32(42, 2835, true);
  view.setUint32(46, 0, true);
  view.setUint32(50, 0, true);

  let off = 54;
  for (let y = height - 1; y >= 0; y--) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      out[off++] = imageData.data[i + 2]; // B
      out[off++] = imageData.data[i + 1]; // G
      out[off++] = imageData.data[i]; // R
    }
    const pad = rowSize - width * 3;
    for (let p = 0; p < pad; p++) out[off++] = 0;
  }
  return out;
}

class LzwEncoder {
  private minCodeSize: number;
  private clearCode: number;
  private endCode: number;
  private codeSize = 0;
  private nextCode = 0;
  private table = new Map<string, number>();
  private buffer = "";
  private output: number[] = [];
  private bitBuffer = 0;
  private bitCount = 0;

  constructor(minCodeSize: number) {
    this.minCodeSize = minCodeSize;
    this.clearCode = 1 << minCodeSize;
    this.endCode = this.clearCode + 1;
    this.reset();
  }

  private reset() {
    this.codeSize = this.minCodeSize + 1;
    this.nextCode = this.endCode + 1;
    this.table.clear();
    for (let i = 0; i < this.clearCode; i++) this.table.set(String.fromCharCode(i), i);
    this.buffer = "";
    this.output = [];
    this.bitBuffer = 0;
    this.bitCount = 0;
  }

  encode(pixels: Uint8Array): Uint8Array {
    this.reset();
    this.writeCode(this.clearCode);
    this.buffer = String.fromCharCode(pixels[0]);
    for (let i = 1; i < pixels.length; i++) {
      const c = String.fromCharCode(pixels[i]);
      const combined = this.buffer + c;
      if (this.table.has(combined)) {
        this.buffer = combined;
      } else {
        const prevCode = this.table.get(this.buffer);
        if (prevCode !== undefined) this.writeCode(prevCode);
        if (this.nextCode < 4096) {
          this.table.set(combined, this.nextCode++);
          if (this.nextCode >= 1 << this.codeSize && this.codeSize < 12) this.codeSize++;
        }
        this.buffer = c;
      }
    }
    if (this.buffer.length) {
      const code = this.table.get(this.buffer);
      if (code !== undefined) this.writeCode(code);
    }
    this.writeCode(this.endCode);
    if (this.bitCount > 0) this.output.push(this.bitBuffer);
    return new Uint8Array(this.output);
  }

  private writeCode(code: number) {
    for (let i = 0; i < this.codeSize; i++) {
      this.bitBuffer |= ((code >> i) & 1) << this.bitCount;
      this.bitCount++;
      if (this.bitCount === 8) {
        this.output.push(this.bitBuffer);
        this.bitBuffer = 0;
        this.bitCount = 0;
      }
    }
  }
}

function buildUniformPalette(): Uint8Array {
  const palette = new Uint8Array(256 * 3);
  const levels = [0, 36, 73, 109, 146, 182, 219, 255];
  const bLevels = [0, 85, 170, 255];
  let i = 0;
  for (const r of levels) {
    for (const g of levels) {
      for (const b of bLevels) {
        if (i >= 256 * 3) return palette;
        palette[i++] = r;
        palette[i++] = g;
        palette[i++] = b;
      }
    }
  }
  return palette;
}

const UNIFORM_PALETTE = buildUniformPalette();

function findNearestPaletteIndex(r: number, g: number, b: number): number {
  const rIndex = Math.min(7, Math.max(0, Math.round(r / 36.428571)));
  const gIndex = Math.min(7, Math.max(0, Math.round(g / 36.428571)));
  const bIndex = Math.min(3, Math.max(0, Math.round(b / 85)));
  return (rIndex * 8 + gIndex) * 4 + bIndex;
}

export function imageDataToGif(imageData: ImageData): Uint8Array {
  const { width, height, data } = imageData;
  const pixels = new Uint8Array(width * height);
  for (let i = 0; i < width * height; i++) {
    pixels[i] = findNearestPaletteIndex(data[i * 4], data[i * 4 + 1], data[i * 4 + 2]);
  }

  // Palette has 256 entries, so the LZW minimum code size must be 8.
  // Using 2 here meant only indices 0-3 existed in the initial code table,
  // so most pixels were dropped and the GIF decoded as blank/transparent.
  const lzw = new LzwEncoder(8);
  const compressed = lzw.encode(pixels);

  const headerSize = 6 + 7 + 768 + 8 + 10 + 2;
  let bodySize = 0;
  for (let i = 0; i < compressed.length; i += 255) {
    bodySize += Math.min(255, compressed.length - i) + 1;
  }
  bodySize += 1; // block terminator
  const total = headerSize + bodySize;
  const out = new Uint8Array(total);
  let off = 0;

  const write = (bytes: number[]) => {
    for (const b of bytes) out[off++] = b;
  };

  write([0x47, 0x49, 0x46, 0x38, 0x39, 0x61]); // GIF89a
  write([width & 0xff, (width >> 8) & 0xff]);
  write([height & 0xff, (height >> 8) & 0xff]);
  write([0xf7, 0x00, 0x00]); // global color table, 256 colors
  for (let i = 0; i < 768; i++) out[off++] = UNIFORM_PALETTE[i];
  write([0x21, 0xf9, 0x04, 0x00, 0x00, 0x00, 0x00, 0x00]); // GCE
  write([0x2c, 0x00, 0x00, 0x00, 0x00]); // image descriptor start
  write([width & 0xff, (width >> 8) & 0xff]);
  write([height & 0xff, (height >> 8) & 0xff]);
  write([0x00]); // no local color table
  write([0x08]); // LZW minimum code size (matches 256-color palette)

  for (let i = 0; i < compressed.length; i += 255) {
    const chunk = compressed.subarray(i, i + 255);
    out[off++] = chunk.length;
    out.set(chunk, off);
    off += chunk.length;
  }
  out[off++] = 0x00; // block terminator
  out[off++] = 0x3b; // trailer

  return out;
}
