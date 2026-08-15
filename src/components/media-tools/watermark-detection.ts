export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

const TILE_SIZE = 32;

/**
 * Detect likely watermark regions in an image or video frame using simple
 * edge-density clustering. Text and logo watermarks usually have higher local
 * edge density than the surrounding image, so they stand out as connected
 * high-density tile components.
 */
export function detectWatermarks(
  source: HTMLImageElement | HTMLVideoElement,
  W: number,
  H: number
): Rect[] {
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) return [];
  ctx.drawImage(source, 0, 0, W, H);
  const src = ctx.getImageData(0, 0, W, H).data;

  const gray = new Uint8Array(W * H);
  for (let i = 0; i < W * H; i++) {
    const idx = i * 4;
    gray[i] = Math.round(0.299 * src[idx] + 0.587 * src[idx + 1] + 0.114 * src[idx + 2]);
  }

  const edges = new Uint8Array(W * H);
  for (let y = 1; y < H - 1; y++) {
    for (let x = 1; x < W - 1; x++) {
      const idx = y * W + x;
      const gx = Math.abs(gray[idx + 1] - gray[idx - 1]);
      const gy = Math.abs(gray[idx + W] - gray[idx - W]);
      edges[idx] = Math.min(255, gx + gy);
    }
  }

  const tilesX = Math.ceil(W / TILE_SIZE);
  const tilesY = Math.ceil(H / TILE_SIZE);
  const scores = new Float32Array(tilesX * tilesY);
  for (let ty = 0; ty < tilesY; ty++) {
    for (let tx = 0; tx < tilesX; tx++) {
      let sum = 0;
      let count = 0;
      for (let y = ty * TILE_SIZE; y < Math.min(H, (ty + 1) * TILE_SIZE); y++) {
        for (let x = tx * TILE_SIZE; x < Math.min(W, (tx + 1) * TILE_SIZE); x++) {
          sum += edges[y * W + x];
          count++;
        }
      }
      scores[ty * tilesX + tx] = count > 0 ? sum / count : 0;
    }
  }

  let sum = 0;
  for (let i = 0; i < scores.length; i++) sum += scores[i];
  const mean = sum / scores.length;
  let sqSum = 0;
  for (let i = 0; i < scores.length; i++) sqSum += (scores[i] - mean) ** 2;
  const std = Math.sqrt(sqSum / scores.length);
  const threshold = Math.max(15, mean + std * 1.2);

  const candidates: Rect[] = [];
  const visited = new Set<number>();
  for (let ty = 0; ty < tilesY; ty++) {
    for (let tx = 0; tx < tilesX; tx++) {
      const idx = ty * tilesX + tx;
      if (visited.has(idx) || scores[idx] < threshold) continue;
      const queue = [idx];
      visited.add(idx);
      let minX = tx;
      let maxX = tx;
      let minY = ty;
      let maxY = ty;
      while (queue.length) {
        const cur = queue.shift()!;
        const cx = cur % tilesX;
        const cy = Math.floor(cur / tilesX);
        const neighbors = [
          cy > 0 ? cur - tilesX : -1,
          cy < tilesY - 1 ? cur + tilesX : -1,
          cx > 0 ? cur - 1 : -1,
          cx < tilesX - 1 ? cur + 1 : -1,
        ];
        for (const n of neighbors) {
          if (n >= 0 && !visited.has(n) && scores[n] >= threshold) {
            visited.add(n);
            queue.push(n);
            const nx = n % tilesX;
            const ny = Math.floor(n / tilesX);
            minX = Math.min(minX, nx);
            maxX = Math.max(maxX, nx);
            minY = Math.min(minY, ny);
            maxY = Math.max(maxY, ny);
          }
        }
      }
      const rect: Rect = {
        x: Math.max(0, minX * TILE_SIZE - 8),
        y: Math.max(0, minY * TILE_SIZE - 8),
        w: Math.min(W, (maxX - minX + 1) * TILE_SIZE + 16),
        h: Math.min(H, (maxY - minY + 1) * TILE_SIZE + 16),
      };
      rect.w = Math.min(W - rect.x, rect.w);
      rect.h = Math.min(H - rect.y, rect.h);

      const area = rect.w * rect.h;
      if (area < W * H * 0.25 && rect.w > 30 && rect.h > 15) {
        candidates.push(rect);
      }
    }
  }

  candidates.sort((a, b) => b.w * b.h - a.w * a.h);
  return candidates.slice(0, 5);
}
