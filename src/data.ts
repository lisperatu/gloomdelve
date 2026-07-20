import type { DamageType, Item, ItemKind, MonsterDef } from './types';
import { RNG } from './rng';

// ============================================================ strata
export interface Stratum {
  name: string;
  sub: string;
  depths: [number, number];
  gen: 'rooms' | 'caves' | 'flooded' | 'ember' | 'throne';
  floor: [number, number, number];
  wall: [number, number, number];
  accent: string;
  intro: string;
}

export const STRATA: Stratum[] = [
  {
    name: 'The Mossgrave Catacombs', sub: 'where the dead were stacked like firewood',
    depths: [1, 4], gen: 'rooms',
    floor: [98, 92, 114], wall: [170, 156, 192], accent: '#7d9a62',
    intro: 'Cold air rises from below, thick with the smell of wet stone and old prayers. Behind you the way does not slam — it closes the way a ledger closes, softly, on a finished entry.',
  },
  {
    name: 'The Fungal Weald', sub: 'a forest that grew where no light ever fell',
    depths: [5, 9], gen: 'caves',
    floor: [72, 104, 86], wall: [120, 168, 138], accent: '#59d4a0',
    intro: 'Pale stalks taller than men sway in a wind that does not exist. Everything here breathes in unison. After a while, so do you.',
  },
  {
    name: 'The Drowned Cloister', sub: 'the choir sings on, beneath black water',
    depths: [10, 14], gen: 'flooded',
    floor: [72, 94, 122], wall: [120, 154, 198], accent: '#4a8fc0',
    intro: 'Flooded halls of a sunken cathedral, and the hymn reaches you through your teeth before your ears. The black water is warmer than it has any right to be.',
  },
  {
    name: 'The Ember Fathoms', sub: 'the world’s furnace, still burning',
    depths: [15, 19], gen: 'ember',
    floor: [122, 80, 68], wall: [188, 116, 94], accent: '#ff6a2a',
    intro: 'Heat rolls over you in waves. Rivers of fire crawl through the black rock, and things made of cinder walk their banks like foundry hands who never heard the shift end.',
  },
  {
    name: 'The Unlight Throne', sub: 'where darkness itself was crowned',
    depths: [20, 20], gen: 'throne',
    floor: [78, 66, 106], wall: [126, 104, 174], accent: '#8a5cff',
    intro: 'There is no darkness here — there is Unlight, a radiance of absence. On a throne of frozen shadow, something ancient opens a thousand eyes, and not one of them turns to you.',
  },
  { // 5: Ossuary (branch)
    name: 'The Ossuary', sub: 'where the dead are filed, not buried',
    depths: [-1, -1], gen: 'rooms',
    floor: [112, 106, 90], wall: [186, 176, 150], accent: '#e8e0c8',
    intro: '',
  },
  { // 6: Silkfen (branch)
    name: 'The Silkfen', sub: 'the pantry of a patient mother',
    depths: [-1, -1], gen: 'caves',
    floor: [104, 98, 114], wall: [172, 164, 184], accent: '#e0e0f0',
    intro: '',
  },
  { // 7: Vault of Chains (branch)
    name: 'The Vault of Chains', sub: 'the dungeon’s own prison',
    depths: [-1, -1], gen: 'rooms',
    floor: [72, 76, 90], wall: [122, 128, 148], accent: '#8a94b0',
    intro: '',
  },
  { // 8: Wax Garden (branch)
    name: 'The Wax Garden', sub: 'a vigil that would not gutter',
    depths: [-1, -1], gen: 'rooms',
    floor: [126, 112, 84], wall: [196, 172, 124], accent: '#f0d890',
    intro: '',
  },
  { // 9: The Roots (branch)
    name: 'The Roots', sub: 'what the buried forests became',
    depths: [-1, -1], gen: 'caves',
    floor: [96, 82, 62], wall: [150, 126, 92], accent: '#a8c060',
    intro: '',
  },
  { // 10: Mirror Cistern (branch)
    name: 'The Mirror Cistern', sub: 'where the water shows too much',
    depths: [-1, -1], gen: 'flooded',
    floor: [88, 98, 110], wall: [140, 156, 176], accent: '#c8e0f0',
    intro: '',
  },
];

// --- side branches (optional themed sub-dungeons, DCSS-style)
export interface BranchDef {
  id: string;
  name: string;
  sub: string;
  entry: number;   // spine depth where the gate can appear
  levels: number;
  stratum: number; // index into STRATA
  boss: string;
  intro: string;
}

export const BRANCHES: BranchDef[] = [
  {
    id: 'ossuary', name: 'The Ossuary', sub: 'where the dead are filed, not buried',
    entry: 3, levels: 2, stratum: 5, boss: 'charnelbride',
    intro: 'Shelves of bone rise out of sight, catalogued in a script of notches. The aisles run on past where the outer wall should be, and the shelving never repeats. The archive is missing one entry, shaped exactly like you.',
  },
  {
    id: 'silkfen', name: 'The Silkfen', sub: 'the pantry of a patient mother',
    entry: 7, levels: 2, stratum: 6, boss: 'mothersilk',
    intro: 'Every surface is wrapped in grey silk, and some of the bundles are still breathing — all of them, you notice, in unison. High above, something vast shifts its weight along the threads.',
  },
  {
    id: 'chains', name: 'The Vault of Chains', sub: 'the dungeon’s own prison',
    entry: 12, levels: 3, stratum: 7, boss: 'gaoler',
    intro: 'Chains thick as trees vanish into darkness overhead, each one taut, each one holding something. The Gaoler’s ledger has room for one more name, and the line is already ruled.',
  },
];
BRANCHES.push(
  {
    id: 'waxgarden', name: 'The Wax Garden', sub: 'a vigil that would not gutter',
    entry: 3, levels: 2, stratum: 8, boss: 'vestal',
    intro: 'Ten thousand candles, all lit, none guttering, and not one of them casts your shadow. Someone has been tending them since the sun was stolen — and the wax has been rising around her like a patient tide for nine generations.',
  },
  {
    id: 'roots', name: 'The Roots', sub: 'what the buried forests became',
    entry: 7, levels: 2, stratum: 9, boss: 'taproot',
    intro: 'The Grave-Elves buried their forests, but forests do not stay buried — they dig. You are inside the root-ball of a wood that has spent nine generations reaching for something below, and lately the reaching has been reaching back.',
  },
  {
    id: 'cistern', name: 'The Mirror Cistern', sub: 'where the water shows too much',
    entry: 12, levels: 3, stratum: 10, boss: 'reflection',
    intro: 'Still water, floor to ceiling, polished past honesty. The reflections here move a half-second late, and some of them have stopped bothering to match at all.',
  },
);
export const BRANCH_BY_ID = new Map(BRANCHES.map((b) => [b.id, b]));
// each run offers one branch from each pair
export const BRANCH_PAIRS: [string, string][] = [
  ['ossuary', 'waxgarden'],
  ['silkfen', 'roots'],
  ['chains', 'cistern'],
];

export function stratumFor(depth: number): Stratum {
  return STRATA.find((s) => depth >= s.depths[0] && depth <= s.depths[1]) ?? STRATA[STRATA.length - 1];
}

export const MAX_DEPTH = 20;

// ============================================================ corruptions
// Offered by the Nameless Editor at warped altars. Permanent trade-offs.
export interface CorruptionDef {
  id: string;
  name: string;
  gain: string;
  cost: string;
  lore: string;
}
export const CORRUPTIONS: CorruptionDef[] = [
  {
    id: 'venomglands', name: 'Venom Glands',
    gain: 'Your blows often poison.', cost: '−2 DEX (something in your hands sits differently now)',
    lore: 'The glands are grown, not given. You will catch yourself salivating at wounds.',
  },
  {
    id: 'hollowedeye', name: 'The Hollowed Eye',
    gain: 'Sense all creatures nearby, through stone.', cost: '−2 sight radius',
    lore: 'One eye is taken and nothing visible is put back. What sees through the socket now does not use light.',
  },
  {
    id: 'barkgraft', name: 'Bark Graft',
    gain: '+3 armor.', cost: '−2 evasion · fire finds you kindling',
    lore: 'A strip of the buried forests, sewn on living. It grows a ring each year, whether you do or not.',
  },
  {
    id: 'chainedheart', name: 'Chained Heart',
    gain: '+25% maximum health.', cost: 'natural healing halved',
    lore: 'The Vault forges very small chains, for very specific prisoners. Yours beats against its links, stronger for the resistance.',
  },
  {
    id: 'secondstomach', name: 'Second Stomach',
    gain: 'Potions are half again as potent.', cost: 'scrolls sometimes come apart in your hands',
    lore: 'It is not clear what it digests when you have not drunk anything. It is always digesting something.',
  },
  {
    id: 'ledgerhand', name: 'Ledger Hand',
    gain: 'Find half again as much gold.', cost: 'the gods trust you less: piety gains halved',
    lore: 'Your right hand has been deputized. It counts things now, on its own, at night. The gods can read the ink under your skin.',
  },
  {
    id: 'mothlung', name: 'Moth Lung',
    gain: 'Immunity to poison.', cost: '−10% maximum health',
    lore: 'You exhale a little dust now, in cold corridors. It always drifts downward, toward the throne, like everything else.',
  },
  {
    id: 'swallowedkey', name: 'The Swallowed Key',
    gain: '+1 to all attributes.', cost: 'the dungeon knows where you are: enemies wake far more easily',
    lore: 'It goes down cold and it does not come up. Somewhere below, a lock has begun composing its expectations.',
  },
];

