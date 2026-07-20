# GLOOMDELVE — Roadmap

Current state (v0.1, July 2026): a complete, winnable, deployed game.
Everything below is ordered by value-per-effort, not by promise.

## Where we are

| Dimension | Now | DCSS (reference) |
|---|---|---|
| Levels per run | 20 spine + 7 branch (27) | ~27 on the win route, ~100 total |
| Themed environments | 8 (5 strata + 3 branches) | ~20 branches |
| Monsters / bosses | 51 / 8 | ~700 / dozens |
| Races × classes | 7 × 7 | 27 × ~24 |
| Gods | 6 | ~25 |
| Item base types + egos | 42 + 10 | hundreds |
| Written lore | ~5,400 words, 100+ entries | wiki-scale |
| Run length | 1–3 h | 6–15 h |

Systems already in place: procedural generation (4 generator styles), shadowcasting FOV,
energy-based speed, stealth/sleep, 13 status effects, religion with piety economics,
summons/allies, identification, two-tier discovery codex with cross-run knowledge
persistence, global codex search, examine mode, paper-doll rendering, auto-explore,
auto-save, procedural SFX, tile renderer with dynamic lighting.

## v0.2 — More dungeon (near-term)

Also shipped in v0.2: player ranged weapons (sling/shortbow/grave-bow, `f` to fire),
character naming, local hall of fame with scores, grouped inventory, equipped-item stats.

Sprite review pass: DONE (contact-sheet method; hound/spider/fungus/serpent/moth/djinn/
sovereign redrawn). **v0.2 is complete.** Next: v0.3.

- [x] **Branch pairs** (DCSS Swamp/Shoals pattern): each gate slot rolls one of two
      branches per run — e.g. The Ossuary *or* The Wax Garden; Silkfen *or* The Roots.
      Doubles branch variety without doubling per-run length.
- [x] **Vaults**: hand-authored room templates (10–20) injected into the generators —
      shrines, treasure traps, ambush rooms, mini-stories in floor layout.
- [x] **The Gravemerchant**: a rare neutral NPC; gold finally buys identified goods.
- [x] **Unique artifacts**: ~10 named items with fixed egos + their own lore entries
      (the Cartographer's own gear belongs in the game).
- [x] **God wrath & conversion**: abandoning a god should cost; the Silent King should
      notice you leaving.
- [x] Audio toggle (`m`) + per-stratum ambient drone.

## v0.3 — More depth (mid-term)

- [x] **Corruptions**: Qud-style mutations with trade-offs, offered at altars of a 7th,
      nameless power (grow a stinger, lose an eye: the dark edits you).
- [x] **Monster AI pass** (flee when hurt, ranged kiting, pack flanking): kiting casters, fleeing at low HP, pack flanking.
- [x] **Morgue files**: shareable end-of-run report (seed, build, kills, chronicle pages found).
- [x] **Daily seed**: same dungeon for everyone, once a day.
- [x] **Balance harness** (`npm run sim`): headless bot runs to tune the difficulty curve per class.
- [x] More Chronicle: 3 deed-gated chapters (untouched branch, godless depth 15, three edits).

**Standing rule for all future branches** (user directive): every new branch must carry
a bizarre, distinct story — not a theme, a *situation*. Candidate seeds: the Auction of
Hours (bid years of your life against the dead); the Museum of You (exhibits from runs
that never happened); the Backwards River (a floor where cause follows effect); the
Choir School (where the hymn's replacement singers are grown); the Waiting Room (a
branch that is only a queue, and what happens if you skip it).

## v0.4 — Deeper world (in progress)

- [x] **Bidirectional stairs**: climb back up (`<`); every floor is cached exactly as
      left (monsters, loot, fog, abandoned allies) and survives save/restore. The
      surface stays sealed. New perspective stairwell sprites (down into dark, up into pale light).
- [x] **Mysterious puzzle objects**: one riddle per branch (skull refiling, candle vow
      order, tithe-scale, seed cairn, reserved cell, still basin), each opening a sealed
      way + a deed-gated Chronicle chapter. src/objects.ts + objsprites.ts.
- [x] **Inventory item detail view**: Shift+letter — stats, egos spelled out, lore, id-gating.
- [x] **Doll & equipment art pass**: all 7 races distinct, 5 overlays + held weapons redrawn.
- [x] **Sim-driven balance pass 2**: depth 5-8 death wall 52%→27%, class spread 5.1;
      fixed sim bot never picking up items (invalidated old baselines).
- [ ] **Sub-branches**: branches within branches, each a different KIND of place;
      branch stack routing. Full design + content staged in `staging/next-branches.md`.
- [ ] **Branch pair 4 (entry 15)**: the Waiting Room (a queue with no clerk; sub-branch:
      the Office — the Accomplice's appointment, canon payoff) vs the Museum of You
      (exhibits from unlived runs; sub-branch: the Gift Shop). Distinct generators
      ('halls', 'gallery'), palettes (fluorescent green / gallery teal-gold / manila / the
      game's only pink), 11 creatures, 3 bosses. See staging doc.

## v1.0 — More world (long-term)

- [ ] 10 races × 10 classes; 2–3 more gods (the Accomplice from the Chronicle is
      deliberately unexplained — that is a god-shaped hole).
- [ ] A second win condition (spare the Sovereign? The lore already supports it).
- [ ] Achievements tied to codex completion (Hades-style, knowledge-only meta — no power creep).
- [ ] Touch controls; itch.io page; desktop packaging (Tauri → AppImage/Flatpak for Linux).
- [ ] Accessibility: colorblind-safe palette option, UI scaling.
- [ ] Content packs: monsters/items/lore as data — moddable by JSON.

## Engineering debt

- Save schema versioning with migrations (currently v1, tolerant reads).
- Level-gen fuzz tests (connectivity, stairs reachability, gate placement).
- Split `data.ts` (content) from `lore.ts` growth; consider per-branch content files.
