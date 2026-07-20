// Mysterious branch objects — one small riddle per branch.
//
// Design rules (house style): mechanics transparent at a glance, mystery kept
// in the fiction; 2–4 steps, no state machines; solving OPENS something — a
// way that was not there before. Failure is flavorful, never brutal.
//
//   ossuary   — the Misfiled Remains: return them to the gap in the shelves;
//               the shelf swings aside onto the reliquary of the well-filed.
//   waxgarden — the Three Cold Candles: light them in the order of the vow
//               (the stolen, the keeper, yourself); the wax opens an arch.
//   silkfen   — the Tithe-Scale: deposit something bottled; the larder
//               reciprocates and parts its silk from a stocked pantry.
//   roots     — the Charred Seed: take it from the elf-cairn, plant it in the
//               warm hollow; the roots tear open a burrow they kept.
//   chains    — the Reserved Cell: three doors, one never touched. The ledger
//               says which. Wrong doors have occupants.
//   cistern   — the Still Basin: look in, and the reflection shows a door the
//               room does not have. Looking has a price.
//
// All state lives in LevelMap.objects (idx -> ObjData, OBJ_META for floor-wide
// flags) so it survives floor caching and the save round-trip for free.
import './objsprites';
import { RNG } from './rng';
import {
  T, idx, isWalkable, OBJ_META,
  type Item, type LevelMap, type ObjData,
} from './types';
import { MONSTER_BY_ID, genItem, itemName, mkItem } from './data';
import { spawnMonster } from './dungeon';
import { sfx } from './audio';
import type { Game } from './game';

// message colors (mirrors C in game.ts; kept local to avoid an import cycle)
const CO = {
  info: '#8f887c', warn: '#e0a050', god: '#b08ae8', item: '#c8bfae',
  good: '#7fce7f', bad: '#d43a4a', lore: '#a89cc4', bold: '#e8e0d0',
};

const meta = (L: LevelMap): ObjData => {
  let m = L.objects.get(OBJ_META);
  if (!m) {
    m = {};
    L.objects.set(OBJ_META, m);
  }
  return m;
};

// ============================================================ generation

export function placeBranchObjects(
  map: LevelMap, rng: RNG, branchId: string, branchPos: number,
  items: Item[], depth: number, luck: number, px: number, py: number,
): void {
  if (branchPos !== 0) return; // the riddle waits on the first level of each branch
  switch (branchId) {
    case 'ossuary': genOssuary(map, rng, items, depth, luck, px, py); break;
    case 'waxgarden': genWaxgarden(map, rng, items, depth, luck, px, py); break;
    case 'silkfen': genSilkfen(map, rng, items, depth, luck, px, py); break;
    case 'roots': genRoots(map, rng, items, depth, luck, px, py); break;
    case 'chains': genChains(map, rng, items, depth, luck); break;
    case 'cistern': genCistern(map, rng, items, depth, luck, px, py); break;
  }
}

// a pw×ph patch of open ground, clear of the player's arrival tile.
// The ring may hold walkable decor; the middle row (where objects land) must be
// bare floor so nothing load-bearing is replaced.
function findPatch(map: LevelMap, rng: RNG, pw: number, ph: number, px: number, py: number): [number, number] | null {
  const open = (t: number): boolean => t === T.Floor || t === T.Bones || t === T.Rubble || t === T.Fungus;
  for (let tries = 0; tries < 600; tries++) {
    const x0 = rng.int(2, map.w - pw - 3);
    const y0 = rng.int(2, map.h - ph - 3);
    let ok = true;
    for (let y = 0; y < ph && ok; y++)
      for (let x = 0; x < pw && ok; x++) {
        const t = map.tiles[idx(x0 + x, y0 + y, map.w)];
        if (!(y === (ph >> 1) ? t === T.Floor : open(t))) ok = false;
      }
    if (!ok) continue;
    const cx = x0 + (pw >> 1), cy = y0 + (ph >> 1);
    if (Math.abs(cx - px) + Math.abs(cy - py) < 5) continue;
    return [x0, y0];
  }
  return null;
}

