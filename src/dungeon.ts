import { RNG } from './rng';
import { T, idx, isWalkable, type LevelMap, type Monster, type MonsterDef, type Item } from './types';
import { BOSS_FLOORS, BRANCHES, GODS, MONSTERS, MONSTER_BY_ID, STRATA, genItem, mkItem, stratumFor, type BranchDef } from './data';

export interface GenResult {
  map: LevelMap;
  monsters: Monster[];
  items: Item[];
  px: number;
  py: number;
}

let monsterUid = 1;

export function spawnMonster(def: MonsterDef, x: number, y: number, depth: number): Monster {
  const over = Math.max(0, depth - def.depth[0]);
  const hp = Math.round(def.hp * (1 + over * 0.08));
  return {
    uid: monsterUid++,
    def, x, y,
    hp, maxHp: hp,
    dmgBonus: Math.floor(over / 2),
    energy: 0,
    awake: !!def.sleepless,
    friendly: false,
    statuses: [],
  };
}

const W = 72;
const H = 46;

interface Room { x: number; y: number; w: number; h: number }
const centerOf = (r: Room): [number, number] => [Math.floor(r.x + r.w / 2), Math.floor(r.y + r.h / 2)];

export interface GenOpts {
  branch?: BranchDef;
  branchPos?: number;
  doneBranches?: Set<string>;
  runBranches?: Set<string>; // which branch of each pair exists this run
  uniques?: Set<string>;     // artifacts already generated this run
}

// ---------------- hand-authored vaults
// legend: #wall .floor +door ~water Llava %bones ,rubble ffungus Wtorch _altar $gold *loot Mmonster
interface VaultDef { tag: string; rows: string[] }
const VAULTS: VaultDef[] = [
  { tag: 'shrine', rows: ['#######', '#..$..#', '#.._..#', '#W...W#', '#..M..#', '###+###'] },
  { tag: 'crypt', rows: ['#########', '#%.%.%.%#', '#*.%M%.*#', '#%.%.%.%#', '####+####'] },
  { tag: 'treasury', rows: ['########', '#$$..M.#', '#*$....#', '#..$$..#', '#.M..*.#', '###+####'] },
  { tag: 'cache', rows: ['#########', '#~~~~~~~#', '#~..*..~#', '#~.$.$.~#', '#~~~.~~~#', '####+####'] },
  { tag: 'forge', rows: ['#########', '#LL...LL#', '#L..*..L#', '#L.*.M.L#', '#LL...LL#', '####+####'] },
  { tag: 'ring', rows: ['#########', '#..fff..#', '#.f...f.#', '#.f.*.f.#', '#.f...f.#', '#..fff..#', '####+####'] },
  { tag: 'barracks', rows: ['#########', '#M.M.M.M#', '#.......#', '#*..$..*#', '####+####'] },
  { tag: 'study', rows: ['#######', '#*....#', '#..M..#', '#.....#', '#..*..#', '###+###'] },
  { tag: 'candles', rows: ['#######', '#W.W.W#', '#.....#', '#W.$.W#', '#.....#', '#W.W.W#', '###+###'] },
];

