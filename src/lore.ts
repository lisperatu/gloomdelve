// The written world of Gloomdelve.
//
// Style contract (from verified research):
// - Fragments, 1–3 sentences. Never restate what the player can see; every line
//   carries exclusive information (Supergiant rule).
// - Deliberately ambiguous; the larger story is reconstructed by linking pieces
//   (Dark Souls "embedded story").
// - Second-tier entries unlock by deed and must ADD new content, never repeat
//   (Hades codex rule).
// - Voice: the margins of a dead delver's field journal — "the Cartographer" —
//   dry, precise, unafraid. The Chronicle itself speaks in a colder, older voice.
//
// The buried story, for internal consistency (never stated outright):
//   The world above is stuck in the Long Evening because the First Light was
//   dragged below and inverted — it now reigns as the Unlight Sovereign. The
//   catacombs hold everyone who went down to fetch it back. The Weald grew from
//   the world's grief. The Cloister drowned trying to SING it back. The Fathoms
//   burned trying to FORGE a replacement. The gods are six survivors of the
//   theft, each coping differently. The Cartographer catalogued all of it, died,
//   and left you the notes.

export interface ChronicleEntry {
  id: string;
  title: string;
  unlock: { kind: 'start' | 'stratum' | 'boss' | 'god' | 'death' | 'win' | 'corrupt' | 'deed'; key?: string | number };
  text: string;
}

