import { T, idx, type FX } from './types';
import { STRATA } from './data';
import { itemSprite, monsterSprite, playerDoll, sprite, terrain } from './sprites';
import type { Game } from './game';

const TS = 32; // tile px (16px sprites at 2x)

interface Particle { x: number; y: number; vx: number; vy: number; life: number; max: number; color: string; size: number }
interface Floater { x: number; y: number; text: string; color: string; life: number }
interface Beam { x0: number; y0: number; x1: number; y1: number; color: string; life: number }
interface Trail { points: [number, number][]; life: number }

export interface UIView {
  mode: string;
  targetMon: { x: number; y: number } | null;
  targetRange: number;
  cursor: { x: number; y: number } | null;
}

export class Renderer {
  cv: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  particles: Particle[] = [];
  floaters: Floater[] = [];
  beams: Beam[] = [];
  trails: Trail[] = [];
  shake = 0;
  flash: { color: string; life: number } | null = null;
  noise: number[] = [];

  constructor(cv: HTMLCanvasElement) {
    this.cv = cv;
    this.ctx = cv.getContext('2d')!;
    for (let i = 0; i < 4096; i++) this.noise.push(Math.random());
    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  resize(): void {
    const r = this.cv.parentElement!.getBoundingClientRect();
    this.cv.width = Math.floor(r.width);
    this.cv.height = Math.floor(r.height);
  }

  consumeFx(fx: FX[]): void {
    for (const f of fx) {
      switch (f.t) {
        case 'float':
          this.floaters.push({ x: f.x, y: f.y, text: f.text, color: f.color, life: 1 });
          break;
        case 'shake':
          this.shake = Math.max(this.shake, f.mag);
          break;
        case 'burst':
          for (let i = 0; i < f.n; i++) {
            const a = Math.random() * Math.PI * 2;
            const sp = 0.5 + Math.random() * 2.2;
            this.particles.push({
              x: f.x + 0.5, y: f.y + 0.5,
              vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 0.5,
              life: 1, max: 0.4 + Math.random() * 0.5,
              color: f.color, size: 1.5 + Math.random() * 2.5,
            });
          }
          break;
        case 'beam':
          this.beams.push({ ...f, life: 1 });
          break;
        case 'trail':
          this.trails.push({ points: f.points, life: 1 });
          break;
        case 'flash':
          this.flash = { color: f.color, life: 1 };
          break;
      }
    }
    fx.length = 0;
  }

  draw(g: Game, ui: UIView, t: number, dt: number): void {
    const { ctx, cv } = this;
    this.consumeFx(g.fx);
    const L = g.level;
    const S = STRATA[L.stratum];
    const p = g.player;

    ctx.fillStyle = '#020204';
    ctx.fillRect(0, 0, cv.width, cv.height);

    const camX = Math.floor(p.x * TS - cv.width / 2 + TS / 2);
    const camY = Math.floor(p.y * TS - cv.height / 2 + TS / 2);

    ctx.save();
    if (this.shake > 0.3) {
      ctx.translate((Math.random() - 0.5) * this.shake * 2, (Math.random() - 0.5) * this.shake * 2);
      this.shake *= Math.pow(0.02, dt);
    }

    const x0 = Math.max(0, Math.floor(camX / TS) - 1);
    const y0 = Math.max(0, Math.floor(camY / TS) - 1);
    const x1 = Math.min(L.w - 1, Math.ceil((camX + cv.width) / TS) + 1);
    const y1 = Math.min(L.h - 1, Math.ceil((camY + cv.height) / TS) + 1);

    // -------- light field for visible tiles
    const lightOf = (x: number, y: number): number => {
      const dx = x - p.x, dy = y - p.y;
      const d = Math.sqrt(dx * dx + dy * dy);
      let l = Math.max(0, 1 - d / (g.race?.fov ?? 8));
      l = 0.5 + l * 0.55;
      for (const li of L.lights) {
        const ldx = x - li.x, ldy = y - li.y;
        const ld = Math.sqrt(ldx * ldx + ldy * ldy);
        if (ld < li.r) {
          const fl = 0.8 + 0.2 * Math.sin(t * 0.006 + li.flicker * 7);
          l = Math.max(l, (1 - ld / li.r) * fl);
        }
      }
      return Math.min(1, l);
    };

    ctx.imageSmoothingEnabled = false;
    ctx.font = `bold ${TS - 12}px ui-monospace, Menlo, Consolas, monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const wallLike = (tt: number): boolean => tt === T.Wall || tt === T.Torch;

    for (let y = y0; y <= y1; y++) {
      for (let x = x0; x <= x1; x++) {
        const i = idx(x, y, L.w);
        if (!L.explored[i]) continue;
        const vis = L.visible[i] === 1;
        const tile = L.tiles[i];
        const sx = x * TS - camX;
        const sy = y * TS - camY;
        const n = this.noise[(x * 73 + y * 149) % 4096];
        const variant = (x * 7 + y * 13) % 4;
        const lv = vis ? lightOf(x, y) : 0.24;

        if (wallLike(tile)) {
          const below = y + 1 < L.h ? L.tiles[idx(x, y + 1, L.w)] : T.Wall;
          const isFace = !wallLike(below);
          ctx.drawImage(terrain(isFace ? 'wallFace' : 'wallTop', S.wall, variant), sx, sy, TS, TS);
        } else if (tile === T.Water) {
          const wob = Math.sin(t * 0.0025 + (x * 5 + y * 11)) * 0.12;
          ctx.fillStyle = `rgb(${Math.floor(42 + wob * 30)},${Math.floor(86 + wob * 40)},${Math.floor(124 + wob * 45)})`;
          ctx.fillRect(sx, sy, TS, TS);
          // ripple highlights
          if (vis) {
            ctx.fillStyle = `rgba(160,205,235,${0.18 + 0.12 * Math.sin(t * 0.003 + x * 2 + y)})`;
            ctx.fillRect(sx + 4, sy + 8 + Math.floor(2 * Math.sin(t * 0.002 + x + y)), 12, 2);
            ctx.fillRect(sx + 18, sy + 22 + Math.floor(2 * Math.cos(t * 0.002 + x - y)), 10, 2);
          }
        } else if (tile === T.Lava) {
          const wob = 0.75 + 0.25 * Math.sin(t * 0.004 + (x * 3 + y * 7));
          ctx.fillStyle = `rgb(${Math.floor(225 * wob)},${Math.floor(80 * wob)},${Math.floor(22 * wob)})`;
          ctx.fillRect(sx, sy, TS, TS);
          if (vis) {
            ctx.fillStyle = `rgba(255,210,110,${0.3 + 0.2 * Math.sin(t * 0.005 + x + y * 3)})`;
            ctx.fillRect(sx + 6, sy + 10, 10, 3);
            ctx.fillRect(sx + 20, sy + 22, 7, 2);
          }
        } else {
          ctx.drawImage(terrain('floor', S.floor, variant), sx, sy, TS, TS);
        }

        // ambient occlusion: floor tiles in the "shadow" of a wall above
        if (!wallLike(tile) && y > 0 && wallLike(L.tiles[idx(x, y - 1, L.w)])) {
          ctx.fillStyle = 'rgba(0,0,0,0.3)';
          ctx.fillRect(sx, sy, TS, 5);
        }

        // decal (blood)
        const dec = L.decals.get(i);
        if (dec) {
          ctx.fillStyle = dec;
          ctx.beginPath();
          ctx.arc(sx + TS / 2 + (n - 0.5) * 8, sy + TS / 2 + (n - 0.5) * 6, TS * 0.28, 0, Math.PI * 2);
          ctx.fill();
        }

        // feature sprites
        const feat = (name: string, tint: string, glow = 0): void => {
          if (glow > 0 && vis) {
            ctx.shadowColor = tint;
            ctx.shadowBlur = glow;
          }
          ctx.drawImage(sprite(name, tint), sx, sy, TS, TS);
          ctx.shadowBlur = 0;
        };
        switch (tile) {
          case T.DoorClosed: feat('doorClosed', '#8a6a42'); break;
          case T.DoorOpen: feat('doorOpen', '#8a6a42'); break;
          case T.StairsDown: feat('stairs', '#d8d0c0', 10); break;
          case T.Altar: feat('altar', '#b08ae8', 12); break;
          case T.Fungus: feat('fungus', S.accent, vis ? 8 : 0); break;
          case T.Bones: feat('bones', '#b0a894'); break;
          case T.Rubble: feat('rubble', '#8a8278'); break;
          case T.BranchDown: feat('portal', '#dcbe6e', 12); break;
          case T.PortalBack: feat('portal', '#8a6cf0', 12); break;
          case T.Merchant: feat('humanoid', '#dcbe6e', 10); break;
          case T.WarpAltar: feat('altar', '#8ad45a', 14); break;
        }

        // lighting overlay
        const dark = vis ? Math.min(0.72, (1 - lv) * 0.9) : 0.72;
        if (dark > 0.02) {
          ctx.fillStyle = `rgba(4,3,10,${dark})`;
          ctx.fillRect(sx, sy, TS, TS);
        }

        // torch flame on top of wall tile
        if (tile === T.Torch && vis) {
          const fl = Math.sin(t * 0.02 + x * 7 + y * 3);
          ctx.shadowColor = '#ff9a3c';
          ctx.shadowBlur = 10;
          ctx.fillStyle = `rgba(255,${170 + fl * 40},70,0.95)`;
          ctx.beginPath();
          ctx.arc(sx + TS / 2, sy + TS / 2 + 2, 4.5 + fl, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = `rgba(255,225,150,0.95)`;
          ctx.beginPath();
          ctx.arc(sx + TS / 2, sy + TS / 2 + 1, 2, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      }
    }

    // -------- items
    for (const it of g.items) {
      const i = idx(it.x, it.y, L.w);
      if (!L.explored[i]) continue;
      const vis = L.visible[i] === 1;
      if (!vis && it.kind !== 'gold') continue;
      const [name, col] = itemSprite(it);
      const sx = it.x * TS - camX, sy = it.y * TS - camY;
      ctx.shadowColor = col;
      ctx.shadowBlur = 8;
      ctx.globalAlpha = vis ? 1 : 0.5;
      ctx.drawImage(sprite(name, col), sx, sy, TS, TS);
      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;
    }

    // -------- monsters
    const senseAll = g.player.equip.amulet?.id === 'whispers' || g.player.corruptions?.includes('hollowedeye');
    for (const m of g.monsters) {
      const i = idx(m.x, m.y, L.w);
      const vis = L.visible[i] === 1;
      if (!vis && !(senseAll && g.dist(p.x, p.y, m.x, m.y) <= 14)) continue;
      const sx = m.x * TS - camX, sy = m.y * TS - camY;
      const bob = m.def.boss ? Math.sin(t * 0.004 + m.uid) * 2 : 0;
      ctx.shadowColor = m.def.color;
      ctx.shadowBlur = m.def.boss ? 18 : 9;
      ctx.globalAlpha = vis ? 1 : 0.4;
      const img = sprite(monsterSprite(m.def.glyph), m.def.color);
      if (m.def.boss) {
        const bs = Math.floor(TS * 1.3);
        const off = Math.floor((bs - TS) / 2);
        ctx.drawImage(img, sx - off, sy - off + bob, bs, bs);
      } else {
        ctx.drawImage(img, sx, sy + bob, TS, TS);
      }
      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;
      // hp bar
      if (vis && m.hp < m.maxHp) {
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.fillRect(sx + 3, sy - 3, TS - 6, 3);
        ctx.fillStyle = m.friendly ? '#6a9adb' : '#c22e40';
        ctx.fillRect(sx + 3, sy - 3, (TS - 6) * Math.max(0, m.hp / m.maxHp), 3);
      }
      if (vis && !m.awake) {
        ctx.fillStyle = 'rgba(200,200,255,0.8)';
        ctx.font = `bold 12px ui-monospace, monospace`;
        ctx.fillText('z', sx + TS - 7, sy + 8);
        ctx.font = `bold ${TS - 12}px ui-monospace, Menlo, monospace`;
      }
      if (vis && m.friendly) {
        ctx.fillStyle = '#6a9adb';
        ctx.fillRect(sx + TS / 2 - 2, sy + TS - 4, 4, 4);
      }
    }

    // -------- player (composed paper doll)
    {
      const sx = p.x * TS - camX, sy = p.y * TS - camY;
      ctx.shadowColor = '#e8e0d0';
      ctx.shadowBlur = 14;
      ctx.drawImage(playerDoll(p.raceId, p.equip), sx, sy, TS, TS);
      ctx.shadowBlur = 0;
    }

    // -------- boss presence bar
    const boss = g.monsters.find((m) => m.def.boss && L.visible[idx(m.x, m.y, L.w)]);
    if (boss) {
      const bw = Math.min(460, cv.width - 80);
      const bx = (cv.width - bw) / 2;
      ctx.fillStyle = 'rgba(8,6,12,0.82)';
      ctx.fillRect(bx - 10, 12, bw + 20, 40);
      ctx.strokeStyle = 'rgba(155,28,46,0.7)';
      ctx.strokeRect(bx - 10, 12, bw + 20, 40);
      ctx.font = 'bold 14px Georgia, serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#e8d8c8';
      ctx.shadowColor = '#9b1c2e';
      ctx.shadowBlur = 8;
      ctx.fillText(boss.def.name.toUpperCase(), cv.width / 2, 26);
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#241018';
      ctx.fillRect(bx, 34, bw, 10);
      ctx.fillStyle = '#c22e40';
      ctx.fillRect(bx, 34, bw * Math.max(0, boss.hp / boss.maxHp), 10);
      ctx.font = `bold ${TS - 12}px ui-monospace, Menlo, monospace`;
    }

    // -------- light bloom (additive)
    ctx.globalCompositeOperation = 'lighter';
    for (const li of L.lights) {
      const sx = li.x * TS - camX + TS / 2;
      const sy = li.y * TS - camY + TS / 2;
      if (sx < -200 || sy < -200 || sx > cv.width + 200 || sy > cv.height + 200) continue;
      if (!L.visible[idx(li.x, li.y, L.w)] && !L.explored[idx(li.x, li.y, L.w)]) continue;
      if (!L.visible[idx(li.x, li.y, L.w)]) continue;
      const fl = 0.75 + 0.25 * Math.sin(t * 0.006 + li.flicker * 7);
      const rad = li.r * TS * 0.9 * fl;
      const grad = ctx.createRadialGradient(sx, sy, 0, sx, sy, rad);
      grad.addColorStop(0, `rgba(${li.color[0]},${li.color[1]},${li.color[2]},0.14)`);
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grad;
      ctx.fillRect(sx - rad, sy - rad, rad * 2, rad * 2);
    }
    ctx.globalCompositeOperation = 'source-over';

    // -------- auto-explore footprint trails
    for (const tr of this.trails) {
      tr.life -= dt * 0.3;
      if (tr.life <= 0) continue;
      const n = tr.points.length;
      for (let i = 0; i < n - 1; i++) {
        // older steps fade first, so the trail dissolves from the tail
        const a = Math.max(0, Math.min(1, tr.life * 1.2 - (1 - i / n) * 0.3)) * 0.85;
        if (a <= 0.02) continue;
        const [tx, ty] = tr.points[i];
        ctx.fillStyle = `rgba(240,228,190,${a})`;
        ctx.shadowColor = '#e8dcb0';
        ctx.shadowBlur = 6;
        const off = i % 2 === 0 ? -4 : 4; // alternate like footfalls
        ctx.beginPath();
        ctx.arc(tx * TS - camX + TS / 2 + off, ty * TS - camY + TS / 2 + 2, 3.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }
    this.trails = this.trails.filter((tr) => tr.life > 0);

    // -------- beams
    for (const b of this.beams) {
      ctx.strokeStyle = b.color;
      ctx.globalAlpha = b.life * 0.9;
      ctx.lineWidth = 2.5 * b.life;
      ctx.shadowColor = b.color;
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.moveTo(b.x0 * TS - camX + TS / 2, b.y0 * TS - camY + TS / 2);
      ctx.lineTo(b.x1 * TS - camX + TS / 2, b.y1 * TS - camY + TS / 2);
      ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;
      b.life -= dt * 4;
    }
    this.beams = this.beams.filter((b) => b.life > 0);

    // -------- particles
    for (const pa of this.particles) {
      pa.x += pa.vx * dt * 6;
      pa.y += pa.vy * dt * 6;
      pa.vy += dt * 3;
      pa.life -= dt / pa.max;
      if (pa.life <= 0) continue;
      ctx.globalAlpha = Math.max(0, pa.life);
      ctx.fillStyle = pa.color;
      ctx.fillRect(pa.x * TS - camX, pa.y * TS - camY, pa.size, pa.size);
    }
    ctx.globalAlpha = 1;
    this.particles = this.particles.filter((pa) => pa.life > 0);

    // -------- floaters
    ctx.font = `bold 15px ui-monospace, Menlo, monospace`;
    for (const f of this.floaters) {
      f.life -= dt * 1.1;
      if (f.life <= 0) continue;
      ctx.globalAlpha = Math.min(1, f.life * 2);
      ctx.fillStyle = f.color;
      ctx.shadowColor = '#000';
      ctx.shadowBlur = 4;
      ctx.fillText(f.text, f.x * TS - camX + TS / 2, f.y * TS - camY - 4 + (1 - f.life) * -18);
      ctx.shadowBlur = 0;
    }
    ctx.globalAlpha = 1;
    ctx.font = `bold ${TS - 12}px ui-monospace, Menlo, monospace`;
    this.floaters = this.floaters.filter((f) => f.life > 0);

    // -------- examine cursor
    if (ui.mode === 'examine' && ui.cursor) {
      const cx = ui.cursor.x, cy = ui.cursor.y;
      const pulse = 0.6 + 0.4 * Math.sin(t * 0.012);
      ctx.strokeStyle = `rgba(180,220,255,${pulse})`;
      ctx.lineWidth = 2;
      ctx.strokeRect(cx * TS - camX + 2, cy * TS - camY + 2, TS - 4, TS - 4);
    }

    // -------- targeting
    if (ui.mode === 'target' && ui.targetMon) {
      const tm = ui.targetMon;
      const pulse = 0.6 + 0.4 * Math.sin(t * 0.012);
      ctx.strokeStyle = `rgba(255,210,100,${pulse})`;
      ctx.lineWidth = 2;
      ctx.strokeRect(tm.x * TS - camX + 2, tm.y * TS - camY + 2, TS - 4, TS - 4);
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = `rgba(255,210,100,${pulse * 0.5})`;
      ctx.beginPath();
      ctx.moveTo(p.x * TS - camX + TS / 2, p.y * TS - camY + TS / 2);
      ctx.lineTo(tm.x * TS - camX + TS / 2, tm.y * TS - camY + TS / 2);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    ctx.restore();

    // -------- flash
    if (this.flash) {
      ctx.globalAlpha = this.flash.life * 0.25;
      ctx.fillStyle = this.flash.color;
      ctx.fillRect(0, 0, cv.width, cv.height);
      ctx.globalAlpha = 1;
      this.flash.life -= dt * 3;
      if (this.flash.life <= 0) this.flash = null;
    }

    // -------- vignette
    const vg = ctx.createRadialGradient(
      cv.width / 2, cv.height / 2, Math.min(cv.width, cv.height) * 0.32,
      cv.width / 2, cv.height / 2, Math.max(cv.width, cv.height) * 0.72);
    vg.addColorStop(0, 'rgba(0,0,0,0)');
    vg.addColorStop(1, 'rgba(0,0,0,0.55)');
    ctx.fillStyle = vg;
    ctx.fillRect(0, 0, cv.width, cv.height);

    // low hp warning pulse
    const hpFrac = p.hp / Math.max(1, g.maxHpTot());
    if (hpFrac < 0.3 && !g.over) {
      const a = (0.3 - hpFrac) * (0.5 + 0.5 * Math.sin(t * 0.008));
      const rg = ctx.createRadialGradient(
        cv.width / 2, cv.height / 2, Math.min(cv.width, cv.height) * 0.3,
        cv.width / 2, cv.height / 2, Math.max(cv.width, cv.height) * 0.7);
      rg.addColorStop(0, 'rgba(155,28,46,0)');
      rg.addColorStop(1, `rgba(155,28,46,${a})`);
      ctx.fillStyle = rg;
      ctx.fillRect(0, 0, cv.width, cv.height);
    }
  }

  private embers: Particle[] = [];
  drawMenuBg(t: number, dt: number): void {
    const { ctx, cv } = this;
    ctx.fillStyle = '#050408';
    ctx.fillRect(0, 0, cv.width, cv.height);
    if (this.embers.length < 60 && Math.random() < 0.3) {
      this.embers.push({
        x: Math.random() * cv.width, y: cv.height + 10,
        vx: (Math.random() - 0.5) * 12, vy: -14 - Math.random() * 24,
        life: 1, max: 5 + Math.random() * 6,
        color: Math.random() < 0.7 ? '#e07a2e' : '#9b1c2e', size: 1 + Math.random() * 2.5,
      });
    }
    for (const e of this.embers) {
      e.x += e.vx * dt + Math.sin(t * 0.001 + e.max) * 0.4;
      e.y += e.vy * dt;
      e.life -= dt / e.max;
      if (e.life <= 0) continue;
      ctx.globalAlpha = Math.min(0.8, e.life);
      ctx.fillStyle = e.color;
      ctx.shadowColor = e.color;
      ctx.shadowBlur = 6;
      ctx.fillRect(e.x, e.y, e.size, e.size);
      ctx.shadowBlur = 0;
    }
    ctx.globalAlpha = 1;
    this.embers = this.embers.filter((e) => e.life > 0 && e.y > -20);
    const vg = ctx.createRadialGradient(
      cv.width / 2, cv.height / 2, Math.min(cv.width, cv.height) * 0.2,
      cv.width / 2, cv.height / 2, Math.max(cv.width, cv.height) * 0.7);
    vg.addColorStop(0, 'rgba(0,0,0,0)');
    vg.addColorStop(1, 'rgba(0,0,0,0.7)');
    ctx.fillStyle = vg;
    ctx.fillRect(0, 0, cv.width, cv.height);
  }

  drawMinimap(mm: HTMLCanvasElement, g: Game): void {
    const ctx = mm.getContext('2d')!;
    const L = g.level;
    ctx.fillStyle = '#08070c';
    ctx.fillRect(0, 0, mm.width, mm.height);
    const s = Math.min(mm.width / L.w, mm.height / L.h);
    const ox = (mm.width - L.w * s) / 2;
    const oy = (mm.height - L.h * s) / 2;
    const S = STRATA[L.stratum];
    for (let y = 0; y < L.h; y++) {
      for (let x = 0; x < L.w; x++) {
        const i = idx(x, y, L.w);
        if (!L.explored[i]) continue;
        const t = L.tiles[i];
        if (t === T.Wall || t === T.Torch) continue;
        const vis = L.visible[i] === 1;
        let c = vis ? `rgba(${S.floor[0] + 50},${S.floor[1] + 50},${S.floor[2] + 55},0.95)` : `rgba(${S.floor[0] + 25},${S.floor[1] + 25},${S.floor[2] + 30},0.6)`;
        if (t === T.Water) c = 'rgba(60,110,160,0.8)';
        if (t === T.Lava) c = 'rgba(220,90,30,0.9)';
        if (t === T.StairsDown) c = '#e8e0d0';
        if (t === T.Altar) c = '#b08ae8';
        if (t === T.BranchDown) c = '#dcbe6e';
        if (t === T.Merchant) c = '#ffd700';
        if (t === T.WarpAltar) c = '#8ad45a';
        if (t === T.PortalBack) c = '#a88cf0';
        ctx.fillStyle = c;
        ctx.fillRect(ox + x * s, oy + y * s, Math.max(1, s), Math.max(1, s));
      }
    }
    for (const m of g.monsters) {
      const i = idx(m.x, m.y, L.w);
      if (!L.visible[i]) continue;
      ctx.fillStyle = m.friendly ? '#6a9adb' : m.def.boss ? '#ff5060' : '#d08050';
      ctx.fillRect(ox + m.x * s - 1, oy + m.y * s - 1, s + 2, s + 2);
    }
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(ox + g.player.x * s - 1, oy + g.player.y * s - 1, s + 2, s + 2);
  }
}