function placeVaults(
  map: LevelMap, rng: RNG, depth: number,
  monsters: Monster[], items: Item[],
  pool: MonsterDef[], luck: number, uniques?: Set<string>,
): void {
  const n = rng.chance(0.7) ? rng.int(1, 2) : 0;
  for (let v = 0; v < n; v++) {
    const vault = rng.pick(VAULTS);
    const vh = vault.rows.length;
    const vw = vault.rows[0].length;
    for (let tries = 0; tries < 90; tries++) {
      const x0 = rng.int(2, W - vw - 3);
      const y0 = rng.int(2, H - vh - 3);
      let ok = true;
      for (let y = -1; y <= vh && ok; y++) {
        for (let x = -1; x <= vw && ok; x++) {
          if (map.tiles[idx(x0 + x, y0 + y, W)] !== T.Wall) ok = false;
        }
      }
      if (!ok) continue;
      let door: [number, number] = [x0 + (vw >> 1), y0 + vh - 1];
      for (let y = 0; y < vh; y++) {
        for (let x = 0; x < vw; x++) {
          const ch = vault.rows[y][x];
          const gx = x0 + x, gy = y0 + y;
          const i = idx(gx, gy, W);
          switch (ch) {
            case '#': break;
            case '.': map.tiles[i] = T.Floor; break;
            case '+': map.tiles[i] = T.DoorClosed; door = [gx, gy]; break;
            case '~': map.tiles[i] = T.Water; break;
            case 'L': map.tiles[i] = T.Lava; break;
            case '%': map.tiles[i] = T.Bones; break;
            case ',': map.tiles[i] = T.Rubble; break;
            case 'f':
              map.tiles[i] = T.Fungus;
              map.lights.push({ x: gx, y: gy, r: 3.5, color: [70, 200, 150], flicker: rng.next() * 10 });
              break;
            case 'W':
              map.tiles[i] = T.Torch;
              map.lights.push({ x: gx, y: gy, r: 5, color: [255, 170, 80], flicker: rng.next() * 10 });
              break;
            case '_': {
              map.tiles[i] = T.Altar;
              map.altarGod.set(i, rng.pick(GODS).id);
              map.lights.push({ x: gx, y: gy, r: 3.5, color: [150, 110, 255], flicker: rng.next() * 10 });
              break;
            }
            case '$': {
              map.tiles[i] = T.Floor;
              const g = mkItem('gold', 'gold', { qty: rng.int(10, 20 + depth * 4) });
              g.x = gx; g.y = gy;
              items.push(g);
              break;
            }
            case '*': {
              map.tiles[i] = T.Floor;
              const it = genItem(Math.min(20, depth + 1), rng, luck + 1, uniques);
              it.x = gx; it.y = gy;
              items.push(it);
              break;
            }
            case 'M': {
              map.tiles[i] = T.Floor;
              if (pool.length) {
                const def = rng.weighted(pool.map((m) => [m, m.weight] as const));
                monsters.push(spawnMonster(def, gx, gy, depth));
              }
              break;
            }
          }
        }
      }
      connectToFloor(map, rng, door[0], door[1], { x0, y0, vw, vh });
      break;
    }
  }
}

function connectToFloor(
  map: LevelMap, rng: RNG, fx: number, fy: number,
  rect: { x0: number; y0: number; vw: number; vh: number },
): void {
  for (let r = 1; r < Math.max(W, H); r++) {
    const cands: [number, number][] = [];
    for (let dy = -r; dy <= r; dy++) {
      for (let dx = -r; dx <= r; dx++) {
        if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue;
        const nx = fx + dx, ny = fy + dy;
        if (nx < 1 || ny < 1 || nx >= W - 1 || ny >= H - 1) continue;
        const inside = nx >= rect.x0 && nx < rect.x0 + rect.vw && ny >= rect.y0 && ny < rect.y0 + rect.vh;
        if (!inside && map.tiles[idx(nx, ny, W)] === T.Floor) cands.push([nx, ny]);
      }
    }
    if (cands.length) {
      const [tx, ty] = rng.pick(cands);
      corridor(map, rng, fx, fy, tx, ty);
      return;
    }
  }
}

