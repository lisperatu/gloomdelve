// 16x16 pixel-art tileset, authored as string grids and baked to canvases with
// per-entity tinting. '.'=transparent  X=tint  x=dark tint  L=light tint
// fixed colors: k=outline  w=bone  r=red  y=gold  g=green  B=brown  S=steel  p=purple  o=orange
import type { EquipSlots, Item } from './types';

const FIXED: Record<string, string> = {
  k: '#171221', w: '#e8e0d0', r: '#d43a4a', y: '#e8c860', g: '#6fbf4a',
  B: '#8a6a42', S: '#b8b0c8', p: '#8a6cf0', o: '#e07a2e', h: '#3a3244',
};

const SPRITES: Record<string, string[]> = {
  player: [
    '................',
    '......kkkk......',
    '.....kXXXXk.....',
    '....kXxxxxXk....',
    '....kXxwxwxk....',
    '....kXxxxxXk....',
    '.....kXXXXk.....',
    '....kXXXXXXk....',
    '...kXXXXXXXXk...',
    '..kXxXXXXXXxXk..',
    '..kXxXXXXXXxXk..',
    '..kXkXXXXXXkXk..',
    '...kkXXXXXXkk...',
    '....kXXkkXXk....',
    '....kXXk.kXXk...',
    '....kkk...kkk...',
  ],
  rat: [
    '................',
    '................',
    '................',
    '................',
    '..kk............',
    '.kxxk.....kkk...',
    '..kxxk...kxxxk..',
    '..kXXXkkkXXxxk..',
    '.kXXXXXXXXXxk...',
    '.kxXwXXXXXXk....',
    '..kXXXXXXXXk....',
    '...kXXkkXXk.....',
    '...kxk..kxk.....',
    '...kk....kk.....',
    'kkkxkkkkk.......',
    '.kkk............',
  ],
  zombie: [
    // lurching shambler: head slumped forward-left, one arm outstretched,
    // torn wound (r) and exposed rib (w), dragging back leg
    '................',
    '....kkkk........',
    '...kXXXXk.......',
    '...kXwXxk.......',
    '...kXxxXk.......',
    '....kXXk........',
    'kkkkkXXXXk......',
    'kXXXXXXXXXk.....',
    '.kkkkXrXXXk.....',
    '.....kXwXxXk....',
    '.....kXXXXxk....',
    '.....kXXXXk.....',
    '.....kxXkXXk....',
    '.....kxk.kXXk...',
    '....kkk...kkkk..',
    '................',
  ],
  hound: [
    // lunging hound: head dropped low-left, open jaw with fangs (w),
    // arched back rising to the rump, tail whipped up-right
    '................',
    '............kk..',
    '...........kXxk.',
    '....kkkkk..kXk..',
    '...kXXXXXkkXk...',
    '.kXkXXXXXXXXk...',
    '.kXXxXXxxXXXk...',
    'kXrXXXXXXXXk....',
    'kXXxXXXXXXXk....',
    'kwwk.kXXk.kXk...',
    '.kk..kXxk.kxk...',
    '.....kxk..kxk...',
    '.....kk...kk....',
    '................',
    '................',
    '................',
  ],
  spider: [
    '................',
    '................',
    '.k...k..k...k...',
    '.kx..kx.xk..xk..',
    '..kx.kx..xk.xk..',
    '...kxkXXXXkxk...',
    '..kxkXXrrXXkxk..',
    '.kx.kXXXXXXk.xk.',
    '.kk.kXXXXXXk.kk.',
    '....kXXXXXXk....',
    '..kxkXxXXxXkxk..',
    '.kx..kXXXXk..xk.',
    '.k....kkkk....k.',
    '................',
    '................',
    '................',
  ],
  bat: [
    '................',
    '................',
    '................',
    '..kk........kk..',
    '.kXXk......kXXk.',
    'kXXXXk....kXXXXk',
    'kXxxXXk..kXXxxXk',
    '.kXxxXXkkXXxxXk.',
    '..kXXXXXXXXXXk..',
    '...kXXrXXrXXk...',
    '....kXXXXXXk....',
    '.....kXkkXk.....',
    '......k..k......',
    '................',
    '................',
    '................',
  ],
  skeleton: [
    // skull with dark sockets + tooth row, ribcage with see-through gaps
    // around the spine, hanging bone arms, split pelvis and shin bones
    '................',
    '....kkkkkk......',
    '...kXXXXXXk.....',
    '...kXkXXkXk.....',
    '...kXXxxXXk.....',
    '....kXkXkk......',
    '..kkkXXXXXkkk...',
    '.kXkkXXXXXkkXk..',
    '.kXk.k.X.k.kXk..',
    '.kxk.kXXXk.kxk..',
    '..kk.k.X.k.kk...',
    '.....kXXXk......',
    '....kXk.kXk.....',
    '....kXk.kXk.....',
    '...kkk...kkk....',
    '................',
  ],
  wraith: [
    // hooded robed spectre: deep hood shadow, pale eyes, x fold-lines
    // giving the robe form, hem tearing into uneven drifting tatters
    '................',
    '.....kkkkk......',
    '....kXXXXXk.....',
    '...kXxxxxxXk....',
    '...kXxwxwxXk....',
    '...kXxxxxxXk....',
    '...kXXXXXXXk....',
    '..kXXXxXXXXXk...',
    '..kXXxXXXXxXk...',
    '..kXxXXXXXxXk...',
    '..kXXXXXxXXXk...',
    '...kXxXxXXXk....',
    '...kxkXkxkXk....',
    '..kxk.kk.kxk....',
    '...k...k..k.....',
    '................',
  ],
  humanoid: [
    // hooded delver: face lost in hood shadow (x band, pale eyes), long
    // robe with x fold-shading down one side, slight off-center stance
    '................',
    '.....kkkk.......',
    '....kXXXXk......',
    '....kXxxXk......',
    '....kxwwxk......',
    '.....kXXk.......',
    '...kkXXXXkk.....',
    '..kXxXXXXXXk....',
    '..kXxXXXXxXk....',
    '..kXkXXXXxXk....',
    '...kkXXXXXkk....',
    '....kXxXXk......',
    '....kXxXXk......',
    '...kXXkkXXk.....',
    '...kkk..kkk.....',
    '................',
  ],
  fungus: [
    '................',
    '.....kkkkkk.....',
    '....kXXXXXXk....',
    '...kXLLXXXXXk...',
    '..kXLXXXXXXXXk..',
    '..kXXXXxxXXXXk..',
    '..kkkkkkkkkkkk..',
    '......kxxk......',
    '......kxxk......',
    '......kxxk.kkk..',
    '.....kxxxkkXXXk.',
    '.....kxxxkkXLXk.',
    '....kkkkkkkkkkk.',
    '..........kxk...',
    '..........kkk...',
    '................',
  ],
  moth: [
    '................',
    '....k.....k.....',
    '.....k...k......',
    '..kk..k.k..kk...',
    '.kXXkkkXkkkXXk..',
    'kXXXXkXXXkXXXXk.',
    'kXLXXkXxXkXXLXk.',
    'kXXXXkXxXkXXXXk.',
    '.kXXkkXxXkkXXk..',
    '..kkkXXxXXkkk...',
    '.....kXxXk......',
    '......kXk.......',
    '......kXk.......',
    '.......k........',
    '................',
    '................',
  ],
  serpent: [
    // raised head with red eye, bared fang (w), shaded jaw; body S-curves
    // down-right with x underside + L spine glints, tapering tail
    '................',
    '..kkkk..........',
    '.kXXXXk.........',
    'kXrXXXXk........',
    'kXXxxXXk........',
    '.kwkXXXk........',
    '..kkxXXXk.......',
    '....kXLXXk......',
    '.....kxXLXk.....',
    '......kxXXXk....',
    '.......kxXXk....',
    '.....kkXXXk.....',
    '...kkXXXXk......',
    '..kXXXXxk.......',
    '..kkxxkk........',
    '................',
  ],
  troll: [
    // hulking hunch: no neck, head sunk between massive shoulders, deep-set
    // eyes under a shadowed brow, upturned tusks (w), knuckle-dragging arms
    '................',
    '................',
    '....kkkkkk......',
    '..kkXXXXXXkk....',
    '.kXXkxxxxkXXk...',
    '.kXXkxwXwxkXXk..',
    'kXxXkXwXXwXkXxXk',
    'kXxXkXXXXXXkXxXk',
    'kXxkkXXxxXXkkxXk',
    'kxXkkXxxxxXkkXxk',
    'kXXkkXXXXXXkkXXk',
    '.kk.kXXXXXXk.kk.',
    '....kXXkkXXk....',
    '...kXXk..kXXk...',
    '...kkkk..kkkk...',
    '................',
  ],
  golem: [
    '................',
    '...kkkkkkkk.....',
    '..kXXXXXXXXk....',
    '..kXrXXXXrXk....',
    '..kXXXXXXXXk....',
    '.kkXXxxxxXXkk...',
    'kXXkXXXXXXkXXk..',
    'kXXkXXXXXXkXXk..',
    'kxxkXXxxXXkxxk..',
    'kkkkXXxxXXkkkk..',
    '...kXXXXXXk.....',
    '...kXXkkXXk.....',
    '..kXXXk.kXXXk...',
    '..kxxxk.kxxxk...',
    '..kkkkk.kkkkk...',
    '................',
  ],
  shade: [
    // formless darkness leaning into a drift: small pale-eyed head atop a
    // widening smoke-mass, heavy x mottling, ragged trailing wisps
    '................',
    '................',
    '......kk........',
    '.....kXXk.......',
    '....kXXXXk......',
    '...kXwXwXXk.....',
    '...kXXXXXXXk....',
    '..kxXXXXXXXXk...',
    '..kxXXXxXXXXXk..',
    '.kxXXXxxXXXXk...',
    '.kxXxXXXXxXXXk..',
    '..kxxXxXXkxXk...',
    '.kxk.kxxk.kxk...',
    '..k...kxk..k....',
    '.......k........',
    '................',
  ],
  imp: [
    '................',
    '....k...k.......',
    '....kk.kk.......',
    '....kXkXk.......',
    '...kXXXXXk......',
    '...kXrXrXk......',
    '...kXXXXXk......',
    '.kk.kXXXk.kk....',
    'kXXkXXXXXkXXk...',
    '.kXXkXXXXXXk....',
    '..kkXXXXXkk.....',
    '....kXXXk.......',
    '....kXkXk.......',
    '...kXk.kXk......',
    '...kk...kk......',
    '................',
  ],
  djinn: [
    '................',
    '......kkkk......',
    '.....kXLLXk.....',
    '.....kXwwXk.....',
    '.....kXXXXk.....',
    '..kk.kXXXXk.kk..',
    '.kXXkXXXXXXkXXk.',
    '.kXkXXXXXXXXkXk.',
    '..k.kXXXXXXk.k..',
    '.....kXXXXk.....',
    '......kXXXk.....',
    '.......kXXk.....',
    '......kXXk......',
    '.......kXk......',
    '........kk......',
    '................',
  ],
  sovereign: [
    '................',
    '.k..k..kk..k..k.',
    '.kk.kkkXXkkk.kk.',
    '..kXXXXXXXXXXk..',
    '..kXXXXXXXXXXk..',
    '.kXXrXXrrXXrXXk.',
    '.kXXXXXXXXXXXXk.',
    '.kXrXXrXXrXXrXk.',
    '.kXXXXxxxxXXXXk.',
    'kXXXXXxkkxXXXXXk',
    'kXxXXXXXXXXXXxXk',
    'kXxXXXXXXXXXXxXk',
    '.kXXXXXXXXXXXXk.',
    '..kXxXxXXxXxXk..',
    '...kkkkkkkkkk...',
    '................',
  ],
  // ---------------- items
  sword: [
    '................',
    '...........kk...',
    '..........kXLk..',
    '.........kXLk...',
    '........kXLk....',
    '.......kXLk.....',
    '......kXLk......',
    '.....kXLk.......',
    '..k.kXLk........',
    '..kkkLk.........',
    '..kyykk.........',
    '.kykkyk.........',
    'kyk..kk.........',
    'kk..............',
    '................',
    '................',
  ],
  dagger: [
    '................',
    '................',
    '................',
    '................',
    '........kk......',
    '.......kXLk.....',
    '......kXLk......',
    '.....kXLk.......',
    '..k.kXLk........',
    '..kkkLk.........',
    '..kyykk.........',
    '.kykkyk.........',
    'kyk..kk.........',
    'kk..............',
    '................',
    '................',
  ],
  mace: [
    '................',
    '.......kkkk.....',
    '......kXXXXk....',
    '.....kXXLXXk....',
    '.....kXXXXXk....',
    '......kXXXk.....',
    '.......kBk......',
    '.......kBk......',
    '.......kBk......',
    '.......kBk......',
    '.......kBk......',
    '......kkBkk.....',
    '.......kkk......',
    '................',
    '................',
    '................',
  ],
  axe: [
    '................',
    '......kkk.......',
    '....kkXXXk......',
    '...kXXXLXk......',
    '...kXXXkBk......',
    '....kXkkBk......',
    '.....k.kBk......',
    '.......kBk......',
    '.......kBk......',
    '.......kBk......',
    '.......kBk......',
    '.......kBk......',
    '......kkkk......',
    '................',
    '................',
    '................',
  ],
  spear: [
    '................',
    '..........kkk...',
    '.........kXLLk..',
    '........kXXLk...',
    '........kXXk....',
    '.......kBkk.....',
    '......kBk.......',
    '.....kBk........',
    '....kBk.........',
    '...kBk..........',
    '..kBk...........',
    '..kk............',
    '................',
    '................',
    '................',
    '................',
  ],
  bow: [
    // recurve seen side-on: tinted limbs with x backs, gold grip wrap,
    // steel string strung tip to tip
    '................',
    '................',
    '.....kkXXkkS....',
    '....kXXkk..S....',
    '...kXxk....S....',
    '...kXk.....S....',
    '..kXxk.....S....',
    '..kyk......S....',
    '..kyk......S....',
    '..kXxk.....S....',
    '...kXk.....S....',
    '...kXxk....S....',
    '....kXXkk..S....',
    '.....kkXXkkS....',
    '................',
    '................',
  ],
  armor: [
    '................',
    '................',
    '...kk......kk...',
    '..kXXkkkkkkXXk..',
    '..kXXXXXXXXXXk..',
    '..kXxXXXXXXxXk..',
    '..kXxkXXXXkxXk..',
    '..kkkXXXXXXkkk..',
    '....kXXxxXXk....',
    '....kXXxxXXk....',
    '....kXXXXXXk....',
    '....kXXXXXXk....',
    '.....kkkkkk.....',
    '................',
    '................',
    '................',
  ],
  potion: [
    '................',
    '......kkkk......',
    '......kBBk......',
    '......kBBk......',
    '.....kkkkkk.....',
    '....kXXXXXXk....',
    '...kXXXXXXXXk...',
    '...kXXLXXXXXk...',
    '...kXXXXXXXXk...',
    '...kXxXXXXxXk...',
    '...kXxXXXXxXk...',
    '....kXXXXXXk....',
    '.....kkkkkk.....',
    '................',
    '................',
    '................',
  ],
  scroll: [
    '................',
    '................',
    '...kkkkkkkkk....',
    '..kXXXXXXXXXk...',
    '..kXkkXkXkkXk...',
    '..kXXXXXXXXXk...',
    '..kXkXkkXkXXk...',
    '..kXXXXXXXXXk...',
    '..kXXkXkXkkXk...',
    '..kXXXXXXXXXk...',
    '...kkkkkkkkk....',
    '................',
    '................',
    '................',
    '................',
    '................',
  ],
  ring: [
    '................',
    '................',
    '......kkk.......',
    '.....kLLLk......',
    '....kLkkkLk.....',
    '....kXk.kXk.....',
    '....kXk.kXk.....',
    '....kxk.kxk.....',
    '.....kxxxk......',
    '......kkk.......',
    '................',
    '................',
    '................',
    '................',
    '................',
    '................',
  ],
  amulet: [
    '................',
    '....kkkkkkk.....',
    '...kBk....kBk...',
    '...kBk....kBk...',
    '...kBk....kBk...',
    '....kBk..kBk....',
    '.....kkkkk......',
    '......kXXk......',
    '.....kXLXXk.....',
    '.....kXXXXk.....',
    '......kXXk......',
    '.......kk.......',
    '................',
    '................',
    '................',
    '................',
  ],
  gold: [
    '................',
    '................',
    '................',
    '................',
    '......kkkk......',
    '....kkXXXXkk....',
    '...kXXLXXXXXk...',
    '...kXXXXXXXXk...',
    '..kXXXXkkXXXXk..',
    '..kXXkkXXkkXXk..',
    '...kkXXXXXXkk...',
    '....kkkkkkkk....',
    '................',
    '................',
    '................',
    '................',
  ],
  // ---------------- held weapons (full-scale, gripped at the doll's right hand
  // ~col 12 row 10; drawn last in playerDoll so they sit in front of armor)
  held_sword: [
    '................',
    '................',
    '............kk..',
    '...........kLXk.',
    '...........kLXk.',
    '...........kLXk.',
    '...........kLXk.',
    '...........kLXk.',
    '...........kLXk.',
    '..........kyyyyk',
    '............kBk.',
    '............kyk.',
    '................',
    '................',
    '................',
    '................',
  ],
  held_dagger: [
    '................',
    '................',
    '................',
    '................',
    '................',
    '................',
    '............kk..',
    '...........kLXk.',
    '...........kLXk.',
    '...........kyyk.',
    '............kBk.',
    '................',
    '................',
    '................',
    '................',
    '................',
  ],
  held_mace: [
    '................',
    '................',
    '................',
    '...........kkk..',
    '..........kXXXk.',
    '..........kXLXk.',
    '..........kxXxk.',
    '...........kBk..',
    '...........kBk..',
    '...........kBk..',
    '...........kBk..',
    '...........kkk..',
    '................',
    '................',
    '................',
    '................',
  ],
  held_axe: [
    '................',
    '................',
    '................',
    '..........kkkk..',
    '.........kXXkBk.',
    '........kXXLkBk.',
    '.........kXXkBk.',
    '..........kkkBk.',
    '............kBk.',
    '............kBk.',
    '............kBk.',
    '............kk..',
    '................',
    '................',
    '................',
    '................',
  ],
  held_spear: [
    '................',
    '...........kk...',
    '..........kLLk..',
    '...........kLk..',
    '...........kBk..',
    '...........kBk..',
    '...........kBk..',
    '...........kBk..',
    '...........kBk..',
    '...........kBk..',
    '...........kBk..',
    '...........kBk..',
    '...........kk...',
    '................',
    '................',
    '................',
  ],
  held_bow: [
    '................',
    '................',
    '................',
    '...........kk...',
    '..........SkXk..',
    '..........S.kXk.',
    '..........S.kXk.',
    '..........S.kyk.',
    '..........S.kXk.',
    '..........S.kXk.',
    '..........SkXk..',
    '...........kk...',
    '................',
    '................',
    '................',
    '................',
  ],
  // ---------------- race dolls (shared frame: head r1-5 c4-11, shoulders r6,
  // torso r7-11 interior c6-9, arm skin c4/c11, hands r10, legs r12-14; race
  // features may spill outside the frame — armor overlays cover r6-12 c3-12)
  doll_hollowed: [
    // a corpse that refused to lie down: sunken sockets, gaunt cheeks, and a
    // literal dark hollow punched through the chest, framed by pale ribs
    '................',
    '.....kkkkkk.....',
    '....kXXXXXXk....',
    '....kXkXXkXk....',
    '....kXxXXxXk....',
    '.....kxXXxk.....',
    '....kkXXXXkk....',
    '...kXkXwwXkXk...',
    '...kXkwkkwkXk...',
    '...kXkwkkwkXk...',
    '...kXkXwwXkXk...',
    '....kkXXXXkk....',
    '.....kXkkXk.....',
    '.....kXk.kXk....',
    '....kkk...kkk...',
    '................',
  ],
  doll_ashkin: [
    // born the year the sky burned: ember-crowned hair, red coal eyes,
    // charcoal wraps with a live ember seam glowing through the torso
    '................',
    '.....oyoyo......',
    '....oyXXXXyo....',
    '....kXrXXrXk....',
    '....kXXxxXXk....',
    '.....kXXXXk.....',
    '....kkXXXXkk....',
    '...kXkhhhhkXk...',
    '...kXkhohhkXk...',
    '...kXkhhohkXk...',
    '...kXkhhhhkXk...',
    '....kkhhhhkk....',
    '.....kXkkXk.....',
    '.....kXk.kXk....',
    '....kkk...kkk...',
    '................',
  ],
  doll_vesperkin: [
    // night-folk: tall bat ears with shadowed inner fold, onyx eyes, sleek
    // dark bodysuit with a violet scarf knotted at the throat
    '................',
    '...kk......kk...',
    '..kXxk....kxXk..',
    '..kXXkkkkkkXXk..',
    '...kXXXXXXXXk...',
    '....kXkXXkXk....',
    '....kkpXXpkk....',
    '...kXkhXXhkXk...',
    '...kXkhXXhkXk...',
    '...kXkhXXhkXk...',
    '...kXkhXXhkXk...',
    '....kkhXXhkk....',
    '.....kXkkXk.....',
    '.....kXk.kXk....',
    '....kkk...kkk...',
    '................',
  ],
  doll_graveelf: [
    // buried their forests and followed them down: long pointed ears in
    // silhouette, white hair falling past the cheeks, slim shaded frame
    '................',
    '..k..kkkkkk..k..',
    '.kXkkwwwwwwkkXk.',
    '..kXkwXXXXwkXk..',
    '...kkXxXXxXkk...',
    '....kwXXXXwk....',
    '....kkXXXXkk....',
    '...kXkxXXxkXk...',
    '...kXkxXXxkXk...',
    '...kXkXxxXkXk...',
    '...kXkxXXxkXk...',
    '....kkXXXXkk....',
    '.....kXkkXk.....',
    '.....kXk.kXk....',
    '....kkk...kkk...',
    '................',
  ],
  doll_trollblood: [
    // half-mountain: head sunk low between massive shoulders, upturned tusks,
    // knuckle-heavy arms wider than the armor, thick stumpy legs
    '................',
    '................',
    '.....kkkkkk.....',
    '....kXXXXXXk....',
    '....kXkXXkXk....',
    '...kkwXxxXwkk...',
    '..kXXkXXXXkXXk..',
    '.kXXxkXxxXkxXXk.',
    '.kXxXkxXXxkXxXk.',
    '.kXxkkxXXxkkxXk.',
    '.kxXkkXxxXkkXxk.',
    '..kkkkXXXXkkkk..',
    '.....kXkkXk.....',
    '....kXXk.kXXk...',
    '....kkkk.kkkk...',
    '................',
  ],
  doll_mireborn: [
    // raised by the swamp: green dorsal fin, golden frog eyes, scaled hide
    // in a checker pattern, splayed webbed feet
    '................',
    '......kggk......',
    '.....kggggk.....',
    '....kXXXXXXk....',
    '....kXyXXyXk....',
    '....kXXxxXXk....',
    '....kkXXXXkk....',
    '...kXkXxXxkXk...',
    '...kXkxXxXkXk...',
    '...kXkXxXxkXk...',
    '...kXkxXxXkXk...',
    '....kkXXXXkk....',
    '.....kXkkXk.....',
    '.....kXk.kXk....',
    '...kkkk...kkkk..',
    '................',
  ],
  doll_mothtouched: [
    // marked by the Mother of Moths: curved antennae, pale dust-wings with a
    // dark eyespot, and a faint moth-shaped mark on the chest
    '................',
    '...k........k...',
    '....k......k....',
    '.....kkkkkk.....',
    '....kXXXXXXk....',
    '....kXkXXkXk....',
    '....kXXxxXXk....',
    'ww..kkXXXXkk..ww',
    'wxwkXkXxxXkXkwxw',
    '.wwkXkxXXxkXkww.',
    '..wkXkXxxXkXkw..',
    '....kkXXXXkk....',
    '.....kXkkXk.....',
    '.....kXk.kXk....',
    '....kkk...kkk...',
    '................',
  ],
  // ---------------- armor overlays (centered on the doll frame: torso r6-12,
  // body c3-12; sleeveless cuts leave the arm skin at c4/c11 visible and every
  // overlay leaves the legs/feet showing)
  ov_robe: [
    // tattered robe: full sleeves, rope-cinched waist, ragged hem strips with
    // gaps so the wearer's legs show through
    '................',
    '................',
    '................',
    '................',
    '................',
    '................',
    '....kXXXXXXk....',
    '...kXXXXXXXXk...',
    '...kXxXXXXxXk...',
    '...kXxXXXXxXk...',
    '...kxxXXXXxxk...',
    '...kXXxXXxXXk...',
    '...kXxXXXXxXk...',
    '...kx.kXXk.xk...',
    '................',
    '................',
  ],
  ov_vest: [
    // fitted leather jerkin: sleeveless (arms stay bare), zig-zag lacing
    // down the front, dark belt line
    '................',
    '................',
    '................',
    '................',
    '................',
    '................',
    '.....kXXXXk.....',
    '.....kXxXXk.....',
    '.....kXXxXk.....',
    '.....kXxXXk.....',
    '.....kxXXxk.....',
    '.....kkkkkk.....',
    '................',
    '................',
    '................',
    '................',
  ],
  ov_mail: [
    // mail shirt: short sleeves capping the shoulders, link-checker weave,
    // skirted hem ending above the knees
    '................',
    '................',
    '................',
    '................',
    '................',
    '................',
    '....kXXXXXXk....',
    '...kxXxXxXxXk...',
    '...kXkxXxXkXk...',
    '.....kXxXxk.....',
    '.....kxXxXk.....',
    '.....kXxXxk.....',
    '.....kkkkkk.....',
    '................',
    '................',
    '................',
  ],
  ov_plate: [
    // plate harness: pauldrons joined by a gorget, gleaming breastplate,
    // waist shadow and fauld hem
    '................',
    '................',
    '................',
    '................',
    '................',
    '...kk......kk...',
    '..kXLk....kLXk..',
    '..kXXkkkkkkXXk..',
    '...kkXXXXXXkk...',
    '....kXLXXXXk....',
    '....kXXxxXXk....',
    '....kxXXXXxk....',
    '.....kkkkkk.....',
    '................',
    '................',
    '................',
  ],
  ov_bone: [
    // bonewrought aegis: spiked bone spaulders rising past the shoulders,
    // lashed rib-bands over a dark under-harness
    '................',
    '................',
    '................',
    '................',
    '................',
    '...w........w...',
    '..kwkXXXXXXkwk..',
    '...kXXXXXXXXk...',
    '...kxxXxxXxxk...',
    '...kXXXXXXXXk...',
    '...kxxXxxXxxk...',
    '...kXXXXXXXXk...',
    '....kkkkkkkk....',
    '................',
    '................',
    '................',
  ],
  ov_amulet: [
    // thin cord meeting in a V, gem hanging on the sternum
    '................',
    '................',
    '................',
    '................',
    '................',
    '................',
    '.....kB..Bk.....',
    '......kBBk......',
    '......kLXk......',
    '.......kk.......',
    '................',
    '................',
    '................',
    '................',
    '................',
    '................',
  ],
  portal: [
    '................',
    '....kkkkkkkk....',
    '...kXXkkkkXXk...',
    '..kXXk....kXXk..',
    '..kXk..LL..kXk..',
    '..kXk.LxxL.kXk..',
    '..kXk.Lx.xL.kXk.',
    '..kXk.LxxL.kXk..',
    '..kXk..LL..kXk..',
    '..kXk......kXk..',
    '..kXXk....kXXk..',
    '..kXXk....kXXk..',
    '..kXXk....kXXk..',
    '.kkXXkkkkkkXXkk.',
    '.kkkkkkkkkkkkkk.',
    '................',
  ],
  // ---------------- features
  doorClosed: [
    '................',
    '..kkkkkkkkkkk...',
    '..kXXkXXXkXXk...',
    '..kXXkXXXkXXk...',
    '..kXXkXXXkXXk...',
    '..kXXkXXXkXXk...',
    '..kXXkXXXkXXk...',
    '..kXXkXXXkXXk...',
    '..kXXkXyXkXXk...',
    '..kXXkXXXkXXk...',
    '..kXXkXXXkXXk...',
    '..kXXkXXXkXXk...',
    '..kXXkXXXkXXk...',
    '..kkkkkkkkkkk...',
    '................',
    '................',
  ],
  doorOpen: [
    '................',
    '..kkk......kkk..',
    '..kXk......kXk..',
    '..kXk......kXk..',
    '..kXk......kXk..',
    '..kXk......kXk..',
    '..kXk......kXk..',
    '..kXk......kXk..',
    '..kXk......kXk..',
    '..kXk......kXk..',
    '..kXk......kXk..',
    '..kXk......kXk..',
    '..kXk......kXk..',
    '..kkk......kkk..',
    '................',
    '................',
  ],
  stairs: [
    '................',
    '.kkkkkkkkkkkkk..',
    '.kLLLLLLLLLLLk..',
    '.kXXXXXXXXXXXk..',
    '.kxkkkkkkkkkxk..',
    '.kxLLLLLLLLLxk..',
    '.kxXXXXXXXXXxk..',
    '.kxxkkkkkkkxxk..',
    '.kxxLLLLLLLxxk..',
    '.kxxXXXXXXXxxk..',
    '.kxxxkkkkkxxxk..',
    '.kxxxXXXXXxxxk..',
    '.kxxxxkkkxxxxk..',
    '.kxxxxkkkxxxxk..',
    '.kkkkkkkkkkkkk..',
    '................',
  ],
  stairsup: [
    '................',
    '.kkkkkkkkkkkkk..',
    '.kxxxxLLLxxxxk..',
    '.kxxxxLLLxxxxk..',
    '.kxxxLLLLLxxxk..',
    '.kxxxkkkkkxxxk..',
    '.kxxLLLLLLLxxk..',
    '.kxxXXXXXXXxxk..',
    '.kxxkkkkkkkxxk..',
    '.kxLLLLLLLLLxk..',
    '.kxXXXXXXXXXxk..',
    '.kxkkkkkkkkkxk..',
    '.kLLLLLLLLLLLk..',
    '.kXXXXXXXXXXXk..',
    '.kkkkkkkkkkkkk..',
    '................',
  ],
  altar: [
    '................',
    '................',
    '......kkkk......',
    '.....kXLLXk.....',
    '.....kXXXXk.....',
    '......kXXk......',
    '......kXXk......',
    '.....kkXXkk.....',
    '....kXXXXXXk....',
    '...kXXXXXXXXk...',
    '..kkkkkkkkkkkk..',
    '..kXXXXXXXXXXk..',
    '..kkkkkkkkkkkk..',
    '................',
    '................',
    '................',
  ],
  bones: [
    '................',
    '................',
    '................',
    '....kkkk........',
    '...kXXXXk.......',
    '...kXkXkk.......',
    '...kXXXXk..kk...',
    '....kkkk..kXXk..',
    '..........kkk...',
    '...kkkkkkkk.....',
    '..kXk....kXk....',
    '...kkkkkkkk.....',
    '......kk........',
    '................',
    '................',
    '................',
  ],
  rubble: [
    '................',
    '................',
    '................',
    '................',
    '................',
    '......kk........',
    '.....kXXk..kk...',
    '....kXxXkkkXXk..',
    '...kXXXXkXxXXk..',
    '..kXxXXXkkXXk...',
    '..kXXxXXXkkk....',
    '...kkkkkkk......',
    '................',
    '................',
    '................',
    '................',
  ],
};

