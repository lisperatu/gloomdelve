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
  unlock: { kind: 'start' | 'stratum' | 'boss' | 'god' | 'death' | 'win'; key?: string | number };
  text: string;
}

// ============================================================ the chronicle
export const CHRONICLE: ChronicleEntry[] = [
  {
    id: 'evening', title: 'I. The Long Evening', unlock: { kind: 'start' },
    text: 'No one alive remembers noon. The sun has hung at the lip of the horizon for nine generations, neither setting nor rising, like a coin balanced on its edge. The priests called it a trial. The scholars called it a wobble. The Cartographer, whose notes you carry, called it what it is: a wound. Something was taken out of the sky, and the sky has been bleeding out ever since. It was not taken up. Everything stolen from the world is taken down.',
  },
  {
    id: 'catacombs', title: 'II. The Processions', unlock: { kind: 'stratum', key: 0 },
    text: 'You are not the first. The Mossgrave Catacombs are not a cemetery — they are a queue. Nine generations of delvers went down to take back what was stolen, and the dungeon filed them where they fell. The dead here still face downward, even the ones on their backs. Note, in the Cartographer\'s hand: "The rats are fat and the wights wear crowns of barrow-gold. Everyone who failed brought something worth stealing. Remember that you did too."',
  },
  {
    id: 'weald', title: 'III. What Grief Grows', unlock: { kind: 'stratum', key: 1 },
    text: 'The Fungal Weald has no seeds and no sun, and yet it grows. The Cartographer\'s theory, underlined twice: mourning is a nutrient. Every tear shed in the Long Evening drains through the earth, and this is where it pools — a forest of pale flesh feeding on a world\'s worth of missing. The Weald does not hate you. It simply considers you a rich source of what it eats, because no one comes down here who has not lost something.',
  },
  {
    id: 'cloister', title: 'IV. The Choir That Would Not Stop', unlock: { kind: 'stratum', key: 2 },
    text: 'The Drowned Cloister was built by the Church of the Returning Sun, who believed the stolen light could be sung back into the sky if the hymn never once broke. They sang in shifts for sixty years. When the water came — and the water was not an accident — they made a decision that still echoes: they kept singing. The Chronicle records no order to stop. Beneath the black water, none has ever been given.',
  },
  {
    id: 'fathoms', title: 'V. The Forgery', unlock: { kind: 'stratum', key: 3 },
    text: 'When singing failed, the Guild of the Second Dawn tried honesty: if the sun cannot be retrieved, build another. The Ember Fathoms are their foundry, sunk deep to hide the heat. The Chronicle is precise about the result. The forge-fires took, the mold held, and for one hour something rose over the anvils that cast true shadows. Then it went out — inward, the way a swallowed thing goes — and what crawls the Fathoms now are the parts of it that refused to cool.',
  },
  {
    id: 'throne', title: 'VI. The Inversion', unlock: { kind: 'stratum', key: 4 },
    text: 'Here is the theft, seated. The First Light was not destroyed and not hidden: it was turned inside out, and what radiates from the throne is everything a sun is when you subtract the giving. The Cartographer\'s last legible page: "It still WANTS to shine. That is the horror of it. Light bent into a shape that can only take. If you stand before it, understand — you are not fighting a darkness. You are fighting a dawn that was taught to hoard."',
  },
  {
    id: 'shepherd', title: 'The Shepherd of the Filed Dead', unlock: { kind: 'boss', key: 'ossuaryshepherd' },
    text: 'The first delvers were buried with honors. By the third generation there were too many, and something in the catacombs volunteered to keep order. The Ossuary Shepherd was a gravedigger once — the best of them, the one who dug for forty years and never once went down a hole himself. The dungeon made him a deal it makes to very few: stay, and keep the flock. He has kept it beautifully. He is so proud of the rows.',
  },
  {
    id: 'tyrant', title: 'The One Flesh of the Weald', unlock: { kind: 'boss', key: 'mycelialtyrant' },
    text: 'Every mushroom in the Weald is a knuckle of a single buried hand. The Mycelial Tyrant is not its king — kings can be replaced. It is the Weald\'s decision to have a fist. The Cartographer fed it three torchbearers and a mule to learn one fact: it bleeds the same sap that seeps from the Catacomb walls. The grief that grows the Weald comes from above. Whatever waters it, waters it through the graves.',
  },
  {
    id: 'cardinal', title: 'The Baptism of the Deep', unlock: { kind: 'boss', key: 'drownedcardinal' },
    text: 'When the water rose in the Cloister, Cardinal Vesse made the hymn mandatory. He walked the flooding aisles baptizing his choir into the deep one by one, holding each under with his own hands so the song would continue below. The Chronicle preserves his arithmetic: a drowned voice never tires, never doubts, never stops. He was correct. The hymn has not broken in three hundred years. This is what it costs to be correct.',
  },
  {
    id: 'kiln', title: 'The Apprentice at the Bellows', unlock: { kind: 'boss', key: 'kilntyrant' },
    text: 'The Guild\'s false sun did not simply fail — it was sabotaged from inside the workshop. The Kiln Tyrant was the forgemaster\'s apprentice, left to mind the bellows on the last night, and something came up through the fire and spoke to it in the language of heat. What it was offered, the Chronicle does not record. What it did is the Fathoms themselves: it opened the mold an hour early, and it has been trying to finish the sun in its own image ever since.',
  },
  {
    id: 'bride', title: 'The Wedding Below', unlock: { kind: 'boss', key: 'charnelbride' },
    text: 'She came down in the second generation, in a procession of forty, to marry her betrothed who had fallen the year before — a rite the mountain villages practiced when the Evening began, to keep the dead from feeling abandoned. The dungeon attended the ceremony. It was, by the only surviving account, deeply moved. It granted her what it considered the obvious gift: that the marriage never end. She has curated the Ossuary ever since, filing every delver like a wedding guest, and her veil grows one thread longer with each.',
  },
  {
    id: 'mother', title: 'The Larder', unlock: { kind: 'boss', key: 'mothersilk' },
    text: 'Mother-of-Silk is older than the theft — she was here when the First Light still hung in the sky, and she is one of the few things below that remembers it. She does not eat her wrapped delvers. She keeps them, the Cartographer insists, the way the rich keep pantries through a famine: not from hunger, from arithmetic. She has seen what the dark eats when it runs out of everything else, and she intends to be holding the last food in the world when it comes asking.',
  },
  {
    id: 'gaoler2', title: 'The Ledger of Chains', unlock: { kind: 'boss', key: 'gaoler' },
    text: 'The Vault was not built to hold criminals. Read the cell doors: they lock from the outside AND the inside. When the Unlight took its throne, some of the things that had served the First Light could not bear to look at what it had become — and could not be trusted not to kneel to it either. They chose the chains. The Gaoler was their commander, and it holds the one post it could not assign: warden of the loyal. Its ledger records no releases because none of them has ever asked.',
  },
  {
    id: 'ledger', title: '✝ What the Ledger Keeps', unlock: { kind: 'death' },
    text: 'The dungeon keeps a ledger of every delver it has ended, and the entries do not stop at the name. It records what you knew. This is why the Codex survives you when your body does not — knowledge is the one coin the dark cannot confiscate, and every delver who reads these notes inherits every delver who wrote in them. The Cartographer\'s hand, on the inside cover: "Die well. Write it down first."',
  },
  {
    id: 'dawn', title: 'VII. Dawn, Reassembled', unlock: { kind: 'win' },
    text: 'The Chronicle\'s final page was blank for nine generations. It reads, now: The crown came off. What was hoarded, spilled. Light does not hold a grudge — that is the entire difference between it and everything else in the deep — and it rose through twenty floors of grave-earth like water remembering it can be rain. Above, on the horizon, the coin tips. The queue in the catacombs can stop forming. The hymn, at very long last, is permitted to end.',
  },
];

