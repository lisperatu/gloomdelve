// Headless balance simulator: a bot plays full runs of Gloomdelve in Node,
// no browser, no rendering. Measures survival, progression, and death causes.
//
//   npm run sim               (defaults: every class, 12 runs each)
//   npm run sim -- 30         (30 runs per class)
//   npm run sim -- 20 nobranch
//
// The Game engine is DOM-free (audio/localStorage calls are try/catch-guarded),
// so this exercises the real code: generation, vaults, branches, AI, combat.

import { Game } from '../src/game';
import { CLASSES, RACES, WEAPONS, ARMORS } from '../src/data';
import { T, idx, isWalkable, type Item, type Monster } from '../src/types';
import { bfsDistance } from '../src/dungeon';

interface RunResult {
  race: string;
  cls: string;
  outcome: 'win' | 'dead' | 'stall';
  depth: number;
  effDepth: number;
  level: number;
  turns: number;
  kills: number;
  cause: string;
  branchesDone: number;
  god: string | null;
}

const wAvg = (it: Item): number => {
  const d = WEAPONS.find((w) => w.id === it.id)!;
  return (d.dmg[0] + d.dmg[1] + it.plus) / 2 + (it.ego ? 1.5 : 0);
};
const aVal = (it: Item): number => {
  const d = ARMORS.find((a) => a.id === it.id)!;
  return d.ac + it.plus + (it.ego ? 1.5 : 0);
};

function stepTowards(g: Game, tx: number, ty: number): boolean {
  const p = g.player;
  const back = bfsDistance(g.level, tx, ty, true);
  let best: [number, number] | null = null;
  let bd = back[idx(p.x, p.y, g.level.w)];
  for (const [dx, dy] of [[0, 1], [0, -1], [1, 0], [-1, 0], [1, 1], [1, -1], [-1, 1], [-1, -1]] as [number, number][]) {
    const nx = p.x + dx, ny = p.y + dy;
    const t = g.tileAt(nx, ny);
    const mon = g.monsterAt(nx, ny);
    const attackable = mon && !mon.friendly && nx === tx && ny === ty;
    if (!attackable && (!(isWalkable(t) || t === T.DoorClosed) || t === T.Lava || (mon && !mon.friendly))) continue;
    const d = back[idx(nx, ny, g.level.w)];
    if (d < bd) { bd = d; best = [dx, dy]; }
  }
  if (!best) return false;
  return g.tryMove(best[0], best[1]);
}

function findTile(g: Game, kinds: number[]): [number, number] | null {
  const L = g.level;
  for (let i = 0; i < L.w * L.h; i++) {
    if (kinds.includes(L.tiles[i])) return [i % L.w, Math.floor(i / L.w)];
  }
  return null;
}

function act(g: Game, useBranches: boolean): void {
  const p = g.player;
  // emergency heal
  const heal = p.inventory.find((i) => i.kind === 'potion' && i.id === 'heal');
  if (p.hp < g.maxHpTot() * 0.35 && heal) { g.quaff(heal); return; }
  // gear upgrades
  for (const it of [...p.inventory]) {
    if (it.kind === 'weapon' && wAvg(it) > (p.equip.weapon ? wAvg(p.equip.weapon) : 2)) { g.equipItem(it); return; }
    if (it.kind === 'armor' && aVal(it) > (p.equip.body ? aVal(p.equip.body) : 0)) { g.equipItem(it); return; }
    if (it.kind === 'ring' && (!p.equip.ring1 || !p.equip.ring2)) { g.equipItem(it); return; }
    if (it.kind === 'amulet' && !p.equip.amulet) { g.equipItem(it); return; }
  }
  const foes = g.visibleMonsters();
  if (foes.length) {
    const t: Monster = foes[0];
    const d = g.dist(p.x, p.y, t.x, t.y);
    for (const a of g.abilitySlots()) {
      if (!a.usable || a.ab.id === 'reprieve') continue;
      if (g.needsTarget(a.ab)) {
        if (d <= a.ab.range && (a.ab.range <= 1 ? d <= 1 : g.losClear(p.x, p.y, t.x, t.y))) {
          if (g.useAbility(a.ab, a.source, t)) return;
        }
      } else if (d <= 3 && foes.length >= 2) {
        if (g.useAbility(a.ab, a.source)) return;
      }
    }
    if (stepTowards(g, t.x, t.y)) return;
    g.wait();
    return;
  }
  const here = g.tileAt(p.x, p.y);
  if (here === T.StairsDown || here === T.PortalBack || (here === T.BranchDown && useBranches)) {
    g.descend();
    return;
  }
  if ((p.hp < g.maxHpTot() * 0.7 || p.mp < g.maxMpTot() * 0.5)) {
    const t0 = p.turns;
    g.rest();
    if (p.turns > t0) return;
  }
  // altar: join first god we meet
  if (here === T.Altar && !p.godId) { g.pray(); return; }
  const t0 = p.turns;
  g.autoExplore();
  if (p.turns > t0) return;
  // fully explored: head for the way down
  const targetKinds = useBranches ? [T.BranchDown, T.StairsDown, T.PortalBack] : [T.StairsDown, T.PortalBack];
  const tgt = findTile(g, targetKinds);
  if (tgt && stepTowards(g, tgt[0], tgt[1])) return;
  g.wait();
}