// glyph -> sprite name for monsters
const GLYPH_SPRITE: Record<string, string> = {
  r: 'rat', z: 'zombie', h: 'hound', s: 'spider', b: 'bat', k: 'skeleton',
  w: 'wraith', W: 'wraith', p: 'humanoid', '@': 'humanoid', f: 'fungus', F: 'fungus',
  m: 'moth', l: 'serpent', e: 'serpent', T: 'troll', G: 'golem', x: 'shade',
  i: 'imp', J: 'djinn', n: 'humanoid', A: 'wraith', Z: 'skeleton', P: 'humanoid',
  '&': 'sovereign',
};

export function monsterSprite(glyph: string): string {
  return GLYPH_SPRITE[glyph] ?? 'humanoid';
}

const WEAPON_SPRITE: Record<string, string> = {
  dagger: 'dagger', club: 'mace', shortsword: 'sword', spear: 'spear', mace: 'mace',
  longsword: 'sword', waraxe: 'axe', glaive: 'spear', greatsword: 'sword',
  doommaul: 'mace', sunderblade: 'sword',
  sling: 'bow', shortbow: 'bow', gravebow: 'bow',
};

const ARMOR_TINT: Record<string, string> = {
  robe: '#b8a890', leather: '#a58050', ringmail: '#b8b0c8',
  chain: '#9aa8b8', plate: '#c8ccd8', boneaegis: '#e0d8c0',
};