// ============================================================ races
export interface RaceDef {
  id: string;
  name: string;
  desc: string;
  str: number; dex: number; wil: number;
  hpMult: number; mpMult: number;
  fov: number;
  regenMult: number;
  stealth: number;      // multiplier on wake chance (lower = stealthier)
  immunePoison?: boolean;
  resist?: DamageType[];
  luck?: number;        // bonus item quality
  blinkOnHit?: number;  // chance
  waterborn?: boolean;
  mods: string;
}

export const RACES: RaceDef[] = [
  {
    id: 'hollowed', name: 'The Hollowed',
    desc: 'A corpse that refused to lie down. Feels no venom, fears no grave-chill — but flesh this dead knits slowly.',
    str: 2, dex: -1, wil: 1, hpMult: 1.15, mpMult: 1, fov: 8, regenMult: 0.5, stealth: 1,
    immunePoison: true, resist: ['necro', 'cold'],
    mods: '+2 STR −1 DEX +1 WIL · +15% HP · immune poison · resist necro/cold · slow regen',
  },
  {
    id: 'ashkin', name: 'Ashkin',
    desc: 'Born in the year the sky burned. Cinders drift from their hair; fire knows them as kin.',
    str: 1, dex: 0, wil: 1, hpMult: 1, mpMult: 1.1, fov: 8, regenMult: 1, stealth: 1,
    resist: ['fire'],
    mods: '+1 STR +1 WIL · resist fire · fire spells +25% · lava barely burns',
  },
  {
    id: 'vesperkin', name: 'Vesperkin',
    desc: 'Night-folk with eyes like polished onyx. They see through darkness that would blind others, and move like rumors.',
    str: -1, dex: 3, wil: 0, hpMult: 0.85, mpMult: 1, fov: 11, regenMult: 1, stealth: 0.5,
    mods: '−1 STR +3 DEX · −15% HP · wide night-sight · very stealthy',
  },
  {
    id: 'graveelf', name: 'Grave-Elf',
    desc: 'Elves who buried their forests and followed them down. Frail, luminous, and terribly wise.',
    str: -2, dex: 1, wil: 3, hpMult: 0.9, mpMult: 1.4, fov: 9, regenMult: 1, stealth: 0.8,
    mods: '−2 STR +1 DEX +3 WIL · +40% MP · spell power +15%',
  },
  {
    id: 'trollblood', name: 'Trollblood',
    desc: 'Half-mountain, half-appetite. Wounds close before the blood dries.',
    str: 3, dex: -2, wil: -1, hpMult: 1.3, mpMult: 0.8, fov: 7, regenMult: 3, stealth: 1.4,
    mods: '+3 STR −2 DEX −1 WIL · +30% HP · regenerates ×3 · loud',
  },
  {
    id: 'mireborn', name: 'Mireborn',
    desc: 'Raised by the swamp itself. Venom is a mother-tongue; black water is a second skin.',
    str: 1, dex: 1, wil: 0, hpMult: 1, mpMult: 1, fov: 8, regenMult: 1, stealth: 0.9,
    immunePoison: true, waterborn: true,
    mods: '+1 STR +1 DEX · immune poison · at home in water (+EV in water)',
  },
  {
    id: 'mothtouched', name: 'Moth-touched',
    desc: 'Marked at birth by the Mother of Moths. Luck clings to them like dust; sometimes they simply are not where the blow lands.',
    str: 0, dex: 1, wil: 1, hpMult: 0.9, mpMult: 1, fov: 8, regenMult: 1, stealth: 0.8,
    luck: 1, blinkOnHit: 0.15,
    mods: '+1 DEX +1 WIL · −10% HP · lucky finds · 15% to flicker away from blows',
  },
];

// ============================================================ classes
export interface AbilityDef {
  id: string;
  name: string;
  cost: number;       // mp (or piety for god powers)
  desc: string;
  target: 'self' | 'enemy';
  range: number;
  unlock: number;     // player level (or piety threshold)
}

export interface ClassDef {
  id: string;
  name: string;
  desc: string;
  hpPer: number;
  mpPer: number;
  hpBase: number;
  mpBase: number;
  statFav: ['str' | 'dex' | 'wil', 'str' | 'dex' | 'wil'];
  kit: { weapon?: string; weaponPlus?: number; body?: string; potions?: string[]; scrolls?: string[] };
  abilities: AbilityDef[];
  mods: string;
}

export const CLASSES: ClassDef[] = [
  {
    id: 'gravewarden', name: 'Gravewarden',
    desc: 'Keeper of the doors the dead should not open. Iron, patience, and a mace that has ended arguments for three hundred years.',
    hpPer: 12, mpPer: 2, hpBase: 34, mpBase: 6, statFav: ['str', 'str'],
    kit: { weapon: 'mace', body: 'chain', potions: ['heal'] },
    abilities: [
      { id: 'shieldslam', name: 'Shield Slam', cost: 4, desc: 'Brutal blow that stuns an adjacent foe.', target: 'enemy', range: 1, unlock: 1 },
      { id: 'bulwark', name: 'Bulwark', cost: 6, desc: 'Raise a ward that absorbs damage.', target: 'self', range: 0, unlock: 4 },
      { id: 'roar', name: 'Sepulchral Roar', cost: 9, desc: 'A grave-cold bellow; nearby enemies flee.', target: 'self', range: 0, unlock: 8 },
    ],
    mods: 'Heavy armor · mace · the anvil that outlasts',
  },
  {
    id: 'pyroclast', name: 'Pyroclast',
    desc: 'They swallowed a coal from the Black Sun’s altar and lived. Now the fire wants out.',
    hpPer: 8, mpPer: 5, hpBase: 24, mpBase: 16, statFav: ['wil', 'wil'],
    kit: { weapon: 'dagger', body: 'robe', potions: ['mana'] },
    abilities: [
      { id: 'emberbolt', name: 'Ember Bolt', cost: 3, desc: 'Hurl a searing dart of flame.', target: 'enemy', range: 7, unlock: 1 },
      { id: 'ashnova', name: 'Ash Nova', cost: 8, desc: 'A ring of fire scours everything around you.', target: 'self', range: 0, unlock: 4 },
      { id: 'immolate', name: 'Immolate', cost: 11, desc: 'Set a foe alight with clinging fire.', target: 'enemy', range: 7, unlock: 8 },
    ],
    mods: 'Fire magic · fragile · burns very bright',
  },
  {
    id: 'shadowdancer', name: 'Shadowdancer',
    desc: 'A knife-artist who treats darkness as a dance floor. Most victims never hear the music.',
    hpPer: 10, mpPer: 3, hpBase: 29, mpBase: 10, statFav: ['dex', 'dex'],
    kit: { weapon: 'dagger', weaponPlus: 1, body: 'leather', scrolls: ['blink'] },
    abilities: [
      { id: 'shadowstep', name: 'Shadow Step', cost: 4, desc: 'Step through darkness to a foe’s side.', target: 'enemy', range: 7, unlock: 1 },
      { id: 'veil', name: 'Veil', cost: 6, desc: 'Wrap yourself in shadow: evasion up, footfalls silent.', target: 'self', range: 0, unlock: 4 },
      { id: 'garrote', name: 'Garrote', cost: 8, desc: 'Savage strike; devastating against the unaware.', target: 'enemy', range: 1, unlock: 8 },
    ],
    mods: 'Stealth · daggers · sleeping foes take ×2.5',
  },
  {
    id: 'plaguewright', name: 'Plaguewright',
    desc: 'A physician who kept asking why. Carries their laboratory under their fingernails.',
    hpPer: 9, mpPer: 4, hpBase: 27, mpBase: 13, statFav: ['wil', 'dex'],
    kit: { weapon: 'dagger', body: 'robe', potions: ['heal'] },
    abilities: [
      { id: 'venomlash', name: 'Venom Lash', cost: 3, desc: 'A whip of green ichor; poisons the target.', target: 'enemy', range: 6, unlock: 1 },
      { id: 'miasma', name: 'Miasma', cost: 8, desc: 'Exhale a rotting cloud poisoning all nearby foes.', target: 'self', range: 0, unlock: 4 },
      { id: 'transfusion', name: 'Transfusion', cost: 9, desc: 'Rip the life from a foe and stitch it into yourself.', target: 'enemy', range: 5, unlock: 8 },
    ],
    mods: 'Poison · drain · patient death',
  },
  {
    id: 'hexblade', name: 'Hexblade',
    desc: 'Sword-saint of a heretical order: every cut is a curse, every parry a prayer said backwards.',
    hpPer: 10, mpPer: 4, hpBase: 30, mpBase: 12, statFav: ['str', 'wil'],
    kit: { weapon: 'shortsword', body: 'leather' },
    abilities: [
      { id: 'hex', name: 'Hex', cost: 3, desc: 'Curse a foe: their strength withers.', target: 'enemy', range: 6, unlock: 1 },
      { id: 'soulcleave', name: 'Soul Cleave', cost: 7, desc: 'A necrotic arc strikes every adjacent enemy.', target: 'self', range: 0, unlock: 4 },
      { id: 'darkpact', name: 'Dark Pact', cost: 0, desc: 'Pay in blood: lose HP, gain mana and battle-fury.', target: 'self', range: 0, unlock: 8 },
    ],
    mods: 'Spellsword · curses · blood for power',
  },
  {
    id: 'bonecaster', name: 'Bonecaster',
    desc: 'The dead make excellent servants: no wages, no complaints, no fear.',
    hpPer: 8, mpPer: 5, hpBase: 25, mpBase: 15, statFav: ['wil', 'wil'],
    kit: { weapon: 'dagger', body: 'robe', potions: ['mana'] },
    abilities: [
      { id: 'bonedart', name: 'Bone Dart', cost: 3, desc: 'A splinter of sharpened femur.', target: 'enemy', range: 7, unlock: 1 },
      { id: 'raiseservant', name: 'Raise Servant', cost: 8, desc: 'Call a skeletal servant to fight beside you.', target: 'self', range: 0, unlock: 4 },
      { id: 'gravechill', name: 'Grave Chill', cost: 10, desc: 'Tomb-cold bursts from you, freezing and slowing foes.', target: 'self', range: 0, unlock: 8 },
    ],
    mods: 'Necromancy · summons · never truly alone',
  },
  {
    id: 'ascetic', name: 'Ascetic',
    desc: 'Owns nothing but scars and certainty. Their fists have outlived every weapon raised against them.',
    hpPer: 11, mpPer: 3, hpBase: 30, mpBase: 9, statFav: ['dex', 'str'],
    kit: { body: 'robe', potions: ['heal'] },
    abilities: [
      { id: 'flurry', name: 'Flurry', cost: 4, desc: 'Strike an adjacent foe twice in a heartbeat.', target: 'enemy', range: 1, unlock: 1 },
      { id: 'stillness', name: 'Inner Stillness', cost: 7, desc: 'Breathe: mend wounds and purge afflictions.', target: 'self', range: 0, unlock: 4 },
      { id: 'ironpalm', name: 'Iron Palm', cost: 8, desc: 'A blow that hurls a foe backward, stunned.', target: 'enemy', range: 1, unlock: 8 },
    ],
    mods: 'Unarmed (scales with level) · fast · self-sufficient',
  },
];

