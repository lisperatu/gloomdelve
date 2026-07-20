import { RNG } from './rng';
import {
  T, idx, isWalkable, isTransparent,
  type DamageType, type FX, type Item, type LevelMap, type Monster, type Msg,
  type Player, type Status, type StatusKind,
} from './types';
import {
  ARMORS, BRANCH_BY_ID, BRANCH_PAIRS, CLASSES, CORRUPTIONS, GODS, MAX_DEPTH, MONSTER_BY_ID, RACES,
  STRATA, WEAPONS, genItem, itemName, makeIdentify, mkItem, stratumFor,
  type AbilityDef, type ClassDef, type Identify, type RaceDef,
} from './data';
import { bresenham, computeFOV } from './fov';
import { sfx } from './audio';
import { WHISPERS } from './lore';
import { bfsDistance, generateLevel, neighbors, spawnMonster } from './dungeon';

export const C = {
  dmg: '#e06a6a', good: '#7fce7f', info: '#8f887c', warn: '#e0a050',
  god: '#b08ae8', item: '#c8bfae', bad: '#d43a4a', bold: '#e8e0d0',
};

export class Game {
  rng: RNG;
  seed: number;
  ident: Identify;
  player!: Player;
  race!: RaceDef;
  cls!: ClassDef;
  level!: LevelMap;
  monsters: Monster[] = [];
  items: Item[] = [];
  depth = 1;
  msgs: Msg[] = [];
  fx: FX[] = [];
  over: 'dead' | 'win' | null = null;
  deathCause = '';
  distMap!: Float64Array;
  seenStrata = new Set<number>();
  seenBosses = new Set<string>();
  bestiary = new Set<string>(); // monster ids the player has seen (codex unlocks)
  bestiaryKills: Record<string, number> = {};
  whispersFired: string[] = [];
  branch: string | null = null;
  branchPos = 0;
  branchesDone: string[] = [];
  runBranches: string[] = [];
  foundUniques = new Set<string>();
  merchantStock: Item[] | null = null; // per-level; null until visited
  shopOpen = false;
  corruptionOffer: string[] | null = null; // two corruption ids, set when praying at a warped altar

  hasCorr(id: string): boolean {
    return this.player?.corruptions.includes(id) ?? false;
  }

  acceptCorruption(id: string | null): void {
    const p = this.player;
    this.corruptionOffer = null;
    const here = idx(p.x, p.y, this.level.w);
    if (this.tileAt(p.x, p.y) === T.WarpAltar) {
      this.level.tiles[here] = T.Rubble; // the altar is spent either way
    }
    if (!id) {
      this.msg('You refuse. The altar closes like an eye. Something makes a small note.', C.god);
      this.advanceWorld();
      return;
    }
    const def = CORRUPTIONS.find((c) => c.id === id);
    if (!def) return;
    p.corruptions.push(id);
    switch (id) {
      case 'venomglands': p.dex = Math.max(3, p.dex - 2); break;
      case 'swallowedkey': p.str++; p.dex++; p.wil++; break;
      default: break;
    }
    p.hp = Math.min(p.hp, this.maxHpTot());
    sfx.play('god');
    this.pushFx({ t: 'flash', color: '#8ad45a' });
    this.msg(`The edit is made. You have gained: ${def.name}.`, C.god);
    this.msg(`${def.lore}`, '#a89cc4');
    if (p.corruptions.length === 1) this.chroniclePage();
    this.dirty = true;
    this.advanceWorld();
  }
  hpAcc = 0;
  mpAcc = 0;
  dirty = true; // HUD refresh flag

  constructor(seed: number) {
    this.seed = seed;
    this.rng = new RNG(seed);
    this.ident = makeIdentify(this.rng);
    // knowledge persists across deaths (the Codex outlives the delver)
    const meta = Game.loadMeta();
    this.bestiary = new Set(meta.bestiary);
    this.bestiaryKills = { ...meta.kills };
  }

  static loadMeta(): { bestiary: string[]; kills: Record<string, number>; deaths: number; wins: number } {
    try {
      const raw = localStorage.getItem('gloomdelve-meta');
      if (raw) return { bestiary: [], kills: {}, deaths: 0, wins: 0, ...JSON.parse(raw) };
    } catch { /* ignore */ }
    return { bestiary: [], kills: {}, deaths: 0, wins: 0 };
  }

  syncMeta(event?: 'death' | 'win'): void {
    try {
      const meta = Game.loadMeta();
      meta.bestiary = [...new Set([...meta.bestiary, ...this.bestiary])];
      for (const [k, v] of Object.entries(this.bestiaryKills)) {
        meta.kills[k] = Math.max(meta.kills[k] ?? 0, v);
      }
      if (event === 'death') meta.deaths++;
      if (event === 'win') meta.wins++;
      localStorage.setItem('gloomdelve-meta', JSON.stringify(meta));
    } catch { /* ignore */ }
  }

  chroniclePage(): void {
    this.msg('✎ A page of the Chronicle writes itself. (c to read)', C.god);
  }

  // ============================================== persistence
  save(): void {
    if (!this.player || !this.level || this.over) return;
    try {
      const L = this.level;
      const data = {
        v: 1, seed: this.seed, rng: this.rng.state, depth: this.depth,
        player: this.player,
        level: {
          w: L.w, h: L.h, depth: L.depth, stratum: L.stratum,
          tiles: Array.from(L.tiles), explored: Array.from(L.explored),
          lights: L.lights, decals: [...L.decals], altarGod: [...L.altarGod], gates: [...L.gates],
        },
        monsters: this.monsters.map((m) => ({
          id: m.def.id, x: m.x, y: m.y, hp: m.hp, maxHp: m.maxHp, dmgBonus: m.dmgBonus,
          energy: m.energy, awake: m.awake, friendly: m.friendly, statuses: m.statuses, uid: m.uid,
        })),
        items: this.items,
        ident: {
          known: [...this.ident.known], potion: [...this.ident.potionFlavor],
          scroll: [...this.ident.scrollFlavor], ring: [...this.ident.ringFlavor], amulet: [...this.ident.amuletFlavor],
        },
        seenStrata: [...this.seenStrata], seenBosses: [...this.seenBosses],
        bestiary: [...this.bestiary], bestiaryKills: this.bestiaryKills,
        branch: this.branch, branchPos: this.branchPos, branchesDone: this.branchesDone,
        runBranches: this.runBranches, whispersFired: this.whispersFired, foundUniques: [...this.foundUniques],
        merchantStock: this.merchantStock,
        msgs: this.msgs.slice(-30),
      };
      localStorage.setItem('gloomdelve-save', JSON.stringify(data));
      this.syncMeta();
    } catch { /* storage unavailable */ }
  }

  static hasSave(): boolean {
    try { return localStorage.getItem('gloomdelve-save') !== null; } catch { return false; }
  }

  static clearSave(): void {
    try { localStorage.removeItem('gloomdelve-save'); } catch { /* ignore */ }
  }

  tryRestore(): boolean {
    try {
      const raw = localStorage.getItem('gloomdelve-save');
      if (!raw) return false;
      const d = JSON.parse(raw);
      if (d.v !== 1) return false;
      this.seed = d.seed;
      this.rng.state = d.rng;
      this.player = d.player;
      this.race = RACES.find((r) => r.id === d.player.raceId)!;
      this.cls = CLASSES.find((c) => c.id === d.player.classId)!;
      if (!this.race || !this.cls) return false;
      this.depth = d.depth;
      this.level = {
        w: d.level.w, h: d.level.h, depth: d.level.depth, stratum: d.level.stratum,
        tiles: Uint8Array.from(d.level.tiles as number[]), explored: Uint8Array.from(d.level.explored as number[]),
        visible: new Uint8Array(d.level.w * d.level.h),
        lights: d.level.lights, decals: new Map(d.level.decals), altarGod: new Map(d.level.altarGod),
        gates: new Map(d.level.gates ?? []),
      };
      this.monsters = (d.monsters as { id: string; x: number; y: number; hp: number; maxHp: number; dmgBonus: number; energy: number; awake: boolean; friendly: boolean; statuses: Status[]; uid: number }[])
        .filter((m) => MONSTER_BY_ID.has(m.id))
        .map((m) => ({
          uid: m.uid, def: MONSTER_BY_ID.get(m.id)!, x: m.x, y: m.y, hp: m.hp, maxHp: m.maxHp,
          dmgBonus: m.dmgBonus, energy: m.energy, awake: m.awake, friendly: m.friendly, statuses: m.statuses,
        }));
      this.items = d.items;
      this.ident = {
        known: new Set(d.ident.known), potionFlavor: new Map(d.ident.potion),
        scrollFlavor: new Map(d.ident.scroll), ringFlavor: new Map(d.ident.ring), amuletFlavor: new Map(d.ident.amulet),
      };
      this.seenStrata = new Set(d.seenStrata);
      this.seenBosses = new Set(d.seenBosses);
      this.bestiary = new Set(d.bestiary ?? []);
      this.bestiaryKills = d.bestiaryKills ?? {};
      this.branch = d.branch ?? null;
      this.branchPos = d.branchPos ?? 0;
      this.branchesDone = d.branchesDone ?? [];
      this.whispersFired = d.whispersFired ?? [];
      this.runBranches = d.runBranches ?? ['ossuary', 'silkfen', 'chains'];
      this.foundUniques = new Set(d.foundUniques ?? []);
      this.merchantStock = d.merchantStock ?? null;
      if (!this.player.charName) this.player.charName = 'the Delver';
      this.msgs = d.msgs;
      this.msg('You return to the dark, exactly where it left you.', C.god);
      this.updateFOV();
      this.distMap = bfsDistance(this.level, this.player.x, this.player.y, true);
      this.dirty = true;
      return true;
    } catch {
      return false;
    }
  }

  // ============================================== run setup
  startRun(raceId: string, classId: string, charName = 'the Delver'): void {
    this.race = RACES.find((r) => r.id === raceId)!;
    this.cls = CLASSES.find((c) => c.id === classId)!;
    const str = 10 + this.race.str + (this.cls.statFav[0] === 'str' ? 1 : 0) + (this.cls.statFav[1] === 'str' ? 1 : 0);
    const dex = 10 + this.race.dex + (this.cls.statFav[0] === 'dex' ? 1 : 0) + (this.cls.statFav[1] === 'dex' ? 1 : 0);
    const wil = 10 + this.race.wil + (this.cls.statFav[0] === 'wil' ? 1 : 0) + (this.cls.statFav[1] === 'wil' ? 1 : 0);
    const maxHp = Math.round(this.cls.hpBase * this.race.hpMult);
    const maxMp = Math.round((this.cls.mpBase + Math.max(0, wil - 10)) * this.race.mpMult);
    this.player = {
      x: 0, y: 0, hp: maxHp, maxHp, mp: maxMp, maxMp,
      str, dex, wil, level: 1, xp: 0, gold: 0,
      raceId, classId, godId: null, piety: 0,
      inventory: [], equip: { weapon: null, body: null, amulet: null, ring1: null, ring2: null },
      statuses: [], reprieveUsed: false, kills: 0, turns: 0,
      name: `${this.race.name.replace(/^The /, '')} ${this.cls.name}`,
      charName,
      corruptions: [],
    };
    const kit = this.cls.kit;
    if (kit.weapon) {
      const w = mkItem('weapon', kit.weapon, { plus: kit.weaponPlus ?? 0 });
      this.player.equip.weapon = w;
    }
    if (kit.body) this.player.equip.body = mkItem('armor', kit.body);
    for (const p of kit.potions ?? []) this.player.inventory.push(mkItem('potion', p, { qty: 2 }));
    for (const s of kit.scrolls ?? []) this.player.inventory.push(mkItem('scroll', s, { qty: 2 }));
    this.runBranches = BRANCH_PAIRS.map((pair) => this.rng.pick(pair));
    this.newLevel(1);
    this.msg(`You are ${this.player.name}. The earth swallows you whole.`, C.bold);
    this.msg('Somewhere below, the Unlight Sovereign waits on its throne. Descend. (? for help)', C.god);
  }