export function itemSprite(it: Item): [string, string] {
  switch (it.kind) {
    case 'weapon': return [WEAPON_SPRITE[it.id] ?? 'sword', it.ego ? '#e0a050' : '#b8b0c8'];
    case 'armor': return ['armor', it.ego ? '#e0a050' : ARMOR_TINT[it.id] ?? '#9ab0a0'];
    case 'potion': return ['potion', '#d05a8a'];
    case 'scroll': return ['scroll', '#d8cfba'];
    case 'ring': return ['ring', '#c9a24b'];
    case 'amulet': return ['amulet', '#8a6cf0'];
    case 'gold': return ['gold', '#e8c860'];
  }
}

// ---------------- baking
const cache = new Map<string, HTMLCanvasElement>();

function shadeHex(hex: string, mul: number, add = 0): string {
  const n = parseInt(hex.slice(1), 16);
  const f = (v: number) => Math.max(0, Math.min(255, Math.round(v * mul + add)));
  return `rgb(${f((n >> 16) & 255)},${f((n >> 8) & 255)},${f(n & 255)})`;
}

// Other modules (branch objects, future content files) register their own 16×16
// grids here at module load — keeps sprites.ts single-owner while content grows.
export function registerSprites(defs: Record<string, string[]>): void {
  Object.assign(SPRITES, defs);
}