// ============================================================ the chronicle
export const CHRONICLE: ChronicleEntry[] = [
  {
    id: 'evening', title: 'I. The Long Evening', unlock: { kind: 'start' },
    text: 'No one alive remembers noon. The sun has hung at the lip of the horizon for nine generations, neither setting nor rising, like a coin balanced on its edge. The priests called it a trial. The scholars called it a wobble. The Cartographer, whose notes you carry, called it what it is: a wound. Something was taken out of the sky, and the sky has been bleeding out ever since. Nine surveys of the horizon exist, one per generation, and no two of them agree on where the horizon is. The instruments were checked. The instruments are fine. It was not taken up — the notes are firm on this, and the firmness reads like fear. Everything stolen from the world is taken down.',
  },
  {
    id: 'catacombs', title: 'II. The Processions', unlock: { kind: 'stratum', key: 0 },
    text: 'You are not the first. The Mossgrave Catacombs are not a cemetery — they are a queue. Nine generations of delvers went down to take back what was stolen, and the dungeon filed them where they fell. The dead here still face downward, even the ones on their backs, and the oldest graves lie deepest though no hand has ever moved them: the queue is still, very slowly, advancing. The Chronicle does not say toward what window. Note, in the Cartographer\'s hand: "The rats are fat and the wights wear crowns of barrow-gold. Everyone who failed brought something worth stealing. Remember that you did too."',
  },
  {
    id: 'weald', title: 'III. What Grief Grows', unlock: { kind: 'stratum', key: 1 },
    text: 'The Fungal Weald has no seeds and no sun, and yet it grows. The Cartographer\'s theory, underlined twice: mourning is a nutrient. Every tear shed in the Long Evening drains through the earth, and this is where it pools — a forest of pale flesh feeding on a world\'s worth of missing. The Weald does not hate you; the Cartographer dissected widely and found no organ for it. It simply considers you a rich source of what it eats, because no one comes down here who has not lost something — and it can smell what, and how much, and, this being the underlined part, how much you have left.',
  },
  {
    id: 'cloister', title: 'IV. The Choir That Would Not Stop', unlock: { kind: 'stratum', key: 2 },
    text: 'The Drowned Cloister was built by the Church of the Returning Sun, who believed the stolen light could be sung back into the sky if the hymn never once broke. They sang in shifts for sixty years. When the water came — and the water was not an accident — they made a decision that still echoes: they kept singing. The Chronicle records no order to stop. Beneath the black water, none has ever been given. One measurement appears in the Cartographer\'s notes, crossed out and retaken and crossed out again: from above, the nave sounds at forty feet. No diver sent down to touch the floor has ever reported reaching it.',
  },
  {
    id: 'fathoms', title: 'V. The Forgery', unlock: { kind: 'stratum', key: 3 },
    text: 'When singing failed, the Guild of the Second Dawn tried honesty: if the sun cannot be retrieved, build another. The Ember Fathoms are their foundry, sunk deep to hide the heat. The Chronicle is precise about the result. The forge-fires took, the mold held, and for one hour something rose over the anvils that cast true shadows. Then it went out — inward, the way a swallowed thing goes — and what crawls the Fathoms now are the parts of it that refused to cool. The shadows of that one hour are still on the workshop walls, still crisp, still faithfully tracking the position of a light that is no longer anywhere.',
  },
  {
    id: 'throne', title: 'VI. The Inversion', unlock: { kind: 'stratum', key: 4 },
    text: 'Here is the theft, seated. The First Light was not destroyed and not hidden: it was turned inside out, and what radiates from the throne is everything a sun is when you subtract the giving. The Cartographer\'s last legible page: "It still WANTS to shine. That is the horror of it. Light bent into a shape that can only take. If you stand before it, understand — you are not fighting a darkness. You are fighting a dawn that was taught to hoard. It will not hate you. A sun does not hate what stands in its light. It will simply begin, very gently, to count you among its holdings."',
  },
  {
    id: 'shepherd', title: 'The Shepherd of the Filed Dead', unlock: { kind: 'boss', key: 'ossuaryshepherd' },
    text: 'The first delvers were buried with honors. By the third generation there were too many, and something in the catacombs volunteered to keep order. The Ossuary Shepherd was a gravedigger once — the best of them, the one who dug for forty years and never once went down a hole himself. The dungeon made him a deal it makes to very few: stay, and keep the flock. He has kept it beautifully. He is so proud of the rows. The Cartographer, out of professional habit, surveyed them: every row is perfectly straight, and every row, extended on paper, converges on a single point some floors below the deepest floor of any map.',
  },
  {
    id: 'tyrant', title: 'The One Flesh of the Weald', unlock: { kind: 'boss', key: 'mycelialtyrant' },
    text: 'Every mushroom in the Weald is a knuckle of a single buried hand. The Mycelial Tyrant is not its king — kings can be replaced. It is the Weald\'s decision to have a fist. The Cartographer fed it three torchbearers and a mule to learn one fact: it bleeds the same sap that seeps from the Catacomb walls. The grief that grows the Weald comes from above. Whatever waters it, waters it through the graves. A question in the margin, never answered and never repeated: gardens imply a gardener.',
  },
  {
    id: 'cardinal', title: 'The Baptism of the Deep', unlock: { kind: 'boss', key: 'drownedcardinal' },
    text: 'When the water rose in the Cloister, Cardinal Vesse made the hymn mandatory. He walked the flooding aisles baptizing his choir into the deep one by one, holding each under with his own hands so the song would continue below. The Chronicle preserves his arithmetic: a drowned voice never tires, never doubts, never stops. He was correct. The hymn has not broken in three hundred years. This is what it costs to be correct. The Chronicle\'s copyist adds one figure without comment: of the hundred and nine he baptized, only the first nine struggled. The rest had by then heard what sings back from under the water, and went under reaching.',
  },
  {
    id: 'kiln', title: 'The Apprentice at the Bellows', unlock: { kind: 'boss', key: 'kilntyrant' },
    text: 'The Guild\'s false sun did not simply fail — it was sabotaged from inside the workshop. The Kiln Tyrant was the forgemaster\'s apprentice, left to mind the bellows on the last night, and something came up through the fire and spoke to it in the language of heat. What it was offered, the Chronicle does not record. What it did is the Fathoms themselves: it opened the mold an hour early, and it has been trying to finish the sun in its own image ever since. The workshop clocks were found stopped at nine different hours, each claiming to be the hour it happened. The Chronicle keeps all nine, being unable to prove any of them wrong.',
  },
  {
    id: 'bride', title: 'The Wedding Below', unlock: { kind: 'boss', key: 'charnelbride' },
    text: 'She came down in the second generation, in a procession of forty, to marry her betrothed who had fallen the year before — a rite the mountain villages practiced when the Evening began, to keep the dead from feeling abandoned. The dungeon attended the ceremony. It was, by the only surviving account, deeply moved. It granted her what it considered the obvious gift: that the marriage never end. She has curated the Ossuary ever since, filing every delver like a wedding guest, and her veil grows one thread longer with each. The account of the ceremony survives because the dungeon preserved it — the only document it is known to keep. The Chronicle notes this the way one notes a predator keeping a keepsake.',
  },
  {
    id: 'mother', title: 'The Larder', unlock: { kind: 'boss', key: 'mothersilk' },
    text: 'Mother-of-Silk is older than the theft — she was here when the First Light still hung in the sky, and she is one of the few things below that remembers it. She does not eat her wrapped delvers. She keeps them, the Cartographer insists, the way the rich keep pantries through a famine: not from hunger, from arithmetic. She has seen what the dark eats when it runs out of everything else, and she intends to be holding the last food in the world when it comes asking. The Cartographer\'s note on meeting her gaze: "She looked at me the way we look at weather."',
  },
  {
    id: 'gaoler2', title: 'The Ledger of Chains', unlock: { kind: 'boss', key: 'gaoler' },
    text: 'The Vault was not built to hold criminals. Read the cell doors: they lock from the outside AND the inside. When the Unlight took its throne, some of the things that had served the First Light could not bear to look at what it had become — and could not be trusted not to kneel to it either. They chose the chains. The Gaoler was their commander, and it holds the one post it could not assign: warden of the loyal. Its ledger records no releases because none of them has ever asked. The ledger also carries columns with no headings, kept current in a careful hand. The Cartographer copied a single cell before the Gaoler turned around. It was a date. It has not happened yet.',
  },
  {
    id: 'vestal2', title: 'The Vigil of Tallow', unlock: { kind: 'boss', key: 'vestal' },
    text: 'The night the sun was stolen, most of the world panicked. One woman in a hillside chapel did something more dangerous: she made a vow. One candle lit for the missing light, and none permitted to gutter until it returned. The chapel sank — vows of that weight do — and the Garden grew around her vigil, candle by candle, votary by votary. The Chronicle is careful here, because the arithmetic is uncomfortable: her candles are the only surface-light that has never once gone out since the theft. The Unlight has tried. The wax, rising like a patient tide, may be the dungeon\u2019s way of finishing what it cannot blow out.',
  },
  {
    id: 'taproot2', title: 'What the Forests Want', unlock: { kind: 'boss', key: 'taproot' },
    text: 'The Grave-Elves buried their forests out of mercy and assumed that was the end of it. But a forest is mostly root, and a root has exactly one instinct. The buried woods pooled everything — sap, patience, the elves\u2019 own interred wisdom — into a single Taproot and aimed it downward, toward the warmth every root can feel and no elf would name. The Chronicle\u2019s botanist is blunt: it was not digging toward the Unlight to attack it. Roots do not attack suns. They grow toward them. The forests intended to drink it, and nine generations of reaching had nearly arrived when you interrupted.',
  },
  {
    id: 'reflection2', title: 'The Faces in the Cistern', unlock: { kind: 'boss', key: 'reflection' },
    text: 'Mirrors below the world do not work the way they do above, because reflection requires light and the light down here has been inverted. What the Cistern\u2019s water shows is therefore not you — it is what the Unlight sees when it looks at you: the wanting, the hoarding, the version of you that descends for the crown and not the dawn. Every delver leaves one behind. The Pale Reflection is the anthology. The Chronicle\u2019s warning is underlined three times: it wears the faces of those who got furthest, and the reason it wears them is that the delvers who got furthest were the ones most like it.',
  },
  {
    id: 'riddle_ossuary', title: 'The Right Row', unlock: { kind: 'deed', key: 'riddle_ossuary' },
    text: 'You returned a misfiled thing to its gap, and the archive paid you for the tidying — the shelves keep a reliquary for exactly this, stocked and waiting. Attend to the detail the Bride hopes you will miss: the gap was labeled before the remains went missing. The Ossuary does not react to its losses. It schedules them. The Chronicle has met one other institution below that files an event before it happens, and it is a prison.',
  },
  {
    id: 'riddle_waxgarden', title: 'The Order of Grief', unlock: { kind: 'deed', key: 'riddle_waxgarden' },
    text: 'The vigil-rule the wax taught your knuckles — the stolen, then the keeper, then yourself — is not etiquette. It is engineering. A vigil begun with yourself burns inward, and the Garden is planted thick with what that leaves: the wretches in the wax are not intruders the Vestal caught. They are votaries who lit their own candle first. The rule was written after them, in the only medium the Garden trusts to hold an edge: a burn.',
  },
  {
    id: 'riddle_silkfen', title: 'The Deposit', unlock: { kind: 'deed', key: 'riddle_silkfen' },
    text: 'You gave the larder something bottled, and the larder gave back with interest — which settles a question the Cartographer left open twice. Mother-of-Silk is not hoarding. She is banking. A hoard only implies fear; a bank implies a forecast: a day on which everything she holds must be withdrawn at once, and creditors whose shapes she has already measured. Note what the scale accepted as currency. Things that keep. She is not expecting the day soon. She is expecting it exactly.',
  },
  {
    id: 'riddle_roots', title: 'What Was Handed Off', unlock: { kind: 'deed', key: 'riddle_roots' },
    text: 'The elf under the cairn died mid-errand, holding the charred seed toward something, and the loam you planted it in was already waiting — warm, root-lined, dug to fit. So was the burrow that opened: excavated generations ago, aimed at a planting that had not happened yet. The forests do not dig toward their pasts. They dig toward their futures, and they are patient enough to build the road before the traveler is born. The seed fell below the night of the theft. Ask what the forests expect it to grow into, this close to the throne.',
  },
  {
    id: 'riddle_chains', title: 'The Untouched Lock', unlock: { kind: 'deed', key: 'riddle_chains' },
    text: 'The reserved cell was never locked — a reservation is not a restraint — and inside, effects laid out in trust: whoever is coming will arrive with nothing, and the Vault intends them to be received properly. The Chronicle places two facts side by side and declines to introduce them. The date on the shelf-tag matches the date on the ledger’s final page. And the effects were sized, the Cartographer’s note insists, by someone who knew the arrival’s measurements. The Vault is not holding a cell for a prisoner. It is keeping a room ready for a guest.',
  },
  {
    id: 'riddle_cistern', title: 'The Door the Water Keeps', unlock: { kind: 'deed', key: 'riddle_cistern' },
    text: 'The basin showed you a door the room did not have, and the door was there, because the Cistern reflects what the Unlight sees and the Unlight sees its own ways below. Understand what you actually did: you did not find a secret. You read the owner’s map, over the owner’s shoulder, in a mirror the owner trusts. The margin, in a hand pressed hard enough to tear: the ways it keeps are kept for something that walks them. The water knows the routes. Now the water knows you know.',
  },
  {
    id: 'untouched', title: 'The Unmarked Guest', unlock: { kind: 'deed', key: 'untouched' },
    text: 'The Chronicle keeps a very short appendix of delvers who walked into one of the deep places — the archive, the larder, the vault, the garden — and walked out again without shedding one drop. The dungeon\u2019s custodians do not know what to file such a person under, and it disturbs them the way a blank line disturbs a clerk. You are in the appendix now. Somewhere below, something has begun setting a better table, on the reasoning that a guest who cannot be wounded must instead be hosted.',
  },
  {
    id: 'godless', title: 'The Unclaimed', unlock: { kind: 'deed', key: 'godless' },
    text: 'Fifteen floors down with no god\u2019s mark on you. Understand what the six make of that: not offense — inventory. An unclaimed soul at this depth is the rarest commodity in the deep, and every altar you pass now files a small, competing claim. The Cartographer went godless to depth eleven and wrote: "The silence below the hymn is not empty. It is attentive. Something down here prefers us unaffiliated, and I have stopped wanting to know its reasons." You have four floors on the Cartographer. The attention compounds.',
  },
  {
    id: 'edited3', title: 'The Third Revision', unlock: { kind: 'deed', key: 'edited3' },
    text: 'One edit is a bargain. Two is a habit. Three, the Chronicle notes, is a manuscript — and manuscripts belong to their editor, whatever the ink believes. Delvers with three or more revisions report the same small phenomenon: at warped altars they no longer feel offered to. They feel consulted, the way one consults a work in progress about its own next chapter. The Chronicle does not record any delver reaching seven edits. It records, instead, that the eighth altar such a delver finds is always already spent, as if something decided the draft was finished.',
  },
  {
    id: 'editor', title: 'The Nameless Editor', unlock: { kind: 'corrupt' },
    text: 'The warped altars are catalogued in no scripture, and the six gods do not speak of them — not from ignorance, the Cartographer concluded, but the way one does not speak of a colleague under investigation. Whoever tends them works in revisions: a gland here, an eye there, always a fair trade, always a receipt. Consider what kind of power edits delvers stronger the deeper they go, as if preparing instruments. Consider that the theft of the sun was scheduled, that the Vault holds a reservation, and that somewhere below, someone has always known exactly what shape the descent requires you to be. The Chronicle does not say the Editor and the Accomplice are the same hand. The Chronicle notes only that neither has ever signed anything.',
  },
  {
    id: 'ledger', title: '✝ What the Ledger Keeps', unlock: { kind: 'death' },
    text: 'The dungeon keeps a ledger of every delver it has ended, and the entries do not stop at the name. It records what you knew. It records, in a second column, what you were about to know — the Cartographer found his own entry while still alive, already ruled, already half-filled, and confirms that the handwriting was his. This is why the Codex survives you when your body does not — knowledge is the one coin the dark cannot confiscate, and every delver who reads these notes inherits every delver who wrote in them. The Cartographer\'s hand, on the inside cover: "Die well. Write it down first."',
  },
  {
    id: 'dawn', title: 'VII. Dawn, Reassembled', unlock: { kind: 'win' },
    text: 'The Chronicle\'s final page was blank for nine generations. It reads, now: The crown came off. What was hoarded, spilled. Light does not hold a grudge — that is the entire difference between it and everything else in the deep — and it rose through twenty floors of grave-earth like water remembering it can be rain. Above, on the horizon, the coin tips. The queue in the catacombs can stop forming. The hymn, at very long last, is permitted to end. One page after this one is blank, and the Chronicle keeps it blank, in the way a court keeps a warrant open. The theft was scheduled, and schedules have authors. The light is home. The ink is waiting.',
  },
];

