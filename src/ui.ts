import type { Item, Monster } from './types';
import {
  AMULETS, ARMORS, CLASSES, GODS, POTIONS, RACES, RINGS, SCROLLS, STRATA, WEAPONS,
  itemName, type AbilityDef,
} from './data';
import { itemSprite, monsterSprite as monsterSpriteName, playerDollURL, spriteURL } from './sprites';
import { CHRONICLE, EGO_LORE, GOD_LORE, ITEM_LORE, MONSTER_LORE, MONSTER_LORE2, RACE_LORE, CLASS_LORE } from './lore';
import { MONSTERS, MONSTER_BY_ID } from './data';
import { C, Game } from './game';
import type { Renderer } from './render';

type Mode = 'title' | 'race' | 'class' | 'play' | 'inv' | 'help' | 'target' | 'dead' | 'win' | 'examine' | 'codex';

const LETTERS = 'abcdefghijklmnopqrstuvwxyz';

export class UI {
  game: Game;
  ren: Renderer;
  mode: Mode = 'title';
  raceSel = 0;
  classSel = 0;
  invSel = -1;
  targets: Monster[] = [];
  targetIdx = 0;
  exX = 0;
  exY = 0;
  exPanel: HTMLDivElement | null = null;
  pendingAbility: { ab: AbilityDef; source: 'class' | 'god' } | null = null;
  overlay = document.getElementById('overlay') as HTMLDivElement;
  hud = document.getElementById('hud') as HTMLDivElement;
  log = document.getElementById('log') as HTMLDivElement;
  minimap = document.getElementById('minimap') as HTMLCanvasElement;
  msgCount = 0;

  constructor(game: Game, ren: Renderer) {
    this.game = game;
    this.ren = ren;
    window.addEventListener('keydown', (e) => this.onKey(e));
    this.showTitle();
  }

  // ============================== overlays
  private show(html: string, opaque = false): void {
    this.overlay.innerHTML = html;
    this.overlay.classList.remove('hidden');
    this.overlay.classList.toggle('opaque', opaque);
  }
  private hide(): void {
    this.overlay.classList.add('hidden');
    this.overlay.innerHTML = '';
  }

  showTitle(): void {
    this.mode = 'title';
    const hasSave = Game.hasSave();
    const hint = hasSave
      ? `<span class="key">Enter</span> continue your descent &nbsp;·&nbsp; <span class="key">n</span> abandon it and begin anew`
      : `<span class="key">Enter</span> to descend &nbsp;·&nbsp; <span class="key">?</span> in-game for help`;
    const arts = ['title.png', 'title2.png', 'title3.png', 'title4.png', 'title5.png',
      'title6.png', 'title7.png', 'title8.png', 'title9.png', 'title10.png'];
    const art = arts[Math.floor(Math.random() * arts.length)];
    this.show(`
      <div class="panel" style="text-align:center; max-width:760px;">
        <img class="titleart" src="${import.meta.env.BASE_URL}art/${art}" onerror="this.src=import.meta.env.BASE_URL+'art/title.png'" alt="" />
        <h1>GLOOMDELVE</h1>
        <div class="tag">DEPTHS OF THE UNLIGHT</div>
        <p class="flavor">Twenty floors below the world, the Unlight Sovereign sits a throne of frozen shadow,
        and every grave between here and there is merely a waiting room.<br/>
        Descend. Pledge your soul to whatever listens. Come back crowned — or not at all.</p>
        <p class="hint">${hint}</p>
      </div>`, true);
  }

  showRaceSelect(): void {
    this.mode = 'race';
    const cards = RACES.map((r, i) => `
      <div class="card ${i === this.raceSel ? 'sel' : ''}" data-i="${i}">
        <img class="dollsm" src="${playerDollURL(r.id, null)}" alt="" />
        <b><span class="key">${LETTERS[i]}</span>${r.name}</b>
        <small>${r.desc}</small>
        <div class="mods">${r.mods}</div>
      </div>`).join('');
    this.show(`
      <div class="panel" style="max-width:860px;">
        <h2>Choose your Lineage</h2>
        <div class="cards">${cards}</div>
        <p class="hint"><span class="key">a–${LETTERS[RACES.length - 1]}</span> or click · <span class="key">Esc</span> back</p>
      </div>`, true);
    this.overlay.querySelectorAll('.card').forEach((el) => {
      el.addEventListener('click', () => {
        this.raceSel = Number((el as HTMLElement).dataset.i);
        this.showClassSelect();
      });
    });
  }

  showClassSelect(): void {
    this.mode = 'class';
    const cards = CLASSES.map((c, i) => `
      <div class="card ${i === this.classSel ? 'sel' : ''}" data-i="${i}">
        <b><span class="key">${LETTERS[i]}</span>${c.name}</b>
        <small>${c.desc}</small>
        <div class="mods">${c.mods}</div>
      </div>`).join('');
    this.show(`
      <div class="panel" style="max-width:860px;">
        <h2>Choose your Calling — ${RACES[this.raceSel].name}</h2>
        <div class="cards">${cards}</div>
        <p class="hint"><span class="key">a–${LETTERS[CLASSES.length - 1]}</span> or click · <span class="key">Esc</span> back</p>
      </div>`, true);
    this.overlay.querySelectorAll('.card').forEach((el) => {
      el.addEventListener('click', () => {
        this.classSel = Number((el as HTMLElement).dataset.i);
        this.startGame();
      });
    });
  }

  startGame(): void {
    this.game.startRun(RACES[this.raceSel].id, CLASSES[this.classSel].id);
    this.mode = 'play';
    this.hide();
    this.refreshHud();
  }