// ============================================================ gods
export const GOD_LORE: Record<string, string> = {
  silentking: 'He was the First Light\'s shadow — cast for an eternity, then suddenly cast off. He does not want the light back; a shadow freed of its caster answers to no one. He gathers the dead because they are the only things that fall to him naturally now, and he is patient because he won either way: every candle in the world will come to him eventually, one flicker at a time. The Cartographer notes his single mercy — he genuinely does refuse deaths he considers "badly written."',
  moths: 'When the Light was dragged below, everything that loved it had to choose: mourn or follow. The moths followed — all of them, a river of wings pouring into the earth — and something in the dark, amused or moved, crowned the current. She is the patron of everyone who descends toward what they love knowing it will burn them. Her luck is real, and it is not luck: it is a thousand small wings, nudging.',
  rottingchoir: 'Not one god — a congregation. They were the Cloister\'s first choir, the generation that drowned, and in the deep their hymn fermented into something else: a harmony of decomposition, every voice a different stage of rot singing the same note. They love poison because poison is patient music, a song that keeps performing in the body after the singer leaves. Join them and you will notice, on quiet floors, that you are humming something you never learned.',
  blacksun: 'The Guild\'s false sun did not entirely die. The hour it burned was enough for it to be worshipped — heat makes converts fast — and a thing worshipped even once does not fully go out. The Black Sun is that hour, remembered so hard it stayed. It radiates the inverse of its maker\'s intent: not light for everyone, but fire for its own. It asks its followers to burn things because every burning is a small vote that it existed.',
  drowned: 'The water that took the Cloister was not sent by the Unlight, whatever the priests say. It rose on its own — the deep\'s oldest tenant, older than light and unbothered by its theft. The Drowned One considers the entire war over the sky to be a squabble between newcomers. It rewards kills made in its element for the simplest of reasons: it likes to watch things learn, at the end, that the tide was always the landlord.',
  warden: 'Every god below is something the theft broke. The Nameless Warden is what the theft could not break: the bare act of standing between a blow and someone behind you. It has no temples because it does not stay anywhere long enough; it is worshipped exclusively in the moment of impact. The Cartographer\'s note is uncharacteristically warm: "Of all of them, only the Warden never asked me for anything. It only ever asked the blow."',
};