// Carve a sealed iw×ih chamber into solid rock. Its entrance tile stays part of
// the shell (returned so the puzzle can turn it into a way in later); a straight
// corridor is dug from just outside the entrance to the nearest open floor, so
// the sealed way sits flush on a walkable dead end.
function carveChamber(map: LevelMap, rng: RNG, iw: number, ih: number): { interior: number[]; entrance: number } | null {
  const w = map.w, h = map.h;
  for (let tries = 0; tries < 500; tries++) {
    const x0 = rng.int(2, w - iw - 4);
    const y0 = rng.int(2, h - ih - 4);
    // the exact shell (interior + 1-tile wall) must be solid rock; caves are
    // porous, so demanding extra margin would starve them of chambers
    let solid = true;
    for (let y = 0; y <= ih + 1 && solid; y++)
      for (let x = 0; x <= iw + 1 && solid; x++)
        if (map.tiles[idx(x0 + x, y0 + y, w)] !== T.Wall) solid = false;
    if (!solid) continue;
    // entrance candidates: middle of each shell side, with a straight shot out
    const sides: [number, number, number, number][] = [
      [x0 + 1 + ((iw - 1) >> 1), y0 + ih + 1, 0, 1],
      [x0 + 1 + ((iw - 1) >> 1), y0, 0, -1],
      [x0, y0 + 1 + ((ih - 1) >> 1), -1, 0],
      [x0 + iw + 1, y0 + 1 + ((ih - 1) >> 1), 1, 0],
    ];
    for (const [ex, ey, dx, dy] of rng.shuffle(sides)) {
      const path: number[] = [];
      let cx = ex + dx, cy = ey + dy;
      let found = false;
      for (let step = 0; step < 40; step++) {
        if (cx < 1 || cy < 1 || cx >= w - 1 || cy >= h - 1) break;
        const t = map.tiles[idx(cx, cy, w)];
        if (t === T.Floor) { found = true; break; }
        if (t !== T.Wall) break; // never tunnel into water, lava or features
        path.push(idx(cx, cy, w));
        cx += dx; cy += dy;
      }
      if (!found) continue;
      const interior: number[] = [];
      for (let y = 1; y <= ih; y++)
        for (let x = 1; x <= iw; x++) {
          const i = idx(x0 + x, y0 + y, w);
          map.tiles[i] = T.Floor;
          interior.push(i);
        }
      for (const i of path) map.tiles[i] = T.Floor;
      return { interior, entrance: idx(ex, ey, w) };
    }
  }
  return null;
}

// preferred size first, then a snugger crypt for tight cave maps
function carveRewardChamber(map: LevelMap, rng: RNG): { interior: number[]; entrance: number } | null {
  return carveChamber(map, rng, 3, 2) ?? carveChamber(map, rng, 2, 2) ?? carveChamber(map, rng, 2, 1);
}

function stockChamber(map: LevelMap, rng: RNG, interior: number[], items: Item[], depth: number, luck: number, n: number): void {
  const spots = rng.shuffle(interior);
  for (let k = 0; k < n; k++) {
    const it = genItem(Math.min(20, depth + 2), rng, luck + 2);
    const i = spots[k % spots.length];
    it.x = i % map.w;
    it.y = Math.floor(i / map.w);
    items.push(it);
  }
  const gi = spots[n % spots.length];
  const gold = mkItem('gold', 'gold', { qty: rng.int(30, 60 + depth * 5) });
  gold.x = gi % map.w;
  gold.y = Math.floor(gi / map.w);
  items.push(gold);
}

function genOssuary(map: LevelMap, rng: RNG, items: Item[], depth: number, luck: number, px: number, py: number): void {
  const patch = findPatch(map, rng, 3, 3, px, py);
  if (!patch) return;
  const ch = carveRewardChamber(map, rng);
  if (!ch) return;
  map.tiles[ch.entrance] = T.ObjNiche;
  map.objects.set(ch.entrance, { kind: 'niche' });
  stockChamber(map, rng, ch.interior, items, depth, luck, 2);
  const si = idx(patch[0] + 1, patch[1] + 1, map.w);
  map.tiles[si] = T.ObjSkull;
  map.objects.set(si, { kind: 'skull' });
  meta(map).puzzle = 'ossuary';
}