function runOne(raceId: string, clsId: string, seed: number, useBranches: boolean): RunResult {
  const g = new Game(seed);
  g.startRun(raceId, clsId);
  let lastProgress = 0;
  let lastTurns = -1;
  let lastDepthChange = 0;
  let lastEff = 1;
  const t0 = Date.now();
  for (let step = 0; step < 9000 && !g.over; step++) {
    act(g, useBranches);
    if (g.player.turns === lastTurns) {
      lastProgress++;
      if (lastProgress > 60) break; // no world turn advanced in 60 decisions
    } else {
      lastProgress = 0;
      lastTurns = g.player.turns;
    }
    if (g.effDepth() !== lastEff) { lastEff = g.effDepth(); lastDepthChange = step; }
    if (step - lastDepthChange > 2500) break;      // stuck on one floor
    if (g.player.turns > 11000) break;             // run too long
    if (Date.now() - t0 > 20000) break;            // wall-clock safety
  }
  return {
    race: raceId, cls: clsId,
    outcome: g.over === 'win' ? 'win' : g.over === 'dead' ? 'dead' : 'stall',
    depth: g.depth, effDepth: g.effDepth(), level: g.player.level, turns: g.player.turns,
    kills: g.player.kills, cause: g.deathCause || '-', branchesDone: g.branchesDone.length,
    god: g.player.godId,
  };
}

// ---------------- main
const args = process.argv.slice(2).filter((a) => a !== '--');
const runsPer = Number(args.find((a) => /^\d+$/.test(a))) || 12;
const useBranches = !args.includes('nobranch');

const results: RunResult[] = [];
const t0 = Date.now();
for (const cls of CLASSES) {
  for (let i = 0; i < runsPer; i++) {
    const race = RACES[i % RACES.length];
    results.push(runOne(race.id, cls.id, 90000 + i * 7919 + cls.id.length * 131, useBranches));
  }
}
const elapsed = (Date.now() - t0) / 1000;

const fmt = (n: number): string => n.toFixed(1);
console.log(`\n${results.length} runs in ${fmt(elapsed)}s (${fmt(results.length / elapsed)} runs/s, branches=${useBranches})\n`);
console.log('class        | win% | avg death depth | avg lvl | avg turns | avg kills | stalls');
console.log('-------------|------|-----------------|---------|-----------|-----------|-------');
for (const cls of CLASSES) {
  const rs = results.filter((r) => r.cls === cls.id);
  const wins = rs.filter((r) => r.outcome === 'win').length;
  const deaths = rs.filter((r) => r.outcome === 'dead');
  const stalls = rs.filter((r) => r.outcome === 'stall').length;
  const avgD = deaths.length ? deaths.reduce((a, r) => a + r.effDepth, 0) / deaths.length : 0;
  const avgL = rs.reduce((a, r) => a + r.level, 0) / rs.length;
  const avgT = rs.reduce((a, r) => a + r.turns, 0) / rs.length;
  const avgK = rs.reduce((a, r) => a + r.kills, 0) / rs.length;
  console.log(
    `${cls.id.padEnd(12)} | ${String(Math.round((wins / rs.length) * 100)).padStart(3)}% | ${fmt(avgD).padStart(15)} | ${fmt(avgL).padStart(7)} | ${String(Math.round(avgT)).padStart(9)} | ${fmt(avgK).padStart(9)} | ${stalls}`);
}

// survival curve
console.log('\ndeaths by depth band:');
const bands: Record<string, number> = {};
for (const r of results.filter((x) => x.outcome === 'dead')) {
  const b = `${Math.floor((r.effDepth - 1) / 4) * 4 + 1}-${Math.floor((r.effDepth - 1) / 4) * 4 + 4}`;
  bands[b] = (bands[b] ?? 0) + 1;
}
for (const [b, n] of Object.entries(bands).sort((a, b2) => Number(a[0].split('-')[0]) - Number(b2[0].split('-')[0]))) {
  console.log(`  depth ${b.padEnd(6)} ${'#'.repeat(n)} ${n}`);
}

// top killers
console.log('\ntop killers:');
const killers: Record<string, number> = {};
for (const r of results.filter((x) => x.outcome === 'dead')) killers[r.cause] = (killers[r.cause] ?? 0) + 1;
for (const [c, n] of Object.entries(killers).sort((a, b2) => b2[1] - a[1]).slice(0, 10)) {
  console.log(`  ${String(n).padStart(3)}× ${c}`);
}
const brDone = results.reduce((a, r) => a + r.branchesDone, 0);
console.log(`\nbranches completed across all runs: ${brDone}; godded runs: ${results.filter((r) => r.god).length}/${results.length}`);