export function sprite(name: string, tint: string): HTMLCanvasElement {
  const key = `${name}:${tint}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const rows = SPRITES[name] ?? SPRITES.humanoid;
  const cv = document.createElement('canvas');
  cv.width = 16;
  cv.height = 16;
  const c = cv.getContext('2d')!;
  for (let y = 0; y < 16; y++) {
    const row = (rows[y] ?? '').padEnd(16, '.');
    for (let x = 0; x < 16; x++) {
      const ch = row[x];
      if (ch === '.' || ch === undefined) continue;
      let col: string;
      if (ch === 'X') col = tint;
      else if (ch === 'x') col = shadeHex(tint, 0.55);
      else if (ch === 'L') col = shadeHex(tint, 1.35, 40);
      else col = FIXED[ch] ?? tint;
      c.fillStyle = col;
      c.fillRect(x, y, 1, 1);
    }
  }
  cache.set(key, cv);
  return cv;
}

export function spriteURL(name: string, tint: string): string {
  const key = `url:${name}:${tint}`;
  const hit = urlCache.get(key);
  if (hit) return hit;
  const url = sprite(name, tint).toDataURL();
  urlCache.set(key, url);
  return url;
}
const urlCache = new Map<string, string>();

// ---------------- player paper-doll composition
export const RACE_SKIN: Record<string, string> = {
  hollowed: '#a8b096', ashkin: '#948680', vesperkin: '#8a7ca8', graveelf: '#c9c5d2',
  trollblood: '#6f8d7d', mireborn: '#7da24e', mothtouched: '#d8cbb8',
};

// item-sprite name -> full-scale held-weapon sprite drawn at the doll's hand
const HELD_SPRITE: Record<string, string> = {
  sword: 'held_sword', dagger: 'held_dagger', mace: 'held_mace',
  axe: 'held_axe', spear: 'held_spear', bow: 'held_bow',
};

const ARMOR_OVERLAY: Record<string, string> = {
  robe: 'ov_robe', leather: 'ov_vest', ringmail: 'ov_mail', chain: 'ov_mail',
  plate: 'ov_plate', boneaegis: 'ov_bone',
};

export function playerDoll(raceId: string, equip: EquipSlots | null): HTMLCanvasElement {
  const b = equip?.body, w = equip?.weapon;
  const key = `doll:${raceId}:${b?.id ?? ''}:${b?.ego ?? ''}:${w?.id ?? ''}:${w?.ego ?? ''}:${equip?.amulet ? 1 : 0}:${equip?.ring1 ? 1 : 0}:${equip?.ring2 ? 1 : 0}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const cv = document.createElement('canvas');
  cv.width = 16;
  cv.height = 16;
  const c = cv.getContext('2d')!;
  c.imageSmoothingEnabled = false;
  const skin = RACE_SKIN[raceId] ?? '#d8cbb8';
  c.drawImage(sprite(`doll_${raceId}`, skin), 0, 0);
  if (b) {
    const ov = ARMOR_OVERLAY[b.id] ?? 'ov_vest';
    const tint = b.ego ? '#e0a050' : ARMOR_TINT[b.id] ?? '#9ab0a0';
    c.drawImage(sprite(ov, tint), 0, 0);
  }
  if (equip?.amulet) c.drawImage(sprite('ov_amulet', '#8a6cf0'), 0, 0);
  if (equip?.ring1) { c.fillStyle = '#e8c860'; c.fillRect(3, 10, 1, 1); }
  if (equip?.ring2) { c.fillStyle = '#e8c860'; c.fillRect(12, 10, 1, 1); }
  if (w) {
    const [spr, tint] = itemSprite(w);
    const held = HELD_SPRITE[spr];
    // dedicated full-scale held sprite at the right hand; unknown/registered
    // weapon sprites fall back to the old half-scale placement
    if (held) c.drawImage(sprite(held, tint), 0, 0);
    else c.drawImage(sprite(spr, tint), 9, 3, 8, 8);
  }
  cache.set(key, cv);
  return cv;
}