function genWaxgarden(map: LevelMap, rng: RNG, items: Item[], depth: number, luck: number, px: number, py: number): void {
  const patch = findPatch(map, rng, 5, 3, px, py);
  if (!patch) return;
  const ch = carveRewardChamber(map, rng);
  if (!ch) return;
  stockChamber(map, rng, ch.interior, items, depth, luck, 2);
  const m = meta(map);
  m.puzzle = 'waxgarden';
  m.door = ch.entrance;
  const ords = rng.shuffle([0, 1, 2]);
  for (let k = 0; k < 3; k++) {
    const i = idx(patch[0] + 1 + k, patch[1] + 1, map.w);
    map.tiles[i] = T.ObjCandle;
    map.objects.set(i, { kind: 'candle', ord: ords[k], lit: 0 });
  }
}

function genSilkfen(map: LevelMap, rng: RNG, items: Item[], depth: number, luck: number, px: number, py: number): void {
  const patch = findPatch(map, rng, 3, 3, px, py);
  if (!patch) return;
  const ch = carveRewardChamber(map, rng);
  if (!ch) return;
  stockChamber(map, rng, ch.interior, items, depth, luck, 3); // the Mother provisions well
  const m = meta(map);
  m.puzzle = 'silkfen';
  m.door = ch.entrance;
  const si = idx(patch[0] + 1, patch[1] + 1, map.w);
  map.tiles[si] = T.ObjScale;
  map.objects.set(si, { kind: 'scale' });
}

function genRoots(map: LevelMap, rng: RNG, items: Item[], depth: number, luck: number, px: number, py: number): void {
  const a = findPatch(map, rng, 3, 3, px, py);
  if (!a) return;
  let b: [number, number] | null = null;
  for (let tries = 0; tries < 40 && !b; tries++) {
    const c = findPatch(map, rng, 3, 3, px, py);
    if (c && Math.abs(c[0] - a[0]) + Math.abs(c[1] - a[1]) >= 8) b = c;
  }
  for (let tries = 0; tries < 20 && !b; tries++) { // a close cairn beats no riddle
    const c = findPatch(map, rng, 3, 3, px, py);
    if (c && (c[0] !== a[0] || c[1] !== a[1])) b = c;
  }
  if (!b) return;
  const ch = carveRewardChamber(map, rng);
  if (!ch) return;
  stockChamber(map, rng, ch.interior, items, depth, luck, 2);
  const m = meta(map);
  m.puzzle = 'roots';
  m.door = ch.entrance;
  m.seed = 0;
  const ci = idx(a[0] + 1, a[1] + 1, map.w);
  map.tiles[ci] = T.ObjCairn;
  map.objects.set(ci, { kind: 'cairn' });
  const hi = idx(b[0] + 1, b[1] + 1, map.w);
  map.tiles[hi] = T.ObjHollow;
  map.objects.set(hi, { kind: 'hollow' });
}