  showHelp(): void {
    this.mode = 'help';
    this.show(`
      <div class="panel" style="max-width:700px;">
        <h2>How to Delve</h2>
        <div class="helpcols">
          <div><span class="key">←↑↓→ / hjkl</span> move / attack</div>
          <div><span class="key">yubn</span> diagonal moves</div>
          <div><span class="key">. or 5</span> wait a turn</div>
          <div><span class="key">g</span> pick up</div>
          <div><span class="key">></span> descend stairs</div>
          <div><span class="key">i</span> inventory</div>
          <div><span class="key">1–5</span> abilities & god powers</div>
          <div><span class="key">p</span> pray at altar</div>
          <div><span class="key">o</span> auto-explore</div>
          <div><span class="key">r</span> rest</div>
          <div><span class="key">x</span> examine anything</div>
          <div><span class="key">c</span> codex (lore & bestiary)</div>
          <div><span class="key">Tab</span> cycle targets</div>
          <div><span class="key">Esc</span> cancel / close</div>
        </div>
        <p class="flavor" style="margin-top:14px">To equip or use an item: press <span class="key">i</span>, then the item's letter twice (or letter, then Enter).</p>
        <p class="flavor">Reading the ground: brick walls block you; textured stone floor is safe, as are bones, rubble and glowing fungus.
        Dark blue water is passable but hampers your evasion (and douses flame). Glowing lava will kill you. Doors open when you walk into them.</p>
        <p class="flavor">Sleeping foes take brutal bonus damage. Altars accept only the unclaimed. The way back is always sealed — the only way out is through the throne.</p>
        <p class="hint"><span class="key">Esc</span> to return</p>
      </div>`);
  }

  showInventory(): void {
    this.mode = 'inv';
    const g = this.game;
    const p = g.player;
    const eqEntries: [string, Item | null][] = [
      ['weapon', p.equip.weapon], ['body', p.equip.body], ['amulet', p.equip.amulet],
      ['ring', p.equip.ring1], ['ring', p.equip.ring2],
    ];
    const eq = eqEntries.map(([slot, it], i) => {
      const nm = it ? itemName(it, g.ident) : '<span style="opacity:.4">—</span>';
      return `<div><span class="key">${i + 1}</span> <span class="eq">${slot.padEnd(7, ' ')}</span> ${nm}</div>`;
    }).join('');
    const inv = p.inventory.length
      ? p.inventory.map((it, i) => {
        const [spr, col] = itemSprite(it);
        const sel = i === this.invSel ? 'sel' : '';
        const qty = it.qty > 1 ? ` ×${it.qty}` : '';
        return `<div class="${sel}" data-i="${i}"><span class="key">${LETTERS[i]}</span> <img class="spr" src="${spriteURL(spr, col)}" alt=""> ${itemName(it, g.ident)}${qty}</div>`;
      }).join('')
      : '<div style="opacity:.5">Your pack is empty.</div>';
    let detail = '';
    if (this.invSel >= 0 && p.inventory[this.invSel]) {
      const it = p.inventory[this.invSel];
      const verb = it.kind === 'potion' ? 'quaff' : it.kind === 'scroll' ? 'read' : 'equip';
      detail = `<p class="flavor" style="margin-top:12px">${this.describe(it)}</p>
        <p class="hint"><span class="key">Enter</span> (or <span class="key">${LETTERS[this.invSel]}</span> again) to ${verb}
        · <span class="key">d</span> drop · <span class="key">Esc</span> back</p>`;
    }
    this.show(`
      <div class="panel" style="min-width:520px;">
        <h2>Inventory · ${p.gold} gold</h2>
        <div class="inv-list">${eq}<hr style="border-color:#241e32;margin:8px 0">${inv}</div>
        ${detail}
        <p class="hint"><span class="key">a–z</span> select, twice to use/equip · <span class="key">1–5</span> remove worn · <span class="key">Esc</span> close</p>
      </div>`);
    this.overlay.querySelectorAll('.inv-list [data-i]').forEach((el) => {
      el.addEventListener('click', () => {
        this.invSel = Number((el as HTMLElement).dataset.i);
        this.showInventory();
      });
    });
  }

  describe(it: Item): string {
    const g = this.game;
    const known = g.ident.known.has(`${it.kind}:${it.id}`);
    const loreLine = known ? (ITEM_LORE[`${it.kind}:${it.id}`] ?? (it.ego ? EGO_LORE[it.ego] : undefined)) : undefined;
    const withLore = (base: string): string => loreLine ? `${base}<br><i style="color:#a89cc4">${loreLine}</i>` : base;
    switch (it.kind) {
      case 'weapon': {
        const d = WEAPONS.find((w) => w.id === it.id)!;
        return withLore(`Damage ${d.dmg[0]}–${d.dmg[1] + it.plus}, accuracy ${d.acc >= 0 ? '+' : ''}${d.acc + it.plus}.`);
      }
      case 'armor': {
        const d = ARMORS.find((a) => a.id === it.id)!;
        return withLore(`Armor ${d.ac + it.plus}, evasion ${d.evPen}.`);
      }
      case 'potion': return known ? withLore(POTIONS.find((p) => p.id === it.id)!.desc) : 'An unidentified draught. Drink to learn — the hard way.';
      case 'scroll': return known ? withLore(SCROLLS.find((s) => s.id === it.id)!.desc) : 'An unidentified scroll, in a script that itches to read.';
      case 'ring': return known ? withLore(RINGS.find((r) => r.id === it.id)!.desc) : 'An unidentified ring. Wear it to learn its nature.';
      case 'amulet': return known ? withLore(AMULETS.find((a) => a.id === it.id)!.desc) : 'An unidentified amulet. Wear it to learn its nature.';
      default: return '';
    }
  }

