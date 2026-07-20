// Recursive shadowcasting over 8 octants.
const MULT = [
  [1, 0, 0, -1, -1, 0, 0, 1],
  [0, 1, -1, 0, 0, -1, 1, 0],
  [0, 1, 1, 0, 0, -1, -1, 0],
  [1, 0, 0, 1, -1, 0, 0, -1],
];

export function computeFOV(
  ox: number,
  oy: number,
  radius: number,
  transparent: (x: number, y: number) => boolean,
  reveal: (x: number, y: number) => void,
): void {
  reveal(ox, oy);
  for (let oct = 0; oct < 8; oct++) {
    castLight(ox, oy, radius, 1, 1.0, 0.0, MULT[0][oct], MULT[1][oct], MULT[2][oct], MULT[3][oct], transparent, reveal);
  }
}

function castLight(
  cx: number, cy: number, radius: number, row: number,
  start: number, end: number,
  xx: number, xy: number, yx: number, yy: number,
  transparent: (x: number, y: number) => boolean,
  reveal: (x: number, y: number) => void,
): void {
  if (start < end) return;
  const r2 = radius * radius;
  for (let j = row; j <= radius; j++) {
    let dx = -j - 1;
    const dy = -j;
    let blocked = false;
    let newStart = start;
    while (dx <= 0) {
      dx += 1;
      const X = cx + dx * xx + dy * xy;
      const Y = cy + dx * yx + dy * yy;
      const lSlope = (dx - 0.5) / (dy + 0.5);
      const rSlope = (dx + 0.5) / (dy - 0.5);
      if (start < rSlope) continue;
      if (end > lSlope) break;
      if (dx * dx + dy * dy <= r2) reveal(X, Y);
      if (blocked) {
        if (!transparent(X, Y)) {
          newStart = rSlope;
          continue;
        } else {
          blocked = false;
          start = newStart;
        }
      } else if (!transparent(X, Y) && j < radius) {
        blocked = true;
        castLight(cx, cy, radius, j + 1, start, lSlope, xx, xy, yx, yy, transparent, reveal);
        newStart = rSlope;
      }
    }
    if (blocked) break;
  }
}

export function bresenham(x0: number, y0: number, x1: number, y1: number): [number, number][] {
  const pts: [number, number][] = [];
  const dx = Math.abs(x1 - x0);
  const dy = Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1;
  const sy = y0 < y1 ? 1 : -1;
  let err = dx - dy;
  let x = x0;
  let y = y0;
  for (;;) {
    pts.push([x, y]);
    if (x === x1 && y === y1) break;
    const e2 = 2 * err;
    if (e2 > -dy) { err -= dy; x += sx; }
    if (e2 < dx) { err += dx; y += sy; }
  }
  return pts;
}