function genChains(map: LevelMap, rng: RNG, items: Item[], depth: number, luck: number): void {
  const w = map.w;
  for (let tries = 0; tries < 240; tries++) {
    const x0 = rng.int(3, w - 12);
    const y0 = rng.int(3, map.h - 10);
    let solid = true;
    for (let y = -1; y <= 4 && solid; y++)
      for (let x = -1; x <= 7 && solid; x++)
        if (map.tiles[idx(x0 + x, y0 + y, w)] !== T.Wall) solid = false;
    if (!solid) continue;
    // straight corridor out from the front row (below the middle door, or west)
    const shots: [number, number, number, number][] = [
      [x0 + 3, y0 + 3, 0, 1],
      [x0, y0 + 3, -1, 0],
    ];
    let dug: number[] | null = null;
    for (const [sx, sy, dx, dy] of rng.shuffle(shots)) {
      const path: number[] = [];
      let cx = sx + dx, cy = sy + dy;
      for (let step = 0; step < 40; step++) {
        if (cx < 1 || cy < 1 || cx >= w - 1 || cy >= map.h - 1) break;
        const t = map.tiles[idx(cx, cy, w)];
        if (t === T.Floor) { dug = path; break; }
        if (t !== T.Wall) break;
        path.push(idx(cx, cy, w));
        cx += dx; cy += dy;
      }
      if (dug) break;
    }
    if (!dug) continue;
    // block: three 1-tile cells over three barred doors over a walk row
    const right = rng.int(0, 2);
    for (let k = 0; k < 3; k++) {
      const cx = x0 + 1 + k * 2;
      map.tiles[idx(cx, y0 + 1, w)] = T.Floor; // cell interior
      const di = idx(cx, y0 + 2, w);
      map.tiles[di] = T.ObjCell;
      map.objects.set(di, { kind: 'cell', right: k === right ? 1 : 0, h: k === right ? 2 : k % 2 });
      if (k === right) {
        const it = genItem(Math.min(20, depth + 2), rng, luck + 2);
        it.x = cx; it.y = y0 + 1;
        items.push(it);
        const it2 = genItem(Math.min(20, depth + 2), rng, luck + 2);
        it2.x = cx; it2.y = y0 + 1;
        items.push(it2);
        const gold = mkItem('gold', 'gold', { qty: rng.int(40, 60 + depth * 5) });
        gold.x = cx; gold.y = y0 + 1;
        items.push(gold);
      }
    }
    for (let x = 0; x <= 5; x++) map.tiles[idx(x0 + x, y0 + 3, w)] = T.Floor; // walk row
    const li = idx(x0 + 6, y0 + 3, w);
    map.tiles[li] = T.ObjLedger;
    map.objects.set(li, { kind: 'ledger' });
    for (const i of dug) map.tiles[i] = T.Floor;
    meta(map).puzzle = 'chains';
    return;
  }
}

function genCistern(map: LevelMap, rng: RNG, items: Item[], depth: number, luck: number, px: number, py: number): void {
  const patch = findPatch(map, rng, 3, 3, px, py);
  if (!patch) return;
  const ch = carveRewardChamber(map, rng);
  if (!ch) return;
  stockChamber(map, rng, ch.interior, items, depth, luck, 2);
  const m = meta(map);
  m.puzzle = 'cistern';
  m.door = ch.entrance;
  const bi = idx(patch[0] + 1, patch[1] + 1, map.w);
  map.tiles[bi] = T.ObjBasin;
  map.objects.set(bi, { kind: 'basin', used: 0 });
}

// ============================================================ interaction

const dirWord = (fx: number, fy: number, tx: number, ty: number): string => {
  const dx = tx - fx, dy = ty - fy;
  const ns = Math.abs(dy) > Math.abs(dx) / 2 ? (dy < 0 ? 'north' : 'south') : '';
  const ew = Math.abs(dx) > Math.abs(dy) / 2 ? (dx < 0 ? 'west' : 'east') : '';
  return ns && ew ? `${ns}-${ew}` : ns || ew || 'heart of the floor';
};

function solve(g: Game, branch: string): void {
  sfx.play('god');
  g.pushFx({ t: 'flash', color: '#b08ae8' });
  g.earnDeed(`riddle_${branch}`);
}

function openWay(g: Game, door: number, tile: T): void {
  const L = g.level;
  L.tiles[door] = tile;
  L.explored[door] = 1;
  g.pushFx({ t: 'shake', mag: 3 });
  g.updateFOV();
  g.dirty = true;
}

