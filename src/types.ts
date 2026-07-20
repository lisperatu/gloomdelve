// ---------- tiles ----------
export enum T {
  Wall,
  Floor,
  DoorClosed,
  DoorOpen,
  StairsDown,
  Water,
  Lava,
  Altar,
  Fungus,
  Bones,
  Rubble,
  Torch,
  BranchDown,
  PortalBack,
  Merchant,
}

export type DamageType = 'phys' | 'fire' | 'poison' | 'necro' | 'cold';

export type StatusKind =
  | 'poison' | 'burn' | 'slow' | 'haste' | 'regen' | 'shield'
  | 'weak' | 'hex' | 'veil' | 'might' | 'stone' | 'fear' | 'stun' | 'cinder';

export interface Status {
  kind: StatusKind;
  turns: number;
  power: number;
}

export interface Light {
  x: number;
  y: number;
  r: number;
  color: [number, number, number];
  flicker: number; // phase
}

export interface LevelMap {
  w: number;
  h: number;
  depth: number;
  stratum: number;
  tiles: Uint8Array;
  explored: Uint8Array;
  visible: Uint8Array;
  lights: Light[];
  decals: Map<number, string>; // idx -> css color (blood etc.)
  altarGod: Map<number, string>;
  gates: Map<number, string>; // idx -> branch id
}

// ---------- monsters ----------
export interface RangedAttack {
  name: string;
  dmg: [number, number];
  type: DamageType;
  range: number;
  color: string;
  chance: number;
}

export interface MonsterDef {
  id: string;
  name: string;
  glyph: string;
  color: string;
  depth: [number, number];
  weight: number;
  hp: number;
  dmg: [number, number];
  acc: number;
  ev: number;
  ac: number;
  speed: number; // 10 = normal
  xp: number;
  pack?: [number, number];
  ranged?: RangedAttack;
  summon?: { id: string; count: number; chance: number };
  onHit?: { kind: StatusKind; power: number; turns: number; chance: number };
  drain?: boolean;
  regen?: boolean;
  amphibious?: boolean;
  boss?: boolean;
  sleepless?: boolean;
  flees?: boolean;
  mindless?: boolean; // never flees, never kites
  branch?: string;
  resist?: DamageType[];
  vuln?: DamageType[];
  flavor?: string;
}

export interface Monster {
  uid: number;
  def: MonsterDef;
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  dmgBonus: number; // depth scaling
  energy: number;
  awake: boolean;
  friendly: boolean;
  statuses: Status[];
}

// ---------- items ----------
export type ItemKind = 'weapon' | 'armor' | 'potion' | 'scroll' | 'ring' | 'amulet' | 'gold';

export interface Item {
  kind: ItemKind;
  id: string;
  qty: number;
  plus: number;
  ego: string | null;
  unique?: string; // named artifact
  x: number; // -1 when carried
  y: number;
}

export interface EquipSlots {
  weapon: Item | null;
  body: Item | null;
  amulet: Item | null;
  ring1: Item | null;
  ring2: Item | null;
}

// ---------- player ----------
export interface Player {
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  str: number;
  dex: number;
  wil: number;
  level: number;
  xp: number;
  gold: number;
  raceId: string;
  classId: string;
  godId: string | null;
  piety: number;
  inventory: Item[];
  equip: EquipSlots;
  statuses: Status[];
  reprieveUsed: boolean;
  kills: number;
  turns: number;
  name: string;
  charName: string;
}

// ---------- fx / messages ----------
export type FX =
  | { t: 'float'; x: number; y: number; text: string; color: string }
  | { t: 'shake'; mag: number }
  | { t: 'burst'; x: number; y: number; color: string; n: number }
  | { t: 'beam'; x0: number; y0: number; x1: number; y1: number; color: string }
  | { t: 'flash'; color: string }
  | { t: 'trail'; points: [number, number][] };

export interface Msg {
  text: string;
  color: string;
  count: number;
  fresh: boolean;
}

export const idx = (x: number, y: number, w: number) => y * w + x;

export function isWalkable(t: number): boolean {
  return t === T.Floor || t === T.DoorOpen || t === T.StairsDown || t === T.Water ||
    t === T.Lava || t === T.Altar || t === T.Fungus || t === T.Bones || t === T.Rubble ||
    t === T.BranchDown || t === T.PortalBack;
}

export function isTransparent(t: number): boolean {
  return t !== T.Wall && t !== T.DoorClosed && t !== T.Torch;
}