// ============================================================ gods
export interface GodDef {
  id: string;
  name: string;
  title: string;
  desc: string;
  likes: string;
  color: string;
  powers: [AbilityDef, AbilityDef]; // unlock = piety threshold, cost = piety
}

export const GODS: GodDef[] = [
  {
    id: 'silentking', name: 'The Silent King', title: 'He Who Waits Below',
    desc: 'God of the patient dead. He asks no hymns — only harvest.',
    likes: 'Piety for every soul you send below.', color: '#a8a4c0',
    powers: [
      { id: 'reap', name: 'Reap', cost: 15, desc: 'Drain life from every visible enemy.', target: 'self', range: 0, unlock: 30 },
      { id: 'reprieve', name: 'Death’s Reprieve', cost: 0, desc: 'Passive: once per descent, the King refuses your death.', target: 'self', range: 0, unlock: 80 },
    ],
  },
  {
    id: 'moths', name: 'The Mother of Moths', title: 'Lady of a Thousand Wings',
    desc: 'Goddess of dust, luck, and the beauty of brief things.',
    likes: 'Piety for descending ever deeper, and for treasures found.', color: '#d8c890',
    powers: [
      { id: 'wingblessing', name: 'Wingblessing', cost: 12, desc: 'Her wings carry you: hasted for a time.', target: 'self', range: 0, unlock: 30 },
      { id: 'dreamdust', name: 'Dust of Dreams', cost: 18, desc: 'Sleep falls on every enemy in sight.', target: 'self', range: 0, unlock: 80 },
    ],
  },
  {
    id: 'rottingchoir', name: 'The Rotting Choir', title: 'The Hymn That Festers',
    desc: 'Not one god but a congregation of them, decomposing in harmony.',
    likes: 'Piety when poisoned foes perish.', color: '#8fbf5a',
    powers: [
      { id: 'flies', name: 'Chorus of Flies', cost: 12, desc: 'Summon a swarm of corpse-flies to fight for you.', target: 'self', range: 0, unlock: 30 },
      { id: 'blight', name: 'Blight', cost: 18, desc: 'Every visible enemy is wracked with virulent poison.', target: 'self', range: 0, unlock: 80 },
    ],
  },
  {
    id: 'blacksun', name: 'The Black Sun', title: 'The Light That Devours',
    desc: 'A sun that burned so hot it burned through to the other side of light.',
    likes: 'Piety for foes consumed by fire.', color: '#ff8a3c',
    powers: [
      { id: 'solarflare', name: 'Solar Flare', cost: 14, desc: 'A detonation of black fire around you.', target: 'self', range: 0, unlock: 30 },
      { id: 'cindershield', name: 'Cinder Shield', cost: 16, desc: 'Wreathe yourself in fire that bites attackers.', target: 'self', range: 0, unlock: 80 },
    ],
  },
  {
    id: 'drowned', name: 'The Drowned One', title: 'The Tide Beneath the World',
    desc: 'It rose once, and the world learned what shorelines are for.',
    likes: 'Piety for kills made while standing in water.', color: '#4a8fc0',
    powers: [
      { id: 'undertow', name: 'Undertow', cost: 12, desc: 'Cold currents seize every visible enemy: slowed.', target: 'self', range: 0, unlock: 30 },
      { id: 'renewal', name: 'Abyssal Renewal', cost: 16, desc: 'The tide mends you, over and over.', target: 'self', range: 0, unlock: 80 },
    ],
  },
  {
    id: 'warden', name: 'The Nameless Warden', title: 'The Shield With No Face',
    desc: 'No temples, no scripture. It simply stands between.',
    likes: 'Piety for every blow you endure.', color: '#c0b090',
    powers: [
      { id: 'aegis', name: 'Aegis', cost: 12, desc: 'An unbreakable ward absorbs great harm.', target: 'self', range: 0, unlock: 30 },
      { id: 'sanctuary', name: 'Sanctuary', cost: 18, desc: 'Terror radiates outward; enemies flee your ground.', target: 'self', range: 0, unlock: 80 },
    ],
  },
];

// ============================================================ items
export interface WeaponDef { id: string; name: string; dmg: [number, number]; acc: number; tier: number; range?: number }
export const WEAPONS: WeaponDef[] = [
  { id: 'dagger', name: 'dagger', dmg: [1, 5], acc: 2, tier: 1 },
  { id: 'club', name: 'grave-club', dmg: [2, 6], acc: 0, tier: 1 },
  { id: 'shortsword', name: 'shortsword', dmg: [2, 7], acc: 1, tier: 1 },
  { id: 'spear', name: 'boneshod spear', dmg: [2, 9], acc: 0, tier: 2 },
  { id: 'mace', name: 'mace', dmg: [3, 9], acc: 0, tier: 2 },
  { id: 'longsword', name: 'longsword', dmg: [3, 11], acc: 1, tier: 3 },
  { id: 'waraxe', name: 'war axe', dmg: [3, 13], acc: -1, tier: 3 },
  { id: 'glaive', name: 'glaive', dmg: [4, 14], acc: -1, tier: 4 },
  { id: 'greatsword', name: 'greatsword', dmg: [5, 16], acc: -1, tier: 4 },
  { id: 'doommaul', name: 'doom maul', dmg: [6, 19], acc: -2, tier: 5 },
  { id: 'sunderblade', name: 'sunderblade', dmg: [6, 17], acc: 1, tier: 5 },
  { id: 'sling', name: 'leaden sling', dmg: [2, 5], acc: 1, tier: 1, range: 5 },
  { id: 'shortbow', name: 'shortbow', dmg: [2, 7], acc: 1, tier: 2, range: 6 },
  { id: 'gravebow', name: 'grave-bow', dmg: [4, 11], acc: 1, tier: 4, range: 7 },
];