// ============================================================ gods
export const GOD_LORE: Record<string, string> = {
  silentking: 'He was the First Light\'s shadow — cast for an eternity, then suddenly cast off. He does not want the light back; a shadow freed of its caster answers to no one. He gathers the dead because they are the only things that fall to him naturally now, and he is patient because he won either way: every candle in the world will come to him eventually, one flicker at a time. The Cartographer notes his single mercy — he genuinely does refuse deaths he considers "badly written." The refused wake at the foot of their own graves with the particular feeling of a manuscript handed back.',
  moths: 'When the Light was dragged below, everything that loved it had to choose: mourn or follow. The moths followed — all of them, a river of wings pouring into the earth — and something in the dark, amused or moved, crowned the current. She is the patron of everyone who descends toward what they love knowing it will burn them. Her luck is real, and it is not luck: it is a thousand small wings, nudging. Ask toward what, and every account agrees on the answer: closer.',
  rottingchoir: 'Not one god — a congregation. They were the Cloister\'s first choir, the generation that drowned, and in the deep their hymn fermented into something else: a harmony of decomposition, every voice a different stage of rot singing the same note. They love poison because poison is patient music, a song that keeps performing in the body after the singer leaves. Join them and you will notice, on quiet floors, that you are humming something you never learned. You will notice, somewhat later, that you cannot remember starting.',
  blacksun: 'The Guild\'s false sun did not entirely die. The hour it burned was enough for it to be worshipped — heat makes converts fast — and a thing worshipped even once does not fully go out. The Black Sun is that hour, remembered so hard it stayed. It radiates the inverse of its maker\'s intent: not light for everyone, but fire for its own. It asks its followers to burn things because every burning is a small vote that it existed. It counts the votes. It is not yet a majority.',
  drowned: 'The water that took the Cloister was not sent by the Unlight, whatever the priests say. It rose on its own — the deep\'s oldest tenant, older than light and unbothered by its theft. The Drowned One considers the entire war over the sky to be a squabble between newcomers. It rewards kills made in its element for the simplest of reasons: it likes to watch things learn, at the end, that the tide was always the landlord. Prayers to it do not rise. They sink, and the answers come back up slower and colder, and not always to the one who asked.',
  warden: 'Every god below is something the theft broke. The Nameless Warden is what the theft could not break: the bare act of standing between a blow and someone behind you. It has no temples because it does not stay anywhere long enough; it is worshipped exclusively in the moment of impact. The Cartographer\'s note is uncharacteristically warm: "Of all of them, only the Warden never asked me for anything. It only ever asked the blow."',
};

