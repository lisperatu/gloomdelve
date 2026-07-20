# GLOOMDELVE — Depths of the Unlight

A dark, gloomy, DCSS-inspired roguelike for the browser. Twenty procedurally generated
floors down to the Unlight Sovereign's throne; the way back always seals — the only way
out is through.

## Play

**In your browser, no install:** https://lisperatu.github.io/gloomdelve/

**Run locally (Linux/macOS/Windows — needs Node 20+):**

```sh
git clone https://github.com/lisperatu/gloomdelve
cd gloomdelve
npm install
npm run dev        # play at http://localhost:5173
```

Static build: `npm run build`, then serve `dist/` with anything (`npx serve dist`).
Maintainers deploy with `./deploy.sh` (builds and force-pushes the `gh-pages` branch).

## The game

- **7 lineages** (The Hollowed, Ashkin, Vesperkin, Grave-Elf, Trollblood, Mireborn,
  Moth-touched) with real mechanical identity: poison immunity, night-sight, ×3 regen,
  luck, blink-on-hit…
- **7 callings** (Gravewarden, Pyroclast, Shadowdancer, Plaguewright, Hexblade,
  Bonecaster, Ascetic), each with 3 abilities unlocking at levels 1/4/8 — stuns, novas,
  shadow-steps, poison clouds, undead servants, knockbacks.
- **6 gods** joined at dungeon altars. Each likes different deeds (fire kills, poison
  kills, kills in water, damage endured, descent itself) and grants two powers at piety
  30/80 — including a literal refusal of your death.
- **5 strata**, each with its own generator, palette and bestiary: room-and-corridor
  catacombs, cellular-automata fungal caves, flooded cloister halls, lava-riddled ember
  fathoms, and the pillared throne vault.
- **3 optional side branches** (DCSS-style): The Ossuary, The Silkfen, and the Vault of
  Chains — sealed gates on the descent lead to short themed sub-dungeons with unique
  monsters, their own bosses (the Charnel Bride, Mother-of-Silk, the Gaoler) and
  guaranteed prizes. The only way back is through.
- **Examine & Codex**: `x` inspects anything on screen (stats transparent, DCSS-style);
  `c` opens the Delver's Codex — a discovery-driven bestiary with two-tier lore entries
  (slay a creature enough and its deeper truth unlocks), god myths, race/class origins,
  and the Chronicle: the story of the stolen First Light, drip-fed as you reach strata,
  meet bosses, join gods, die, and win. Codex knowledge persists across deaths.
- **~40 monsters** that scale with depth (HP/damage grow when spawning below their native
  floor), packs, ranged casters, summoners, life-drinkers, regenerators — plus 5 bosses
  on floors 4 / 9 / 14 / 19 / 20.
- **Items**: weapons/armor in 5 tiers with enchantment plusses and egos (flame, venom,
  draining, grave-wind, ruin…), unidentified potions/scrolls/rings/amulets with
  per-run flavor names, enchant & identify scrolls.
- **Systems**: shadowcasting FOV, sleeping monsters & stealth (sneak attacks ×2.5),
  water that douses fire and hampers evasion, lava, blood decals, auto-explore (`o`),
  rest (`r`), energy-based speed with haste/slow.
- **Presentation**: full pixel-art tileset (16×16 sprites at 2×, tinted per creature) —
  brick walls, textured stone floors, sprite monsters/items/features — plus dynamic
  torch/fungal lighting, flicker, animated water & lava, particles, beams, floating
  damage, screen shake, boss health bars, low-HP vignette, minimap, procedural
  synthesized sound effects, and 10 AI-generated title artworks shown at random
  (plus death/victory art).
- **Paper doll**: DCSS-style composed player sprite — each race has its own base doll
  (tusks, antennae, ember hair, bat ears…) and worn armor, wielded weapon, amulet and
  rings layer onto it, in the dungeon, in the HUD portrait, and on race-select cards.
- **Persistence**: the run auto-saves (localStorage) — continue from the title screen;
  the save is consumed by death or victory, as is proper.

## Keys

Move `←↑↓→`/`hjkl` (+`yubn` diagonals) · wait `.` · pickup `g` · descend `>` ·
inventory `i` (press an item's letter twice to use/equip it) · abilities `1–5` ·
pray `p` · auto-explore `o` · rest `r` · help `?`

## Stack

TypeScript + Vite + HTML5 Canvas. No runtime dependencies.