  showDeath(): void {
    this.mode = 'dead';
    const g = this.game;
    const meta = Game.loadMeta();
    this.show(`
      <div class="panel deathpanel" style="text-align:center;">
        <img class="titleart" src="${import.meta.env.BASE_URL}art/death.png" onerror="this.style.display='none'" alt="" />
        <h1>YOU HAVE FALLEN</h1>
        <div class="tag">SLAIN BY ${g.deathCause.toUpperCase()} · ${g.locationName().toUpperCase()}</div>
        <table class="stats-table" style="margin:14px auto">
          <tr><td>Delver</td><td>${g.player.name}</td></tr>
          <tr><td>Level</td><td>${g.player.level}</td></tr>
          <tr><td>Kills</td><td>${g.player.kills}</td></tr>
          <tr><td>Gold</td><td>${g.player.gold}</td></tr>
          <tr><td>Turns</td><td>${g.player.turns}</td></tr>
          <tr><td>God</td><td>${g.player.godId ? GODS.find((x) => x.id === g.player.godId)!.name : 'none'}</td></tr>
        </table>
        <p class="flavor">The dungeon adds your name to its ledger — the ${meta.deaths}${['th','st','nd','rd'][((meta.deaths%100>10&&meta.deaths%100<14)?0:meta.deaths%10)]??'th'} entry in its pages.
        But the Codex survives you: everything you learned, the next delver knows. Knowledge is the one coin the dark cannot confiscate.</p>
        <p class="hint"><span class="key">Enter</span> to delve again · <span class="key">c</span>odex persists</p>
      </div>`);
  }

  showWin(): void {
    this.mode = 'win';
    const g = this.game;
    this.show(`
      <div class="panel winpanel" style="text-align:center;">
        <img class="titleart" src="${import.meta.env.BASE_URL}art/win.png" onerror="this.style.display='none'" alt="" />
        <h1>THE UNLIGHT DIES</h1>
        <div class="tag">THE THRONE STANDS EMPTY · THE CROWN IS YOURS</div>
        <table class="stats-table" style="margin:14px auto">
          <tr><td>Delver</td><td>${g.player.name}</td></tr>
          <tr><td>Level</td><td>${g.player.level}</td></tr>
          <tr><td>Kills</td><td>${g.player.kills}</td></tr>
          <tr><td>Gold</td><td>${g.player.gold}</td></tr>
          <tr><td>Turns</td><td>${g.player.turns}</td></tr>
        </table>
        <p class="flavor">You climb back toward a surface that has never heard of you,
        wearing a crown of something colder than metal. Somewhere below, the dark begins, very patiently, to wait again.</p>
        <p class="hint"><span class="key">Enter</span> to delve again</p>
      </div>`);
  }

  // ============================== codex
  codexTab: 'bestiary' | 'faiths' | 'chronicle' | 'origins' = 'bestiary';
  codexSel = 0;
  codexSearch: string | null = null; // null = not searching