export interface UniqueDef { unique: string; kind: ItemKind; id: string; plus: number; ego: string | null }
export const UNIQUES: UniqueDef[] = [
  { unique: 'Vigil', kind: 'weapon', id: 'spear', plus: 4, ego: 'flaming' },
  { unique: 'The Cartographer’s Pick', kind: 'weapon', id: 'waraxe', plus: 3, ego: 'vorpal' },
  { unique: 'Choirmail', kind: 'armor', id: 'chain', plus: 3, ego: 'warding' },
  { unique: 'The Long Evening', kind: 'weapon', id: 'gravebow', plus: 3, ego: 'frost' },
  { unique: 'Barrowband', kind: 'ring', id: 'fury', plus: 0, ego: null },
  { unique: 'The Last Candle', kind: 'amulet', id: 'leech', plus: 0, ego: null },
];

export interface ArmorDef { id: string; name: string; ac: number; evPen: number; tier: number }
export const ARMORS: ArmorDef[] = [
  { id: 'robe', name: 'tattered robe', ac: 1, evPen: 0, tier: 1 },
  { id: 'leather', name: 'leather armor', ac: 2, evPen: 0, tier: 1 },
  { id: 'ringmail', name: 'ring mail', ac: 3, evPen: -1, tier: 2 },
  { id: 'chain', name: 'chain hauberk', ac: 4, evPen: -2, tier: 3 },
  { id: 'plate', name: 'plate harness', ac: 6, evPen: -3, tier: 4 },
  { id: 'boneaegis', name: 'bonewrought aegis', ac: 8, evPen: -4, tier: 5 },
];

export interface ConsumableDef { id: string; name: string; desc: string; weight: number; minDepth?: number }
export const POTIONS: ConsumableDef[] = [
  { id: 'heal', name: 'potion of mending', desc: 'Knits flesh and bone.', weight: 30 },
  { id: 'mana', name: 'potion of the deep well', desc: 'Restores magical essence.', weight: 18 },
  { id: 'might', name: 'potion of fury', desc: 'Battle-rage: your blows strike far harder.', weight: 12 },
  { id: 'swiftness', name: 'potion of quicksilver', desc: 'The world slows around you.', weight: 10 },
  { id: 'stoneskin', name: 'potion of stone', desc: 'Your skin hardens to living granite.', weight: 10 },
  { id: 'cleansing', name: 'potion of cleansing', desc: 'Purges poison, flame and curses.', weight: 12 },
  { id: 'regen', name: 'potion of troll blood', desc: 'Wounds close with unnatural speed.', weight: 10 },
  { id: 'ichor', name: 'potion of black ichor', desc: 'Tastes of graves. You feel terrible.', weight: 6 },
];

export const SCROLLS: ConsumableDef[] = [
  { id: 'teleport', name: 'scroll of translocation', desc: 'Tears you elsewhere on this floor.', weight: 16 },
  { id: 'blink', name: 'scroll of blinking', desc: 'A short step through the dark between places.', weight: 18 },
  { id: 'mapping', name: 'scroll of the cartographer', desc: 'The floor’s secrets ink themselves into your mind.', weight: 14 },
  { id: 'enchweapon', name: 'scroll of whetting', desc: 'Your weapon drinks the ink and grows keener.', weight: 12 },
  { id: 'encharmor', name: 'scroll of warding', desc: 'Your armor drinks the ink and grows harder.', weight: 12 },
  { id: 'identify', name: 'scroll of revelation', desc: 'Names every unnamed thing you carry.', weight: 14 },
  { id: 'fear', name: 'scroll of dread', desc: 'A word that should not be read aloud. Enemies flee it.', weight: 8 },
  { id: 'immolation', name: 'scroll of immolation', desc: 'The page burns — and so does everything near you.', weight: 6 },
];

export const RINGS: ConsumableDef[] = [
  { id: 'vigor', name: 'ring of vigor', desc: '+12 maximum health.', weight: 10 },
  { id: 'shadows', name: 'ring of shadows', desc: '+3 evasion; you move like a rumor.', weight: 10 },
  { id: 'fury', name: 'ring of fury', desc: '+3 damage to every blow.', weight: 10 },
  { id: 'warding', name: 'ring of warding', desc: '+3 armor.', weight: 10 },
  { id: 'springs', name: 'ring of hidden springs', desc: 'Mana seeps back faster.', weight: 8 },
];

export const AMULETS: ConsumableDef[] = [
  { id: 'leech', name: 'amulet of the leech', desc: 'Your blows feed you.', weight: 8 },
  { id: 'clarity', name: 'amulet of clarity', desc: 'Immune to slowing and stunning.', weight: 8 },
  { id: 'graveheart', name: 'amulet of the graveheart', desc: '+20 maximum health, −1 evasion.', weight: 8 },
  { id: 'whispers', name: 'amulet of whispers', desc: 'The dark murmurs of nearby hunters (sense monsters).', weight: 6 },
];

export const WEAPON_EGOS: Record<string, string> = {
  flaming: 'of flame', venom: 'of venom', draining: 'of draining', frost: 'of the grave-wind', vorpal: 'of ruin',
};
export const ARMOR_EGOS: Record<string, string> = {
  shadows: 'of shadows', warding: 'of warding', embers: 'of embers', mire: 'of the mire', vitality: 'of vitality',
};

export const POTION_FLAVORS = [
  'murky', 'bubbling', 'viscous black', 'pale', 'luminous', 'clotted', 'smoking', 'quicksilver', 'weeping', 'humming',
];
export const SCROLL_FLAVORS = [
  'VAKTHUL NAR', 'ESH KAMMUR', 'OLM ZHERAI', 'DUN VOTHEK', 'IRRIX MOL', 'SETH ANUR', 'GHUL MAVETH', 'KOR ILUNE', 'PHAX OMMOR', 'NUL RETHIS',
];
export const RING_FLAVORS = ['jet', 'coral', 'bone', 'meteoric iron', 'tarnished silver', 'verdigris', 'knucklebone', 'obsidian'];
export const AMULET_FLAVORS = ['moth-wing', 'salt-crusted', 'weeping bronze', 'toothed', 'hollow gold', 'braided hair'];

