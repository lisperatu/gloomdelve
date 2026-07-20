import { Game } from './game';
import { Renderer } from './render';
import { UI } from './ui';

const canvas = document.getElementById('view') as HTMLCanvasElement;
const seed = (Date.now() ^ (Math.random() * 0xffffffff)) >>> 0;
const game = new Game(seed);
const ren = new Renderer(canvas);
const ui = new UI(game, ren);
(window as unknown as { G: Game }).G = game; // debug handle

window.addEventListener('beforeunload', () => {
  if (game.player && game.level && !game.over) game.save();
});

let last = performance.now();
function frame(t: number): void {
  const dt = Math.min(0.1, (t - last) / 1000);
  last = t;
  if (game.player && game.level) {
    ren.draw(game, ui.view(), t, dt);
    ui.tick();
  } else {
    ren.drawMenuBg(t, dt);
  }
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