// ============================================================ bestiary — tier 1 (unlocked on sight)
export const MONSTER_LORE: Record<string, string> = {
  graverat: 'The catacomb rats are fat because grave-offerings are edible and grief is regular. The Cartographer\'s tally-mark method for estimating a floor\'s body count: count the rats, multiply by what they weigh.',
  shambler: 'The buried delvers do not rise on their own — the moss grows through them first, and the moss remembers walking. What shambles is a collaboration. Neither party is the one that weeps.',
  skelhound: 'Delvers brought dogs, the first few generations. The dogs kept the vigil their owners could not. Some are still waiting at the specific graves.',
  tombspider: 'It webs the mouths of the dead. The Cartographer never established what it was keeping in, and stopped wanting to know.',
  gloombat: 'They roost in the throats of the ventilation shafts, which means they have tasted surface air more recently than any delver. They screech in the old daylight tongue.',
  bonearcher: 'The Shepherd\'s pickets. It fletches its shafts from its own ribs and grows them back, which the Cartographer notes is "either devotion or budgeting."',
  cairnwight: 'The crowned dead of the first procession — knights, once, with names worth engraving. Their barrow-gold is real. They drain the living because rank, below, is measured in vigor owed.',
  gravedigger: 'He dug graves topside for forty years, climbed down into the last one he dug, and came out of it changed. He attacks delvers because he recognizes the shape of his old customers.',
  ossuaryshepherd: 'Keeper of the flock of the failed. He was offered the post by the dungeon itself, and accepted with pride.',
  myconid: 'It dreams standing up, and what it dreams leaks: sleep near one and you will dream of a sky you have never seen, hanging at evening.',
  sporehulk: 'A walking hillside. The Weald uses them to relocate itself, acre by patient acre, always downward. Ask why a forest is migrating toward the throne.',
  caveleech: 'It prefers the blood of the recently bereaved — richer, the Cartographer supposes, in what the Weald farms.',
  fungalzombie: 'The Weald\'s politest arrangement: the corpse gets to keep walking, the fungus gets the itinerary. All the itineraries end at the same place.',
  glowmoth: 'Descendants of the river of wings that followed the Light down. They still navigate by a sun that is no longer in the sky, which is why they circle.',
  venomcrawler: 'Its venom is refined grief — the Weald\'s cash crop. A drop on the tongue, one survivor reported, tastes like the day the Evening began.',
  sporecaller: 'The Weald\'s clergy, insofar as a single organism needs clergy. It does not summon reinforcements; it reminds the floor that it is all one thing.',
  deeptroll: 'Trolls dug too deep long before delvers did, and made peace with the dark on better terms than most: it heals them. The Cartographer\'s advice is underlined: "Fire. Nothing else is a decision."',
  mycelialtyrant: 'The Weald\'s decision to have a fist.',
  drownedacolyte: 'Third generation of the Choir. Born below, baptized below; the hymn is not something they sing but something they are. The pulped hymnal is ceremonial — they have never needed to read it.',
  paleeel: 'They swim the flooded aisles in formation, and the formation spells something. The Cartographer transcribed a stanza of it before deciding some scholarship is self-harm.',
  choirwraith: 'A voice that outlived its lungs. The dirge it casts is one phrase of the great hymn, isolated — which is why it kills: the hymn was never meant to be heard in pieces.',
  barnaclegolem: 'The Cloister\'s saints, statue by statue, are being reassigned. The barnacles are not a growth; they are vestments.',
  siren: 'She sings the counter-melody — the one part of the hymn Cardinal Vesse forbade, the descant that mourns instead of insisting. Her song unstitches resolve because it is honest.',
  drownedknight: 'The Cloister kept soldiers to guard the singers. Their oath had no clause for the water, so as far as they are concerned, nothing has changed.',
  shadow: 'Not every shadow lost its owner in the theft. Some were let go on purpose, by owners who wanted deniability. It remembers being worn.',
  drownedcardinal: 'He held them under himself, so the song would continue. He was correct.',
  cinderimp: 'Slag that came out of the false sun\'s mold with opinions. They are loyal to the Kiln Tyrant the way sparks are loyal to a fire: enthusiastically and briefly.',
  magmacrawler: 'It swims the stone because, to it, the stone is still molten — it simply refuses to acknowledge nine generations of cooling. The Fathoms respect commitment.',
  ashrevenant: 'When the false sun went out, its light had already left the workshop — and light, once emitted, must go somewhere. The revenants are the emissions, come home angry.',
  embercultist: 'The Guild\'s heirs, doctrinally split from the Black Sun\'s church over one word: whether the fire is to be FED or FINISHED. They pray with lit matches for tongues either way.',
  pyrehound: 'The Guild bred hounds to walk the forge floors and fetch dropped tools from the coals. The breed outlived the Guild. It still fetches, and it has begun bringing back tools nobody dropped.',
  obsidiangolem: 'Forge-slag from the sabotage night, load-bearing and unforgiving. Each one contains, at its core, a tool the apprentice was holding when it said yes.',
  flamedjinn: 'It came up through the fire on the last night and spoke to the apprentice. It grants one wish per delver, always the same one, always by incineration — its position being that everyone, deep down, wishes to be light.',
  kilntyrant: 'The apprentice, still at the bellows, still finishing the work in its own image.',
  voidspawn: 'Where the Unlight\'s radiance falls thickest, the world develops holes. The holes develop curiosity. The Cartographer\'s margin: "Do not let it learn your outline."',
  unlightherald: 'It announces what cannot be described, in a voice that subtracts. Delvers deaf in one ear report hearing the announcement anyway, on the deaf side.',
  sovereign: 'A dawn that was taught to hoard.',
  skelservant: 'Your own work, and good work at that. The bones remember employment fondly — it beats the queue.',
  corpseflies: 'The Choir\'s smallest chorus, on loan. Each fly holds one note. Together they hold a grudge.',
  boneswarm: 'Misfiled remains — the Ossuary\'s only flaw. The Bride finds them embarrassing and will not thank you for the tidying, but she will notice.',
  marrowwight: 'The Bride\'s librarians. They read the living the way you read a spine on a shelf: to decide where you will be filed.',
  ossuarycolossus: 'Ten thousand catalogued femurs, filed under WRATH. The filing system permits withdrawals.',
  charnelbride: 'Married below, in the second generation. The dungeon attended, and was moved.',
  silkstalker: 'The Mother\'s midwives hunt in perfect silence because the larder must not be distressed. Stress, she holds, spoils the keeping.',
  webweaver: 'Its silk is measured to your stride because the Mother has your measurements. She has everyone\'s. She took them generations ago, against the famine.',
  broodling: 'Mother says: eat your visitors. They are still learning the difference between visitors and stock, which is the only reason anything leaves the Silkfen.',
  mothersilk: 'She remembers the sky, and is provisioning against what the dark will eat when it runs out of everything else.',
  waxwretch: 'The Vestal does not recruit. People come to hold a candle for someone they lost, and stay one hour too long. The Garden\u2019s wax is warm, and grief is tired.',
  tallowhound: 'Bred from pyre hounds, gentled by candlelight. The wick in its spine was lit from the Vestal\u2019s first candle, which makes each one a walking piece of the original vow.',
  flickerwisp: 'Candleflames are not supposed to be individuals. Nine generations of never going out gave some of them time to develop opinions, mostly about promotion.',
  vestal: 'She lit the first candle the night the sun went missing, and the wax has risen past her waist.',
  rootcrawler: 'The forests\u2019 sappers. Where the Weald grows grief, the Roots simply dig — and everything in their way is, botanically speaking, in their way.',
  mournwillow: 'The graveside willows drank nine generations of funerals before following their congregations underground. Their grief is structural now, like heartwood.',
  sapwraith: 'When a tree dies its sap keeps moving for days. The buried forests\u2019 sap has kept moving for nine generations, and it remembers every axe.',
  taproot: 'The buried forests elected one root to keep digging, and fed it everything.',
  mirrorshade: 'The Cistern\u2019s water remembers everyone who ever looked in. Some memories climb out. They are not hostile to you specifically — they are hostile to being a memory.',
  glassgolem: 'The Cistern grows glass the way graves grow moss. The Cartographer\u2019s note: "It shows you at a worse angle. The horror is that the angle is accurate."',
  stillwatcher: 'It floats beneath the surface matching faces, and it is very good at faces now. The Cartographer\u2019s advice: do not drink here, and above all, do not check your reflection to see why.',
  reflection: 'Every delver who bent over the Cistern left one behind. It wears the ones that got furthest.',
  chainedpenitent: 'They chose the chains, which is the detail everyone misses. Each one holds its own key, swallowed, in the old fashion of oaths.',
  gaolwraith: 'A sentence, in both senses. It reads yours aloud as it kills you, and delvers who survived report the worst part: it was accurate.',
  ironwarden: 'Armor whose occupant was released for good behavior — the Vault\'s one recorded parole. The armor appealed the decision and remains at its post.',
  gaoler: 'Warden of the loyal, holding the one post it could not assign to anyone else.',
};