// ============================================================ monsters
const M = (m: MonsterDef) => m;
export const MONSTERS: MonsterDef[] = [
  // ---- Mossgrave Catacombs (1-4)
  M({ id: 'graverat', name: 'grave rat', glyph: 'r', color: '#9a8878', depth: [1, 3], weight: 30, hp: 4, dmg: [1, 3], acc: 2, ev: 4, ac: 0, speed: 12, xp: 2, pack: [2, 4], flavor: 'Fat on things best not considered.' }),
  M({ id: 'shambler', mindless: true, name: 'rotting shambler', glyph: 'z', color: '#7d9a62', depth: [1, 4], weight: 26, hp: 9, dmg: [2, 5], acc: 1, ev: 0, ac: 1, speed: 7, xp: 4, resist: ['poison', 'necro'], flavor: 'It remembers doors, dimly.' }),
  M({ id: 'skelhound', mindless: true, name: 'skeletal hound', glyph: 'h', color: '#cfc6b0', depth: [1, 4], weight: 22, hp: 8, dmg: [2, 5], acc: 3, ev: 6, ac: 1, speed: 13, xp: 5, resist: ['necro', 'poison'], flavor: 'Still loyal. To what, unclear.' }),
  M({ id: 'tombspider', name: 'tomb spider', glyph: 's', color: '#6fbf4a', depth: [2, 5], weight: 20, hp: 7, dmg: [1, 4], acc: 3, ev: 8, ac: 0, speed: 11, xp: 6, onHit: { kind: 'poison', power: 2, turns: 4, chance: 0.5 }, flavor: 'Webs woven from shrouds.' }),
  M({ id: 'gloombat', name: 'gloom bat', glyph: 'b', color: '#8a7ca8', depth: [1, 5], weight: 16, hp: 5, dmg: [1, 3], acc: 4, ev: 12, ac: 0, speed: 16, xp: 4, flavor: 'A scrap of night with teeth.' }),
  M({ id: 'bonearcher', mindless: true, name: 'ossuary archer', glyph: 'k', color: '#c8b890', depth: [2, 5], weight: 16, hp: 8, dmg: [1, 4], acc: 2, ev: 4, ac: 2, speed: 10, xp: 7, resist: ['necro', 'poison'], ranged: { name: 'bone shaft', dmg: [2, 6], type: 'phys', range: 6, color: '#d8cfba', chance: 0.65 }, flavor: 'Its quiver is its own ribcage.' }),
  M({ id: 'cairnwight', name: 'cairn wight', glyph: 'w', color: '#a8b8d0', depth: [3, 6], weight: 14, hp: 14, dmg: [2, 6], acc: 3, ev: 4, ac: 2, speed: 9, xp: 10, drain: true, resist: ['necro', 'cold', 'poison'], flavor: 'It wears its barrow like a crown.' }),
  M({ id: 'gravedigger', name: 'mad gravedigger', glyph: '@', color: '#b09068', depth: [2, 5], weight: 12, hp: 12, dmg: [3, 7], acc: 2, ev: 3, ac: 1, speed: 10, xp: 8, flavor: 'He dug too many. Then he dug one for himself and climbed out changed.' }),
  M({ id: 'ossuaryshepherd', name: 'The Ossuary Shepherd', glyph: 'Z', color: '#e8d8a8', depth: [4, 4], weight: 0, hp: 48, dmg: [3, 8], acc: 5, ev: 4, ac: 4, speed: 10, xp: 60, boss: true, sleepless: true, resist: ['necro', 'poison', 'cold'], summon: { id: 'skelhound', count: 2, chance: 0.25 }, flavor: 'It gathers the scattered dead and teaches them to walk in flocks.' }),
  // ---- Fungal Weald (5-9)
  M({ id: 'myconid', mindless: true, name: 'myconid drifter', glyph: 'f', color: '#b8a8d8', depth: [5, 8], weight: 24, hp: 12, dmg: [2, 6], acc: 2, ev: 2, ac: 1, speed: 7, xp: 8, onHit: { kind: 'poison', power: 2, turns: 3, chance: 0.35 }, flavor: 'It dreams standing up.' }),
  M({ id: 'sporehulk', mindless: true, name: 'spore hulk', glyph: 'F', color: '#9ad4a0', depth: [6, 9], weight: 16, hp: 26, dmg: [4, 10], acc: 2, ev: 0, ac: 3, speed: 7, xp: 16, resist: ['poison'], flavor: 'A walking hillside of fruiting bodies.' }),
  M({ id: 'caveleech', name: 'cave leech', glyph: 'l', color: '#c05a6a', depth: [5, 9], weight: 18, hp: 14, dmg: [2, 6], acc: 3, ev: 3, ac: 0, speed: 8, xp: 9, drain: true, amphibious: true, flavor: 'It has opinions about your blood.' }),
  M({ id: 'fungalzombie', mindless: true, name: 'sporebound corpse', glyph: 'z', color: '#8fbf8a', depth: [5, 9], weight: 22, hp: 16, dmg: [3, 7], acc: 1, ev: 0, ac: 1, speed: 6, xp: 10, resist: ['poison', 'necro'], pack: [1, 3], flavor: 'The fungus wears it politely.' }),
  M({ id: 'glowmoth', name: 'glowmoth swarm', glyph: 'm', color: '#e8d890', depth: [5, 9], weight: 14, hp: 8, dmg: [1, 4], acc: 5, ev: 12, ac: 0, speed: 15, xp: 6, pack: [2, 3], flavor: 'Beautiful. Hungry. Mostly hungry.' }),
  M({ id: 'venomcrawler', name: 'venom crawler', glyph: 's', color: '#5ad45a', depth: [6, 10], weight: 16, hp: 15, dmg: [3, 7], acc: 4, ev: 7, ac: 1, speed: 12, xp: 12, onHit: { kind: 'poison', power: 3, turns: 5, chance: 0.6 }, flavor: 'Its footsteps blister stone.' }),
  M({ id: 'sporecaller', name: 'sporecaller shaman', glyph: 'f', color: '#d0b0ff', depth: [7, 10], weight: 10, hp: 18, dmg: [2, 5], acc: 2, ev: 4, ac: 1, speed: 9, xp: 15, summon: { id: 'myconid', count: 1, chance: 0.3 }, ranged: { name: 'spore burst', dmg: [2, 7], type: 'poison', range: 6, color: '#9ad4a0', chance: 0.5 }, flavor: 'The Weald speaks through its many mouths.' }),
  M({ id: 'deeptroll', name: 'deep troll', glyph: 'T', color: '#7a9a8a', depth: [7, 11], weight: 10, hp: 32, dmg: [5, 12], acc: 3, ev: 2, ac: 3, speed: 9, xp: 22, regen: true, flavor: 'Cut it and count to ten; the cut is gone, and it is angry.' }),
  M({ id: 'mycelialtyrant', name: 'The Mycelial Tyrant', glyph: 'F', color: '#e0c8ff', depth: [9, 9], weight: 0, hp: 110, dmg: [5, 12], acc: 5, ev: 2, ac: 5, speed: 8, xp: 140, boss: true, sleepless: true, resist: ['poison'], summon: { id: 'myconid', count: 2, chance: 0.3 }, onHit: { kind: 'poison', power: 3, turns: 5, chance: 0.5 }, flavor: 'Every fungus in the Weald is one flesh, and this is its fist.' }),
  // ---- Drowned Cloister (10-14)
  M({ id: 'drownedacolyte', name: 'drowned acolyte', glyph: 'p', color: '#7ab0d0', depth: [10, 14], weight: 24, hp: 22, dmg: [4, 9], acc: 3, ev: 4, ac: 2, speed: 9, xp: 16, amphibious: true, pack: [1, 3], resist: ['cold'], flavor: 'Still clutching its hymnal. The pages are pulp.' }),
  M({ id: 'paleeel', name: 'pale eel', glyph: 'e', color: '#c8d8e0', depth: [10, 14], weight: 16, hp: 18, dmg: [4, 10], acc: 4, ev: 8, ac: 0, speed: 13, xp: 15, amphibious: true, onHit: { kind: 'slow', power: 1, turns: 4, chance: 0.35 }, flavor: 'White as a drowned moon. Its bite carries the cold of the deep.' }),
  M({ id: 'choirwraith', name: 'choir wraith', glyph: 'W', color: '#a0c0e8', depth: [10, 14], weight: 14, hp: 20, dmg: [3, 8], acc: 4, ev: 8, ac: 1, speed: 10, xp: 20, drain: true, resist: ['necro', 'cold', 'poison'], ranged: { name: 'dirge', dmg: [3, 9], type: 'necro', range: 6, color: '#a0c0e8', chance: 0.55 }, flavor: 'Its verse ends every listener.' }),
  M({ id: 'barnaclegolem', mindless: true, name: 'barnacle golem', glyph: 'G', color: '#80a090', depth: [11, 15], weight: 12, hp: 40, dmg: [6, 13], acc: 2, ev: 0, ac: 6, speed: 6, xp: 26, amphibious: true, resist: ['poison', 'cold'], onHit: { kind: 'stun', power: 1, turns: 2, chance: 0.2 }, flavor: 'The cloister’s statuary, crusted and ambulatory. Its fists ring like bells.' }),
  M({ id: 'siren', name: 'siren of the deep', glyph: 'n', color: '#d0a0d8', depth: [11, 15], weight: 10, hp: 24, dmg: [3, 8], acc: 4, ev: 7, ac: 1, speed: 10, xp: 22, amphibious: true, onHit: { kind: 'weak', power: 2, turns: 6, chance: 0.4 }, flavor: 'Her song unstitches your resolve.' }),
  M({ id: 'drownedknight', name: 'drowned knight', glyph: 'p', color: '#90b8c8', depth: [12, 16], weight: 12, hp: 34, dmg: [6, 13], acc: 4, ev: 3, ac: 5, speed: 9, xp: 28, amphibious: true, resist: ['cold'], flavor: 'Rust and duty, in that order.' }),
  M({ id: 'shadow', name: 'shadow', glyph: 'x', color: '#6a5a8a', depth: [10, 17], weight: 12, hp: 18, dmg: [3, 8], acc: 5, ev: 12, ac: 0, speed: 12, xp: 18, drain: true, resist: ['necro', 'cold', 'poison'], flavor: 'Yours, perhaps, come loose.' }),
  M({ id: 'drownedcardinal', name: 'The Drowned Cardinal', glyph: 'P', color: '#b0e0f0', depth: [14, 14], weight: 0, hp: 190, dmg: [7, 15], acc: 6, ev: 4, ac: 6, speed: 9, xp: 300, boss: true, sleepless: true, amphibious: true, resist: ['cold', 'necro'], summon: { id: 'drownedacolyte', count: 2, chance: 0.3 }, ranged: { name: 'baptism of the deep', dmg: [5, 12], type: 'cold', range: 7, color: '#7ad0f0', chance: 0.5 }, flavor: 'He baptized his flock in the flood, and none of them ever surfaced.' }),
  // ---- Ember Fathoms (15-19)
  M({ id: 'cinderimp', name: 'cinder imp', glyph: 'i', color: '#ff9a4a', depth: [15, 19], weight: 22, hp: 20, dmg: [3, 8], acc: 5, ev: 9, ac: 1, speed: 13, xp: 20, resist: ['fire'], vuln: ['cold'], ranged: { name: 'spark', dmg: [3, 9], type: 'fire', range: 5, color: '#ffb060', chance: 0.6 }, pack: [1, 3], flavor: 'A tantrum given wings.' }),
  M({ id: 'magmacrawler', name: 'magma crawler', glyph: 's', color: '#ff6a2a', depth: [15, 19], weight: 18, hp: 34, dmg: [6, 13], acc: 3, ev: 2, ac: 4, speed: 8, xp: 26, resist: ['fire'], onHit: { kind: 'burn', power: 3, turns: 3, chance: 0.5 }, flavor: 'It swims in stone the way you drown in it.' }),
  M({ id: 'ashrevenant', name: 'ash revenant', glyph: 'W', color: '#d0c0b0', depth: [15, 19], weight: 14, hp: 30, dmg: [5, 11], acc: 5, ev: 8, ac: 2, speed: 11, xp: 30, drain: true, resist: ['fire', 'necro'], flavor: 'What remains when a pyre dreams of revenge.' }),
  M({ id: 'embercultist', name: 'ember cultist', glyph: 'p', color: '#e08050', depth: [15, 19], weight: 16, hp: 28, dmg: [4, 9], acc: 4, ev: 4, ac: 2, speed: 10, xp: 26, resist: ['fire'], ranged: { name: 'black flame', dmg: [5, 12], type: 'fire', range: 6, color: '#ff5a1f', chance: 0.55 }, pack: [1, 2], flavor: 'They pray with lit matches for tongues.' }),
  M({ id: 'pyrehound', name: 'pyre hound', glyph: 'h', color: '#ff8a3c', depth: [15, 19], weight: 16, hp: 26, dmg: [5, 11], acc: 5, ev: 7, ac: 1, speed: 14, xp: 26, resist: ['fire'], onHit: { kind: 'burn', power: 2, turns: 3, chance: 0.4 }, pack: [1, 2], flavor: 'It fetches. What it fetches is you.' }),
  M({ id: 'obsidiangolem', mindless: true, name: 'obsidian golem', glyph: 'G', color: '#6a5a66', depth: [16, 20], weight: 10, hp: 55, dmg: [8, 16], acc: 3, ev: 0, ac: 8, speed: 6, xp: 40, resist: ['fire', 'poison', 'necro'], flavor: 'Volcanic glass, load-bearing hatred.' }),
  M({ id: 'flamedjinn', name: 'flame djinn', glyph: 'J', color: '#ffb040', depth: [17, 20], weight: 8, hp: 44, dmg: [6, 13], acc: 5, ev: 8, ac: 2, speed: 11, xp: 45, resist: ['fire'], vuln: ['cold'], ranged: { name: 'gout of flame', dmg: [6, 14], type: 'fire', range: 7, color: '#ffcc60', chance: 0.55 }, flavor: 'It grants one wish: incineration.' }),
  M({ id: 'kilntyrant', name: 'The Kiln Tyrant', glyph: 'J', color: '#ffd070', depth: [19, 19], weight: 0, hp: 280, dmg: [9, 18], acc: 7, ev: 4, ac: 8, speed: 10, xp: 600, boss: true, sleepless: true, resist: ['fire', 'poison'], vuln: ['cold'], summon: { id: 'cinderimp', count: 2, chance: 0.3 }, ranged: { name: 'furnace breath', dmg: [7, 16], type: 'fire', range: 7, color: '#ffd070', chance: 0.5 }, onHit: { kind: 'burn', power: 4, turns: 4, chance: 0.5 }, flavor: 'The forge-god’s apprentice, left too long at the bellows.' }),
  // ---- Unlight Throne (20)
  M({ id: 'voidspawn', name: 'voidspawn', glyph: 'x', color: '#9a7ae8', depth: [20, 20], weight: 20, hp: 36, dmg: [6, 13], acc: 6, ev: 10, ac: 2, speed: 12, xp: 40, resist: ['necro', 'cold'], flavor: 'A hole in the world, ambulatory and curious.' }),
  M({ id: 'unlightherald', name: 'herald of unlight', glyph: 'A', color: '#c0a0ff', depth: [20, 20], weight: 14, hp: 50, dmg: [7, 14], acc: 6, ev: 6, ac: 4, speed: 10, xp: 60, drain: true, resist: ['necro', 'cold', 'poison'], ranged: { name: 'ray of absence', dmg: [6, 14], type: 'necro', range: 7, color: '#b090ff', chance: 0.5 }, flavor: 'It announces what cannot be described.' }),
  M({ id: 'sovereign', name: 'The Unlight Sovereign', glyph: '&', color: '#d8b8ff', depth: [20, 20], weight: 0, hp: 444, dmg: [10, 21], acc: 8, ev: 6, ac: 9, speed: 11, xp: 0, boss: true, sleepless: true, resist: ['necro', 'cold', 'poison', 'fire'], summon: { id: 'voidspawn', count: 2, chance: 0.3 }, ranged: { name: 'unlight', dmg: [8, 18], type: 'necro', range: 8, color: '#d8b8ff', chance: 0.5 }, drain: true, flavor: 'Before the first candle, it reigned. It intends to again.' }),
  // ---- The Ossuary (branch, ~depth 4-6)
  M({ id: 'boneswarm', mindless: true, name: 'bone swarm', glyph: 'k', color: '#d8d0b8', depth: [5, 6], weight: 26, hp: 7, dmg: [1, 4], acc: 3, ev: 9, ac: 0, speed: 14, xp: 6, pack: [2, 3], branch: 'ossuary', sleepless: true, resist: ['necro', 'poison'], flavor: 'Misfiled remains, moving as one furious clerical error.' }),
  M({ id: 'marrowwight', name: 'marrow wight', glyph: 'w', color: '#c8c0d8', depth: [5, 6], weight: 18, hp: 15, dmg: [3, 8], acc: 4, ev: 4, ac: 2, speed: 9, xp: 14, drain: true, branch: 'ossuary', resist: ['necro', 'cold', 'poison'], flavor: 'It reads the marrow of the living like a borrowed book — and never returns what it takes.' }),
  M({ id: 'ossuarycolossus', name: 'ossuary colossus', glyph: 'G', color: '#e0d8c0', depth: [5, 6], weight: 10, hp: 34, dmg: [6, 12], acc: 3, ev: 0, ac: 5, speed: 6, xp: 22, branch: 'ossuary', resist: ['necro', 'poison'], flavor: 'Ten thousand catalogued femurs, filed under WRATH.' }),
  M({ id: 'charnelbride', name: 'The Charnel Bride', glyph: 'W', color: '#f0e8d8', depth: [6, 6], weight: 0, hp: 85, dmg: [5, 11], acc: 5, ev: 6, ac: 3, speed: 10, xp: 120, boss: true, sleepless: true, drain: true, branch: 'ossuary', resist: ['necro', 'cold', 'poison'], summon: { id: 'boneswarm', count: 2, chance: 0.3 }, ranged: { name: 'bridal dirge', dmg: [4, 10], type: 'necro', range: 6, color: '#f0e8d8', chance: 0.5 }, flavor: 'She was promised to death, and death, for once, kept its word. She has curated the Ossuary ever since her honeymoon.' }),
  // ---- The Silkfen (branch, ~depth 8-9)
  M({ id: 'silkstalker', name: 'silk stalker', glyph: 's', color: '#e8e8f0', depth: [9, 10], weight: 24, hp: 16, dmg: [3, 8], acc: 5, ev: 11, ac: 1, speed: 14, xp: 14, branch: 'silkfen', flavor: 'You will hear it exactly once, and that will be the end of the hearing.' }),
  M({ id: 'webweaver', name: 'web weaver', glyph: 's', color: '#c0b8d8', depth: [9, 10], weight: 18, hp: 20, dmg: [2, 6], acc: 4, ev: 6, ac: 1, speed: 10, xp: 16, branch: 'silkfen', onHit: { kind: 'slow', power: 1, turns: 5, chance: 0.5 }, ranged: { name: 'thrown silk', dmg: [2, 5], type: 'phys', range: 5, color: '#e8e8f0', chance: 0.5 }, flavor: 'Its silk is measured to your stride. It has been expecting you for some time.' }),
  M({ id: 'broodling', name: 'broodling', glyph: 's', color: '#a8d0a0', depth: [9, 10], weight: 22, hp: 9, dmg: [2, 5], acc: 4, ev: 8, ac: 0, speed: 13, xp: 7, pack: [2, 4], branch: 'silkfen', onHit: { kind: 'poison', power: 2, turns: 4, chance: 0.4 }, flavor: 'Mother says: eat your visitors.' }),
  M({ id: 'mothersilk', name: 'Mother-of-Silk', glyph: 's', color: '#f0f0f8', depth: [10, 10], weight: 0, hp: 150, dmg: [6, 13], acc: 6, ev: 7, ac: 4, speed: 12, xp: 220, boss: true, sleepless: true, branch: 'silkfen', summon: { id: 'broodling', count: 2, chance: 0.35 }, onHit: { kind: 'slow', power: 1, turns: 6, chance: 0.6 }, ranged: { name: 'binding silk', dmg: [3, 8], type: 'phys', range: 6, color: '#f0f0f8', chance: 0.5 }, flavor: 'She has wrapped and kept every delver who ever entered her larder. She does not think of it as murder. She thinks of it as preserving.' }),
  // ---- The Vault of Chains (branch, ~depth 13-16)
  M({ id: 'chainedpenitent', name: 'chained penitent', glyph: 'p', color: '#9aa4b8', depth: [14, 16], weight: 24, hp: 30, dmg: [5, 11], acc: 4, ev: 3, ac: 4, speed: 9, xp: 24, pack: [1, 2], branch: 'chains', flavor: 'It drags its sentence behind it, link by link. It would very much like to share the weight.' }),
  M({ id: 'gaolwraith', name: 'gaol wraith', glyph: 'W', color: '#8a94b0', depth: [14, 16], weight: 16, hp: 28, dmg: [4, 10], acc: 5, ev: 9, ac: 1, speed: 11, xp: 28, drain: true, branch: 'chains', resist: ['necro', 'cold', 'poison'], ranged: { name: 'sentence', dmg: [4, 11], type: 'necro', range: 6, color: '#8a94b0', chance: 0.5 }, flavor: 'A warden that outlived its prison, or a prisoner that outlived its warden. The keys do not care which.' }),
  M({ id: 'ironwarden', mindless: true, name: 'iron warden', glyph: 'G', color: '#b8bcc8', depth: [14, 16], weight: 12, hp: 48, dmg: [7, 14], acc: 4, ev: 0, ac: 9, speed: 6, xp: 38, branch: 'chains', resist: ['fire', 'poison', 'necro'], onHit: { kind: 'stun', power: 1, turns: 2, chance: 0.25 }, flavor: 'Armor with no occupant and no vacancy.' }),
  M({ id: 'gaoler', name: 'The Gaoler', glyph: 'P', color: '#c8d0e0', depth: [16, 16], weight: 0, hp: 240, dmg: [8, 16], acc: 7, ev: 4, ac: 8, speed: 9, xp: 400, boss: true, sleepless: true, branch: 'chains', resist: ['cold', 'necro', 'poison'], summon: { id: 'chainedpenitent', count: 2, chance: 0.3 }, onHit: { kind: 'stun', power: 1, turns: 2, chance: 0.35 }, ranged: { name: 'cast chains', dmg: [6, 13], type: 'phys', range: 6, color: '#c8d0e0', chance: 0.5 }, flavor: 'Every cell in the Vault was filled the day it opened, and it has never once recorded a release. Its ledger is bound in warden-leather.' }),
  // ---- The Wax Garden (branch, ~depth 4-6)
  M({ id: 'waxwretch', mindless: true, name: 'wax wretch', glyph: 'z', color: '#e8d8a8', depth: [5, 6], weight: 26, hp: 12, dmg: [2, 6], acc: 2, ev: 2, ac: 2, speed: 7, xp: 8, branch: 'waxgarden', resist: ['cold'], vuln: ['fire'], flavor: 'A votary who stood vigil too close, too long. The wax preserved everything but the shape.' }),
  M({ id: 'tallowhound', name: 'tallow hound', glyph: 'h', color: '#e0c890', depth: [5, 6], weight: 20, hp: 14, dmg: [3, 7], acc: 4, ev: 6, ac: 1, speed: 12, xp: 10, branch: 'waxgarden', onHit: { kind: 'burn', power: 2, turns: 3, chance: 0.4 }, pack: [1, 2], flavor: 'It carries a lit wick in its spine. The Garden uses them to relight what the draughts take.' }),
  M({ id: 'flickerwisp', name: 'flickerwisp', glyph: 'x', color: '#ffe8a0', depth: [5, 6], weight: 18, hp: 8, dmg: [1, 4], acc: 5, ev: 12, ac: 0, speed: 15, xp: 8, branch: 'waxgarden', resist: ['fire'], ranged: { name: 'spat flame', dmg: [2, 5], type: 'fire', range: 5, color: '#ffe8a0', chance: 0.5 }, flavor: 'A candleflame that got ambitions. It remembers which candle it left, and intends to come back important.' }),
  M({ id: 'vestal', name: 'The Vestal of Tallow', glyph: 'p', color: '#f0e0b0', depth: [6, 6], weight: 0, hp: 90, dmg: [4, 9], acc: 5, ev: 5, ac: 3, speed: 10, xp: 130, boss: true, sleepless: true, branch: 'waxgarden', resist: ['fire', 'cold'], summon: { id: 'flickerwisp', count: 2, chance: 0.3 }, ranged: { name: 'molten benediction', dmg: [4, 10], type: 'fire', range: 6, color: '#f0d890', chance: 0.5 }, onHit: { kind: 'burn', power: 3, turns: 3, chance: 0.4 }, flavor: 'She lit the first candle the night the sun went missing, and swore none would gutter until it returned. The wax has risen past her waist. She considers this progress.' }),
  // ---- The Roots (branch, ~depth 8-9)
  M({ id: 'rootcrawler', mindless: true, name: 'root crawler', glyph: 's', color: '#a08858', depth: [9, 10], weight: 24, hp: 22, dmg: [3, 8], acc: 3, ev: 4, ac: 3, speed: 8, xp: 14, branch: 'roots', resist: ['poison'], flavor: 'A knot of root that learned locomotion by strangling things that had it.' }),
  M({ id: 'mournwillow', mindless: true, name: 'mourn-willow', glyph: 'T', color: '#8aa060', depth: [9, 10], weight: 14, hp: 36, dmg: [5, 11], acc: 3, ev: 1, ac: 3, speed: 7, xp: 22, branch: 'roots', regen: true, resist: ['poison'], vuln: ['fire'], flavor: 'The elves planted willows on every grave. The willows took the assignment personally.' }),
  M({ id: 'sapwraith', name: 'sap wraith', glyph: 'W', color: '#b0c078', depth: [9, 10], weight: 18, hp: 20, dmg: [3, 8], acc: 4, ev: 8, ac: 1, speed: 11, xp: 16, drain: true, branch: 'roots', resist: ['poison', 'necro'], ranged: { name: 'weeping sap', dmg: [3, 8], type: 'poison', range: 5, color: '#b0c078', chance: 0.5 }, flavor: 'Tree-blood with a grievance. It remembers being tapped.' }),
  M({ id: 'taproot', name: 'The Taproot', glyph: 'T', color: '#c0d080', depth: [10, 10], weight: 0, hp: 160, dmg: [6, 13], acc: 5, ev: 2, ac: 5, speed: 8, xp: 230, boss: true, sleepless: true, regen: true, branch: 'roots', resist: ['poison'], vuln: ['fire'], summon: { id: 'rootcrawler', count: 2, chance: 0.3 }, onHit: { kind: 'poison', power: 3, turns: 5, chance: 0.5 }, flavor: 'The buried forests elected a single root to keep digging, and fed it everything they had. It has been reaching downward for nine generations. Ask yourself what a forest wants with the bottom of the world.' }),
  // ---- The Mirror Cistern (branch, ~depth 13-16)
  M({ id: 'mirrorshade', name: 'mirror-shade', glyph: 'x', color: '#c8e0f0', depth: [14, 16], weight: 22, hp: 24, dmg: [4, 10], acc: 6, ev: 12, ac: 0, speed: 12, xp: 26, drain: true, branch: 'cistern', resist: ['cold', 'necro'], flavor: 'A reflection that noticed nobody was checking. It holds your outline like a borrowed coat it is thinking of keeping.' }),
  M({ id: 'glassgolem', mindless: true, name: 'glass golem', glyph: 'G', color: '#d8ecf8', depth: [14, 16], weight: 12, hp: 44, dmg: [7, 14], acc: 4, ev: 2, ac: 7, speed: 7, xp: 34, branch: 'cistern', resist: ['cold', 'poison'], onHit: { kind: 'weak', power: 2, turns: 5, chance: 0.3 }, flavor: 'The Cistern grows them like the Cloister grew saints. Every surface of it shows you at a worse angle.' }),
  M({ id: 'stillwatcher', name: 'still-watcher', glyph: 'e', color: '#a8c8d8', depth: [14, 16], weight: 18, hp: 30, dmg: [5, 11], acc: 5, ev: 7, ac: 1, speed: 12, xp: 28, amphibious: true, branch: 'cistern', onHit: { kind: 'slow', power: 1, turns: 4, chance: 0.4 }, resist: ['cold'], flavor: 'It floats just beneath the mirror-surface, matching your face until it is sure of the fit.' }),
  M({ id: 'reflection', name: 'The Pale Reflection', glyph: 'P', color: '#e8f4ff', depth: [16, 16], weight: 0, hp: 250, dmg: [8, 16], acc: 7, ev: 8, ac: 5, speed: 11, xp: 420, boss: true, sleepless: true, drain: true, branch: 'cistern', amphibious: true, resist: ['cold', 'necro'], summon: { id: 'mirrorshade', count: 2, chance: 0.3 }, ranged: { name: 'your own face', dmg: [6, 14], type: 'cold', range: 7, color: '#e8f4ff', chance: 0.5 }, onHit: { kind: 'weak', power: 2, turns: 6, chance: 0.4 }, flavor: 'Every delver who ever bent over the Cistern to drink left one behind. It has collected thousands of faces, and it wears the ones that got furthest. When it turns to you, you will recognize the expression. It is yours, from the day you decided to descend.' }),
  // ---- summons / allies
  M({ id: 'skelservant', mindless: true, name: 'skeletal servant', glyph: 'k', color: '#e8e0c8', depth: [1, 20], weight: 0, hp: 16, dmg: [3, 8], acc: 4, ev: 4, ac: 2, speed: 10, xp: 0, sleepless: true, resist: ['necro', 'poison'], flavor: 'Bound to your will, rattling with enthusiasm.' }),
  M({ id: 'corpseflies', mindless: true, name: 'swarm of corpse-flies', glyph: 'm', color: '#a0b060', depth: [1, 20], weight: 0, hp: 12, dmg: [2, 6], acc: 5, ev: 12, ac: 0, speed: 14, xp: 0, sleepless: true, onHit: { kind: 'poison', power: 2, turns: 3, chance: 0.5 }, flavor: 'The Choir’s smallest chorus.' }),
];