  newLevel(depth: number): void {
    this.depth = depth;
    this.branch = null;
    this.merchantStock = null;
    const gen = generateLevel(depth, this.rng, this.race?.luck ?? 0, {
      doneBranches: new Set(this.branchesDone),
      runBranches: new Set(this.runBranches.length ? this.runBranches : ['ossuary', 'silkfen', 'chains']),
      uniques: this.foundUniques,
    });
    this.level = gen.map;
    this.monsters = gen.monsters;
    this.items = gen.items;
    this.player.x = gen.px;
    this.player.y = gen.py;
    const s = stratumFor(depth);
    const si = STRATA.indexOf(s);
    if (!this.seenStrata.has(si)) {
      this.seenStrata.add(si);
      this.msg(`— ${s.name} —`, C.bold);
      this.msg(s.intro, C.info);
      this.chroniclePage();
    } else {
      this.msg(`You descend to depth ${depth}. ${s.name}.`, C.info);
    }
    if (this.player.godId === 'moths') this.gainPiety(8, 'The Mother of Moths delights in your descent.');
    const wh = WHISPERS[depth];
    if (wh && !this.whispersFired.includes(wh.id)) {
      this.whispersFired.push(wh.id);
      this.msg(wh.text, '#a89cc4');
    }
    // state-conditioned margin notes (fire once per run)
    if (this.player.hp < this.maxHpTot() * 0.3 && !this.whispersFired.includes('wounded')) {
      this.whispersFired.push('wounded');
      this.msg('The Cartographer\u2019s rule for floors entered bleeding: "The dungeon can smell arithmetic. Rest before you owe it a remainder."', '#a89cc4');
    } else if (this.player.gold >= 250 && !this.whispersFired.includes('rich')) {
      this.whispersFired.push('rich');
      this.msg('A margin note beside a coin-tally: "Everyone who failed brought something worth stealing. You are becoming worth stealing."', '#a89cc4');
    }
    if (depth > 1) sfx.play('stairs');
    sfx.ambient(this.level.stratum);
    this.updateFOV();
    this.distMap = bfsDistance(this.level, this.player.x, this.player.y, true);
    this.dirty = true;
    this.save();
  }

  effDepth(): number {
    if (!this.branch) return this.depth;
    const b = BRANCH_BY_ID.get(this.branch)!;
    return b.entry + this.branchPos + 2;
  }

  locationName(): string {
    if (this.branch) {
      const b = BRANCH_BY_ID.get(this.branch)!;
      return `${b.name} · level ${this.branchPos + 1}`;
    }
    return `${stratumFor(this.depth).name} · depth ${this.depth}`;
  }

  enterBranch(id: string): void {
    const b = BRANCH_BY_ID.get(id);
    if (!b) return;
    this.branch = id;
    this.branchPos = 0;
    this.makeBranchLevel();
    this.msg(`— ${b.name} —`, C.bold);
    this.msg(b.intro, C.info);
    sfx.ambient(this.level.stratum);
    this.msg('The gate grinds shut behind you. Somewhere ahead, a way home is being kept from you.', C.warn);
    sfx.play('stairs');
  }

  advanceBranch(): void {
    this.branchPos++;
    this.makeBranchLevel();
    const b = BRANCH_BY_ID.get(this.branch!)!;
    this.msg(`You descend deeper into ${b.name}.`, C.info);
    sfx.play('stairs');
  }

  private makeBranchLevel(): void {
    const b = BRANCH_BY_ID.get(this.branch!)!;
    const gen = generateLevel(this.effDepth(), this.rng, this.race?.luck ?? 0, { branch: b, branchPos: this.branchPos, uniques: this.foundUniques });
    this.level = gen.map;
    this.monsters = gen.monsters;
    this.items = gen.items;
    this.player.x = gen.px;
    this.player.y = gen.py;
    this.updateFOV();
    this.distMap = bfsDistance(this.level, this.player.x, this.player.y, true);
    this.dirty = true;
    this.save();
  }

  exitBranch(): void {
    const b = BRANCH_BY_ID.get(this.branch!)!;
    if (!this.branchesDone.includes(b.id)) this.branchesDone.push(b.id);
    this.branch = null;
    this.branchPos = 0;
    const returnDepth = this.depth;
    this.msg(`The portal spits you back into the great descent. ${b.name} is behind you — and it will remember.`, C.god);
    this.gainXp(20 + b.entry * 5);
    this.newLevel(returnDepth);
  }

  // ============================================== messages / fx
  msg(text: string, color = C.info): void {
    const last = this.msgs[this.msgs.length - 1];
    if (last && last.text === text) {
      last.count++;
    } else {
      this.msgs.push({ text, color, count: 1, fresh: true });
      if (this.msgs.length > 120) this.msgs.shift();
    }
    this.dirty = true;
  }

  pushFx(f: FX): void {
    this.fx.push(f);
  }

  // ============================================== derived stats
  private ringBonus(id: string): number {
    let n = 0;
    for (const r of [this.player.equip.ring1, this.player.equip.ring2]) {
      if (r && r.id === id) n++;
    }
    return n;
  }
  private hasAmulet(id: string): boolean {
    return this.player.equip.amulet?.id === id;
  }
  hasStatus(kind: StatusKind, who: { statuses: Status[] } = this.player): boolean {
    return who.statuses.some((s) => s.kind === kind);
  }
  getStatus(kind: StatusKind, who: { statuses: Status[] } = this.player): Status | undefined {
    return who.statuses.find((s) => s.kind === kind);
  }
  addStatus(who: { statuses: Status[] }, kind: StatusKind, power: number, turns: number): void {
    const ex = who.statuses.find((s) => s.kind === kind);
    if (ex) {
      ex.turns = Math.max(ex.turns, turns);
      ex.power = Math.max(ex.power, power);
    } else {
      who.statuses.push({ kind, turns, power });
    }
    this.dirty = true;
  }
  removeStatus(who: { statuses: Status[] }, kind: StatusKind): void {
    who.statuses = who.statuses.filter((s) => s.kind !== kind);
  }

  maxHpTot(): number {
    let hp = this.player.maxHp + this.ringBonus('vigor') * 12;
    if (this.hasAmulet('graveheart')) hp += 20;
    if (this.player.equip.body?.ego === 'vitality') hp += 15;
    if (this.hasCorr('chainedheart')) hp = Math.round(hp * 1.25);
    if (this.hasCorr('mothlung')) hp = Math.round(hp * 0.9);
    return hp;
  }
  maxMpTot(): number {
    return this.player.maxMp;
  }
  playerAC(): number {
    const b = this.player.equip.body;
    let ac = b ? (ARMORS.find((a) => a.id === b.id)!.ac + b.plus + (b.ego === 'warding' ? 2 : 0)) : 0;
    ac += this.ringBonus('warding') * 3;
    if (this.hasStatus('stone')) ac += 4;
    if (this.hasCorr('barkgraft')) ac += 3;
    return ac;
  }
  playerEV(): number {
    const p = this.player;
    let ev = 8 + Math.floor((p.dex - 10) / 2);
    const b = p.equip.body;
    if (b) ev += ARMORS.find((a) => a.id === b.id)!.evPen + (b.ego === 'shadows' ? 2 : 0);
    ev += this.ringBonus('shadows') * 3;
    if (this.hasStatus('veil')) ev += 4;
    if (this.hasAmulet('graveheart')) ev -= 1;
    if (this.hasCorr('barkgraft')) ev -= 2;
    const here = this.level.tiles[idx(p.x, p.y, this.level.w)];
    if (here === T.Water) ev += this.race.waterborn ? 2 : -2;
    if (this.hasStatus('stun')) ev -= 5;
    return ev;
  }
  playerAcc(): number {
    const p = this.player;
    const w = p.equip.weapon;
    let acc = 3 + Math.floor(p.level * 0.7) + Math.floor((p.dex - 10) / 2);
    if (w) acc += WEAPONS.find((d) => d.id === w.id)!.acc + w.plus;
    return acc;
  }
  playerDmgRoll(): number {
    const p = this.player;
    const w = p.equip.weapon;
    let min = 1, max = 3;
    if (w) {
      const d = WEAPONS.find((x) => x.id === w.id)!;
      min = d.dmg[0]; max = d.dmg[1] + w.plus;
      if (d.range) { min = 1; max = Math.max(2, Math.ceil(max / 2)); } // bows are poor clubs
    } else if (this.cls.id === 'ascetic') {
      max = 4 + Math.floor(p.level * 1.5);
      min = 1 + Math.floor(p.level / 3);
    }
    let dmg = this.rng.int(min, Math.max(min, max)) + Math.floor((p.str - 10) / 2);
    if (this.hasStatus('might')) dmg += 4;
    dmg += this.ringBonus('fury') * 3;
    if (this.hasStatus('weak')) dmg = Math.floor(dmg * 0.7);
    if (w?.ego === 'vorpal') dmg = Math.floor(dmg * 1.25);
    return Math.max(1, dmg);
  }
  playerResists(): DamageType[] {
    const out: DamageType[] = [...(this.race.resist ?? [])];
    const b = this.player.equip.body;
    if (b?.ego === 'embers') out.push('fire');
    return out;
  }
  playerPoisonImmune(): boolean {
    return !!this.race.immunePoison || this.player.equip.body?.ego === 'mire' || this.hasCorr('mothlung');
  }
  spellPower(type?: DamageType): number {
    let m = 1 + Math.max(0, this.player.wil - 10) * 0.04;
    if (this.race.id === 'graveelf') m *= 1.15;
    if (type === 'fire' && this.race.id === 'ashkin') m *= 1.25;
    return m;
  }
  stealthMult(): number {
    let m = this.race.stealth;
    if (this.hasCorr('swallowedkey')) m *= 2;
    if (this.hasStatus('veil')) m *= 0.4;
    if (this.ringBonus('shadows') > 0) m *= 0.6;
    if (this.player.equip.body?.ego === 'shadows') m *= 0.7;
    return m;
  }