// ============================================================ bestiary — tier 2 (unlocked by slaying)
// Rule: adds NEW information; never restates tier 1.
export const MONSTER_LORE2: Record<string, string> = {
  cairnwight: 'Their crowns come off the moment they die — and roll, always, toward the stairs down. The Cartographer weighted one with lead. It still rolled. The barrow-gold wants to go home to the throne, which tells you who minted it.',
  ossuaryshepherd: 'Under the robes there is no shepherd — there is the crook, grown through a stack of forty-one delvers like a spine through vertebrae. The dungeon\'s deals are honored precisely: it promised him he would never lie in the rows. It never promised he would stop being buried.',
  deeptroll: 'A slain troll\'s wounds keep trying to close for three days. The Guild used to harvest the effort — troll blood is why their crucibles survived the false sun\'s heat. Every potion of troll blood you drink is Guild stock, still circulating. Check the vintage.',
  mycelialtyrant: 'Cut it open and the sap runs UP, against gravity, back toward the graves it drains. The Weald is not feeding on the world\'s grief for sustenance. It is stockpiling it. Grief, concentrated, is the one thing the Unlight cannot metabolize — the Weald is building a poison, and it is nearly done.',
  choirwraith: 'Silence one and the hymn does not lose a voice — the remaining wraiths redistribute the phrase within the hour, like a load-bearing wall sharing weight. The Cartographer\'s conclusion, boxed for emphasis: the hymn is not a performance. It is a structure. Something is being held up by it, or held down.',
  drownedcardinal: 'His hands, when he finally dies, do not stop. They continue the baptismal motion, empty, patient. The Chronicle\'s appendix records what Vesse never told his choir: the water offered him terms on the first night, and the hymn\'s true purpose since has been to drown OUT its voice, not to reach the sky. He kept them singing so they could not hear it.',
  kilntyrant: 'Slain, it does not cool for nine days — and on the ninth, its chest-furnace is found empty. Whatever the djinn offered it on the last night, it was not power. It was custody. The unfinished false sun has been inside the apprentice all along, and killing the Tyrant does not extinguish the prototype. It releases it to find a new smith. The Chronicle\'s advice is for once practical: when it falls, be holding nothing that could be called a hammer.',
  flamedjinn: 'Every djinn you kill dies mid-sentence, and delvers who compare notes find the sentences continue each other. The Cartographer assembled forty-one fragments. They spell an apology — addressed not to the Guild, and not to the apprentice, but to the mold.',
  sovereign: 'The Chronicle\'s appendix, in a hand that is not the Cartographer\'s: it did not steal itself. Light cannot fall below the horizon uninvited. Somebody, in the noon of the world, looked at a sun that gave to everyone equally and concluded it was being wasted. The Sovereign is the crime. The accomplice was never caught. The queue in the catacombs, nine generations long, includes every detective who got close.',
  charnelbride: 'Her veil, unwound, is a guest list — every delver she has filed, stitched in hair-fine bone thread, in order of arrival. The forty-first entry is circled. The Cartographer never explained the circle, and the Cartographer was the forty-first thing she filed.',
  mothersilk: 'In the deepest chamber of the Silkfen hangs one bundle she permits no broodling to touch — man-shaped, sky-blue silk, spun in a weave she has used exactly once. She wrapped something the day the Light was dragged past her fen. She has been keeping it fresh ever since. She does not think of it as evidence. She thinks of it as leverage.',
  gaoler: 'Its ledger\'s final page is pre-filled, in the oldest ink in the Vault: one empty cell, one name-blank, and a date the Cartographer identified as the day the Long Evening began. The Vault was commissioned BEFORE the theft. Someone ordered a cell built for a prisoner that did not exist yet, which means the crime was scheduled. The Gaoler guards the reservation.',
  vestal: 'When she finally falls, every candle in the Garden gutters at once — and then relights, on its own, one heartbeat later. The vow no longer needs her; it has been load-bearing for generations, like the hymn in the Cloister. The Chronicle lists the things still holding the world up. It is a shorter list than anyone would like, and you have now met two of them.',
  taproot: 'Its rings, counted, number nine generations exactly — but the innermost ring is charred. The Taproot did not start growing when the forests were buried. It started growing the night of the theft, from a seed that fell BELOW when the Light was dragged down. Whatever fruit a sun\u2019s seed bears at the bottom of the world, the forests knew about it before anyone, and said nothing.',
  reflection: 'Slain, it does not shatter — it settles, like water finding level, and for a moment shows one final face: not yours, and not any delver\u2019s. A face looking down from above the frame, the way you look into a well. The Cistern\u2019s water reflects what the Unlight sees, and in that last moment it reflected whoever it is the Unlight looks up at. The Chronicle does not speculate further, and for the Chronicle, that is a scream.',
  ossuarycolossus: 'Disassembled, its femurs are found to be numbered — but not sequentially. They are page references. The Colossus is an index of the Ossuary\'s collection, and it attacked you for the reason any librarian would: you were about to be shelved out of order.',
  siren: 'Her counter-melody, transcribed, is a lullaby every delver recognizes from childhood — words changed, tune identical. It predates the Cloister. Mothers in the Long Evening have been singing their children a mourning-song for the sun for nine generations without knowing it. The Cardinal did not forbid her descant because it was heresy. He forbade it because it was older than his hymn, and better.',
  unlightherald: 'Struck down, it announces its own death — and for one syllable, the voice stops subtracting and simply grieves. The heralds are not the Sovereign\'s creations. They are what remains of the First Light\'s own criers, conscripted, still contractually obligated to announce their employer.',
};