export const MONSTER_BY_ID = new Map(MONSTERS.map((m) => [m.id, m]));

export const BOSS_FLOORS: Record<number, string> = {
  4: 'ossuaryshepherd',
  9: 'mycelialtyrant',
  14: 'drownedcardinal',
  19: 'kilntyrant',
  20: 'sovereign',
};

// ============================================================ item generation & naming
export interface Identify {
  known: Set<string>;
  potionFlavor: Map<string, string>;
  scrollFlavor: Map<string, string>;
  ringFlavor: Map<string, string>;
  amuletFlavor: Map<string, string>;
}

export function makeIdentify(rng: RNG): Identify {
  const pf = rng.shuffle(POTION_FLAVORS);
  const sf = rng.shuffle(SCROLL_FLAVORS);
  const rf = rng.shuffle(RING_FLAVORS);
  const af = rng.shuffle(AMULET_FLAVORS);
  return {
    known: new Set(['potion:heal', 'scroll:blink']),
    potionFlavor: new Map(POTIONS.map((p, i) => [p.id, pf[i % pf.length]])),
    scrollFlavor: new Map(SCROLLS.map((s, i) => [s.id, sf[i % sf.length]])),
    ringFlavor: new Map(RINGS.map((r, i) => [r.id, rf[i % rf.length]])),
    amuletFlavor: new Map(AMULETS.map((a, i) => [a.id, af[i % af.length]])),
  };
}

