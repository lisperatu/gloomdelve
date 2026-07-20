# STAGED: Branch pair 4 + sub-branch architecture (v0.4)

Status: DESIGN COMPLETE, integration blocked until the tuning agent releases
`data.ts` and the puzzle-objects agent releases `game.ts`/`dungeon.ts`.
Everything below is written to be pasted with minimal adaptation.
Standing rule honored: each branch is a bizarre SITUATION, not a theme.
User directives honored: sub-branches of a different kind; different in every
way — palette, generator, creatures, sounds, rewards.

---

## 1. Sub-branch architecture (game.ts / data.ts / dungeon.ts)

### data.ts — BranchDef gains two optional fields
```ts
export interface BranchDef {
  // ...existing...
  parent?: string;   // id of parent branch — gate appears INSIDE that branch
  entryPos?: number; // 0-based parent level where the gate appears
}
```
Sub-branches are excluded from BRANCH_PAIRS and from spine gate placement
(`!b.parent` filter). They are placed by `generateLevel` when
`opts.branch.id === child.parent && opts.branchPos === child.entryPos`.
Alignment with puzzle-objects agent: where a puzzle object exists on that
floor, the sub-branch gate should START SEALED and be opened by solving it
(mechanism: tile flip to T.BranchDown + `gates.set(i, childId)`); if no
puzzle object is present, place the gate open. Integration detail to settle
with that agent's final API.

### game.ts — branch scalar → branch stack
```ts
branchStack: { id: string; pos: number }[] = [];
get branch(): string | null { return this.branchStack.at(-1)?.id ?? null; }
get branchPos(): number { return this.branchStack.at(-1)?.pos ?? 0; }
```
All `this.branch = x` / `this.branchPos = n` writes become push/pop/mutate of
the top entry (grep call sites; there are ~12). Methods:
- `enterBranch(id)` → `branchStack.push({id, pos: 0})` (works from spine OR from inside a branch)
- `advanceBranch()` → `top.pos++`
- `climb()` in branch → `top.pos--` (pos 0 keeps the sealed-gate message)
- `exitBranch()` → pops ONE level: from a sub-branch you return to the parent
  branch floor (cached), from an outer branch to the spine. Cache cleanup key
  prefix must use the full path key (below).
- `effDepth()` = `entryOf(branchStack[0]) + Σ over stack of (pos_i + 2)` — each
  nesting level bites ~2 depths harder, so sub-branches are spicier than their
  parent, mirroring DCSS Lair→Swamp.
- floorCache keys: spine `d{depth}` unchanged; branch floors use the full path:
  `'b' + branchStack.map(s => `${s.id}:${s.pos}`).join('/')`.
- Save: persist `branchStack`; tolerant migration:
  `this.branchStack = d.branchStack ?? (d.branch ? [{id: d.branch, pos: d.branchPos ?? 0}] : [])`.
- startRun reset list: `this.branchStack = []`.
- `locationName()`: join names, deepest last: `The Waiting Room · The Office`.
- branchesDone / untouched-deed: track per branch id as today; a sub-branch
  completes independently of its parent.

---

## 2. New spine gate pair — entry 15 (Cindermarch stratum)

`BRANCH_PAIRS.push(['waitingroom', 'museum'])` — one of the two per run.
Late-game: the delver is strong; these two are about something worse than
combat — bureaucracy and biography.

### 2a. THE WAITING ROOM — "a queue with no clerk"
Situation, not theme: **you are given a number, and the number is wrong.**
An endless institutional anteroom deep under the Cindermarch. Benches bolted
to stone. A ticket dispenser that has never jammed because it has never been
questioned. At the far end of the last floor: the Wicket — a barred window,
shut. A sign says NOW SERVING and a number that is not yours and never
will be. Some of the seated have waited so long they have calcified into the
benches. The hymn is heard here as hold music, hummed off-key by everything
at once (audio note below).

