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

- [ ] **Branch pairs** (DCSS Swamp/Shoals pattern): each gate slot rolls one of two
      branches per run — e.g. The Ossuary *or* The Wax Garden; Silkfen *or* The Roots.
      Doubles branch variety without doubling per-run length.
- [ ] **Vaults**: hand-authored room templates (10–20) injected into the generators —
      shrines, treasure traps, ambush rooms, mini-stories in floor layout.
- [ ] **The Gravemerchant**: a rare neutral NPC; gold finally buys identified goods.
- [ ] **Unique artifacts**: ~10 named items with fixed egos + their own lore entries
      (the Cartographer's own gear belongs in the game).
- [ ] **God wrath & conversion**: abandoning a god should cost; the Silent King should
      notice you leaving.
- [ ] Audio toggle + per-stratum ambient drone.

## v0.3 — More depth (mid-term)

- [ ] **Corruptions**: Qud-style mutations with trade-offs, offered at altars of a 7th,
      nameless power (grow a stinger, lose an eye: the dark edits you).
- [ ] **Monster AI pass**: kiting casters, fleeing at low HP, pack flanking.
- [ ] **Morgue files**: shareable end-of-run report (seed, build, kills, chronicle pages found).
- [ ] **Daily seed**: same dungeon for everyone, once a day.
- [ ] **Balance harness**: headless bot runs to tune the difficulty curve per class.
- [ ] More Chronicle: chapters for branches completed without taking damage, godless wins, etc.

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