export function generateLevel(depth: number, rng: RNG, luck = 0, opts: GenOpts = {}): GenResult {
  const stratum = opts.branch ? STRATA[opts.branch.stratum] : stratumFor(depth);
  const si = opts.branch ? opts.branch.stratum : STRATA.indexOf(stratum);
  const map: LevelMap = {
    w: W, h: H, depth, stratum: si,
    tiles: new Uint8Array(W * H).fill(T.Wall),
    explored: new Uint8Array(W * H),
    visible: new Uint8Array(W * H),
    lights: [],
    decals: new Map(),
    altarGod: new Map(),
    gates: new Map(),
  };

  let rooms: Room[] = [];
  if (stratum.gen === 'rooms' || stratum.gen === 'flooded') {
    rooms = carveRooms(map, rng);
  } else if (stratum.gen === 'throne') {
    rooms = carveThrone(map, rng);
  } else {
    carveCaves(map, rng);
  }

  // largest connected region only
  keepLargestRegion(map);

  const floors: number[] = [];
  for (let i = 0; i < W * H; i++) if (map.tiles[i] === T.Floor) floors.push(i);
  if (floors.length < 40) return generateLevel(depth, rng, luck, opts); // degenerate, retry

  // ---- water / lava features
  if (stratum.gen === 'flooded') {
    for (let n = rng.int(5, 8); n > 0; n--) blob(map, rng, T.Water, rng.int(12, 40));
  } else if (stratum.gen === 'ember') {
    for (let n = rng.int(4, 7); n > 0; n--) blob(map, rng, T.Lava, rng.int(8, 26));
  } else if (stratum.gen === 'caves') {
    for (let n = rng.int(1, 3); n > 0; n--) blob(map, rng, T.Water, rng.int(6, 16));
  } else if (stratum.gen === 'rooms' && rng.chance(0.4)) {
    blob(map, rng, T.Water, rng.int(6, 14));
  }

  // ---- decor
  const decorTiles: [number, number][] = stratum.gen === 'caves'
    ? [[T.Fungus, 26], [T.Bones, 6], [T.Rubble, 8]]
    : stratum.gen === 'ember'
      ? [[T.Rubble, 18], [T.Bones, 10], [T.Fungus, 2]]
      : [[T.Bones, 14], [T.Rubble, 10], [T.Fungus, 6]];
  for (const [tile, count] of decorTiles) {
    for (let n = 0; n < count; n++) {
      const i = rng.pick(floorIdx(map));
      map.tiles[i] = tile;
    }
  }

  // ---- lights: torches in room strata, fungal glow in caves
  if (rooms.length > 0) {
    for (const r of rooms) {
      if (rng.chance(0.75)) {
        const wallSpots = roomWallSpots(map, r);
        for (let n = Math.min(wallSpots.length, rng.int(1, 2)); n > 0; n--) {
          const [tx, ty] = rng.pick(wallSpots);
          map.tiles[idx(tx, ty, W)] = T.Torch;
          map.lights.push({ x: tx, y: ty, r: 5.5, color: warmLight(stratum.gen), flicker: rng.next() * 10 });
        }
      }
    }
  } else {
    for (let n = rng.int(6, 10); n > 0; n--) {
      const i = rng.pick(floorIdx(map));
      map.tiles[i] = T.Fungus;
      map.lights.push({ x: i % W, y: Math.floor(i / W), r: 4.5, color: stratum.gen === 'ember' ? [255, 120, 50] : [70, 200, 150], flicker: rng.next() * 10 });
    }
  }

  // ---- altar
  if (!opts.branch && depth < 20 && rng.chance(0.5)) {
    const i = rng.pick(floorIdx(map));
    map.tiles[i] = T.Altar;
    map.altarGod.set(i, rng.pick(GODS).id);
    map.lights.push({ x: i % W, y: Math.floor(i / W), r: 3.5, color: [150, 110, 255], flicker: rng.next() * 10 });
  }

  // ---- monster pool (needed for vaults too)
  const pool = opts.branch
    ? MONSTERS.filter((m) => m.weight > 0 && m.branch === opts.branch!.id)
    : MONSTERS.filter((m) => m.weight > 0 && !m.branch && depth >= m.depth[0] && depth <= m.depth[1]);

  // ---- vaults (hand-authored set pieces, carved into the rock)
  const monsters: Monster[] = [];
  const items: Item[] = [];
  if (stratum.gen !== 'throne') placeVaults(map, rng, depth, monsters, items, pool, luck, opts.uniques);

  // ---- player start & stairs (far apart)
  const open = floorIdx(map);
  const pi = rng.pick(open);
  const px = pi % W, py = Math.floor(pi / W);
  let best = pi, bestD = -1;
  const dist = bfsDistance(map, px, py, true);
  for (const i of open) {
    if (dist[i] > bestD && dist[i] < Infinity && map.tiles[i] === T.Floor) { bestD = dist[i]; best = i; }
  }
  const lastBranchLevel = opts.branch && (opts.branchPos ?? 0) === opts.branch.levels - 1;
  if (lastBranchLevel) map.tiles[best] = T.PortalBack;
  else if (depth < 20 || opts.branch) map.tiles[best] = T.StairsDown;
  const sx = best % W, sy = Math.floor(best / W);

  // ---- branch gates on spine levels
  if (!opts.branch) {
    for (const b of BRANCHES) {
      if (b.entry !== depth || opts.doneBranches?.has(b.id)) continue;
      if (opts.runBranches && !opts.runBranches.has(b.id)) continue;
      for (let tries = 0; tries < 60; tries++) {
        const gi = rng.pick(open);
        const gx = gi % W, gy = Math.floor(gi / W);
        if (map.tiles[gi] !== T.Floor || gi === best) continue;
        if (Math.abs(gx - px) + Math.abs(gy - py) < 6) continue;
        map.tiles[gi] = T.BranchDown;
        map.gates.set(gi, b.id);
        map.lights.push({ x: gx, y: gy, r: 4, color: [220, 190, 110], flicker: rng.next() * 10 });
        break;
      }
    }
  }

  // ---- monsters
  const bossId = opts.branch ? (lastBranchLevel ? opts.branch.boss : undefined) : BOSS_FLOORS[depth];
  if (bossId) {
    const def = MONSTER_BY_ID.get(bossId)!;
    const spot = stratum.gen === 'throne'
      ? open[Math.floor(open.length / 2)]
      : nearIdx(map, sx, sy, rng);
    monsters.push(spawnMonster(def, spot % W, Math.floor(spot / W), depth));
  }
  // small chance of out-of-depth terror (spine only)
  const oodPool = opts.branch ? [] : MONSTERS.filter((m) => m.weight > 0 && !m.branch && m.depth[0] === depth + 1);
  const count = 6 + Math.floor(depth * 0.8) + rng.int(0, 3);
  let placed = 0;
  let guard = 0;
  while (placed < count && guard++ < 500) {
    const def = (oodPool.length && rng.chance(0.05))
      ? rng.pick(oodPool)
      : rng.weighted(pool.map((m) => [m, m.weight] as const));
    const i = rng.pick(open);
    const mx = i % W, my = Math.floor(i / W);
    if (Math.abs(mx - px) + Math.abs(my - py) < 9) continue;
    if (monsters.some((m) => m.x === mx && m.y === my)) continue;
    if (!standable(map, mx, my)) continue;
    monsters.push(spawnMonster(def, mx, my, depth));
    placed++;
    if (def.pack) {
      for (let n = rng.int(def.pack[0], def.pack[1]) - 1; n > 0; n--) {
        const spots = neighbors(mx, my).filter(([nx, ny]) =>
          standable(map, nx, ny) && !monsters.some((m) => m.x === nx && m.y === ny));
        if (!spots.length) break;
        const [nx, ny] = rng.pick(spots);
        monsters.push(spawnMonster(def, nx, ny, depth));
        placed++;
      }
    }
  }

  // ---- items
  const itemCount = rng.int(4, 7) + (depth >= 10 ? 1 : 0);
  for (let n = 0; n < itemCount; n++) {
    const i = rng.pick(open);
    if (map.tiles[i] !== T.Floor && map.tiles[i] !== T.Bones) continue;
    const it = genItem(depth, rng, luck, opts.uniques);
    it.x = i % W;
    it.y = Math.floor(i / W);
    items.push(it);
  }

  return { map, monsters, items, px, py };
}

