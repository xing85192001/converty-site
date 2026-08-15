export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

const TILE = 16;
const MAX_DIM = 480;

/**
 * Detect likely watermark regions in an image or video frame.
 *
 * Approach: grayscale -> edge magnitude -> per-tile (16px) edge-density score,
 * with a *position prior* that strongly boosts tiles near the frame
 * edges/corners (where text/logo watermarks almost always sit) so that busy
 * scene content in the middle is not mistaken for a watermark. Connected
 * high-density tiles become candidate boxes, filtered by size and ranked by a
 * combined density + corner-proximity score.
 *
 * This is a heuristic, not semantic watermark recognition — it works best for
 * opaque text/logo watermarks and is less reliable for transparent or
 * edge-matched watermarks. The UI always lets the user confirm/adjust.
 */
export function detectWatermarks(
  source: HTMLImageElement | HTMLVideoElement,
  W: number,
  H: number
): Rect[] {
  // Downscale for speed (mobile especially) — detection does not need native res.
  const scale = Math.min(1, MAX_DIM / Math.max(W, H));
  const w = Math.max(1, Math.round(W * scale));
  const h = Math.max(1, Math.round(H * scale));

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return [];
  ctx.drawImage(source, 0, 0, w, h);
  const src = ctx.getImageData(0, 0, w, h).data;

  const gray = new Uint8ClampedArray(w * h);
  for (let i = 0; i < w * h; i++) {
    const idx = i * 4;
    gray[i] = Math.round(0.299 * src[idx] + 0.587 * src[idx + 1] + 0.114 * src[idx + 2]);
  }

  const edges = new Uint8ClampedArray(w * h);
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const idx = y * w + x;
      const gx = Math.abs(gray[idx + 1] - gray[idx - 1]);
      const gy = Math.abs(gray[idx + w] - gray[idx - w]);
      edges[idx] = Math.min(255, gx + gy);
    }
  }

  const tilesX = Math.ceil(w / TILE);
  const tilesY = Math.ceil(h / TILE);
  const scores = new Float32Array(tilesX * tilesY);
  const margin = Math.max(1, Math.round(tilesX * 0.18));
  const marginY = Math.max(1, Math.round(tilesY * 0.18));

  for (let ty = 0; ty < tilesY; ty++) {
    for (let tx = 0; tx < tilesX; tx++) {
      let sum = 0;
      let count = 0;
      for (let y = ty * TILE; y < Math.min(h, (ty + 1) * TILE); y++) {
        for (let x = tx * TILE; x < Math.min(w, (tx + 1) * TILE); x++) {
          sum += edges[y * w + x];
          count++;
        }
      }
      let s = count > 0 ? sum / count : 0;
      // Position prior: watermarks are usually near an edge/corner. A tile
      // touching the outer margin gets a boost, with corners weighted higher.
      const onEdge =
        tx <= margin || tx >= tilesX - 1 - margin || ty <= marginY || ty >= tilesY - 1 - marginY;
      if (onEdge) {
        const corner =
          (tx <= margin && ty <= marginY) ||
          (tx >= tilesX - 1 - margin && ty <= marginY) ||
          (tx <= margin && ty >= tilesY - 1 - marginY) ||
          (tx >= tilesX - 1 - margin && ty >= tilesY - 1 - marginY);
        s *= corner ? 2.6 : 1.7;
      }
      scores[ty * tilesX + tx] = s;
    }
  }

  let sum = 0;
  for (let i = 0; i < scores.length; i++) sum += scores[i];
  const mean = sum / scores.length;
  let sqSum = 0;
  for (let i = 0; i < scores.length; i++) sqSum += (scores[i] - mean) ** 2;
  const std = Math.sqrt(sqSum / scores.length);
  // Higher threshold so only genuinely strong edges (logo/text) survive.
  const threshold = Math.max(24, mean + 1.5 * std);

  const candidates: { rect: Rect; score: number }[] = [];
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
      let compSum = scores[idx];
      let compCount = 1;
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
            compSum += scores[n];
            compCount++;
          }
        }
      }

      // Map tile bbox back to original frame coordinates.
      const pad = TILE;
      let rx = Math.max(0, minX * TILE - pad);
      let ry = Math.max(0, minY * TILE - pad);
      let rw = Math.min(w, (maxX - minX + 1) * TILE + pad * 2);
      let rh = Math.min(h, (maxY - minY + 1) * TILE + pad * 2);
      rx /= scale;
      ry /= scale;
      rw /= scale;
      rh /= scale;

      const area = rw * rh;
      // Keep small-to-medium regions only: too small = noise, too large = scene.
      if (compCount >= 2 && area >= W * H * 0.008 && area <= W * H * 0.2 && rw > 20 && rh > 12) {
        // Corner proximity bonus: normalize distance from nearest corner.
        const dcx = Math.min(rx, W - rx - rw);
        const dcy = Math.min(ry, H - ry - rh);
        const cornerDist = Math.sqrt(dcx * dcx + dcy * dcy);
        const cornerBonus = 1 + 2 / (1 + cornerDist / Math.max(W, H));
        const density = compSum / compCount;
        candidates.push({
          rect: { x: Math.round(rx), y: Math.round(ry), w: Math.round(rw), h: Math.round(rh) },
          score: density * cornerBonus,
        });
      }
    }
  }

  candidates.sort((a, b) => b.score - a.score);
  return candidates.slice(0, 3).map((c) => c.rect);
}