// ============================================================ bestiary — tier 1 (unlocked on sight)
export const MONSTER_LORE: Record<string, string> = {
  graverat: 'The catacomb rats are fat because grave-offerings are edible and grief is regular. The Cartographer\'s tally-mark method for estimating a floor\'s body count: count the rats, multiply by what they weigh.',
  shambler: 'The buried delvers do not rise on their own — the moss grows through them first, and the moss remembers walking. What shambles is a collaboration.',
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
  fungalzombie: 'The Weald\'s politest arrangement: the corpse gets to keep walking, the fungus gets the itinerary.',
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
  pyrehound: 'The Guild bred hounds to walk the forge floors and fetch dropped tools from the coals. The breed outlived the Guild. It still fetches.',
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
  kilntyrant: 'Slain, it does not cool for nine days — and on the ninth, its chest-furnace is found empty. Whatever the djinn offered it on the last night, it was not power. It was custody. The unfinished false sun has been inside the apprentice all along, and killing the Tyrant does not extinguish the prototype. It releases it to find a new smith.',
  flamedjinn: 'Every djinn you kill dies mid-sentence, and delvers who compare notes find the sentences continue each other. The Cartographer assembled forty-one fragments. They spell an apology — addressed not to the Guild, and not to the apprentice, but to the mold.',
  sovereign: 'The Chronicle\'s appendix, in a hand that is not the Cartographer\'s: it did not steal itself. Light cannot fall below the horizon uninvited. Somebody, in the noon of the world, looked at a sun that gave to everyone equally and concluded it was being wasted. The Sovereign is the crime. The accomplice was never caught. The queue in the catacombs, nine generations long, includes every detective who got close.',
  charnelbride: 'Her veil, unwound, is a guest list — every delver she has filed, stitched in hair-fine bone thread, in order of arrival. The forty-first entry is circled. The Cartographer never explained the circle, and the Cartographer was the forty-first thing she filed.',
  mothersilk: 'In the deepest chamber of the Silkfen hangs one bundle she permits no broodling to touch — man-shaped, sky-blue silk, spun in a weave she has used exactly once. She wrapped something the day the Light was dragged past her fen. She has been keeping it fresh ever since. She does not think of it as evidence. She thinks of it as leverage.',
  gaoler: 'Its ledger\'s final page is pre-filled, in the oldest ink in the Vault: one empty cell, one name-blank, and a date the Cartographer identified as the day the Long Evening began. The Vault was commissioned BEFORE the theft. Someone ordered a cell built for a prisoner that did not exist yet, which means the crime was scheduled. The Gaoler guards the reservation.',
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
  'amulet:whispers': 'The dark, it turns out, gossips. This amulet is simply a very good listener with no discretion whatsoever.',
  'potion:ichor': 'Bottled by someone who believed everything below is medicine if you are brave enough. The Cartographer\'s label, added later: "It is not."',
  'scroll:immolation': 'Guild disposal doctrine, single page. The Cartographer\'s note: "Read it angry, and stand in the middle of your problems first."',
};