  showCodex(): void {
    this.mode = 'codex';
    const g = this.game;
    const tabBtn = (id: typeof this.codexTab, label: string, key: string): string =>
      `<span class="cx-tab ${this.codexTab === id ? 'on' : ''}" data-tab="${id}"><span class="key">${key}</span> ${label}</span>`;
    const tabs = `${tabBtn('bestiary', 'Bestiary', '1')} ${tabBtn('faiths', 'Faiths', '2')} ${tabBtn('chronicle', 'Chronicle', '3')} ${tabBtn('origins', 'Origins', '4')}`;
    let body = '';
    if (this.codexTab === 'bestiary') {
      let seen = MONSTERS.filter((m) => g.bestiary.has(m.id));
      if (this.codexSearch) {
        const q = this.codexSearch.toLowerCase();
        const filtered = seen.filter((m) => m.name.toLowerCase().includes(q));
        if (filtered.length) seen = filtered;
      }
      const total = MONSTERS.filter((m) => m.weight > 0 || m.boss).length;
      if (!seen.length) {
        body = `<p class="flavor">Nothing catalogued yet. Meet the dark; it is eager to be introduced.</p>`;
      } else {
        this.codexSel = Math.max(0, Math.min(this.codexSel, seen.length - 1));
        const list = seen.map((m, i) =>
          `<div class="${i === this.codexSel ? 'sel' : ''}" data-i="${i}">
            <img class="spr" src="${spriteURL(monsterSpriteName(m.glyph), m.color)}" alt=""> ${m.name}${m.boss ? ' <b style="color:#d43a4a">◆</b>' : ''}</div>`).join('');
        const m = seen[this.codexSel];
        const stats = this.describeMonsterDef(m);
        const lore = MONSTER_LORE[m.id];
        const lore2 = MONSTER_LORE2[m.id];
        const kills = g.bestiaryKills[m.id] ?? 0;
        const need = m.boss ? 1 : 3;
        let deeper = '';
        if (lore2) {
          deeper = kills >= need
            ? `<p class="ex-lore" style="border-color:#6a4d8a">${lore2}</p>`
            : `<p class="ex-sub" style="margin-top:8px">☠ Slay ${need - kills} more to learn its deeper truth.</p>`;
        }
        body = `
          <div class="cx-split">
            <div class="inv-list cx-list">${list}</div>
            <div class="cx-detail">${stats}${lore ? `<p class="ex-lore">${lore}</p>` : ''}${deeper}</div>
          </div>
          <p class="hint">${this.codexSearch !== null
            ? `search: <b style="color:#e8c860">${this.codexSearch || '…'}</b> (type to filter, <span class="key">Enter</span> done)`
            : `${seen.length}/${total} catalogued (knowledge survives death) · <span class="key">↑↓</span> browse · <span class="key">/</span> search`}</p>`;
      }
    } else if (this.codexTab === 'faiths') {
      const gods = GODS;
      this.codexSel = Math.max(0, Math.min(this.codexSel, gods.length - 1));
      const list = gods.map((gd, i) =>
        `<div class="${i === this.codexSel ? 'sel' : ''}" data-i="${i}" style="color:${g.player?.godId === gd.id ? gd.color : ''}">${gd.name}${g.player?.godId === gd.id ? ' ✦' : ''}</div>`).join('');
      const gd = gods[this.codexSel];
      const lore = GOD_LORE[gd.id];
      body = `
        <div class="cx-split">
          <div class="inv-list cx-list">${list}</div>
          <div class="cx-detail">
            <h3 style="color:${gd.color}">${gd.name}</h3>
            <div class="ex-sub">${gd.title}</div>
            <p>${gd.desc}</p>
            <p><b>Doctrine:</b> ${gd.likes}</p>
            <p><b>Gifts:</b> ${gd.powers.map((pw) => `${pw.name} (piety ${pw.unlock})`).join(' · ')}</p>
            ${lore ? `<p class="ex-lore">${lore}</p>` : ''}
          </div>
        </div>`;
    } else if (this.codexTab === 'chronicle') {
      const unlocked = CHRONICLE.filter((e) => this.chronicleUnlocked(e));
      if (!unlocked.length) {
        body = `<p class="flavor">The Chronicle is blank. Descend, and it will write itself.</p>`;
      } else {
        this.codexSel = Math.max(0, Math.min(this.codexSel, unlocked.length - 1));
        const list = unlocked.map((e, i) => `<div class="${i === this.codexSel ? 'sel' : ''}" data-i="${i}">${e.title}</div>`).join('');
        const e = unlocked[this.codexSel];
        body = `
          <div class="cx-split">
            <div class="inv-list cx-list">${list}</div>
            <div class="cx-detail"><h3>${e.title}</h3><p class="ex-lore" style="border:none;padding:0">${e.text}</p></div>
          </div>
          <p class="hint">${unlocked.length}/${CHRONICLE.length} chapters recovered</p>`;
      }
    } else {
      const r = RACES.find((x) => x.id === g.player?.raceId);
      const c = CLASSES.find((x) => x.id === g.player?.classId);
      body = `
        <div class="cx-detail">
          ${r ? `<h3>${r.name}</h3><p>${r.desc}</p>${RACE_LORE[r.id] ? `<p class="ex-lore">${RACE_LORE[r.id]}</p>` : ''}` : ''}
          ${c ? `<h3 style="margin-top:14px">${c.name}</h3><p>${c.desc}</p>${CLASS_LORE[c.id] ? `<p class="ex-lore">${CLASS_LORE[c.id]}</p>` : ''}` : ''}
        </div>`;
    }
    this.show(`
      <div class="panel" style="width:820px; min-height:440px;">
        <h2>The Delver's Codex</h2>
        <div class="cx-tabs">${tabs}</div>
        ${body}
        <p class="hint"><span class="key">1–4</span> sections · <span class="key">↑↓</span> browse · <span class="key">Esc</span> close</p>
      </div>`);
    this.overlay.querySelectorAll('.cx-tab').forEach((el) => {
      el.addEventListener('click', () => {
        this.codexTab = (el as HTMLElement).dataset.tab as typeof this.codexTab;
        this.codexSel = 0;
        this.showCodex();
      });
    });
    this.overlay.querySelectorAll('.cx-list [data-i]').forEach((el) => {
      el.addEventListener('click', () => {
        this.codexSel = Number((el as HTMLElement).dataset.i);
        this.showCodex();
      });
    });
  }

  openCodexAt(monsterId: string): void {
    this.codexTab = 'bestiary';
    this.codexSearch = null;
    const seen = MONSTERS.filter((m) => this.game.bestiary.has(m.id));
    const i = seen.findIndex((m) => m.id === monsterId);
    this.codexSel = Math.max(0, i);
    this.showCodex();
  }

  chronicleUnlocked(e: { unlock: { kind: string; key?: string | number } }): boolean {
    const g = this.game;
    switch (e.unlock.kind) {
      case 'start': return true;
      case 'stratum': return g.seenStrata.has(e.unlock.key as number);
      case 'boss': return g.seenBosses.has(e.unlock.key as string);
      case 'god': return g.player?.godId != null;
      case 'win': return g.over === 'win';
      default: return false;
    }
  }

  describeMonsterDef(d: (typeof MONSTERS)[number]): string {
    const speedWord = d.speed <= 6 ? 'very slow' : d.speed <= 8 ? 'slow' : d.speed <= 11 ? 'normal speed' : d.speed <= 13 ? 'fast' : 'very fast';
    const traits: string[] = [];
    if (d.ranged) traits.push(`attacks at range (${d.ranged.name})`);
    if (d.summon) traits.push(`summons ${MONSTER_BY_ID.get(d.summon.id)?.name ?? 'aid'}`);
    if (d.drain) traits.push('drains life');
    if (d.regen) traits.push('regenerates');
    if (d.onHit) traits.push(`inflicts ${d.onHit.kind}`);
    if (d.amphibious) traits.push('swims');
    if (d.pack) traits.push('packs');
    const res = d.resist?.length ? ` Resists ${d.resist.join(', ')}.` : '';
    const vuln = d.vuln?.length ? ` Vulnerable to ${d.vuln.join(', ')}.` : '';
    return `
      <div class="ex-head"><img src="${spriteURL(monsterSpriteName(d.glyph), d.color)}" alt="" /><div>
        <h3>${d.name}</h3>
        <div class="ex-sub">found at depth ${d.depth[0]}${d.depth[1] > d.depth[0] ? `–${d.depth[1]}` : ''} · ${speedWord}${d.boss ? ' · <b style="color:#d43a4a">boss</b>' : ''}</div>
      </div></div>
      <p>${traits.length ? traits.join(' · ') : 'melee only'}.${res}${vuln}</p>
      ${d.flavor ? `<p class="ex-fla">${d.flavor}</p>` : ''}`;
  }