// ============================================================ items (identified only; Souls rule — explicit where important)
export const ITEM_LORE: Record<string, string> = {
  'ring:vigor': 'Guild work: they issued these to forge-hands so exhaustion would not spoil the pour. The extra life is drawn from somewhere. The rings never said where, and the Guild stopped asking.',
  'ring:shadows': 'Cut from the barrow-gold of a wight who once commanded shadows and let them go. It remembers how to not be seen wearing you.',
  'ring:fury': 'The Ossuary files these under DOMESTIC. The Cartographer declined to elaborate.',
  'ring:warding': 'Choir-silver, cast from a drowned bell. It turns blows the way the bell once turned weather — imperfectly, but with conviction.',
  'ring:springs': 'There are rivers below the Fathoms that have never been mapped because they are made of the same stuff as magic. This ring leaks.',
  'amulet:leech': 'Cloister reliquary work: it holds a leech-saint\'s tooth. The blows you land tithe to you now. The saint takes a cut.',
  'amulet:clarity': 'Forged in the Vault of Chains for interrogators, so the prisoners\' sentences could not slow their pens. It keeps your mind your own, which below is a controlled substance.',
  'amulet:graveheart': 'A heart of grave-soil, still beating on momentum. The vigor is real. So is the weight.',
  'amulet:whispers': 'The dark, it turns out, gossips. This amulet is simply a very good listener with no discretion whatsoever. Some of what it repeats has not been said yet.',
  'potion:ichor': 'Bottled by someone who believed everything below is medicine if you are brave enough. The Cartographer\'s label, added later: "It is not."',
  'scroll:immolation': 'Guild disposal doctrine, single page. The Cartographer\'s note: "Read it angry, and stand in the middle of your problems first."',
};