export function itemGlyph(it: Item): [string, string] {
  switch (it.kind) {
    case 'weapon': return [')', it.ego ? '#e0a050' : '#b8b0c8'];
    case 'armor': return ['[', it.ego ? '#e0a050' : '#9ab0a0'];
    case 'potion': return ['!', '#d05a8a'];
    case 'scroll': return ['?', '#d8cfba'];
    case 'ring': return ['=', '#c9a24b'];
    case 'amulet': return ['"', '#8a6cf0'];
    case 'gold': return ['$', '#ffd700'];
  }
}

export function itemName(it: Item, ident: Identify): string {
  if (it.unique) return it.unique;
  const plus = (p: number) => (p > 0 ? `+${p} ` : p < 0 ? `${p} ` : '');
  switch (it.kind) {
    case 'weapon': {
      const d = WEAPONS.find((w) => w.id === it.id)!;
      return `${plus(it.plus)}${d.name}${it.ego ? ' ' + WEAPON_EGOS[it.ego] : ''}`;
    }
    case 'armor': {
      const d = ARMORS.find((a) => a.id === it.id)!;
      return `${plus(it.plus)}${d.name}${it.ego ? ' ' + ARMOR_EGOS[it.ego] : ''}`;
    }
    case 'potion': {
      if (ident.known.has('potion:' + it.id)) return POTIONS.find((p) => p.id === it.id)!.name;
      return `${ident.potionFlavor.get(it.id)} draught`;
    }
    case 'scroll': {
      if (ident.known.has('scroll:' + it.id)) return SCROLLS.find((s) => s.id === it.id)!.name;
      return `scroll "${ident.scrollFlavor.get(it.id)}"`;
    }
    case 'ring': {
      if (ident.known.has('ring:' + it.id)) return RINGS.find((r) => r.id === it.id)!.name;
      return `${ident.ringFlavor.get(it.id)} ring`;
    }
    case 'amulet': {
      if (ident.known.has('amulet:' + it.id)) return AMULETS.find((a) => a.id === it.id)!.name;
      return `${ident.amuletFlavor.get(it.id)} amulet`;
    }
    case 'gold': return `${it.qty} gold`;
  }
}