  codexKey(k: string): void {
    if (this.codexSearch !== null) {
      if (k === 'Enter' || k === 'Escape') {
        if (k === 'Escape') this.codexSearch = null;
        else this.codexSearch = this.codexSearch || null;
        this.showCodex();
        return;
      }
      if (k === 'Backspace') {
        this.codexSearch = this.codexSearch.slice(0, -1);
        this.codexSel = 0;
        this.showCodex();
        return;
      }
      if (k.length === 1 && /[a-z -]/i.test(k)) {
        this.codexSearch += k.toLowerCase();
        this.codexSel = 0;
        this.showCodex();
      }
      return;
    }
    if (k === '/' && this.codexTab === 'bestiary') {
      this.codexSearch = '';
      this.codexSel = 0;
      this.showCodex();
      return;
    }
    if (k === 'Escape' || k === 'c') {
      this.mode = 'play';
      this.codexSearch = null;
      this.hide();
      return;
    }
    const tabs: (typeof this.codexTab)[] = ['bestiary', 'faiths', 'chronicle', 'origins'];
    if (k >= '1' && k <= '4') {
      this.codexTab = tabs[Number(k) - 1];
      this.codexSel = 0;
      this.showCodex();
      return;
    }
    if (k === 'Tab') {
      this.codexTab = tabs[(tabs.indexOf(this.codexTab) + 1) % tabs.length];
      this.codexSel = 0;
      this.showCodex();
      return;
    }
    if (k === 'ArrowDown' || k === 'j') {
      this.codexSel++;
      this.showCodex();
      return;
    }
    if (k === 'ArrowUp' || k === 'k') {
      this.codexSel = Math.max(0, this.codexSel - 1);
      this.showCodex();
    }
  }

  // ============================== examine mode
  beginExamine(): void {
    const g = this.game;
    const vis = g.visibleMonsters();
    this.mode = 'examine';
    if (vis.length) {
      this.exX = vis[0].x;
      this.exY = vis[0].y;
    } else {
      this.exX = g.player.x;
      this.exY = g.player.y;
    }
    this.renderExamine();
  }

  private endExamine(): void {
    this.mode = 'play';
    if (this.exPanel) {
      this.exPanel.remove();
      this.exPanel = null;
    }
  }