export function playerDollURL(raceId: string, equip: EquipSlots | null): string {
  const b = equip?.body, w = equip?.weapon;
  const key = `dollurl:${raceId}:${b?.id ?? ''}:${b?.ego ?? ''}:${w?.id ?? ''}:${w?.ego ?? ''}:${equip?.amulet ? 1 : 0}:${equip?.ring1 ? 1 : 0}:${equip?.ring2 ? 1 : 0}`;
  const hit = urlCache.get(key);
  if (hit) return hit;
  const url = playerDoll(raceId, equip).toDataURL();
  urlCache.set(key, url);
  return url;
}

// ---------------- terrain textures (procedural, deterministic)
export function terrain(kind: 'floor' | 'wallTop' | 'wallFace', base: [number, number, number], variant: number): HTMLCanvasElement {
  const key = `terr:${kind}:${base.join(',')}:${variant}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const cv = document.createElement('canvas');
  cv.width = 16;
  cv.height = 16;
  const c = cv.getContext('2d')!;
  let s = (variant + 1) * 2654435761 >>> 0;
  const rnd = () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
  const col = (mul: number): string =>
    `rgb(${Math.floor(base[0] * mul)},${Math.floor(base[1] * mul)},${Math.floor(base[2] * mul)})`;
  if (kind === 'floor') {
    c.fillStyle = col(1);
    c.fillRect(0, 0, 16, 16);
    for (let i = 0; i < 34; i++) {
      c.fillStyle = col(rnd() < 0.5 ? 0.82 + rnd() * 0.1 : 1.05 + rnd() * 0.12);
      c.fillRect(Math.floor(rnd() * 16), Math.floor(rnd() * 16), 1, 1);
    }
    // faint cracked-slab lines
    if (rnd() < 0.7) {
      c.fillStyle = col(0.8);
      const ly = Math.floor(rnd() * 16);
      c.fillRect(0, ly, Math.floor(4 + rnd() * 9), 1);
    }
  } else if (kind === 'wallFace') {
    c.fillStyle = col(0.92);
    c.fillRect(0, 0, 16, 16);
    c.fillStyle = col(1.22);
    c.fillRect(0, 0, 16, 1);
    for (let by = 0; by < 3; by++) {
      const y = 5 * by + 4;
      c.fillStyle = col(0.5);
      c.fillRect(0, y, 16, 1);
      const off = (by % 2 === 0 ? 3 : 8) + Math.floor(rnd() * 2);
      for (let jx = off; jx < 16; jx += 8) {
        c.fillRect(jx, y - 4 < 0 ? 1 : y - 4, 1, 4);
      }
    }
    for (let i = 0; i < 12; i++) {
      c.fillStyle = col(0.78 + rnd() * 0.5);
      c.fillRect(Math.floor(rnd() * 16), Math.floor(rnd() * 16), 1, 1);
    }
  } else {
    // wallTop: same brick masonry, slightly darker — walls must never read as floor
    c.fillStyle = col(0.74);
    c.fillRect(0, 0, 16, 16);
    for (let by = 0; by < 4; by++) {
      const y = 4 * by + 3;
      c.fillStyle = col(0.42);
      c.fillRect(0, y, 16, 1);
      const off = (by % 2 === 0 ? 2 : 6) + Math.floor(rnd() * 2);
      for (let jx = off; jx < 16; jx += 8) {
        c.fillRect(jx, Math.max(0, y - 3), 1, 3);
      }
    }
    for (let i = 0; i < 10; i++) {
      c.fillStyle = col(0.6 + rnd() * 0.32);
      c.fillRect(Math.floor(rnd() * 16), Math.floor(rnd() * 16), 1, 1);
    }
  }
  cache.set(key, cv);
  return cv;
}
