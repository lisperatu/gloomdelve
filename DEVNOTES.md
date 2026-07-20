# GLOOMDELVE — Development Notes (continuation handbook)

Everything a fresh session/contributor needs. Pair with ROADMAP.md (what's next)
and README.md (what exists, player-facing).

## Ground facts

- Repo: github.com/lisperatu/gloomdelve · Live: https://lisperatu.github.io/gloomdelve/
- Deploy: `./deploy.sh` (builds, force-pushes `gh-pages`). Pages CDN caches ~10 min.
  No CI: the gh OAuth token lacks `workflow` scope (`gh auth refresh -s workflow` to fix).
- Local: `npm run dev` (user often has a live session at localhost:5199 — **their save
  is in that browser's localStorage; never clobber it**: for testing use a throwaway
  instance, see Testing below).
- Stack: TypeScript + Vite + Canvas, zero runtime deps. `npm run build` = tsc + vite.
- tsconfig only checks `src/`; `sim/` is bundled by esbuild (`npm run sim`).

## Architecture (src/)

| File | Owns |
|---|---|
| `types.ts` | Tile enum `T`, Monster/Item/Player/LevelMap/FX interfaces, walkability |
| `data.ts` | ALL content: STRATA(11: 5 spine + 6 branch), BRANCHES(6, BRANCH_PAIRS 3×2), RACES(7), CLASSES(7)+abilities, GODS(6), WEAPONS(14, 3 ranged w/ `range`), ARMORS, potions/scrolls/rings/amulets, egos, UNIQUES(6), MONSTERS(63), BOSS_FLOORS, genItem, itemName, identification |
| `lore.ts` | CHRONICLE(18 ch., unlock conditions), MONSTER_LORE/-2 (tier1 sight / tier2 kills), GOD_LORE, RACE/CLASS_LORE, ITEM/EGO/UNIQUE_LORE, WHISPERS |
| `dungeon.ts` | generateLevel(depth,rng,luck,GenOpts{branch,branchPos,doneBranches,runBranches,uniques}), 4 generators, VAULTS(9 templates + placeVaults/connectToFloor), bfsDistance, spawnMonster |
| `game.ts` | Game class: combat, statuses(14), AI (flee/kite/flank; `mindless` exempt), religion+wrath, abilities (switch on id), fireRanged, branch routing (enter/advance/exitBranch, effDepth), save/restore (localStorage `gloomdelve-save` v1), meta (`gloomdelve-meta`: bestiary+kills+deaths+wins persist across runs), hall (`gloomdelve-hall`), score(), autoExplore(+trail FX), rest |
| `sprites.ts` | 16×16 string-grid sprites ('.'transparent X tint x dark L light k outline + FIXED letters), sprite()/spriteURL cached, monsterSprite(glyph→name), itemSprite, playerDoll (race base `doll_<race>` + armor overlay `ov_*` + weapon + jewelry), terrain() procedural floor/wallTop/wallFace |
| `render.ts` | TS=32 canvas renderer: terrain, lighting overlay (lightOf + dark rect), entities, boss bar, beams/particles/floaters/trails, examine/target cursors, minimap, menu ember bg |
| `ui.ts` | Mode state machine: title/race/class/name/play/inv/help/target/examine/codex/hall/dead/win. HUD (dirty-flag refresh), codex (4 tabs + global search), examine ('x', 'v'→codex), name input (INPUT-tag passthrough in onKey!), hall, grouped inventory |
| `audio.ts` | Procedural WebAudio sfx (no assets); guarded for headless |
| `main.ts` | Boot, rAF loop, `window.G` debug handle, beforeunload autosave |
| `sim/sim.ts` | Headless bot: `npm run sim -- N [nobranch]`. Caps: 9000 decisions, 11000 turns, 20s wall, stuck-floor detection |

## Key invariants & gotchas

- **Monsters map to sprites via their ASCII glyph** (GLYPH_SPRITE) — new monster = pick an
  existing glyph or add a sprite + mapping.
- Branch monsters: `branch: 'id'` field + depth ≈ entry+2..; spine pools filter `!m.branch`.
- `effDepth()` = spine depth, or branch entry+pos+2 — used for item gen/summon scaling.
- Save schema is tolerant (`?? default` on restore) — extend it that way; bump v only on breaking change.
- Digit keys: top row = abilities (`e.code.startsWith('Digit')`), numpad = movement.
- itemName returns `it.unique` first; uniques generated in genItem when a `uniques` Set is passed (game.foundUniques flows through GenOpts).
- Lore style contract is at the top of lore.ts (research-derived; keep: exclusive info, ambiguity, tier2 adds NEW facts). Buried plot: First Light stolen→inverted = Sovereign; an unnamed Accomplice exists (deliberate hook for a future god).
- Vault interiors carve into solid rock and corridor-connect to the nearest floor; stairs BFS uses forMonsters=true so closed doors don't strand placement.

## Testing recipes

- Browser (never touch the user's run):
  `const gt = new window.G.constructor(seed); gt.save=()=>{}; gt.syncMeta=()=>{}; gt.startRun('hollowed','gravewarden'); ...`
- Full integrity + balance: `npm run sim -- 8` (exercises gen/vaults/branches/AI/combat).
  First results (v0.2): bot 0% win, deaths cluster eff. depth 5–8, Ossuary Shepherd top
  killer → already nerfed once (48hp/[3,8]). Humans >> bot; don't over-nerf from bot data.
- Playwright plays the SAME browser the user plays in — new tab = same localStorage.

## Where we are / what's next (see ROADMAP.md)

v0.2 mostly done. NEXT: **sprite review pass** (contact-sheet render → critique vs creature
identity → redraw weak ones). Then: Gravemerchant NPC shop (gold sink), ambient audio +
mute, inventory tabs, then v0.3 (corruptions, morgue files, daily seed, more chronicle).