function standable(map: LevelMap, x: number, y: number): boolean {
  const t = map.tiles[idx(x, y, map.w)];
  return isWalkable(t) && t !== T.Lava && t !== T.StairsDown;
}

function warmLight(gen: string): [number, number, number] {
  if (gen === 'flooded') return [120, 190, 230];
  if (gen === 'throne') return [160, 110, 255];
  return [255, 170, 80];
}

function floorIdx(map: LevelMap): number[] {
  const out: number[] = [];
  for (let i = 0; i < map.w * map.h; i++) if (map.tiles[i] === T.Floor) out.push(i);
  return out;
}

export function neighbors(x: number, y: number): [number, number][] {
  const out: [number, number][] = [];
  for (let dy = -1; dy <= 1; dy++)
    for (let dx = -1; dx <= 1; dx++) {
      if (dx === 0 && dy === 0) continue;
      out.push([x + dx, y + dy]);
    }
  return out;
}

function nearIdx(map: LevelMap, x: number, y: number, rng: RNG): number {
  const spots: number[] = [];
  for (let dy = -4; dy <= 4; dy++)
    for (let dx = -4; dx <= 4; dx++) {
      const nx = x + dx, ny = y + dy;
      if (nx < 1 || ny < 1 || nx >= map.w - 1 || ny >= map.h - 1) continue;
      if (map.tiles[idx(nx, ny, map.w)] === T.Floor) spots.push(idx(nx, ny, map.w));
    }
  return spots.length ? rng.pick(spots) : idx(x, y, map.w);
}