export const UNIQUE_LORE: Record<string, string> = {
  'Vigil': 'The Vestal\u2019s first spear, planted at the chapel door the night she lit the first candle. It burns because some promises soak in.',
  'The Cartographer’s Pick': 'The tool that mapped every floor you have walked. It cuts rock, bone, and — its maker noted in the margin — excuses. The grip is worn to the shape of a hand that is not yours, and does not stay the same size.',
  'Choirmail': 'Woven from the bell-silver of the Cloister before it drowned. It rings very softly when struck, one note, always the same. Singers recognize it.',
  'The Long Evening': 'A bow strung with the horizon itself, or so the Guild claimed when they sold it. Every arrow it looses arrives a little colder than it left.',
  'Barrowband': 'Wight-gold, freely given — the only crown in the catacombs that ever came off willingly. Its previous owner asked one thing: spend the fury well.',
  'The Last Candle': 'A wick of braided hair in a locket of wax. The Vestal does not know it is missing. When everything else has gone out, it will not.',
};

export const EGO_LORE: Record<string, string> = {
  flaming: 'Quenched in the Fathoms on the night the false sun burned. One hour of dawn is folded into the edge.',
  venom: 'Weald-tithed steel. It pays a percentage of every wound to the forest, in grief.',
  draining: 'The Silent King\'s tax stamp is on the tang. What it takes from them was always, in his accounting, owed. What it takes from you is billed later.',
  frost: 'The grave-wind blows from a door that has never been found. This blade was left in front of it overnight.',
  vorpal: 'Sharpened past sharpness into policy: whatever it touches has, on some level, already agreed to be cut.',
  shadows: 'Woven with thread from the loose shadows — the deniable ones. It extends their arrangement to you.',
  warding: 'Vault-forged. It does not stop blows so much as file appeals against them, and the Vault\'s appeals are usually granted.',
  embers: 'Ash-cured in a pyre hound\'s bed. Fire recognizes it as furniture.',
  mire: 'The swamp raised this armor like it raises its children: venom-proof and unbothered.',
  vitality: 'Lined with troll-felt. It heals its previous owner\'s wounds too, which is why it sometimes sighs.',
};