export const EGO_LORE: Record<string, string> = {
  flaming: 'Quenched in the Fathoms on the night the false sun burned. One hour of dawn is folded into the edge.',
  venom: 'Weald-tithed steel. It pays a percentage of every wound to the forest, in grief.',
  draining: 'The Silent King\'s tax stamp is on the tang. What it takes from them was always, in his accounting, owed.',
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
  ashkin: 'Born in the one hour the false sun burned, to mothers who stood too close to the Fathoms\' vents. The fire that failed the world succeeded, in a small way, in them.',
  vesperkin: 'They lived in the twilight belt before the Evening, and when the whole world became twilight they were suddenly, awkwardly, the natives. Their onyx eyes were made for exactly this.',
  graveelf: 'The elves buried their forests when the Light was taken — a forest cannot mourn on its feet — and followed them down to sit shiva. Nine generations later, they are still down here, and the sitting has become something sharper.',
  trollblood: 'The mountains\' answer to the question no one asked them. Trollblood delvers descend for the oldest reason: their ancestors\' peace with the dark included visiting rights.',
  mireborn: 'The swamp raised them when the Evening\'s refugees left infants at its edge — payment, or offering, or simply surrender. The swamp keeps every promise it never made.',
  mothtouched: 'Marked at birth by a dusting of wings. The Mother of Moths seeds her luck in surface children the way other powers seed prophets: as an investment in the descent she knows they will make.',
};

export const CLASS_LORE: Record<string, string> = {
  gravewarden: 'The order that keeps the doors of the dead was founded after the first procession failed to stay buried. Their maces are consecrated for one argument and they have never lost it twice.',
  pyroclast: 'They swallow a coal from the Black Sun\'s altar as ordination. Most die. The rest are furnaces on a pilgrimage, looking for the original fire to give the coal back.',
  shadowdancer: 'Their guild taught dancing, before the Evening. The dark simply turned out to be a better partner — it never leads, never tires, and never asks questions about the knife.',
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
  6: { id: 'w6', text: 'A tally on the wall: forty marks, then one more in different, shakier chalk.' },
  11: { id: 'w11', text: 'The water here is warm, which the Cartographer\'s notes say to never think about.' },
  16: { id: 'w16', text: 'From here down, your torch-shadows fall the wrong way — toward the light. They know who is in charge below.' },
  19: { id: 'w19', text: 'The last note in the Cartographer\'s journal before the pages go strange: "If you are reading this on depth nineteen, I am two floors of paperwork below you. File me well."' },
};