```ts
// BRANCHES entry
{
  id: 'waitingroom', name: 'The Waiting Room', sub: 'a queue with no clerk',
  entry: 15, levels: 2, stratum: 11 /* new */, boss: 'clerkwicket',
  intro: 'A machine of brown bakelite offers you a paper tongue. Your number is 000000001. The sign above the far window reads NOW SERVING 000000000, and the seated things turn, very slowly, to see who just made the queue longer.',
},
```

```ts
// STRATA entry (index 11) — palette unlike anything in the game:
// dead fluorescent institutional green, flat and shadowless
{
  name: 'The Waiting Room', sub: 'hold music for the underworld',
  depths: [-1, -1], gen: 'halls',
  floor: [116, 128, 110], wall: [150, 168, 152], accent: '#a8e0b0',
  intro: 'The light comes from nowhere and flatters no one. Every bench faces the window. Every window is shut.',
},
```

**New generator `halls`** (dungeon.ts) — nothing else looks like this: 3–4
full-width parallel halls (h≈8) joined by single aligned doorways, with rows
of bench-rubble decor (align with puzzle agent's bench object if any):
```ts
function carveHalls(map: LevelMap, rng: RNG): Room[] {
  const rooms: Room[] = [];
  let y = 2;
  while (y < H - 9) {
    const h = rng.int(6, 8);
    for (let yy = y; yy < y + h; yy++)
      for (let x = 2; x < W - 2; x++) map.tiles[idx(x, yy, W)] = T.Floor;
    rooms.push({ x: 2, y, w: W - 4, h });
    // one narrow door to the next hall, never centered (queues snake)
    const dx = rng.int(6, W - 8);
    map.tiles[idx(dx, y + h, W)] = T.DoorClosed;
    // bench rows: two lines of rubble facing the "front"
    for (let x = 4; x < W - 4; x += 2) {
      if (rng.chance(0.7)) map.tiles[idx(x, y + 2, W)] = T.Rubble;
      if (rng.chance(0.7)) map.tiles[idx(x, y + h - 3, W)] = T.Rubble;
    }
    y += h + 1;
  }
  return rooms;
}
```

**Creatures** (`branch: 'waitingroom'`; stats PROVISIONAL — recalibrate
against post-tuning eff. depth 17–19 before merge; glyph→sprite notes in §4):
```ts
{ id: 'patientone', name: 'a Patient One', glyph: 'p', color: '#b8c8b2', depth: [17, 19], weight: 30, hp: 64, dmg: [8, 16], acc: 6, ev: 2, ac: 12, speed: 6, xp: 60, mindless: true, branch: 'waitingroom', flavor: 'It has sat so long the bench grew through it. It is not angry that you passed it. It is standing up anyway.' },
{ id: 'numbereater', name: 'a Number-Eater', glyph: 'm', color: '#d8e8b0', depth: [17, 19], weight: 25, hp: 28, dmg: [4, 9], acc: 10, ev: 16, ac: 2, speed: 14, xp: 45, pack: [2, 4], branch: 'waitingroom', flavor: 'A moth the size of a prayer book, dusted with shredded paper. Whatever number you were holding, you are not holding it now.' },
{ id: 'queuewarden', name: 'a Queue Warden', glyph: 'H', color: '#8aa890', depth: [17, 19], weight: 25, hp: 52, dmg: [10, 18], acc: 12, ev: 8, ac: 8, speed: 10, xp: 70, pack: [2, 3], onHit: { kind: 'stun', power: 1, turns: 2, chance: 0.2 }, branch: 'waitingroom', flavor: 'Its sash reads ORDER. It has never once been asked a question it answered.' },
{ id: 'holdbell', name: 'the Bell That Waits', glyph: 'j', color: '#e0e8c0', depth: [18, 19], weight: 12, hp: 44, dmg: [6, 12], acc: 10, ev: 10, ac: 6, speed: 10, xp: 90, summon: { id: 'queuewarden', count: 2, chance: 0.25 }, sleepless: true, branch: 'waitingroom', flavor: 'It rings when no one is served. It is ringing now. It has always been ringing.' },
// boss — final level, guards the Wicket
{ id: 'clerkwicket', name: 'the Clerk of the Wicket', glyph: '&', color: '#d4ecc8', depth: [19, 19], weight: 0, hp: 150, dmg: [14, 26], acc: 14, ev: 8, ac: 14, speed: 10, xp: 400, boss: true, sleepless: true, ranged: { name: 'NEXT', dmg: [8, 16], type: 'necro', range: 7, color: '#a8e0b0', chance: 0.35 }, onHit: { kind: 'fear', power: 1, turns: 3, chance: 0.25 }, summon: { id: 'patientone', count: 1, chance: 0.2 }, branch: 'waitingroom', flavor: 'It was not behind the window. It IS the window — the bars, the brass, the little tray. What files out to meet you has a stamp where a face should be.' },
```

**Sub-branch: THE OFFICE** — a different kind entirely: 1 cramped level
BEHIND the Wicket, only reachable after the Clerk falls (or via puzzle-object
unlock if the objects agent placed one here). Where the queue's purpose is
filed. This is a load-bearing lore floor: the Accomplice's appointment.
```ts
{
  id: 'office', name: 'The Office', sub: 'where the queue was always going',
  entry: 15, levels: 1, stratum: 12, boss: 'undermanager',
  parent: 'waitingroom', entryPos: 1,
  intro: 'Behind the window: no room. A corridor of cabinets, each drawer labeled in the notch-script of the Ossuary. One drawer stands open. The file inside is yours, and it is not empty, and the earliest entry is dated before you were born.',
},
// STRATA index 12 — manila, dust, lamplight
{
  name: 'The Office', sub: 'the underworld’s underside',
  depths: [-1, -1], gen: 'rooms',
  floor: [128, 116, 94], wall: [168, 150, 120], accent: '#e0c890',
  intro: 'Everything here is filed. Including, you now understand, everything you have done so far.',
},
{ id: 'thefiled', name: 'one of the Filed', glyph: 'h', color: '#e8dcc0', depth: [19, 20], weight: 40, hp: 40, dmg: [8, 15], acc: 12, ev: 12, ac: 4, speed: 12, xp: 65, pack: [2, 3], vuln: ['fire'], branch: 'office', flavor: 'A person folded to fit a drawer. It unfolds wrong.' },
{ id: 'undermanager', name: 'the Under-Manager', glyph: '&', color: '#f0e0b0', depth: [20, 20], weight: 0, hp: 130, dmg: [12, 24], acc: 14, ev: 10, ac: 10, speed: 12, xp: 350, boss: true, sleepless: true, summon: { id: 'thefiled', count: 2, chance: 0.3 }, branch: 'office', flavor: 'Middle management of the dark. It cannot grant anything. It can only defer you, forever, politely.' },
```
Reward: unique amulet **the Appointment** (`UNIQUES` entry: amulet, ego
'clarity'-like: immunity to stun + fear — you have been seen; you no longer
wait) + a Chronicle chapter (kind: deed 'office') revealing THE canon beat:
*the Accomplice did not steal the First Light — the Accomplice scheduled the
moment when no one would be watching it. The Waiting Room is the machine
that budgets attention; the theft happened in the gap between two numbers.*
(Foundation for the Accomplice god reveal, per roadmap.)

### 2b. THE MUSEUM OF YOU — "exhibits from runs that never happened"
Situation: **your unlived lives, curated.** Gallery halls, spotlit cases.
Placards describe delvers you could have been — pulled from REAL meta data:
hall-of-fame names, past death causes (gloomdelve-hall / meta are already in
localStorage; render through esc() — names are player-typed. XSS!). Cases
hold real generated items (genItem with luck bonus). Breaking a case is the
temptation: take the item, its "owner" wakes as an exhibit-shade.

```ts
{
  id: 'museum', name: 'The Museum of You', sub: 'exhibits from runs that never happened',
  entry: 15, levels: 2, stratum: 13, boss: 'curator',
  intro: 'The plaque by the door is engraved with your name and two dates. The second date is smudged, as if someone keeps changing their mind. Inside, the collection is comprehensive: everything you never did, beautifully lit.',
},
// STRATA index 13 — deep teal-black walls, parquet floor, spotlight gold accent
{
  name: 'The Museum of You', sub: 'a comprehensive collection',
  depths: [-1, -1], gen: 'gallery',
  floor: [96, 74, 60], wall: [70, 96, 100], accent: '#e8d8a0',
  intro: 'Docents drift between the cases, straightening what does not need straightening. They are very glad you came. They have been holding your place.',
},
```

**New generator `gallery`** (dungeon.ts): grid of 5×4-ish medium rooms with
WIDE (2-tile) doorways, each room with a centered pedestal (Torch tile used
as spotlight source + case object from puzzle agent if available, else an
item on Bones), parquet = alternating decal-free floor (terrain() note §4).

**Creatures** (`branch: 'museum'`; stats provisional):
```ts
{ id: 'docent', name: 'a Docent', glyph: 'h', color: '#c8d4d0', depth: [17, 19], weight: 30, hp: 34, dmg: [5, 10], acc: 12, ev: 16, ac: 2, speed: 12, xp: 55, ranged: { name: 'a guided whisper', dmg: [5, 11], type: 'necro', range: 6, color: '#c8d4d0', chance: 0.4 }, onHit: { kind: 'hex', power: 1, turns: 3, chance: 0.3 }, branch: 'museum', flavor: 'It gestures at the exhibits with pride of ownership. The exhibits are you. The pride is not.' },
{ id: 'curatorhand', name: 'a Curator’s Hand', glyph: 'W', color: '#f0f0e8', depth: [17, 19], weight: 30, hp: 22, dmg: [7, 13], acc: 14, ev: 18, ac: 0, speed: 16, xp: 50, pack: [2, 3], branch: 'museum', flavor: 'A white glove, wrist ending in air, moving with the unhurried confidence of staff. It would like you back behind the rope.' },
{ id: 'exhibitshade', name: 'an Exhibit of You', glyph: 'p', color: '#9ab0c8', depth: [17, 19], weight: 22, hp: 48, dmg: [10, 18], acc: 12, ev: 12, ac: 6, speed: 10, xp: 85, drain: true, branch: 'museum', flavor: 'It has your gait and someone else’s luck. The placard says it died well. It would like to compare notes.' },
{ id: 'placardmite', name: 'a Placard-Mite', glyph: 'x', color: '#b0a488', depth: [17, 19], weight: 18, hp: 14, dmg: [3, 7], acc: 10, ev: 14, ac: 2, speed: 14, xp: 25, pack: [3, 5], mindless: true, branch: 'museum', flavor: 'It eats captions and excretes uncertainty. Half the labels in this wing are its fault.' },
{ id: 'curator', name: 'the Curator', glyph: '&', color: '#f0e8c8', depth: [19, 19], weight: 0, hp: 160, dmg: [15, 27], acc: 14, ev: 10, ac: 12, speed: 10, xp: 420, boss: true, sleepless: true, summon: { id: 'curatorhand', count: 2, chance: 0.3 }, onHit: { kind: 'stone', power: 1, turns: 2, chance: 0.2 }, branch: 'museum', flavor: 'It loves you the way amber loves the fly. The lacquer on its fingers is for you; the empty case behind it, floor-lit and waiting, is exactly your size.' },
```

**Sub-branch: THE GIFT SHOP** — 1 level off Museum level 1. Different kind
again: a commerce floor gone wrong. Garish against the gallery gloom —
palette deliberately nauseating (the only pink in the game):
```ts
{
  id: 'giftshop', name: 'The Gift Shop', sub: 'exit through it',
  entry: 15, levels: 1, stratum: 14, boss: 'shopkeep',
  parent: 'museum', entryPos: 0,
  intro: 'You did not see the door until it saw you. Shelves of souvenirs: a snowglobe of the Mossgrave, a plush Sovereign with button eyes, postcards of your death — WISH YOU WERE HERE. Everything is priced. Nothing says what the currency is.',
},
// STRATA index 14 — sickly rose, the only pink in the game
{
  name: 'The Gift Shop', sub: 'all sales are final',
  depths: [-1, -1], gen: 'rooms',
  floor: [140, 100, 120], wall: [180, 130, 150], accent: '#ff9ad4',
  intro: 'The bell above the door rings a beat after you pass. Something behind the till straightens its smile.',
},
{ id: 'replica', name: 'a Cursed Replica', glyph: 'm', color: '#ff9ad4', depth: [17, 19], weight: 40, hp: 30, dmg: [6, 14], acc: 12, ev: 10, ac: 8, speed: 10, xp: 55, mindless: true, branch: 'giftshop', flavor: 'A souvenir of something you fought. Smaller, cuter, and — as it opens — considerably more teeth.' },
{ id: 'shopkeep', name: 'the Souvenir of the Gravemerchant', glyph: '&', color: '#ffc0e0', depth: [19, 19], weight: 0, hp: 120, dmg: [12, 22], acc: 13, ev: 12, ac: 8, speed: 12, xp: 320, boss: true, sleepless: true, summon: { id: 'replica', count: 2, chance: 0.3 }, branch: 'giftshop', flavor: 'It looks like the Gravemerchant the way a mask looks like a face. The real one, wherever he is, would like it made very clear that he has no branch locations.' },
```
Reward idea: floor scattered with *replica* items (genItem at +luck but 30%
chance ego-less fakes — identification matters again late-game) + gold pile.
Gravemerchant lore tier-2 hook ("he has no branch locations").

---

## 3. Audio (audio.ts — free file, integrate anytime)
- `ambient(stratum)` base-freq table needs 4 new entries (indices 11–14):
  waitingroom 62 (fluorescent hum, slightly sharp), office 44, museum 36
  (cavernous), giftshop 66 (too cheerful by a semitone).
- Optional: waitingroom ambient adds a second beat-frequency pair at ~0.5 Hz
  — hold-music throb. One-line change in ambient().

## 4. Art notes (post doll-agent, via registerSprites or sprites.ts)
- New sprite grids needed: `sitter` (calcified seated figure fused to bench),
  `glove` (floating white glove), `clerk` (barred-window face, stamp head),
  `bellthing`, `docent` (tabard + pointing arm), `case` (glass pedestal,
  for gallery decor). Draft in integration pass with contact sheet.
- GLYPH_SPRITE additions (sprites.ts): patientone→sitter, curatorhand→glove,
  clerkwicket→clerk, holdbell→bellthing, docent→docent; rest reuse existing
  (`&` bosses default fine, 'm' moth, 'x' vermin, 'p' shade, 'h' humanoid).
- terrain(): gallery parquet = subtle 2-tone checker on floor color when
  gen === 'gallery'; halls linoleum = faint horizontal banding when 'halls'.
  Both ~5-line additions to the floor texture branch of terrain().

## 5. Lore/codex integration checklist
- CHRONICLE: +2 chapters — 'office' deed chapter (Accomplice-as-scheduler,
  the big beat) and a museum chapter (unlock kind: boss 'curator') about the
  smudged second date.
- MONSTER_LORE tier 1 for all 11 new creatures (voice: short, ambiguous,
  exclusive info); tier 2 for patientone, docent, curator, clerkwicket.
- WHISPERS: one at entry-15 spine depth pointing at the pair ("Two doors are
  being kept warm for you. One counts. One remembers.").
- Examine text auto-derives from flavor fields — no extra work.

## 6. Integration order (when locks release)
1. tuning agent done → data.ts free: paste BRANCHES/STRATA/MONSTERS/PAIRS,
   recalibrate provisional stats vs its final numbers (+1 sim run for sanity).
2. puzzle agent done → game.ts/dungeon.ts free: branch stack refactor (§1),
   carveHalls/carveGallery, gates-in-branches, sub-branch sealed-gate hookup
   with its puzzle API.
3. doll agent done → sprites.ts free: GLYPH_SPRITE entries + new grids +
   terrain() variants (or use registerSprites from a content file).
4. lore.ts additions (voice pass), audio.ts table, morgue location names
   (verify locationName() renders nested path), sim smoke, deploy.