  examineKey(k: string): void {
    const g = this.game;
    if (k === 'Escape' || k === 'q') {
      this.endExamine();
      return;
    }
    if (k === 'v') {
      const mon = g.monsters.find((m) => m.x === this.exX && m.y === this.exY);
      if (mon && g.level.visible[this.exY * g.level.w + this.exX]) {
        this.endExamine();
        this.openCodexAt(mon.def.id);
      }
      return;
    }
    if (k === 'Tab' || k === 'x' || k === '+') {
      const vis = g.visibleMonsters();
      if (vis.length) {
        const cur = vis.findIndex((m) => m.x === this.exX && m.y === this.exY);
        const next = vis[(cur + 1) % vis.length];
        this.exX = next.x;
        this.exY = next.y;
        this.renderExamine();
      }
      return;
    }
    const dirs: Record<string, [number, number]> = {
      ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0],
      h: [-1, 0], j: [0, 1], k: [0, -1], l: [1, 0],
      y: [-1, -1], u: [1, -1], b: [-1, 1], n: [1, 1],
    };
    if (dirs[k]) {
      const L = this.game.level;
      this.exX = Math.max(0, Math.min(L.w - 1, this.exX + dirs[k][0]));
      this.exY = Math.max(0, Math.min(L.h - 1, this.exY + dirs[k][1]));
      this.renderExamine();
    }
  }

  renderExamine(): void {
    if (!this.exPanel) {
      this.exPanel = document.createElement('div');
      this.exPanel.id = 'examine';
      document.getElementById('stage')!.appendChild(this.exPanel);
    }
    this.exPanel.innerHTML = this.describeTile(this.exX, this.exY);
  }

  describeTile(x: number, y: number): string {
    const g = this.game;
    const L = g.level;
    const i = y * L.w + x;
    const explored = L.explored[i] === 1;
    const visible = L.visible[i] === 1;
    const onMon = this.game.monsters.some((m) => m.x === x && m.y === y && this.game.level.visible[y * this.game.level.w + x]);
    const head = `<div class="ex-hint"><span class="key">←↑↓→</span> move · <span class="key">Tab</span> next foe${onMon ? ' · <span class="key">v</span> full codex entry' : ''} · <span class="key">Esc</span> done</div>`;
    if (!explored) return `${head}<h3>The Unknown</h3><p class="ex-fla">You have not walked there. It may not want you to.</p>`;
    const mon = visible ? g.monsters.find((m) => m.x === x && m.y === y) : undefined;
    if (mon) return head + this.describeMonster(mon);
    if (x === g.player.x && y === g.player.y) {
      return `${head}<h3>${g.player.name}</h3><p class="ex-fla">That is you: still upright, still descending. Both facts are subject to change.</p>`;
    }
    const items = g.items.filter((it) => it.x === x && it.y === y);
    if (visible && items.length) {
      const list = items.map((it) => `<b>${itemName(it, g.ident)}</b>`).join(', ');
      return `${head}<h3>On the ground</h3><p>${list}</p><p class="ex-fla">${this.describe(items[0]) || ''}</p>`;
    }
    return head + this.describeTerrain(L.tiles[i], i);
  }

  describeTerrain(t: number, i: number): string {
    const g = this.game;
    const s = STRATA[g.level.stratum];
    const T = {
      Wall: 0, Floor: 1, DoorClosed: 2, DoorOpen: 3, StairsDown: 4, Water: 5, Lava: 6,
      Altar: 7, Fungus: 8, Bones: 9, Rubble: 10, Torch: 11,
    };
    switch (t) {
      case T.Wall: case T.Torch:
        return `<h3>Ancient masonry</h3><p>Impassable.</p><p class="ex-fla">Whoever built ${s.name} built it to keep things in, not out.</p>`;
      case T.DoorClosed:
        return `<h3>Sealed door</h3><p>Walk into it to force it open. Monsters can too.</p>`;
      case T.DoorOpen:
        return `<h3>Open doorway</h3><p>Passable. It will not close again; nothing down here does.</p>`;
      case T.StairsDown:
        return `<h3>Descending stair</h3><p>Press <span class="key">></span> while standing on it. There is no way back up.</p>`;
      case T.Water:
        return `<h3>Black water</h3><p>Passable. −2 evasion while you stand in it (Mireborn gain +2). Douses burning.</p><p class="ex-fla">The surface is calm. The surface is lying.</p>`;
      case T.Lava:
        return `<h3>Molten rock</h3><p>Crossing it deals heavy fire damage every turn. Fire-resistant delvers merely suffer.</p>`;
      case T.Altar: {
        const god = GODS.find((x) => x.id === g.level.altarGod.get(i));
        return `<h3>Altar${god ? ` of ${god.name}` : ''}</h3><p>Stand on it and <span class="key">p</span>ray to pledge yourself${god ? ` to ${god.title}` : ''}. Worshippers may offer gold for piety.</p>`;
      }
      case T.Fungus:
        return `<h3>Glowing growth</h3><p>Walkable. Its light is one of the few honest things down here.</p>`;
      case T.Bones:
        return `<h3>Old bones</h3><p>Walkable. Somebody's bad ending, picked clean.</p>`;
      case T.Rubble:
        return `<h3>Rubble</h3><p>Walkable. The dungeon shrugs sometimes.</p>`;
      case 12: { // BranchDown
        const gi = this.game.level.gates.get(i);
        return `<h3>Sealed branch gate</h3><p>Press <span class="key">></span> on it to enter an optional side-dungeon. Its depths hold unique dangers — and a guarded prize. You can only return by winning through.</p>${gi ? '' : ''}`;
      }
      case 13: // PortalBack
        return `<h3>Portal home</h3><p>Press <span class="key">></span> to return to the great descent.</p>`;
      default:
        return `<h3>Worked stone</h3><p>Bare floor of ${s.name}.</p>`;
    }
  }

  describeMonster(m: Monster): string {
    const g = this.game;
    const d = m.def;
    const speedWord = d.speed <= 6 ? 'very slow' : d.speed <= 8 ? 'slow' : d.speed <= 11 ? 'normal speed' : d.speed <= 13 ? 'fast' : 'very fast';
    const hpFrac = m.hp / m.maxHp;
    const hpWord = m.friendly ? 'bound to you' : hpFrac >= 1 ? 'unharmed' : hpFrac > 0.66 ? 'lightly wounded' : hpFrac > 0.33 ? 'wounded' : 'nearly destroyed';
    const traits: string[] = [];
    if (d.ranged) traits.push(`attacks at range (${d.ranged.name})`);
    if (d.summon) traits.push('summons reinforcements');
    if (d.drain) traits.push('drains life with its blows');
    if (d.regen) traits.push('regenerates rapidly');
    if (d.onHit) traits.push(`its blows can inflict ${d.onHit.kind}`);
    if (d.amphibious) traits.push('at home in water');
    if (d.pack) traits.push('hunts in packs');
    if (d.flees) traits.push('flees when hurt');
    const res = d.resist?.length ? `resists ${d.resist.join(', ')}` : '';
    const vuln = d.vuln?.length ? `vulnerable to ${d.vuln.join(', ')}` : '';
    const avg = (d.dmg[0] + d.dmg[1]) / 2 + m.dmgBonus;
    const hpTot = Math.max(1, g.maxHpTot());
    const threat = m.friendly ? '' : avg * 3 >= hpTot ? 'deadly' : avg * 6 >= hpTot ? 'dangerous' : avg * 12 >= hpTot ? 'a real threat' : 'a nuisance';
    const spr = spriteURL(monsterSpriteName(d.glyph), d.color);
    return `
      <div class="ex-head"><img src="${spr}" alt="" /><div>
        <h3>${d.name}${m.friendly ? ' (ally)' : ''}</h3>
        <div class="ex-sub">${hpWord} · ${speedWord}${d.boss ? ' · <b style="color:#d43a4a">boss</b>' : threat ? ` · looks ${threat}` : ''}</div>
      </div></div>
      <p>${traits.length ? traits.join('; ') + '.' : 'A straightforward killer: it walks up and it hits you.'}
      ${res ? ' It ' + res + '.' : ''}${vuln ? ' It is ' + vuln + '.' : ''}</p>
      ${d.flavor ? `<p class="ex-fla">${d.flavor}</p>` : ''}
      ${MONSTER_LORE[d.id] ? `<p class="ex-lore">${MONSTER_LORE[d.id]}</p>` : ''}`;
  }

  // ============================== targeting
  beginTarget(ab: AbilityDef, source: 'class' | 'god'): void {
    const g = this.game;
    this.targets = g.visibleMonsters().filter((m) =>
      g.dist(g.player.x, g.player.y, m.x, m.y) <= ab.range &&
      (ab.range <= 1 || g.losClear(g.player.x, g.player.y, m.x, m.y)));
    if (!this.targets.length) {
      g.msg(ab.range <= 1 ? 'Nothing within reach.' : 'No target in sight.', C.info);
      return;
    }
    this.pendingAbility = { ab, source };
    if (this.targets.length === 1) {
      this.confirmTarget();
      return;
    }
    this.mode = 'target';
    this.targetIdx = 0;
    g.msg(`Target: ${this.targets[0].def.name} (Tab to cycle, Enter to strike)`, C.warn);
  }

  confirmTarget(): void {
    const pa = this.pendingAbility;
    if (!pa) return;
    const t = this.targets[this.targetIdx];
    this.pendingAbility = null;
    this.mode = 'play';
    if (t) this.game.useAbility(pa.ab, pa.source, t);
    this.afterAction();
  }

  // ============================== input
  onKey(e: KeyboardEvent): void {
    const k = e.key;
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Tab', ' '].includes(k)) e.preventDefault();
    switch (this.mode) {
      case 'title':
        if (k === 'Enter' || k === ' ') {
          if (Game.hasSave() && this.game.tryRestore()) {
            this.mode = 'play';
            this.hide();
            this.refreshHud();
          } else {
            this.showRaceSelect();
          }
        }
        if (k === 'n') {
          Game.clearSave();
          this.showRaceSelect();
        }
        return;
      case 'race': {
        const i = LETTERS.indexOf(k);
        if (i >= 0 && i < RACES.length) { this.raceSel = i; this.showClassSelect(); }
        if (k === 'Escape') this.showTitle();
        return;
      }
      case 'class': {
        const i = LETTERS.indexOf(k);
        if (i >= 0 && i < CLASSES.length) { this.classSel = i; this.startGame(); }
        if (k === 'Escape') this.showRaceSelect();
        return;
      }
      case 'help':
        if (k === 'Escape' || k === '?') { this.mode = 'play'; this.hide(); }
        return;
      case 'dead':
      case 'win':
        if (k === 'Enter') location.reload();
        return;
      case 'inv':
        this.invKey(k);
        return;
      case 'target':
        this.targetKey(k);
        return;
      case 'examine':
        this.examineKey(k);
        return;
      case 'codex':
        this.codexKey(k);
        return;
      case 'play':
        this.playKey(k, e);
        return;
    }
  }

  invKey(k: string): void {
    const g = this.game;
    if (k === 'Escape' || k === 'i') {
      this.mode = 'play';
      this.invSel = -1;
      this.hide();
      return;
    }
    if (k >= '1' && k <= '5') {
      const slots = ['weapon', 'body', 'amulet', 'ring1', 'ring2'] as const;
      const slot = slots[Number(k) - 1];
      if (g.player.equip[slot]) {
        g.unequip(slot);
        this.invSel = -1;
        this.showInventory();
        this.afterAction();
      }
      return;
    }
    if (this.invSel >= 0 && g.player.inventory[this.invSel]) {
      const it = g.player.inventory[this.invSel];
      if (k === 'Enter') {
        this.invSel = -1;
        this.mode = 'play';
        this.hide();
        g.useItem(it);
        this.afterAction();
        return;
      }
      if (k === 'd') {
        g.dropItem(it);
        this.invSel = -1;
        this.showInventory();
        this.afterAction();
        return;
      }
    }
    const i = LETTERS.indexOf(k);
    if (i >= 0 && i < g.player.inventory.length) {
      if (i === this.invSel) {
        // second press of the same letter = use/equip
        const it = g.player.inventory[i];
        this.invSel = -1;
        this.mode = 'play';
        this.hide();
        g.useItem(it);
        this.afterAction();
        return;
      }
      this.invSel = i;
      this.showInventory();
    }
  }

  targetKey(k: string): void {
    if (k === 'Escape') {
      this.pendingAbility = null;
      this.mode = 'play';
      return;
    }
    if (k === 'Tab' || k === 'ArrowRight' || k === 'ArrowDown') {
      this.targetIdx = (this.targetIdx + 1) % this.targets.length;
      return;
    }
    if (k === 'ArrowLeft' || k === 'ArrowUp') {
      this.targetIdx = (this.targetIdx - 1 + this.targets.length) % this.targets.length;
      return;
    }
    if (k === 'Enter' || k === ' ') this.confirmTarget();
  }

  playKey(k: string, e: KeyboardEvent): void {
    const g = this.game;
    if (g.over) {
      if (g.over === 'dead') this.showDeath();
      else this.showWin();
      return;
    }
    const dirs: Record<string, [number, number]> = {
      ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0],
      h: [-1, 0], j: [0, 1], k: [0, -1], l: [1, 0],
      y: [-1, -1], u: [1, -1], b: [-1, 1], n: [1, 1],
      '4': [-1, 0], '6': [1, 0], '8': [0, -1], '2': [0, 1],
      '7': [-1, -1], '9': [1, -1], '1': [-1, 1], '3': [1, 1],
    };
    if (e.code.startsWith('Numpad')) {
      if (k === '5') { g.wait(); this.afterAction(); return; }
      if (dirs[k]) { g.tryMove(dirs[k][0], dirs[k][1]); this.afterAction(); return; }
    }
    if (dirs[k] && !/^[0-9]$/.test(k) && !e.ctrlKey && !e.metaKey) {
      g.tryMove(dirs[k][0], dirs[k][1]);
      this.afterAction();
      return;
    }
    switch (k) {
      case '.': g.wait(); break;
      case 'g': case ',': g.pickup(); break;
      case '>': g.descend(); break;
      case 'i': this.showInventory(); return;
      case 'p': g.pray(); break;
      case 'o': g.autoExplore(); break;
      case 'r': g.rest(); break;
      case '?': this.showHelp(); return;
      case 'x': this.beginExamine(); return;
      case 'c': this.codexSel = 0; this.showCodex(); return;
      default: {
        // ability hotkeys — but 1-5 are also movement on numpad; use code check
        if (e.code.startsWith('Digit') && k >= '1' && k <= '5') {
          const slot = Number(k) - 1;
          const abilities = g.abilitySlots();
          if (slot < abilities.length) {
            const a = abilities[slot];
            if (!a.usable && a.ab.id !== 'reprieve') {
              const need = a.source === 'class'
                ? (g.player.level < a.ab.unlock ? `Unlocks at level ${a.ab.unlock}.` : 'Not enough mana.')
                : (g.player.piety < a.ab.unlock ? `Requires ${a.ab.unlock} piety.` : 'Not enough piety.');
              g.msg(`${a.ab.name}: ${need}`, C.info);
            } else if (g.needsTarget(a.ab)) {
              this.beginTarget(a.ab, a.source);
            } else {
              g.useAbility(a.ab, a.source);
            }
          }
        }
      }
    }
    this.afterAction();
  }

  afterAction(): void {
    const g = this.game;
    if (g.over === 'dead') setTimeout(() => this.showDeath(), 900);
    if (g.over === 'win') setTimeout(() => this.showWin(), 1200);
    this.refreshHud();
  }

  // ============================== HUD
  refreshHud(): void {
    const g = this.game;
    if (!g.player || !g.level) return;
    const p = g.player;
    const s = STRATA[g.level.stratum];
    const god = p.godId ? GODS.find((x) => x.id === p.godId)! : null;
    const bar = (cls: string, cur: number, max: number, label: string): string =>
      `<div class="bar ${cls}"><i style="transform:scaleX(${Math.max(0, Math.min(1, cur / Math.max(1, max)))})"></i><b>${label}</b></div>`;
    const statuses = p.statuses.map((st) =>
      `<span>${st.kind}${st.kind === 'shield' ? ` ${st.power}` : ''} · ${st.turns}</span>`).join('');
    const abilities = g.abilitySlots().map((a, i) => {
      const locked = a.source === 'class' ? p.level < a.ab.unlock : p.piety < a.ab.unlock;
      return `<div class="${locked || !a.usable ? 'off' : ''}"><span class="key">${i + 1}</span> ${a.ab.name}
        <span class="cost">${locked ? (a.source === 'class' ? `lvl ${a.ab.unlock}` : `piety ${a.ab.unlock}`) : a.costLabel}</span></div>`;
    }).join('');
    const eqLine = (label: string, it: Item | null): string =>
      `<div><span class="k">${label}</span> ${it ? itemName(it, g.ident) : '<span style="opacity:.35">—</span>'}</div>`;
    this.hud.innerHTML = `
      <div class="hud-head">
        <img class="doll" src="${playerDollURL(p.raceId, p.equip)}" alt="" />
        <div>
          <h1>${p.name}</h1>
          <div class="sub">${g.locationName()} · turn ${p.turns}</div>
        </div>
      </div>
      ${bar('hp', Math.max(0, p.hp), g.maxHpTot(), `HP ${Math.max(0, p.hp)}/${g.maxHpTot()}`)}
      ${bar('mp', p.mp, g.maxMpTot(), `MP ${p.mp}/${g.maxMpTot()}`)}
      ${bar('xp', p.xp, g.xpNeed(), `Level ${p.level} · ${p.xp}/${g.xpNeed()} xp`)}
      ${god ? bar('piety', p.piety, 200, `${god.name} · piety ${p.piety}`) : '<div class="sub" style="margin:2px 0 6px">godless · find an altar</div>'}
      <div class="row"><span>STR <b>${p.str}</b></span><span>DEX <b>${p.dex}</b></span><span>WIL <b>${p.wil}</b></span></div>
      <div class="row"><span class="k">AC ${g.playerAC()} · EV ${g.playerEV()}</span><span class="k">gold ${p.gold}</span></div>
      <div class="statuses">${statuses}</div>
      <div class="abil">${abilities}</div>
      <div class="equip">
        ${eqLine('wield', p.equip.weapon)}
        ${eqLine('wear', p.equip.body)}
        ${eqLine('amulet', p.equip.amulet)}
        ${eqLine('rings', p.equip.ring1 ?? p.equip.ring2)}
      </div>`;
    // log
    if (g.msgs.length !== this.msgCount || g.dirty) {
      this.msgCount = g.msgs.length;
      this.log.innerHTML = g.msgs.slice(-40).map((m) =>
        `<p style="color:${m.color}">${m.text}${m.count > 1 ? ` <span style="opacity:.6">×${m.count}</span>` : ''}</p>`).join('');
      this.log.scrollTop = this.log.scrollHeight;
    }
    g.dirty = false;
  }

  tick(): void {
    const g = this.game;
    if (g.dirty && (this.mode === 'play' || this.mode === 'target')) this.refreshHud();
    if (g.player && g.level) this.ren.drawMinimap(this.minimap, g);
  }

  view(): { mode: string; targetMon: { x: number; y: number } | null; targetRange: number; cursor: { x: number; y: number } | null } {
    return {
      mode: this.mode,
      targetMon: this.mode === 'target' ? this.targets[this.targetIdx] ?? null : null,
      targetRange: this.pendingAbility?.ab.range ?? 0,
      cursor: this.mode === 'examine' ? { x: this.exX, y: this.exY } : null,
    };
  }
}