// ---------------- rooms & corridors
function carveRooms(map: LevelMap, rng: RNG): Room[] {
  const rooms: Room[] = [];
  for (let tries = 0; tries < 80 && rooms.length < 12; tries++) {
    const w = rng.int(5, 11);
    const h = rng.int(4, 8);
    const x = rng.int(1, W - w - 2);
    const y = rng.int(1, H - h - 2);
    const r = { x, y, w, h };
    if (rooms.some((o) => x < o.x + o.w + 1 && x + w + 1 > o.x && y < o.y + o.h + 1 && y + h + 1 > o.y)) continue;
    rooms.push(r);
    for (let yy = y; yy < y + h; yy++)
      for (let xx = x; xx < x + w; xx++) map.tiles[idx(xx, yy, W)] = T.Floor;
  }
  for (let i = 1; i < rooms.length; i++) {
    const [ax, ay] = centerOf(rooms[i - 1]);
    const [bx, by] = centerOf(rooms[i]);
    corridor(map, rng, ax, ay, bx, by);
  }
  // a couple of extra loops for less linear maps
  for (let n = 0; n < 3 && rooms.length > 3; n++) {
    const a = rng.pick(rooms), b = rng.pick(rooms);
    const [ax, ay] = centerOf(a);
    const [bx, by] = centerOf(b);
    corridor(map, rng, ax, ay, bx, by);
  }
  // doors
  for (const r of rooms) placeDoors(map, rng, r);
  return rooms;
}

function corridor(map: LevelMap, rng: RNG, ax: number, ay: number, bx: number, by: number): void {
  let x = ax, y = ay;
  const horizFirst = rng.chance(0.5);
  const dig = (xx: number, yy: number) => {
    if (map.tiles[idx(xx, yy, W)] === T.Wall) map.tiles[idx(xx, yy, W)] = T.Floor;
  };
  if (horizFirst) {
    while (x !== bx) { x += Math.sign(bx - x); dig(x, y); }
    while (y !== by) { y += Math.sign(by - y); dig(x, y); }
  } else {
    while (y !== by) { y += Math.sign(by - y); dig(x, y); }
    while (x !== bx) { x += Math.sign(bx - x); dig(x, y); }
  }
}

function placeDoors(map: LevelMap, rng: RNG, r: Room): void {
  for (let xx = r.x; xx < r.x + r.w; xx++) {
    for (const yy of [r.y - 1, r.y + r.h]) {
      tryDoor(map, rng, xx, yy, true);
    }
  }
  for (let yy = r.y; yy < r.y + r.h; yy++) {
    for (const xx of [r.x - 1, r.x + r.w]) {
      tryDoor(map, rng, xx, yy, false);
    }
  }
}

function tryDoor(map: LevelMap, rng: RNG, x: number, y: number, horizWall: boolean): void {
  if (x < 1 || y < 1 || x >= W - 1 || y >= H - 1) return;
  const i = idx(x, y, W);
  if (map.tiles[i] !== T.Floor) return;
  const sideA = horizWall ? map.tiles[idx(x - 1, y, W)] : map.tiles[idx(x, y - 1, W)];
  const sideB = horizWall ? map.tiles[idx(x + 1, y, W)] : map.tiles[idx(x, y + 1, W)];
  if (sideA === T.Wall && sideB === T.Wall && rng.chance(0.55)) map.tiles[i] = T.DoorClosed;
}

function roomWallSpots(map: LevelMap, r: Room): [number, number][] {
  const out: [number, number][] = [];
  for (let xx = r.x; xx < r.x + r.w; xx++) {
    if (map.tiles[idx(xx, r.y - 1, W)] === T.Wall) out.push([xx, r.y - 1]);
    if (map.tiles[idx(xx, r.y + r.h, W)] === T.Wall) out.push([xx, r.y + r.h]);
  }
  return out;
}

// ---------------- caves
function carveCaves(map: LevelMap, rng: RNG): void {
  let grid = new Uint8Array(W * H);
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++)
      grid[idx(x, y, W)] = x === 0 || y === 0 || x === W - 1 || y === H - 1 || rng.chance(0.44) ? 1 : 0;
  for (let iter = 0; iter < 4; iter++) {
    const next = new Uint8Array(W * H);
    for (let y = 0; y < H; y++)
      for (let x = 0; x < W; x++) {
        let walls = 0;
        for (let dy = -1; dy <= 1; dy++)
          for (let dx = -1; dx <= 1; dx++) {
            const nx = x + dx, ny = y + dy;
            if (nx < 0 || ny < 0 || nx >= W || ny >= H || grid[idx(nx, ny, W)]) walls++;
          }
        next[idx(x, y, W)] = walls >= 5 ? 1 : 0;
      }
    grid = next;
  }
  for (let i = 0; i < W * H; i++) map.tiles[i] = grid[i] ? T.Wall : T.Floor;
}

