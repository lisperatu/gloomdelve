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
  // ---------------- race dolls (shared frame: head r1-5 c5-10, torso r7-11, arms c3-4/11-12, legs r12-14)
  doll_hollowed: [
    '................',
    '.....kkkkkk.....',
    '....kXXXXXXk....',
    '....kXkXXkXk....',
    '....kXXxxXXk....',
    '.....kXXXXk.....',
    '....kkXXXXkk....',
    '...kXkXxxXkXk...',
    '...kXkxXXxkXk...',
    '...kXkxXXxkXk...',
    '...kXkXxxXkXk...',
    '....kkXXXXkk....',
    '.....kXkkXk.....',
    '.....kXk.kXk....',
    '....kkk...kkk...',
    '................',
  ],
  doll_ashkin: [
    '................',
    '.....oyoyo......',
    '....oyXXXXyo....',
    '....kXXXXXXk....',
    '....kXrXXrXk....',
    '....kXXxxXXk....',
    '....kkXXXXkk....',
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
  doll_vesperkin: [
    '................',
    '...kk......kk...',
    '..kXXk....kXXk..',
    '..kXXXkkkkXXXk..',
    '...kXXXXXXXXk...',
    '....kXkXXkXk....',
    '....kkXXXXkk....',
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
    '................',
    '.....kwwwwk.....',
    '....kwXXXXwk....',
    '...kwXkXXkXwk...',
    '...kwXXXXXXwk...',
    '....kwXxxXwk....',
    '....kkwXXwkk....',
    '...kXkwXXwkXk...',
    '...kXkhXXhkXk...',
    '...kXkhXXhkXk...',
    '...kXkhXXhkXk...',
    '....kkhXXhkk....',
    '.....kXkkXk.....',
    '.....kXk.kXk....',
    '....kkk...kkk...',
    '................',
  ],
  doll_trollblood: [
    '................',
    '.....kkkkkk.....',
    '....kXXXXXXk....',
    '....kXkXXkXk....',
    '....kXXXXXXk....',
    '....kwXxxXwk....',
    '...kkkXXXXkkk...',
    '..kXXkXxxXkXXk..',
    '..kXXkxXXxkXXk..',
    '..kXxkxXXxkxXk..',
    '..kXxkXxxXkxXk..',
    '...kkkXXXXkkk...',
    '.....kXkkXk.....',
    '....kXXk.kXXk...',
    '....kkkk.kkkk...',
    '................',
  ],
  doll_mireborn: [
    '................',
    '......kggk......',
    '.....kggggk.....',
    '....kXXXXXXk....',
    '....kXkXXkXk....',
    '....kXXxxXXk....',
    '....kkXXXXkk....',
    '...kXkXxxXkXk...',
    '...kXkxXXxkXk...',
    '...kXkxXXxkXk...',
    '...kXkXxxXkXk...',
    '....kkXXXXkk....',
    '.....kXkkXk.....',
    '.....kXk.kXk....',
    '....kkk...kkk...',
    '................',
  ],
  doll_mothtouched: [
    '................',
    '...k..k..k..k...',
    '....k.k..k.k....',
    '.....kkkkkk.....',
    '....kXXXXXXk....',
    '....kXkXXkXk....',
    '....kXXxxXXk....',
    'SS..kkXXXXkk..SS',
    'SSSkXkhXXhkXkSSS',
    '.SSkXkhXXhkXkSS.',
    '..S.kXhXXhXk.S..',
    '....kkhXXhkk....',
    '.....kXkkXk.....',
    '.....kXk.kXk....',
    '....kkk...kkk...',
    '................',
  ],
  // ---------------- armor overlays (aligned to doll frame)
  ov_robe: [
    '................',
    '................',
    '................',
    '................',
    '................',
    '................',
    '...kkXXXXkk.....',
    '...kXXXXXXk.....',
    '..kXXxXXxXXk....',
    '..kXXxXXxXXk....',
    '..kXXXXXXXXk....',
    '..kXXXXXXXXk....',
    '..kXxXXXXxXk....',
    '..kXXXXXXXXk....',
    '..kkkkkkkkkk....',
    '................',
  ],
  ov_vest: [
    '................',
    '................',
    '................',
    '................',
    '................',
    '................',
    '....kXXXXkk.....',
    '...kXXXXXXk.....',
    '...kXxXXxXk.....',
    '...kXxXXxXk.....',
    '...kXXXXXXk.....',
    '....kXXXXk......',
    '................',
    '................',
    '................',
    '................',
  ],
  ov_mail: [
    '................',
    '................',
    '................',
    '................',
    '................',
    '................',
    '...kXXXXXXk.....',
    '..kXXXXXXXXk....',
    '..kXxXxXxXXk....',
    '..kXXxXxXxXk....',
    '..kXxXxXxXXk....',
    '...kXXXXXXk.....',
    '....kXXXXk......',
    '................',
    '................',
    '................',
  ],
  ov_plate: [
    '................',
    '................',
    '................',
    '................',
    '................',
    '..kkk......kkk..',
    '.kXXXk....kXXXk.',
    '.kXXXkkkkkkXXXk.',
    '..kkXXXXXXXkk...',
    '...kXLXXXXXk....',
    '...kXXXXXXXk....',
    '...kXxXXXXxk....',
    '....kXXXXXk.....',
    '................',
    '................',
    '................',
  ],
  ov_bone: [
    '................',
    '................',
    '................',
    '................',
    '................',
    '................',
    '...kXXXXXXk.....',
    '..kXwXwXwXXk....',
    '..kXXXXXXXXk....',
    '..kXwXwXwXXk....',
    '..kXXXXXXXXk....',
    '..kXwXwXwXXk....',
    '...kXXXXXXk.....',
    '....kkkkkk......',
    '................',
    '................',
  ],
  ov_amulet: [
    '................',
    '................',
    '................',
    '................',
    '................',
    '................',
    '.....kBBBBk.....',
    '.....kB..Bk.....',
    '.......kXk......',
    '.......kLk......',
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
    '................',
    '..kkkkkkkkkkkk..',
    '..kXXXXXXXXXXk..',
    '..kkkkkkkkkkkk..',
    '....kXXXXXXXk...',
    '....kkkkkkkkk...',
    '......kXXXXXk...',
    '......kkkkkkk...',
    '........kXXXk...',
    '........kkkkk...',
    '..........kXk...',
    '..........kkk...',
    '................',
    '................',
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
  hollowed: '#a8b096', ashkin: '#9a8880', vesperkin: '#8a7ca8', graveelf: '#e0d8c8',
  trollblood: '#7a9a7a', mireborn: '#7a9a62', mothtouched: '#d8cbb8',
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
    // held weapon, half scale at the right hand
    c.drawImage(sprite(spr, tint), 9, 3, 8, 8);
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