// ============================================================ races & classes
export const RACE_LORE: Record<string, string> = {
  hollowed: 'The Hollowed climb out of the catacomb queue — the only delvers who enter the dungeon by leaving one of its graves. The Shepherd regards them as escaped inventory. They regard the Shepherd as an unpaid debt.',
  ashkin: 'Born in the one hour the false sun burned, to mothers who stood too close to the Fathoms\' vents. The fire that failed the world succeeded, in a small way, in them. Their pulse, the Cartographer measured, keeps forge-time rather than heart-time.',
  vesperkin: 'They lived in the twilight belt before the Evening, and when the whole world became twilight they were suddenly, awkwardly, the natives. Their onyx eyes were made for exactly this.',
  graveelf: 'The elves buried their forests when the Light was taken — a forest cannot mourn on its feet — and followed them down to sit shiva. Nine generations later, they are still down here, and the sitting has become something sharper.',
  trollblood: 'The mountains\' answer to the question no one asked them. Trollblood delvers descend for the oldest reason: their ancestors\' peace with the dark included visiting rights.',
  mireborn: 'The swamp raised them when the Evening\'s refugees left infants at its edge — payment, or offering, or simply surrender. The swamp keeps every promise it never made.',
  mothtouched: 'Marked at birth by a dusting of wings. The Mother of Moths seeds her luck in surface children the way other powers seed prophets: as an investment in the descent she knows they will make.',
};

export const CLASS_LORE: Record<string, string> = {
  gravewarden: 'The order that keeps the doors of the dead was founded after the first procession failed to stay buried. Their maces are consecrated for one argument and they have never lost it twice.',
  pyroclast: 'They swallow a coal from the Black Sun\'s altar as ordination. Most die. The rest are furnaces on a pilgrimage, looking for the original fire to give the coal back.',
  shadowdancer: 'Their guild taught dancing, before the Evening. The dark simply turned out to be a better partner — it never leads, never tires, and never asks questions about the knife. The oldest dancers report that, in the long figures, it has lately begun to lead.',
  plaguewright: 'Physicians who kept asking why until the College expelled them into the deep, where the answers live. Their oath is intact, technically: first, do no harm — the order of operations is theirs to choose.',
  hexblade: 'A heretical sword-school whose founding insight was that every parry is a prayer and every prayer can be said backwards. The orthodox schools burned their monastery. The monastery, notably, parried.',
  bonecaster: 'Necromancy below is not forbidden — it is union labor. The Bonecasters hold the oldest contract in the dungeon: the dead work willingly, for the one employer who guarantees they will not be filed.',
  ascetic: 'They own nothing so the dungeon has nothing to steal, and they are very serious about the accounting. Their fists have outlived every weapon raised against them, which the deep finds philosophically upsetting.',
};

// ============================================================ context whispers (Hades-style condition-gated events)
export interface Whisper {
  id: string;
  text: string;
}
// checked on arrival at each new spine depth; fired at most once per run each
export const WHISPERS: Record<number, Whisper> = {
  2: { id: 'w2', text: 'Scratched beside the stairs, in the Cartographer\'s hand: "Still cheerful. Still stupid. Down we go."' },
  4: { id: 'w4', text: 'The Cartographer\'s map of this floor disagrees with the floor. Beside it: "Paced it twice. Eighty-one paces down, seventy-nine back. The corridor keeps the difference."' },
  6: { id: 'w6', text: 'A tally on the wall: forty marks, then one more in different, shakier chalk.' },
  8: { id: 'w8', text: 'A perfect circle of dead moths, wings down. The Cartographer\'s note reads, in full: "Do not stand in the centre. No reason recorded. None needed."' },
  11: { id: 'w11', text: 'The water here is warm, which the Cartographer\'s notes say to never think about.' },
  13: { id: 'w13', text: 'A sounding-line hangs by the stairs, knotted at forty feet, wet to ninety. In the margin: "The Cloister is deeper from the inside. Most things down here are."' },
  16: { id: 'w16', text: 'From here down, your torch-shadows fall the wrong way — toward the light. They know who is in charge below.' },
  17: { id: 'w17', text: 'The same words scratched over and over at the height of a resting hand: "the mold is a door." The scratches are in the Cartographer\'s hand. Below them, same hand: "I did not write this."' },
  19: { id: 'w19', text: 'The last note in the Cartographer\'s journal before the pages go strange: "If you are reading this on depth nineteen, I am two floors of paperwork below you. File me well."' },
};