export function mkItem(kind: ItemKind, id: string, opts: Partial<Item> = {}): Item {
  return { kind, id, qty: 1, plus: 0, ego: null, x: -1, y: -1, ...opts };
}

export function genItem(depth: number, rng: RNG, luck = 0, uniques?: Set<string>): Item {
  if (uniques && rng.chance(0.015 + depth * 0.0035)) {
    const pool = UNIQUES.filter((u) => !uniques.has(u.unique));
    if (pool.length) {
      const u = rng.pick(pool);
      uniques.add(u.unique);
      return { ...mkItem(u.kind, u.id, { plus: u.plus, ego: u.ego }), unique: u.unique };
    }
  }
  const kind = rng.weighted<ItemKind>([
    ['potion', 30], ['scroll', 22], ['weapon', 16], ['armor', 16], ['ring', 8], ['amulet', 5], ['gold', 14],
  ]);
  const tierCap = Math.min(5, 1 + Math.floor((depth + luck) / 4));
  const q = (depth + luck) / MAX_DEPTH;
  switch (kind) {
    case 'gold':
      return mkItem('gold', 'gold', { qty: rng.int(4, 10 + depth * 4) });
    case 'potion':
      return mkItem('potion', rng.weighted(POTIONS.map((p) => [p.id, p.weight] as const)));
    case 'scroll':
      return mkItem('scroll', rng.weighted(SCROLLS.map((s) => [s.id, s.weight] as const)));
    case 'ring':
      return mkItem('ring', rng.weighted(RINGS.map((r) => [r.id, r.weight] as const)));
    case 'amulet':
      return mkItem('amulet', rng.weighted(AMULETS.map((a) => [a.id, a.weight] as const)));
    case 'weapon': {
      const pool = WEAPONS.filter((w) => w.tier <= tierCap);
      const w = rng.pick(pool);
      const plus = Math.max(0, rng.int(-2, Math.floor(q * 6)));
      const ego = rng.chance(0.12 + q * 0.18) ? rng.pick(Object.keys(WEAPON_EGOS)) : null;
      return mkItem('weapon', w.id, { plus, ego });
    }
    case 'armor': {
      const pool = ARMORS.filter((a) => a.tier <= tierCap);
      const a = rng.pick(pool);
      const plus = Math.max(0, rng.int(-2, Math.floor(q * 5)));
      const ego = rng.chance(0.1 + q * 0.16) ? rng.pick(Object.keys(ARMOR_EGOS)) : null;
      return mkItem('armor', a.id, { plus, ego });
    }
  }
}