// ---------------- throne (final floor)
function carveThrone(map: LevelMap, rng: RNG): Room[] {
  const rw = 44, rh = 26;
  const rx = Math.floor((W - rw) / 2), ry = Math.floor((H - rh) / 2);
  for (let y = ry; y < ry + rh; y++)
    for (let x = rx; x < rx + rw; x++) map.tiles[idx(x, y, W)] = T.Floor;
  // pillars
  for (let px = rx + 4; px < rx + rw - 4; px += 6)
    for (let py = ry + 4; py < ry + rh - 4; py += 6)
      if (rng.chance(0.8)) {
        map.tiles[idx(px, py, W)] = T.Wall;
        map.tiles[idx(px + 1, py, W)] = T.Wall;
      }
  // entry corridor from west
  const cy = Math.floor(H / 2);
  for (let x = 2; x <= rx; x++) map.tiles[idx(x, cy, W)] = T.Floor;
  // unlight braziers
  for (let n = 0; n < 8; n++) {
    const x = rng.int(rx + 2, rx + rw - 3), y = rng.int(ry + 2, ry + rh - 3);
    if (map.tiles[idx(x, y, W)] === T.Floor) {
      map.lights.push({ x, y, r: 5, color: [150, 100, 255], flicker: rng.next() * 10 });
    }
  }
  return [{ x: rx, y: ry, w: rw, h: rh }];
}

// ---------------- connectivity helpers
function keepLargestRegion(map: LevelMap): void {
  const seen = new Int32Array(W * H).fill(-1);
  let bestId = -1, bestSize = 0, id = 0;
  for (let i = 0; i < W * H; i++) {
    if (map.tiles[i] === T.Wall || seen[i] !== -1) continue;
    let size = 0;
    const stack = [i];
    seen[i] = id;
    while (stack.length) {
      const cur = stack.pop()!;
      size++;
      const cx = cur % W, cy = Math.floor(cur / W);
      for (const [nx, ny] of neighbors(cx, cy)) {
        if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
        const ni = idx(nx, ny, W);
        if (map.tiles[ni] !== T.Wall && seen[ni] === -1) {
          seen[ni] = id;
          stack.push(ni);
        }
      }
    }
    if (size > bestSize) { bestSize = size; bestId = id; }
    id++;
  }
  for (let i = 0; i < W * H; i++) {
    if (map.tiles[i] !== T.Wall && seen[i] !== bestId) map.tiles[i] = T.Wall;
  }
}

export function bfsDistance(map: LevelMap, sx: number, sy: number, forMonsters = false): Float64Array {
  const dist = new Float64Array(W * H).fill(Infinity);
  const q: number[] = [idx(sx, sy, W)];
  dist[q[0]] = 0;
  let head = 0;
  while (head < q.length) {
    const cur = q[head++];
    const cx = cur % W, cy = Math.floor(cur / W);
    for (const [nx, ny] of neighbors(cx, cy)) {
      if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
      const ni = idx(nx, ny, W);
      const t = map.tiles[ni];
      const ok = isWalkable(t) || (forMonsters && t === T.DoorClosed);
      if (ok && dist[ni] === Infinity) {
        dist[ni] = dist[cur] + 1;
        q.push(ni);
      }
    }
  }
  return dist;
}

function blob(map: LevelMap, rng: RNG, tile: number, size: number): void {
  const open = floorIdx(map);
  if (!open.length) return;
  let cur = rng.pick(open);
  for (let n = 0; n < size; n++) {
    if (map.tiles[cur] === T.Floor) map.tiles[cur] = tile;
    const cx = cur % W, cy = Math.floor(cur / W);
    const opts = neighbors(cx, cy).filter(([nx, ny]) =>
      nx > 0 && ny > 0 && nx < W - 1 && ny < H - 1 &&
      (map.tiles[idx(nx, ny, W)] === T.Floor || map.tiles[idx(nx, ny, W)] === tile));
    if (!opts.length) break;
    const [nx, ny] = rng.pick(opts);
    cur = idx(nx, ny, W);
  }
}