  // ============================================== geometry helpers
  tileAt(x: number, y: number): number {
    if (x < 0 || y < 0 || x >= this.level.w || y >= this.level.h) return T.Wall;
    return this.level.tiles[idx(x, y, this.level.w)];
  }
  monsterAt(x: number, y: number): Monster | undefined {
    return this.monsters.find((m) => m.x === x && m.y === y);
  }
  losClear(x0: number, y0: number, x1: number, y1: number): boolean {
    const line = bresenham(x0, y0, x1, y1);
    for (let i = 1; i < line.length - 1; i++) {
      if (!isTransparent(this.tileAt(line[i][0], line[i][1]))) return false;
    }
    return true;
  }
  dist(x0: number, y0: number, x1: number, y1: number): number {
    return Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0));
  }
  visibleMonsters(): Monster[] {
    const w = this.level.w;
    return this.monsters
      .filter((m) => !m.friendly && this.level.visible[idx(m.x, m.y, w)])
      .sort((a, b) =>
        this.dist(this.player.x, this.player.y, a.x, a.y) - this.dist(this.player.x, this.player.y, b.x, b.y));
  }

  updateFOV(): void {
    const L = this.level;
    L.visible.fill(0);
    computeFOV(this.player.x, this.player.y, Math.max(4, this.race.fov - (this.hasCorr('hollowedeye') ? 2 : 0)),
      (x, y) => isTransparent(this.tileAt(x, y)),
      (x, y) => {
        if (x < 0 || y < 0 || x >= L.w || y >= L.h) return;
        const i = idx(x, y, L.w);
        L.visible[i] = 1;
        L.explored[i] = 1;
      });
    // bestiary discovery + boss sighting flavor
    for (const m of this.monsters) {
      if (L.visible[idx(m.x, m.y, L.w)] && !this.bestiary.has(m.def.id)) {
        this.bestiary.add(m.def.id);
        this.dirty = true;
      }
      if (m.def.boss && !this.seenBosses.has(m.def.id) && L.visible[idx(m.x, m.y, L.w)]) {
        this.seenBosses.add(m.def.id);
        this.msg(`${m.def.name}! ${m.def.flavor ?? ''}`, C.bad);
        this.pushFx({ t: 'shake', mag: 6 });
        sfx.play('boss');
        this.chroniclePage();
      }
    }
  }

  // ============================================== player actions
  tryMove(dx: number, dy: number): boolean {
    if (this.over) return false;
    if (this.hasStatus('stun')) {
      this.msg('You are stunned — the world lurches past you!', C.bad);
      this.advanceWorld();
      return true;
    }
    const p = this.player;
    const nx = p.x + dx, ny = p.y + dy;
    const m = this.monsterAt(nx, ny);
    if (m && !m.friendly) {
      this.playerAttack(m);
      this.advanceWorld();
      return true;
    }
    if (m && m.friendly) {
      // swap with ally
      m.x = p.x; m.y = p.y; p.x = nx; p.y = ny;
      this.afterStep();
      this.advanceWorld();
      return true;
    }
    const t = this.tileAt(nx, ny);
    if (t === T.Merchant) {
      if (!this.merchantStock) {
        this.merchantStock = [];
        for (let n = 0; n < 4; n++) {
          const it = genItem(Math.min(MAX_DEPTH, this.effDepth() + 1), this.rng, 1 + (this.race.luck ?? 0), this.foundUniques);
          if (it.kind === 'gold') { n--; continue; }
          this.ident.known.add(`${it.kind}:${it.id}`);
          this.merchantStock.push(it);
        }
        this.msg('The Gravemerchant unfolds from the shadows and spreads a cloth of wares. "Everything here belonged to somebody brave."', C.warn);
      }
      this.shopOpen = true;
      this.dirty = true;
      return true;
    }
    if (t === T.DoorClosed) {
      this.level.tiles[idx(nx, ny, this.level.w)] = T.DoorOpen;
      this.msg('You push open the rotten door.', C.info);
      this.noise(nx, ny, 5);
      this.advanceWorld();
      return true;
    }
    if (!isWalkable(t)) return false;
    p.x = nx; p.y = ny;
    this.afterStep();
    this.advanceWorld();
    return true;
  }

  private afterStep(): void {
    const p = this.player;
    const t = this.tileAt(p.x, p.y);
    if (t === T.Lava) {
      const dmg = this.race.id === 'ashkin' ? this.rng.int(1, 3) : this.rng.int(6, 14);
      this.msg(this.race.id === 'ashkin' ? 'The molten rock greets you like family.' : 'You wade through molten rock! It is a poor decision.', C.bad);
      this.damagePlayer(dmg, 'fire', 'a river of fire');
    }
    if (t === T.Water) {
      this.removeStatus(p, 'burn');
    }
    const here = this.items.filter((i) => i.x === p.x && i.y === p.y);
    if (here.length === 1) this.msg(`You see ${itemName(here[0], this.ident)} here. (g to take)`, C.item);
    else if (here.length > 1) this.msg(`Several things lie here. (g to take)`, C.item);
    if (t === T.StairsDown) this.msg('A stairway descends into deeper dark. (> to descend)', C.warn);
    if (t === T.BranchDown) {
      const b = BRANCH_BY_ID.get(this.level.gates.get(idx(p.x, p.y, this.level.w)) ?? '');
      if (b) this.msg(`A sealed gate: ${b.name}, ${b.sub}. An optional path — its prize is guarded. (> to enter)`, C.warn);
    }
    if (t === T.PortalBack) this.msg('A pale portal home to the great descent. (> to step through)', C.warn);
    if (t === T.Altar) {
      const god = GODS.find((g) => g.id === this.level.altarGod.get(idx(p.x, p.y, this.level.w)));
      if (god) this.msg(`An altar of ${god.name}, ${god.title}. (p to pray)`, C.god);
    }
  }

  wait(): void {
    if (this.over) return;
    this.advanceWorld();
  }

  pickup(): void {
    const p = this.player;
    const here = this.items.filter((i) => i.x === p.x && i.y === p.y);
    if (!here.length) {
      this.msg('There is nothing here to take.', C.info);
      return;
    }
    for (const it of here) {
      this.items.splice(this.items.indexOf(it), 1);
      if (it.kind === 'gold') {
        p.gold += this.hasCorr('ledgerhand') ? Math.round(it.qty * 1.5) : it.qty;
        sfx.play('gold');
        this.msg(`You gather ${it.qty} gold.`, C.item);
        continue;
      }
      it.x = -1; it.y = -1;
      const stack = p.inventory.find((o) => o.kind === it.kind && o.id === it.id && o.plus === it.plus && o.ego === it.ego && (it.kind === 'potion' || it.kind === 'scroll'));
      if (stack) stack.qty += it.qty;
      else p.inventory.push(it);
      const wearable = it.kind === 'weapon' || it.kind === 'armor' || it.kind === 'ring' || it.kind === 'amulet';
      this.msg(`You take ${itemName(it, this.ident)}.${wearable ? ' (i to equip)' : ''}`, C.item);
      if (p.godId === 'moths') this.gainPiety(1);
    }
    this.advanceWorld();
  }

  descend(): void {
    const p = this.player;
    const t = this.tileAt(p.x, p.y);
    const here = idx(p.x, p.y, this.level.w);
    if (t === T.BranchDown) {
      const id = this.level.gates.get(here);
      if (id) {
        this.enterBranch(id);
        return;
      }
    }
    if (t === T.PortalBack) {
      this.exitBranch();
      return;
    }
    if (t !== T.StairsDown) {
      this.msg('There is no way down here.', C.info);
      return;
    }
    const allies = this.monsters.filter((m) => m.friendly);
    if (allies.length) this.msg('Your servants cannot follow. They watch you go.', C.info);
    if (this.branch) {
      this.advanceBranch();
    } else {
      this.newLevel(this.depth + 1);
    }
  }

  pray(): void {
    const p = this.player;
    const i = idx(p.x, p.y, this.level.w);
    if (this.tileAt(p.x, p.y) !== T.Altar && this.tileAt(p.x, p.y) !== T.WarpAltar) {
      this.msg(p.godId ? 'You whisper a prayer. The depths do not answer.' : 'You need an altar to pledge yourself.', C.god);
      return;
    }
    if (this.tileAt(p.x, p.y) === T.WarpAltar) {
      const pool = CORRUPTIONS.filter((c) => !p.corruptions.includes(c.id));
      if (!pool.length) {
        this.msg('The altar regards you, finds no unedited page, and loses interest.', C.god);
        return;
      }
      const picks = this.rng.shuffle(pool).slice(0, 2).map((c) => c.id);
      this.corruptionOffer = picks;
      this.msg('The altar bears no god\u2019s mark. It hums like held breath, and offers.', C.god);
      this.dirty = true;
      return;
    }
    const god = GODS.find((g) => g.id === this.level.altarGod.get(i));
    if (!god) return;
    if (this.player.godId === god.id) {
      if (p.gold >= 20) {
        const spend = Math.min(100, Math.floor(p.gold / 20) * 20);
        p.gold -= spend;
        sfx.play('god');
        this.gainPiety(Math.floor(spend / 4), `You feed ${spend} gold to the dark. ${god.name} accepts the tribute.`);
      } else {
        this.msg(`${god.name} acknowledges your devotion. (Bring 20+ gold to offer tribute.)`, C.god);
      }
      return;
    }
    if (this.player.godId) {
      const old = GODS.find((x) => x.id === this.player.godId)!;
      this.msg(`You forsake ${old.name} at a rival's altar. The dark goes very quiet.`, C.god);
      this.addStatus(p, 'weak', 2, 80);
      this.addStatus(p, 'hex', 2, 80);
      this.damagePlayer(Math.floor(this.maxHpTot() * 0.15), 'necro', `${old.name}'s wrath`);
      this.msg(`${old.name}'s wrath settles on you like ash. It will pass — slowly.`, C.bad);
      if (this.over) return;
      p.godId = god.id;
      p.piety = 10;
      sfx.play('god');
      this.msg(`${god.name} accepts the apostate. Cautiously.`, C.god);
      this.dirty = true;
      return;
    }
    p.godId = god.id;
    p.piety = 15;
    sfx.play('god');
    this.msg(`You kneel. You pledge yourself to ${god.name}, ${god.title}.`, C.god);
    this.msg(`${god.likes}`, C.god);
    this.chroniclePage();
    this.pushFx({ t: 'flash', color: god.color });
    this.dirty = true;
  }

  gainPiety(n: number, note?: string): void {
    if (!this.player.godId) return;
    const before = this.player.piety;
    if (this.hasCorr('ledgerhand')) n = Math.max(1, Math.floor(n / 2));
    this.player.piety = Math.min(200, this.player.piety + n);
    if (note) this.msg(note, C.god);
    const god = GODS.find((g) => g.id === this.player.godId)!;
    for (const pw of god.powers) {
      if (before < pw.unlock && this.player.piety >= pw.unlock) {
        this.msg(`${god.name} grants you: ${pw.name}!`, C.god);
      }
    }
    this.dirty = true;
  }

  // ============================================== combat
  mn(m: Monster, cap = false): string {
    if (m.def.name.startsWith('The ')) return m.def.name;
    return (cap ? 'The ' : 'the ') + m.def.name;
  }
  srcName(m: Monster): string {
    if (m.def.boss) return m.def.name;
    const art = /^[aeiou]/i.test(m.def.name) ? 'an' : 'a';
    return `${art} ${m.def.name}`;
  }

  playerAttack(m: Monster, mult = 1, silent = false): void {
    const p = this.player;
    const sleeping = !m.awake;
    m.awake = true;
    const acc = this.playerAcc();
    const ev = sleeping ? -5 : m.def.ev;
    const hitChance = Math.min(0.97, Math.max(0.15, 0.72 + (acc - ev) * 0.045));
    this.noise(p.x, p.y, 6);
    if (!this.rng.chance(hitChance)) {
      if (!silent) this.msg(`You miss ${this.mn(m)}.`, C.info);
      this.pushFx({ t: 'float', x: m.x, y: m.y, text: 'miss', color: '#777' });
      sfx.play('miss');
      return;
    }
    sfx.play('hit');
    let dmg = this.playerDmgRoll();
    if (sleeping) {
      dmg = Math.floor(dmg * 2.5);
      this.msg(`You strike the sleeping ${m.def.name} — a brutal blow!`, C.good);
    }
    dmg = Math.floor(dmg * mult);
    const w = p.equip.weapon;
    // weapon egos
    let egoNote = '';
    if (w?.ego === 'flaming') { this.damageMonster(m, Math.floor(this.rng.int(2, 5)), 'fire', true); egoNote = ' Flames lick the wound.'; }
    if (w?.ego === 'frost') {
      this.damageMonster(m, Math.floor(this.rng.int(2, 5)), 'cold', true);
      if (this.rng.chance(0.3)) this.addStatus(m, 'slow', 1, 4);
    }
    if (w?.ego === 'venom' && !m.def.resist?.includes('poison') && this.rng.chance(0.5)) this.addStatus(m, 'poison', 2, 5);
    if (this.hasCorr('venomglands') && !m.def.resist?.includes('poison') && this.rng.chance(0.35)) this.addStatus(m, 'poison', 2, 5);
    if (w?.ego === 'draining' && m.hp > 0) {
      const heal = Math.max(1, Math.floor(dmg / 3));
      this.healPlayer(heal);
      egoNote = ' You drink its vigor.';
    }
    if (this.hasAmulet('leech')) this.healPlayer(Math.max(1, Math.floor(dmg / 4)));
    if (!silent && !sleeping) this.msg(`You hit ${this.mn(m)} for ${dmg}.${egoNote}`, C.bold);
    this.damageMonster(m, dmg, 'phys');
  }

  damageMonster(m: Monster, amount: number, type: DamageType, quiet = false): void {
    if (m.hp <= 0) return;
    let dmg = amount;
    if (m.def.resist?.includes(type)) dmg = Math.floor(dmg * 0.5);
    if (m.def.vuln?.includes(type)) dmg = Math.floor(dmg * 1.5);
    if (type === 'phys') dmg = Math.max(0, dmg - this.rng.int(0, m.def.ac));
    if (dmg <= 0) {
      if (!quiet) this.pushFx({ t: 'float', x: m.x, y: m.y, text: '0', color: '#777' });
      return;
    }
    m.hp -= dmg;
    m.awake = true;
    const col = type === 'fire' ? '#ff9a4a' : type === 'poison' ? '#6fbf4a' : type === 'necro' ? '#b08ae8' : type === 'cold' ? '#7ad0f0' : '#e06a6a';
    this.pushFx({ t: 'float', x: m.x, y: m.y, text: String(dmg), color: col });
    this.pushFx({ t: 'burst', x: m.x, y: m.y, color: col, n: Math.min(10, 3 + dmg) });
    this.level.decals.set(idx(m.x, m.y, this.level.w), 'rgba(120,15,25,0.35)');
    if (m.hp <= 0) this.killMonster(m, type);
  }

  killMonster(m: Monster, type: DamageType): void {
    const p = this.player;
    this.monsters.splice(this.monsters.indexOf(m), 1);
    this.pushFx({ t: 'burst', x: m.x, y: m.y, color: m.def.color, n: 14 });
    sfx.play('kill');
    if (m.friendly) {
      this.msg(`Your ${m.def.name} is destroyed.`, C.info);
      return;
    }
    this.msg(`${this.mn(m, true)} dies.`, C.good);
    p.kills++;
    this.bestiaryKills[m.def.id] = (this.bestiaryKills[m.def.id] ?? 0) + 1;
    // piety
    const inWater = this.tileAt(p.x, p.y) === T.Water;
    switch (p.godId) {
      case 'silentking': this.gainPiety(2); break;
      case 'rottingchoir': if (this.hasStatus('poison', m) || type === 'poison') this.gainPiety(3); break;
      case 'blacksun': if (type === 'fire') this.gainPiety(3); break;
      case 'drowned': if (inWater) this.gainPiety(3); break;
      default: if (p.godId) this.gainPiety(1);
    }
    // xp
    this.gainXp(m.def.xp);
    // drops
    if (m.def.boss) {
      this.pushFx({ t: 'shake', mag: 8 });
      this.msg(`${m.def.name} is destroyed! The dungeon itself exhales.`, C.warn);
      for (let n = 0; n < 3; n++) {
        const it = genItem(Math.min(MAX_DEPTH, this.effDepth() + 2), this.rng, 2 + (this.race.luck ?? 0), this.foundUniques);
        it.x = m.x; it.y = m.y;
        this.items.push(it);
      }
      const branchLoot: Record<string, () => Item[]> = {
        charnelbride: () => [mkItem('armor', 'boneaegis', { plus: this.rng.int(0, 2), ego: 'vitality' })],
        mothersilk: () => [mkItem('ring', 'shadows'), mkItem('amulet', 'clarity')],
        gaoler: () => [mkItem('weapon', 'sunderblade', { plus: this.rng.int(2, 4), ego: 'vorpal' }), mkItem('scroll', 'encharmor', { qty: 2 })],
        vestal: () => [mkItem('weapon', 'spear', { plus: this.rng.int(1, 3), ego: 'flaming' }), mkItem('potion', 'regen', { qty: 2 })],
        taproot: () => [mkItem('armor', 'ringmail', { plus: this.rng.int(1, 2), ego: 'mire' }), mkItem('potion', 'might', { qty: 2 })],
        reflection: () => [mkItem('amulet', 'whispers'), mkItem('ring', 'warding'), mkItem('scroll', 'enchweapon', { qty: 2 })],
      };
      const loot = branchLoot[m.def.id];
      if (loot) {
        for (const it of loot()) {
          it.x = m.x; it.y = m.y;
          this.items.push(it);
        }
        this.msg('Its hoard is yours. The way home stands open.', C.warn);
      }
      if (m.def.id === 'sovereign') {
        this.over = 'win';
        sfx.play('win');
        Game.clearSave();
        this.syncMeta('win');
        this.recordHall();
        this.msg('The Unlight gutters... and dies. Dawn, impossibly, reaches even here.', C.warn);
        return;
      }
    } else if (this.rng.chance(0.22 + (this.race.luck ?? 0) * 0.04)) {
      const it = genItem(this.effDepth(), this.rng, this.race.luck ?? 0, this.foundUniques);
      it.x = m.x; it.y = m.y;
      this.items.push(it);
    }
  }

  gainXp(n: number): void {
    const p = this.player;
    p.xp += n;
    let need = this.xpNeed();
    while (p.xp >= need && p.level < 27) {
      p.xp -= need;
      p.level++;
      const hpGain = Math.round(this.cls.hpPer * this.race.hpMult);
      const mpGain = Math.round(this.cls.mpPer * this.race.mpMult);
      p.maxHp += hpGain;
      p.maxMp += mpGain;
      p.hp = Math.min(this.maxHpTot(), p.hp + hpGain);
      p.mp = Math.min(this.maxMpTot(), p.mp + mpGain);
      const stat = this.rng.chance(0.66) ? this.rng.pick(this.cls.statFav) : this.rng.pick(['str', 'dex', 'wil'] as const);
      p[stat]++;
      sfx.play('levelup');
      this.msg(`Welcome to level ${p.level}! (+${hpGain} HP, +${stat.toUpperCase()})`, C.warn);
      for (const ab of this.cls.abilities) {
        if (ab.unlock === p.level) this.msg(`Ability learned: ${ab.name} — ${ab.desc}`, C.warn);
      }
      this.pushFx({ t: 'flash', color: '#c9a24b' });
      need = this.xpNeed();
    }
    this.dirty = true;
  }

  xpNeed(): number {
    const l = this.player.level;
    return l * l * 10 + l * 10;
  }

  monsterAttackPlayer(m: Monster): void {
    const p = this.player;
    const acc = m.def.acc + Math.floor(m.dmgBonus / 2);
    const hitChance = Math.min(0.95, Math.max(0.1, 0.7 + (acc - this.playerEV()) * 0.045));
    if (!this.rng.chance(hitChance)) {
      this.msg(`${this.mn(m, true)} misses you.`, C.info);
      return;
    }
    if (this.race.blinkOnHit && this.rng.chance(this.race.blinkOnHit)) {
      this.blinkPlayer(4);
      this.msg('You flicker away like a moth from flame!', C.god);
      return;
    }
    let dmg = this.rng.int(m.def.dmg[0], m.def.dmg[1]) + m.dmgBonus;
    if (this.hasStatus('weak', m)) dmg = Math.floor(dmg * 0.7);
    dmg = Math.max(0, dmg - this.rng.int(0, this.playerAC()));
    if (dmg <= 0) {
      this.msg(`${this.mn(m, true)} hits you, but your armor holds.`, C.info);
      return;
    }
    this.msg(`${this.mn(m, true)} hits you for ${dmg}!`, C.dmg);
    if (m.def.drain) {
      m.hp = Math.min(m.maxHp, m.hp + Math.floor(dmg / 2));
      this.msg('You feel your life being siphoned away.', C.bad);
    }
    if (m.def.onHit && this.rng.chance(m.def.onHit.chance)) {
      const oh = m.def.onHit;
      if (oh.kind === 'poison' && this.playerPoisonImmune()) {
        // immune
      } else if ((oh.kind === 'slow' || oh.kind === 'stun') && this.hasAmulet('clarity')) {
        this.msg('Your amulet of clarity keeps your mind your own.', C.good);
        this.ident.known.add('amulet:clarity');
      } else {
        this.addStatus(p, oh.kind, oh.power, oh.turns);
        const afflict: Partial<Record<StatusKind, string>> = {
          poison: 'Venom courses through you!', burn: 'You are set alight!',
          slow: 'Cold seeps into your limbs — you are slowed!', stun: 'The blow leaves you reeling!',
          weak: 'Your strength drains away!',
        };
        this.msg(afflict[oh.kind] ?? `You are afflicted: ${oh.kind}!`, C.bad);
      }
    }
    if (this.hasStatus('cinder')) {
      this.damageMonster(m, this.rng.int(3, 7), 'fire');
      this.msg(`Your cinder shield sears ${this.mn(m)}.`, C.god);
    }
    if (p.godId === 'warden') this.gainPiety(1);
    this.damagePlayer(dmg, 'phys', this.srcName(m), true);
  }

  damagePlayer(amount: number, type: DamageType, source: string, preReduced = false): void {
    const p = this.player;
    let dmg = amount;
    if (type === 'poison' && this.playerPoisonImmune()) return;
    if (this.playerResists().includes(type)) dmg = Math.floor(dmg * 0.5);
    if (type === 'fire' && this.hasCorr('barkgraft')) dmg = Math.ceil(dmg * 1.25);
    if (!preReduced && type === 'phys') dmg = Math.max(0, dmg - this.rng.int(0, this.playerAC()));
    const shield = this.getStatus('shield');
    if (shield && dmg > 0) {
      const absorbed = Math.min(shield.power, dmg);
      shield.power -= absorbed;
      dmg -= absorbed;
      if (shield.power <= 0) {
        this.removeStatus(p, 'shield');
        this.msg('Your ward shatters!', C.warn);
      }
    }
    if (dmg <= 0) return;
    p.hp -= dmg;
    sfx.play('hurt');
    this.pushFx({ t: 'float', x: p.x, y: p.y, text: String(dmg), color: '#ff5060' });
    this.pushFx({ t: 'shake', mag: Math.min(7, 1 + dmg * 0.3) });
    this.pushFx({ t: 'burst', x: p.x, y: p.y, color: '#c22e40', n: Math.min(9, 2 + dmg) });
    this.level.decals.set(idx(p.x, p.y, this.level.w), 'rgba(120,15,25,0.35)');
    if (p.hp <= 0) {
      if (p.godId === 'silentking' && p.piety >= 80 && !p.reprieveUsed) {
        p.reprieveUsed = true;
        p.hp = Math.floor(this.maxHpTot() / 2);
        p.piety = Math.max(0, p.piety - 40);
        this.msg('The Silent King refuses your death. "NOT YET," says the dark.', C.god);
        this.pushFx({ t: 'flash', color: '#a8a4c0' });
        return;
      }
      this.over = 'dead';
      this.deathCause = source;
      sfx.play('death');
      Game.clearSave();
      this.syncMeta('death');
      this.recordHall();
      this.msg(`You are slain by ${source}...`, C.bad);
      this.pushFx({ t: 'flash', color: '#9b1c2e' });
    }
    this.dirty = true;
  }

  healPlayer(n: number): void {
    this.player.hp = Math.min(this.maxHpTot(), this.player.hp + n);
    this.dirty = true;
  }

  blinkPlayer(range: number): void {
    const spots: [number, number][] = [];
    for (let dy = -range; dy <= range; dy++)
      for (let dx = -range; dx <= range; dx++) {
        const nx = this.player.x + dx, ny = this.player.y + dy;
        const t = this.tileAt(nx, ny);
        if (isWalkable(t) && t !== T.Lava && !this.monsterAt(nx, ny)) spots.push([nx, ny]);
      }
    if (!spots.length) return;
    const [nx, ny] = this.rng.pick(spots);
    this.pushFx({ t: 'burst', x: this.player.x, y: this.player.y, color: '#8a6cf0', n: 8 });
    this.player.x = nx; this.player.y = ny;
    this.pushFx({ t: 'burst', x: nx, y: ny, color: '#8a6cf0', n: 8 });
    this.updateFOV();
  }

  noise(x: number, y: number, r: number): void {
    for (const m of this.monsters) {
      if (!m.awake && this.dist(x, y, m.x, m.y) <= r && this.rng.chance(0.5)) m.awake = true;
    }
  }

  fireRanged(target: Monster): boolean {
    const p = this.player;
    const w = p.equip.weapon;
    const def = w ? WEAPONS.find((x) => x.id === w.id) : null;
    if (!w || !def?.range) {
      this.msg('You have nothing to shoot with.', C.info);
      return false;
    }
    const d = this.dist(p.x, p.y, target.x, target.y);
    if (d > def.range) { this.msg('Out of range.', C.info); return false; }
    if (!this.losClear(p.x, p.y, target.x, target.y)) { this.msg('No clear line.', C.info); return false; }
    const sleeping = !target.awake;
    target.awake = true;
    const acc = 3 + Math.floor(p.level * 0.7) + Math.floor((p.dex - 10) / 2) + def.acc + w.plus;
    const ev = sleeping ? -5 : target.def.ev + (d >= 5 ? 2 : 0); // long shots are harder
    this.pushFx({ t: 'beam', x0: p.x, y0: p.y, x1: target.x, y1: target.y, color: '#d8cfba' });
    this.noise(p.x, p.y, 5);
    if (!this.rng.chance(Math.min(0.95, Math.max(0.15, 0.72 + (acc - ev) * 0.045)))) {
      this.msg(`Your shot misses ${this.mn(target)}.`, C.info);
      sfx.play('miss');
      this.advanceWorld();
      return true;
    }
    sfx.play('hit');
    let dmg = this.rng.int(def.dmg[0], def.dmg[1] + w.plus) + Math.floor((p.dex - 10) / 2);
    if (this.hasStatus('might')) dmg += 2;
    if (sleeping) dmg = Math.floor(dmg * 2.5);
    if (w.ego === 'flaming') this.damageMonster(target, this.rng.int(2, 5), 'fire', true);
    if (w.ego === 'frost') {
      this.damageMonster(target, this.rng.int(2, 5), 'cold', true);
      if (this.rng.chance(0.3)) this.addStatus(target, 'slow', 1, 4);
    }
    if (w.ego === 'venom' && !target.def.resist?.includes('poison') && this.rng.chance(0.5)) this.addStatus(target, 'poison', 2, 5);
    this.msg(`Your shot strikes ${this.mn(target)} for ${dmg}.`, C.bold);
    this.damageMonster(target, Math.max(1, dmg), 'phys');
    this.advanceWorld();
    return true;
  }

  score(): number {
    const p = this.player;
    return this.depth * 100 + p.level * 50 + p.kills * 10 + p.gold +
      this.branchesDone.length * 300 + (this.over === 'win' ? 5000 : 0);
  }

  static loadHall(): { name: string; title: string; outcome: string; depth: number; level: number; score: number; date: string; cause: string }[] {
    try { return JSON.parse(localStorage.getItem('gloomdelve-hall') ?? '[]'); } catch { return []; }
  }

  recordHall(): void {
    try {
      const hall = Game.loadHall();
      hall.push({
        name: this.player.charName || 'the Delver', title: this.player.name,
        outcome: this.over === 'win' ? 'ASCENDED' : `slain by ${this.deathCause}`,
        depth: this.depth, level: this.player.level, score: this.score(),
        date: new Date().toISOString().slice(0, 10), cause: this.deathCause,
      });
      hall.sort((a, b) => b.score - a.score);
      localStorage.setItem('gloomdelve-hall', JSON.stringify(hall.slice(0, 50)));
    } catch { /* ignore */ }
  }

  priceOf(it: Item): number {
    const base = it.kind === 'potion' || it.kind === 'scroll' ? 18 : it.kind === 'ring' || it.kind === 'amulet' ? 55 : 30;
    return base + this.effDepth() * 6 + it.plus * 15 + (it.ego ? 45 : 0) + (it.unique ? 120 : 0);
  }

  buyItem(i: number): void {
    const stock = this.merchantStock;
    if (!stock || !stock[i]) return;
    const it = stock[i];
    const price = this.priceOf(it);
    if (this.player.gold < price) {
      this.msg('"Not enough. The dead paid more, and they argued less."', C.warn);
      return;
    }
    this.player.gold -= price;
    stock.splice(i, 1);
    it.x = -1; it.y = -1;
    this.player.inventory.push(it);
    sfx.play('gold');
    this.msg(`Bought: ${itemName(it, this.ident)} for ${price} gold.`, C.item);
    this.dirty = true;
  }

  // ============================================== items
  useItem(it: Item): boolean {
    // returns true if a turn passed
    switch (it.kind) {
      case 'potion': return this.quaff(it);
      case 'scroll': return this.read(it);
      case 'weapon': case 'armor': case 'ring': case 'amulet': return this.equipItem(it);
      default: return false;
    }
  }

  private consume(it: Item): void {
    it.qty--;
    if (it.qty <= 0) {
      const i = this.player.inventory.indexOf(it);
      if (i >= 0) this.player.inventory.splice(i, 1);
    }
  }

  private identify(it: Item): void {
    const key = `${it.kind}:${it.id}`;
    if (!this.ident.known.has(key)) {
      this.ident.known.add(key);
      this.msg(`It was ${itemName(it, this.ident)}.`, C.item);
    }
  }

  quaff(it: Item): boolean {
    const p = this.player;
    sfx.play('quaff');
    this.msg(`You drink ${itemName(it, this.ident)}.`, C.item);
    switch (it.id) {
      case 'heal': {
        let n = 15 + p.level * 2;
        if (this.hasCorr('secondstomach')) n = Math.round(n * 1.5);
        this.healPlayer(n);
        const ps = this.getStatus('poison');
        if (ps) this.removeStatus(p, 'poison');
        this.msg('Your wounds knit closed.', C.good);
        break;
      }
      case 'mana':
        p.mp = Math.min(this.maxMpTot(), p.mp + Math.round((15 + p.level) * (this.hasCorr('secondstomach') ? 1.5 : 1)));
        this.msg('Power floods back into you.', C.good);
        break;
      case 'might':
        this.addStatus(p, 'might', 4, 25);
        this.msg('Fury! Your muscles sing with violence.', C.good);
        break;
      case 'swiftness':
        this.addStatus(p, 'haste', 1, 18);
        this.msg('The world thickens to honey around you.', C.good);
        break;
      case 'stoneskin':
        this.addStatus(p, 'stone', 4, 25);
        this.msg('Your skin grays into living granite.', C.good);
        break;
      case 'cleansing':
        this.removeStatus(p, 'poison');
        this.removeStatus(p, 'burn');
        this.removeStatus(p, 'weak');
        this.removeStatus(p, 'slow');
        this.removeStatus(p, 'hex');
        this.msg('You are scoured clean of afflictions.', C.good);
        break;
      case 'regen':
        this.addStatus(p, 'regen', 2, 25);
        this.msg('Troll blood. Your flesh crawls — in a helpful way.', C.good);
        break;
      case 'ichor':
        this.damagePlayer(this.rng.int(4, 8), 'necro', 'a vile draught');
        this.addStatus(p, 'weak', 2, 12);
        this.msg('Grave-cold ichor. You immediately regret this.', C.bad);
        break;
    }
    this.identify(it);
    this.consume(it);
    this.advanceWorld();
    return true;
  }

  read(it: Item): boolean {
    const p = this.player;
    sfx.play('scroll');
    if (this.hasCorr('secondstomach') && this.rng.chance(0.2)) {
      this.msg(`The scroll comes apart in your ink-stained hands, unread.`, C.warn);
      this.consume(it);
      this.advanceWorld();
      return true;
    }
    this.msg(`You read ${itemName(it, this.ident)}.`, C.item);
    switch (it.id) {
      case 'teleport': {
        const spots: number[] = [];
        for (let i = 0; i < this.level.w * this.level.h; i++) {
          if (this.level.tiles[i] === T.Floor && !this.monsterAt(i % this.level.w, Math.floor(i / this.level.w))) spots.push(i);
        }
        const i = this.rng.pick(spots);
        this.pushFx({ t: 'burst', x: p.x, y: p.y, color: '#8a6cf0', n: 12 });
        p.x = i % this.level.w; p.y = Math.floor(i / this.level.w);
        this.msg('The world folds. You are elsewhere.', C.god);
        this.updateFOV();
        break;
      }
      case 'blink':
        this.blinkPlayer(5);
        this.msg('You step through the dark between places.', C.god);
        break;
      case 'mapping':
        this.level.explored.fill(1);
        this.msg('The floor’s bones ink themselves across your mind.', C.good);
        break;
      case 'enchweapon':
        if (p.equip.weapon) {
          p.equip.weapon.plus++;
          this.msg(`Your ${itemName(p.equip.weapon, this.ident)} gleams hungrily.`, C.good);
        } else this.msg('Your fists tingle briefly. Nothing else happens.', C.info);
        break;
      case 'encharmor':
        if (p.equip.body) {
          p.equip.body.plus++;
          this.msg(`Your ${itemName(p.equip.body, this.ident)} hardens.`, C.good);
        } else this.msg('Your skin itches. Nothing else happens.', C.info);
        break;
      case 'identify': {
        for (const o of p.inventory) this.ident.known.add(`${o.kind}:${o.id}`);
        for (const s of Object.values(p.equip)) if (s) this.ident.known.add(`${s.kind}:${s.id}`);
        this.msg('Every unnamed thing you carry whispers its true name.', C.good);
        break;
      }
      case 'fear':
        for (const m of this.visibleMonsters()) {
          if (!m.def.boss) this.addStatus(m, 'fear', 1, 9);
        }
        this.msg('A word that should not exist rings out. The dark recoils!', C.warn);
        break;
      case 'immolation':
        this.msg('The page ignites in your hands!', C.warn);
        for (const m of this.monsters.slice()) {
          if (this.dist(p.x, p.y, m.x, m.y) <= 2 && !m.friendly) {
            this.damageMonster(m, this.rng.int(8, 18), 'fire');
          }
        }
        this.pushFx({ t: 'burst', x: p.x, y: p.y, color: '#ff6a2a', n: 24 });
        this.pushFx({ t: 'shake', mag: 5 });
        if (!this.playerResists().includes('fire')) this.addStatus(p, 'burn', 2, 3);
        break;
    }
    this.identify(it);
    this.consume(it);
    this.advanceWorld();
    return true;
  }

  equipItem(it: Item): boolean {
    const p = this.player;
    const inv = p.inventory;
    const put = (slot: keyof typeof p.equip, item: Item) => {
      const prev = p.equip[slot];
      if (prev) inv.push(prev);
      const i = inv.indexOf(item);
      if (i >= 0) inv.splice(i, 1);
      p.equip[slot] = item;
      this.ident.known.add(`${item.kind}:${item.id}`);
      sfx.play('equip');
      this.msg(`You ${item.kind === 'weapon' ? 'wield' : 'wear'} ${itemName(item, this.ident)}.`, C.item);
    };
    if (it.kind === 'weapon') put('weapon', it);
    else if (it.kind === 'armor') put('body', it);
    else if (it.kind === 'amulet') put('amulet', it);
    else if (it.kind === 'ring') {
      if (!p.equip.ring1) put('ring1', it);
      else if (!p.equip.ring2) put('ring2', it);
      else put('ring1', it);
    } else return false;
    p.hp = Math.min(p.hp, this.maxHpTot());
    this.advanceWorld();
    return true;
  }

  unequip(slot: keyof Player['equip']): boolean {
    const p = this.player;
    const it = p.equip[slot];
    if (!it) return false;
    p.equip[slot] = null;
    p.inventory.push(it);
    p.hp = Math.min(p.hp, this.maxHpTot());
    this.msg(`You remove ${itemName(it, this.ident)}.`, C.item);
    this.advanceWorld();
    return true;
  }

  dropItem(it: Item): void {
    const p = this.player;
    const one = { ...it, qty: 1, x: p.x, y: p.y };
    this.consume(it);
    this.items.push(one);
    this.msg(`You drop ${itemName(one, this.ident)}.`, C.item);
    this.advanceWorld();
  }

  // ============================================== abilities
  abilitySlots(): { ab: AbilityDef; source: 'class' | 'god'; usable: boolean; costLabel: string }[] {
    const p = this.player;
    const out: { ab: AbilityDef; source: 'class' | 'god'; usable: boolean; costLabel: string }[] = [];
    for (const ab of this.cls.abilities) {
      out.push({
        ab, source: 'class',
        usable: p.level >= ab.unlock && p.mp >= ab.cost,
        costLabel: `${ab.cost} mp`,
      });
    }
    if (p.godId) {
      const god = GODS.find((g) => g.id === p.godId)!;
      for (const pw of god.powers) {
        const passive = pw.id === 'reprieve';
        out.push({
          ab: pw, source: 'god',
          usable: !passive && p.piety >= pw.unlock && p.piety >= pw.cost,
          costLabel: passive ? 'passive' : `${pw.cost} piety`,
        });
      }
    }
    return out;
  }

  needsTarget(ab: AbilityDef): boolean {
    return ab.target === 'enemy';
  }

  useAbility(ab: AbilityDef, source: 'class' | 'god', target?: Monster): boolean {
    const p = this.player;
    if (this.hasStatus('stun')) {
      this.msg('You are too stunned to act!', C.bad);
      this.advanceWorld();
      return false;
    }
    if (ab.id === 'reprieve') {
      this.msg('Death’s Reprieve is a passive gift: the King will act when you fall.', C.god);
      return false;
    }
    if (source === 'class' && p.level < ab.unlock) { this.msg('You have not learned that yet.', C.info); return false; }
    if (source === 'god' && p.piety < ab.unlock) { this.msg('Your god does not yet trust you with that.', C.god); return false; }
    if (source === 'class' && p.mp < ab.cost) { this.msg('Not enough mana.', C.info); return false; }
    if (source === 'god' && p.piety < ab.cost) { this.msg('Not enough piety.', C.god); return false; }
    if (this.needsTarget(ab)) {
      if (!target) { this.msg('No target.', C.info); return false; }
      if (this.dist(p.x, p.y, target.x, target.y) > ab.range) { this.msg('Out of range.', C.info); return false; }
      if (ab.range > 1 && !this.losClear(p.x, p.y, target.x, target.y)) { this.msg('No clear line.', C.info); return false; }
    }
    const sp = this.spellPower();
    const spF = this.spellPower('fire');
    const beam = (m: Monster, color: string) =>
      this.pushFx({ t: 'beam', x0: p.x, y0: p.y, x1: m.x, y1: m.y, color });
    let acted = true;
    switch (ab.id) {
      case 'shieldslam':
        this.msg('You slam your weight into the blow!', C.bold);
        this.addStatus(target!, 'stun', 1, 3);
        this.playerAttack(target!, 1.3);
        break;
      case 'bulwark':
        this.addStatus(p, 'shield', 12 + p.level * 2, 25);
        this.msg('You raise a ward of grave-iron will.', C.good);
        break;
      case 'roar':
        this.msg('You loose a roar of tomb-cold authority!', C.warn);
        for (const m of this.visibleMonsters()) if (!m.def.boss && this.dist(p.x, p.y, m.x, m.y) <= 6) this.addStatus(m, 'fear', 1, 8);
        this.noise(p.x, p.y, 12);
        break;
      case 'emberbolt':
        beam(target!, '#ff9a4a');
        this.msg('A dart of flame leaps from your fingers.', C.bold);
        this.damageMonster(target!, Math.round(this.rng.int(4 + p.level, 8 + p.level * 2) * spF), 'fire');
        break;
      case 'ashnova':
        this.msg('Fire detonates outward from your body!', C.warn);
        this.pushFx({ t: 'burst', x: p.x, y: p.y, color: '#ff6a2a', n: 26 });
        this.pushFx({ t: 'shake', mag: 4 });
        for (const m of this.monsters.slice()) {
          if (!m.friendly && this.dist(p.x, p.y, m.x, m.y) <= 2) {
            this.damageMonster(m, Math.round(this.rng.int(6 + p.level, 12 + p.level * 2) * spF), 'fire');
          }
        }
        break;
      case 'immolate':
        beam(target!, '#ff5a1f');
        this.damageMonster(target!, Math.round(this.rng.int(3, 7) * spF), 'fire');
        if (this.monsters.includes(target!)) {
          this.addStatus(target!, 'burn', Math.round(4 * spF), 6);
          this.msg(`${this.mn(target!, true)} is wreathed in clinging flame!`, C.warn);
        }
        break;
      case 'shadowstep': {
        const spots = neighbors(target!.x, target!.y).filter(([nx, ny]) => {
          const t = this.tileAt(nx, ny);
          return isWalkable(t) && t !== T.Lava && !this.monsterAt(nx, ny);
        });
        if (!spots.length) { this.msg('No shadow to step into.', C.info); return false; }
        this.pushFx({ t: 'burst', x: p.x, y: p.y, color: '#6a5a8a', n: 8 });
        const [nx, ny] = spots.sort((a, b) => this.dist(p.x, p.y, a[0], a[1]) - this.dist(p.x, p.y, b[0], b[1]))[spots.length - 1];
        p.x = nx; p.y = ny;
        this.msg('You step through darkness.', C.god);
        this.updateFOV();
        break;
      }
      case 'veil':
        this.addStatus(p, 'veil', 4, 18);
        this.msg('Shadow wraps you like a second skin.', C.good);
        break;
      case 'garrote':
        this.msg('You strike for the throat!', C.bold);
        this.playerAttack(target!, 2);
        break;
      case 'venomlash':
        beam(target!, '#6fbf4a');
        this.damageMonster(target!, Math.round(this.rng.int(2 + p.level, 5 + p.level) * sp), 'poison');
        if (this.monsters.includes(target!) && !target!.def.resist?.includes('poison')) {
          this.addStatus(target!, 'poison', Math.round(3 * sp), 6);
        }
        break;
      case 'miasma':
        this.msg('You exhale a cloud of festering rot.', C.warn);
        this.pushFx({ t: 'burst', x: p.x, y: p.y, color: '#6fbf4a', n: 22 });
        for (const m of this.monsters.slice()) {
          if (!m.friendly && this.dist(p.x, p.y, m.x, m.y) <= 3) {
            this.damageMonster(m, Math.round(this.rng.int(2, 5) * sp), 'poison');
            if (this.monsters.includes(m) && !m.def.resist?.includes('poison')) this.addStatus(m, 'poison', Math.round(3 * sp), 8);
          }
        }
        break;
      case 'transfusion': {
        beam(target!, '#c05a6a');
        const dmg = Math.round(this.rng.int(4 + p.level, 8 + p.level) * sp);
        this.damageMonster(target!, dmg, 'necro');
        this.healPlayer(Math.floor(dmg / 2));
        this.msg('You rip the life from it and stitch it into yourself.', C.good);
        break;
      }
      case 'hex':
        beam(target!, '#b08ae8');
        this.addStatus(target!, 'weak', 2, 12);
        this.addStatus(target!, 'hex', 2, 12);
        this.msg(`${this.mn(target!, true)} withers under your curse.`, C.god);
        break;
      case 'soulcleave':
        this.msg('Your blade drags a black arc through every neighbor!', C.bold);
        for (const m of this.monsters.slice()) {
          if (!m.friendly && this.dist(p.x, p.y, m.x, m.y) <= 1) {
            this.damageMonster(m, Math.round(this.playerDmgRoll() * 0.8) + Math.round(this.rng.int(2, 6) * sp), 'necro');
          }
        }
        break;
      case 'darkpact':
        if (p.hp <= 9) { this.msg('Too little blood left to bargain with.', C.info); return false; }
        p.hp -= 8;
        p.mp = Math.min(this.maxMpTot(), p.mp + 14);
        this.addStatus(p, 'might', 4, 12);
        this.msg('You pay in blood. The debt converts to power.', C.god);
        break;
      case 'bonedart':
        beam(target!, '#e8e0c8');
        this.damageMonster(target!, Math.round(this.rng.int(3 + p.level, 7 + p.level) * sp), 'necro');
        break;
      case 'raiseservant': {
        if (this.monsters.filter((m) => m.friendly && m.def.id === 'skelservant').length >= 2) {
          this.msg('You cannot bind more servants.', C.info);
          return false;
        }
        const spots = neighbors(p.x, p.y).filter(([nx, ny]) => {
          const t = this.tileAt(nx, ny);
          return isWalkable(t) && t !== T.Lava && !this.monsterAt(nx, ny);
        });
        if (!spots.length) { this.msg('No room for a servant.', C.info); return false; }
        const [nx, ny] = this.rng.pick(spots);
        const sk = spawnMonster(MONSTER_BY_ID.get('skelservant')!, nx, ny, this.effDepth());
        sk.friendly = true;
        sk.maxHp += p.level * 3; sk.hp = sk.maxHp;
        sk.dmgBonus += Math.floor(p.level / 3);
        this.monsters.push(sk);
        this.msg('Bones claw up from the earth and assemble, awaiting orders.', C.god);
        break;
      }
      case 'gravechill':
        this.msg('The cold of the tomb bursts outward!', C.warn);
        this.pushFx({ t: 'burst', x: p.x, y: p.y, color: '#7ad0f0', n: 24 });
        for (const m of this.monsters.slice()) {
          if (!m.friendly && this.dist(p.x, p.y, m.x, m.y) <= 3) {
            this.damageMonster(m, Math.round(this.rng.int(4 + p.level, 9 + p.level) * sp), 'cold');
            if (this.monsters.includes(m)) this.addStatus(m, 'slow', 1, 8);
          }
        }
        break;
      case 'flurry':
        this.msg('Your hands blur.', C.bold);
        this.playerAttack(target!);
        if (this.monsters.includes(target!)) this.playerAttack(target!);
        break;
      case 'stillness':
        this.healPlayer(12 + p.level * 2);
        this.removeStatus(p, 'poison');
        this.removeStatus(p, 'burn');
        this.msg('One breath. The pain is information; you file it away.', C.good);
        break;
      case 'ironpalm': {
        this.msg('IRON PALM!', C.bold);
        this.playerAttack(target!, 1.2);
        if (this.monsters.includes(target!)) {
          this.addStatus(target!, 'stun', 1, 2);
          const dx = Math.sign(target!.x - p.x), dy = Math.sign(target!.y - p.y);
          for (let k = 0; k < 3; k++) {
            const nx = target!.x + dx, ny = target!.y + dy;
            const t = this.tileAt(nx, ny);
            if (!isWalkable(t) || this.monsterAt(nx, ny)) {
              this.damageMonster(target!, this.rng.int(2, 6), 'phys');
              break;
            }
            target!.x = nx; target!.y = ny;
          }
        }
        break;
      }
      // -------- god powers
      case 'reap':
        this.msg('THE HARVEST. Life bends toward the Silent King — through you.', C.god);
        for (const m of this.visibleMonsters()) {
          this.damageMonster(m, Math.round(this.rng.int(5, 10) + this.depth * 0.5), 'necro');
          this.healPlayer(2);
        }
        this.pushFx({ t: 'flash', color: '#a8a4c0' });
        break;
      case 'wingblessing':
        this.addStatus(p, 'haste', 1, 20);
        this.msg('A thousand wings beat inside your blood.', C.god);
        break;
      case 'dreamdust':
        this.msg('Silver dust falls. The dark grows heavy-lidded.', C.god);
        for (const m of this.visibleMonsters()) {
          if (!m.def.boss) { m.awake = false; }
        }
        break;
      case 'flies': {
        let placed = 0;
        for (const [nx, ny] of neighbors(p.x, p.y)) {
          if (placed >= 2) break;
          const t = this.tileAt(nx, ny);
          if (isWalkable(t) && t !== T.Lava && !this.monsterAt(nx, ny)) {
            const fl = spawnMonster(MONSTER_BY_ID.get('corpseflies')!, nx, ny, this.depth);
            fl.friendly = true;
            this.monsters.push(fl);
            placed++;
          }
        }
        this.msg('The Choir sends its smallest singers.', C.god);
        break;
      }
      case 'blight':
        this.msg('Rot blooms in every living thing you can see.', C.god);
        for (const m of this.visibleMonsters()) {
          if (!m.def.resist?.includes('poison')) this.addStatus(m, 'poison', 4, 9);
        }
        break;
      case 'solarflare':
        this.msg('The Black Sun flares through you!', C.god);
        this.pushFx({ t: 'flash', color: '#ff8a3c' });
        this.pushFx({ t: 'shake', mag: 5 });
        for (const m of this.monsters.slice()) {
          if (!m.friendly && this.dist(p.x, p.y, m.x, m.y) <= 2) {
            this.damageMonster(m, this.rng.int(10, 20) + this.depth, 'fire');
          }
        }
        break;
      case 'cindershield':
        this.addStatus(p, 'cinder', 1, 30);
        this.msg('Black fire wreathes you, hungry for anyone who dares touch.', C.god);
        break;
      case 'undertow':
        this.msg('Cold currents seize your enemies.', C.god);
        for (const m of this.visibleMonsters()) this.addStatus(m, 'slow', 1, 9);
        break;
      case 'renewal':
        this.addStatus(p, 'regen', 3, 20);
        this.msg('The tide moves through your wounds, mending.', C.god);
        break;
      case 'aegis':
        this.addStatus(p, 'shield', 25 + p.level, 30);
        this.msg('The Warden stands between. You feel it, faceless and absolute.', C.god);
        break;
      case 'sanctuary':
        this.msg('This ground is claimed. The dark KNOWS it.', C.god);
        for (const m of this.visibleMonsters()) if (!m.def.boss) this.addStatus(m, 'fear', 1, 10);
        break;
      default:
        acted = false;
    }
    if (!acted) return false;
    sfx.play(source === 'god' ? 'god' : 'spell');
    if (source === 'class') p.mp -= ab.cost;
    else p.piety -= ab.cost;
    this.advanceWorld();
    return true;
  }

  // ============================================== world advance
  advanceWorld(): void {
    if (this.over) return;
    const p = this.player;
    p.turns++;
    if (p.turns % 12 === 0) this.save();
    const cost = this.hasStatus('haste') ? 7
      : this.hasStatus('slow') && !this.hasAmulet('clarity') ? 15 : 10;
    // monsters
    this.distMap = bfsDistance(this.level, p.x, p.y, true);
    for (const m of this.monsters.slice()) {
      if (!this.monsters.includes(m)) continue;
      let speed = m.def.speed;
      if (this.hasStatus('slow', m)) speed *= 0.5;
      if (this.hasStatus('haste', m)) speed *= 1.5;
      m.energy += speed * (cost / 10);
      while (m.energy >= 10 && this.monsters.includes(m) && !this.over) {
        m.energy -= 10;
        this.monsterAct(m);
      }
      this.tickStatuses(m, false);
    }
    // player statuses & regen
    this.tickStatuses(p, true);
    if (!this.over) {
      const regenStat = this.getStatus('regen');
      let hpRate = (0.35 + p.level * 0.05) * this.race.regenMult + (regenStat ? regenStat.power * 0.8 : 0);
      if (this.hasCorr('chainedheart')) hpRate *= 0.5;
      this.hpAcc += hpRate;
      while (this.hpAcc >= 1) { this.hpAcc -= 1; this.healPlayer(1); }
      const mpRate = (0.25 + Math.max(0, p.wil - 10) * 0.03) * (this.ringBonus('springs') > 0 ? 2 : 1);
      this.mpAcc += mpRate;
      while (this.mpAcc >= 1) { this.mpAcc -= 1; p.mp = Math.min(this.maxMpTot(), p.mp + 1); }
      // standing in lava hurts every turn
      if (this.tileAt(p.x, p.y) === T.Lava) {
        this.damagePlayer(this.race.id === 'ashkin' ? this.rng.int(1, 2) : this.rng.int(5, 10), 'fire', 'a river of fire');
      }
    }
    this.updateFOV();
    this.dirty = true;
  }

  tickStatuses(who: Monster | Player, isPlayer: boolean): void {
    const list = who.statuses;
    for (const s of list.slice()) {
      if (s.kind === 'poison') {
        if (isPlayer) this.damagePlayer(s.power, 'poison', 'poison', true);
        else this.damageMonster(who as Monster, s.power, 'poison', true);
      }
      if (s.kind === 'burn') {
        if (isPlayer) this.damagePlayer(s.power, 'fire', 'burning', true);
        else this.damageMonster(who as Monster, s.power, 'fire', true);
      }
      s.turns--;
      if (s.turns <= 0) {
        who.statuses = who.statuses.filter((x) => x !== s);
        if (isPlayer) {
          const names: Partial<Record<StatusKind, string>> = {
            might: 'Your fury fades.', haste: 'Time resumes its usual pace.', stone: 'Your skin softens.',
            veil: 'The shadow unwinds from you.', shield: 'Your ward fades.', regen: 'The unnatural mending stops.',
            poison: 'The venom runs its course.', burn: 'The flames gutter out.', weak: 'Strength returns to your limbs.',
            cinder: 'Your cinder shield burns out.', slow: 'Your limbs remember how to move.',
          };
          const n = names[s.kind];
          if (n) this.msg(n, C.info);
        }
      }
    }
    if (isPlayer) this.dirty = true;
  }

  // ============================================== monster AI
  monsterAct(m: Monster): void {
    const p = this.player;
    const L = this.level;
    if (this.hasStatus('stun', m)) return;
    if (!m.awake) {
      const d = this.dist(p.x, p.y, m.x, m.y);
      if (d <= 9 && L.visible[idx(m.x, m.y, L.w)]) {
        const chance = Math.max(0.02, (0.3 - d * 0.025) * this.stealthMult());
        if (this.rng.chance(chance)) {
          m.awake = true;
          if (L.visible[idx(m.x, m.y, L.w)]) this.msg(`${this.mn(m, true)} stirs.`, C.warn);
        }
      }
      return;
    }
    if (m.friendly) {
      this.allyAct(m);
      return;
    }
    const d = this.dist(p.x, p.y, m.x, m.y);
    // fear: flee
    if (this.hasStatus('fear', m)) {
      this.stepAway(m);
      return;
    }
    // survival instinct: badly hurt thinking creatures retreat
    if (!m.def.boss && !m.def.mindless && m.hp < m.maxHp * 0.25 && this.rng.chance(0.65)) {
      if (L.visible[idx(m.x, m.y, L.w)] && this.rng.chance(0.25)) this.msg(`${this.mn(m, true)} tries to escape!`, C.info);
      this.stepAway(m);
      return;
    }
    // kiting: ranged attackers back off from melee range to shoot
    if (m.def.ranged && d <= 1 && !m.def.boss && !m.def.mindless && this.rng.chance(0.5)) {
      this.stepAway(m);
      return;
    }
    // melee
    if (d <= 1) {
      // prefer hitting adjacent ally sometimes
      const adjAlly = this.monsters.find((a) => a.friendly && this.dist(a.x, a.y, m.x, m.y) <= 1);
      if (adjAlly && this.rng.chance(0.5)) {
        this.monsterHitMonster(m, adjAlly);
        return;
      }
      this.monsterAttackPlayer(m);
      return;
    }
    // summoner
    if (m.def.summon && this.rng.chance(m.def.summon.chance) && L.visible[idx(m.x, m.y, L.w)]) {
      const def = MONSTER_BY_ID.get(m.def.summon.id)!;
      let placed = 0;
      for (const [nx, ny] of this.rng.shuffle(neighbors(m.x, m.y))) {
        if (placed >= m.def.summon.count) break;
        const t = this.tileAt(nx, ny);
        if (isWalkable(t) && t !== T.Lava && !this.monsterAt(nx, ny) && !(p.x === nx && p.y === ny)) {
          const sm = spawnMonster(def, nx, ny, this.effDepth());
          sm.awake = true;
          this.monsters.push(sm);
          placed++;
        }
      }
      if (placed) {
        this.msg(`${this.mn(m, true)} calls for aid!`, C.warn);
        return;
      }
    }
    // ranged
    if (m.def.ranged && d <= m.def.ranged.range && d > 1 &&
      this.losClear(m.x, m.y, p.x, p.y) && L.visible[idx(m.x, m.y, L.w)] &&
      this.rng.chance(m.def.ranged.chance)) {
      const r = m.def.ranged;
      this.pushFx({ t: 'beam', x0: m.x, y0: m.y, x1: p.x, y1: p.y, color: r.color });
      const acc = m.def.acc + 1;
      const hit = this.rng.chance(Math.min(0.95, Math.max(0.1, 0.65 + (acc - this.playerEV()) * 0.045)));
      if (hit) {
        const dmg = this.rng.int(r.dmg[0], r.dmg[1]) + m.dmgBonus;
        this.msg(`${this.mn(m, true)}'s ${r.name} strikes you!`, C.dmg);
        this.damagePlayer(dmg, r.type, this.srcName(m));
      } else {
        this.msg(`${this.mn(m, true)}'s ${r.name} misses you.`, C.info);
      }
      return;
    }
    // approach
    this.stepToward(m);
  }

  allyAct(m: Monster): void {
    const p = this.player;
    const targets = this.monsters
      .filter((h) => !h.friendly && this.dist(m.x, m.y, h.x, h.y) <= 8 && this.losClear(m.x, m.y, h.x, h.y))
      .sort((a, b) => this.dist(m.x, m.y, a.x, a.y) - this.dist(m.x, m.y, b.x, b.y));
    const t = targets[0];
    if (t && this.dist(m.x, m.y, t.x, t.y) <= 1) {
      this.monsterHitMonster(m, t);
      return;
    }
    const dest = t ?? p;
    this.greedyStep(m, dest.x, dest.y);
  }

  monsterHitMonster(att: Monster, def: Monster): void {
    const hit = this.rng.chance(Math.min(0.95, Math.max(0.15, 0.72 + (att.def.acc - def.def.ev) * 0.045)));
    const L = this.level;
    const seen = L.visible[idx(att.x, att.y, L.w)] || L.visible[idx(def.x, def.y, L.w)];
    if (!hit) {
      if (seen) this.msg(`${this.mn(att, true)} misses ${this.mn(def)}.`, C.info);
      return;
    }
    const dmg = this.rng.int(att.def.dmg[0], att.def.dmg[1]) + att.dmgBonus;
    if (seen) this.msg(`${this.mn(att, true)} hits ${this.mn(def)}.`, C.info);
    if (att.def.onHit && this.rng.chance(att.def.onHit.chance) && !def.def.resist?.includes('poison')) {
      this.addStatus(def, att.def.onHit.kind, att.def.onHit.power, att.def.onHit.turns);
    }
    this.damageMonster(def, dmg, 'phys');
  }

  stepToward(m: Monster): void {
    const L = this.level;
    let best: [number, number] | null = null;
    let bestD = this.distMap[idx(m.x, m.y, L.w)];
    for (const [nx, ny] of this.rng.shuffle(neighbors(m.x, m.y))) {
      if (nx < 0 || ny < 0 || nx >= L.w || ny >= L.h) continue;
      const t = this.tileAt(nx, ny);
      const passable = isWalkable(t) || t === T.DoorClosed;
      if (!passable) continue;
      if (t === T.Lava && !m.def.resist?.includes('fire')) continue;
      if (this.monsterAt(nx, ny)) continue;
      if (this.player.x === nx && this.player.y === ny) continue;
      const dd = this.distMap[idx(nx, ny, L.w)];
      const flanks = this.dist(nx, ny, this.player.x, this.player.y) === 1;
      if (dd < bestD || (dd === bestD && best !== null && flanks && this.dist(best[0], best[1], this.player.x, this.player.y) > 1)) {
        bestD = dd; best = [nx, ny];
      }
    }
    if (!best) return;
    const t = this.tileAt(best[0], best[1]);
    if (t === T.DoorClosed) {
      L.tiles[idx(best[0], best[1], L.w)] = T.DoorOpen;
      if (L.visible[idx(best[0], best[1], L.w)]) this.msg(`${this.mn(m, true)} wrenches a door open.`, C.warn);
      return;
    }
    m.x = best[0]; m.y = best[1];
  }

  stepAway(m: Monster): void {
    const L = this.level;
    let best: [number, number] | null = null;
    let bestD = this.distMap[idx(m.x, m.y, L.w)];
    for (const [nx, ny] of this.rng.shuffle(neighbors(m.x, m.y))) {
      const t = this.tileAt(nx, ny);
      if (!isWalkable(t)) continue;
      if (t === T.Lava && !m.def.resist?.includes('fire')) continue;
      if (this.monsterAt(nx, ny) || (this.player.x === nx && this.player.y === ny)) continue;
      const dd = this.distMap[idx(nx, ny, L.w)];
      if (dd > bestD && dd < Infinity) { bestD = dd; best = [nx, ny]; }
    }
    if (best) { m.x = best[0]; m.y = best[1]; }
  }

  greedyStep(m: Monster, tx: number, ty: number): void {
    let best: [number, number] | null = null;
    let bestD = this.dist(m.x, m.y, tx, ty);
    if (bestD <= 1) return;
    for (const [nx, ny] of this.rng.shuffle(neighbors(m.x, m.y))) {
      const t = this.tileAt(nx, ny);
      if (!isWalkable(t) || t === T.Lava) continue;
      if (this.monsterAt(nx, ny) || (this.player.x === nx && this.player.y === ny)) continue;
      const dd = this.dist(nx, ny, tx, ty);
      if (dd < bestD) { bestD = dd; best = [nx, ny]; }
    }
    if (best) { m.x = best[0]; m.y = best[1]; }
  }

  // ============================================== QoL: autoexplore & rest
  autoExplore(): void {
    const path: [number, number][] = [[this.player.x, this.player.y]];
    const emitTrail = (): void => {
      if (path.length > 1) this.pushFx({ t: 'trail', points: path });
    };
    for (let step = 0; step < 80; step++) {
      if (this.over) return;
      if (this.visibleMonsters().some((m) => m.awake)) {
        if (step === 0) this.msg('Not with enemies in sight.', C.info);
        else this.msg('You stop: something hunts nearby.', C.warn);
        emitTrail();
        return;
      }
      const L = this.level;
      const dist = bfsDistance(L, this.player.x, this.player.y);
      let target = -1, targetD = Infinity;
      for (let i = 0; i < L.w * L.h; i++) {
        if (!L.explored[i] && isWalkable(L.tiles[i]) && L.tiles[i] !== T.Lava && dist[i] < targetD) {
          targetD = dist[i]; target = i;
        }
      }
      if (target < 0) {
        this.msg('This floor holds no more secrets. (> to descend)', C.good);
        emitTrail();
        return;
      }
      const back = bfsDistance(L, target % L.w, Math.floor(target / L.w));
      let best: [number, number] | null = null;
      let bestD = back[idx(this.player.x, this.player.y, L.w)];
      for (const [nx, ny] of neighbors(this.player.x, this.player.y)) {
        const t = this.tileAt(nx, ny);
        if ((!isWalkable(t) && t !== T.DoorClosed) || t === T.Lava) continue;
        if (this.monsterAt(nx, ny)) continue;
        if (back[idx(nx, ny, L.w)] < bestD) { bestD = back[idx(nx, ny, L.w)]; best = [nx, ny]; }
      }
      if (!best) { emitTrail(); return; }
      const before = this.items.filter((i) => i.x === this.player.x && i.y === this.player.y).length;
      if (!this.tryMove(best[0] - this.player.x, best[1] - this.player.y)) { emitTrail(); return; }
      path.push([this.player.x, this.player.y]);
      const here = this.items.filter((i) => i.x === this.player.x && i.y === this.player.y).length;
      if (here > 0 && before === 0) { emitTrail(); return; } // stop on loot
    }
    emitTrail();
  }

  rest(): void {
    if (this.visibleMonsters().some((m) => m.awake)) {
      this.msg('You cannot rest with enemies in sight.', C.info);
      return;
    }
    const start = this.player.turns;
    this.msg('You rest a while in the dark...', C.info);
    while (this.player.turns - start < 150) {
      if (this.over) return;
      if (this.player.hp >= this.maxHpTot() && this.player.mp >= this.maxMpTot()) break;
      if (this.visibleMonsters().some((m) => m.awake)) {
        this.msg('Your rest is interrupted!', C.warn);
        return;
      }
      this.advanceWorld();
    }
    this.msg('You feel restored.', C.good);
  }
}