// The player walked into a puzzle object. Returns true if a turn passed.
export function interactObject(g: Game, x: number, y: number): boolean {
  const L = g.level;
  const i = idx(x, y, L.w);
  const t = L.tiles[i];
  const o = L.objects.get(i) ?? {};
  const m = meta(L);

  switch (t) {
    // -------- ossuary
    case T.ObjSkull: {
      L.tiles[i] = T.Bones;
      L.objects.delete(i);
      m.skull = 1;
      g.msg('You lift the misfiled remains. The barrow-crown stays on. The skull is lighter than it should be, as if something had already been withdrawn from the account.', CO.item);
      g.msg('Somewhere among the shelves, a gap is waiting for exactly this.', CO.lore);
      return true;
    }
    case T.ObjNiche: {
      if (!m.skull) {
        g.msg('A gap in the rows, exactly remains-shaped. The notch-script label reads like an open entry: something is misfiled, and the shelf will not close until it is returned.', CO.info);
        return false;
      }
      m.skull = 0;
      L.tiles[i] = T.DoorOpen;
      L.objects.delete(i);
      g.msg('You file the remains into the gap. The notch-script accepts the entry — and the whole shelf swings aside on a hinge of bone.', CO.warn);
      g.msg('Behind it: the reliquary of the well-filed. The archive pays for tidying.', CO.god);
      solve(g, 'ossuary');
      openWay(g, i, T.DoorOpen);
      return true;
    }

    // -------- wax garden
    case T.ObjCandle: {
      if (o.lit) {
        g.msg('It burns steadily. Nothing in this garden will put it out now.', CO.info);
        return false;
      }
      const candles: [number, ObjData][] = [...L.objects].filter(([, c]) => c.kind === 'candle');
      const litCount = candles.filter(([, c]) => c.lit === 1).length;
      if (o.ord !== litCount) {
        for (const [ci, c] of candles) {
          if (c.lit !== 1) continue;
          c.lit = 0;
          const cx = ci % L.w, cy = Math.floor(ci / L.w);
          L.lights = L.lights.filter((li) => !(li.x === cx && li.y === cy));
        }
        g.pushFx({ t: 'burst', x, y, color: '#e8d8a8', n: 10 });
        g.msg('The flame takes — then every candle in the row gutters out at once, and hot wax runs over your knuckles like a correction.', CO.bad);
        g.msg('The vigil-rule is absolute: the stolen, then the keeper, then yourself.', CO.lore);
        return true;
      }
      o.lit = 1;
      L.lights.push({ x, y, r: 4, color: [255, 200, 110], flicker: g.rng.next() * 10 });
      const litLines = [
        'The first flame takes: for what was taken. Far above, the horizon does not notice. The wax does.',
        'The second flame takes: for she who waits. Deeper in the garden, something that has stood a very long time straightens slightly.',
        'The third flame takes: yours. Three lights, in the correct order of grief.',
      ];
      g.msg(litLines[litCount], CO.warn);
      if (litCount + 1 === 3 && typeof m.door === 'number') {
        const dd = m.door;
        g.msg(`Across the garden to the ${dirWord(x, y, dd % L.w, Math.floor(dd / L.w))}, a sheet of wax slumps away from an arch that was never sealed — only waiting.`, CO.god);
        openWay(g, dd, T.DoorOpen);
        solve(g, 'waxgarden');
      }
      return true;
    }

    // -------- silkfen
    case T.ObjScale: {
      if (m.paid) {
        g.msg('The scale hangs level. The larder remembers you, the way banks remember.', CO.info);
        return false;
      }
      const flasks = g.player.inventory.filter((it) => it.kind === 'potion');
      if (!flasks.length) {
        g.msg('One pan holds a wrapped ration nine generations old. The other is empty, and it is sized for a flask. The larder takes deposits, not promises.', CO.info);
        return false;
      }
      const pay = flasks.reduce((a, b) => (b.qty > a.qty ? b : a));
      const paidName = itemName(pay, g.ident);
      pay.qty--;
      if (pay.qty <= 0) g.player.inventory.splice(g.player.inventory.indexOf(pay), 1);
      m.paid = 1;
      g.msg(`You set ${paidName} on the empty pan. The scale settles, weighs, approves.`, CO.item);
      if (typeof m.door === 'number') {
        const dd = m.door;
        g.msg(`To the ${dirWord(x, y, dd % L.w, Math.floor(dd / L.w))}, a wall of silk unknots itself, thread by thread, from a pantry door. The Mother honors deposits — and pays interest in kind.`, CO.god);
        openWay(g, dd, T.DoorOpen);
      }
      solve(g, 'silkfen');
      return true;
    }

    // -------- roots
    case T.ObjCairn: {
      L.tiles[i] = T.Rubble;
      L.objects.delete(i);
      m.seed = 1;
      g.msg('You unfold the elf’s fingers. Inside: a seed, charred black, warm as a coal that went out recently — nine generations recently. The hand does not resist. It has been waiting to hand this off.', CO.item);
      return true;
    }
    case T.ObjHollow: {
      if (!m.seed) {
        g.msg('A hollow in the loam, root-lined, blood-warm, exactly seed-shaped. The roots around it all lean inward, like a congregation waiting on a word.', CO.info);
        return false;
      }
      m.seed = 0;
      L.tiles[i] = T.Fungus;
      L.objects.delete(i);
      L.lights.push({ x, y, r: 3.5, color: [120, 220, 130], flicker: g.rng.next() * 10 });
      g.msg('The loam takes the seed like a held breath released. Every root in the walls turns toward it at once.', CO.warn);
      if (typeof m.door === 'number') {
        const dd = m.door;
        g.msg(`To the ${dirWord(x, y, dd % L.w, Math.floor(dd / L.w))}, the floor tears open over a burrow the forests dug long ago — aimed, all along, at where the seed would someday be planted.`, CO.god);
        openWay(g, dd, T.DoorOpen);
      }
      solve(g, 'roots');
      return true;
    }

    // -------- vault of chains
    case T.ObjLedger: {
      g.msg('The reservation ledger, chained to its stand, open to the final page: one cell, one name-blank, one date. A margin note in warden’s hand: "The reserved cell is kept UNTOUCHED. No hand on its lock, no mark within, until the arrival."', CO.god);
      return false;
    }
    case T.ObjCell: {
      L.tiles[i] = T.DoorOpen;
      L.objects.delete(i);
      if (o.right) {
        g.msg('The lock turns before you finish touching it — it was never locked. Inside, laid out with terrible care: effects, held in trust for an arrival.', CO.warn);
        g.msg('The date on the shelf-tag has not happened yet.', CO.lore);
        solve(g, 'chains');
      } else {
        const def = MONSTER_BY_ID.get(g.rng.chance(0.5) ? 'chainedpenitent' : 'gaolwraith');
        if (def) {
          const mon = spawnMonster(def, x, y - 1, g.effDepth());
          mon.awake = true;
          g.monsters.push(mon);
        }
        g.msg('The cell was not empty. Its occupant chose the chains once; it did not choose you.', CO.bad);
      }
      g.updateFOV();
      return true;
    }

    // -------- mirror cistern
    case T.ObjBasin: {
      if (o.used) {
        g.msg('The water still shows the door. It also, now, shows you from behind — a view you never authorized.', CO.info);
        return false;
      }
      o.used = 1;
      if (typeof m.door === 'number') {
        const dd = m.door;
        g.msg(`You look in. The water shows the hall at your back — and in the reflection, to the ${dirWord(x, y, dd % L.w, Math.floor(dd / L.w))}, there is a door where you remember wall. The Cistern reflects what the Unlight sees, and the Unlight knows its ways below.`, CO.warn);
        openWay(g, dd, T.DoorClosed);
      }
      const shade = MONSTER_BY_ID.get('mirrorshade');
      if (shade) {
        const p = g.player;
        const spots: [number, number][] = [];
        for (let dy = -1; dy <= 1; dy++)
          for (let dx = -1; dx <= 1; dx++) {
            if (!dx && !dy) continue;
            const nx = p.x + dx, ny = p.y + dy;
            const nt = L.tiles[idx(nx, ny, L.w)];
            if (isWalkable(nt) && nt !== T.Lava && !g.monsterAt(nx, ny)) spots.push([nx, ny]);
          }
        if (spots.length) {
          const [sx, sy] = g.rng.pick(spots);
          const mon = spawnMonster(shade, sx, sy, g.effDepth());
          mon.awake = true;
          g.monsters.push(mon);
          g.msg('The surface shivers. Something climbs out of it wearing your outline, and it is not glad to be a memory.', CO.bad);
        }
      }
      solve(g, 'cistern');
      g.updateFOV();
      return true;
    }
  }
  return false;
}
