// VortexCloud Gaming catalog + hourly slot model. Frontend-only app: all data lives
// here and in localStorage (see lib/store.ts) — nothing depends on the backend.

export type Genre = "Open World" | "RPG" | "Action" | "Shooter" | "Racing" | "Horror" | "Sports";
export type Rig = "RTX 4080" | "RTX 4090 Ultra";

export interface Game {
  id: string;
  title: string;
  genre: Genre;
  rating: string;
  pricePerHour: number;
  rig: Rig;
  streamSpec: string;
  description: string;
  badge: string;
  featured?: boolean;
  popular?: boolean;
  cover: string;
}

export const GENRES: Genre[] = ["Open World", "RPG", "Action", "Shooter", "Racing", "Horror", "Sports"];

const IMG = "https://static.prod-images.emergentagent.com/jobs/4eba5db1-fbde-4f0f-a914-64b17e6c4ea7/images";

export const GAMES: Game[] = [
  {
    id: "gta-6",
    title: "Grand Theft Auto VI",
    genre: "Open World",
    rating: "18+",
    pricePerHour: 129,
    rig: "RTX 4090 Ultra",
    streamSpec: "4K 120FPS • Ray Tracing • DLSS 3.5",
    description:
      "Step into the neon-soaked streets of Vice City and explore the state of Leonida on our flagship RTX 4090 Ultra rigs — zero downloads, instant streaming.",
    badge: "FEATURED EXCLUSIVE",
    featured: true,
    popular: true,
    cover: `${IMG}/80980ed8b6d86ed7497ea560d8aa1708944e4291a4a050f3686dc20fbc803870.jpeg`,
  },
  {
    id: "cyberpunk-2077",
    title: "Cyberpunk 2077: Phantom Liberty",
    genre: "RPG",
    rating: "18+",
    pricePerHour: 99,
    rig: "RTX 4090 Ultra",
    streamSpec: "4K Ray Tracing Overdrive • DLSS 3.5",
    description: "Explore Night City with full Path Tracing and DLSS 3.5 on high-speed NVMe cloud nodes.",
    badge: "RAY TRACING OVERDRIVE",
    popular: true,
    cover: `${IMG}/e73e74d7182308ec74ed3ad07bc167426e344f57c3facb7aa76b99a9820ce64d.jpeg`,
  },
  {
    id: "black-myth-wukong",
    title: "Black Myth: Wukong",
    genre: "Action",
    rating: "16+",
    pricePerHour: 99,
    rig: "RTX 4090 Ultra",
    streamSpec: "4K 90FPS • DLSS 3.5",
    description: "Fast, cinematic action RPG inspired by classic Chinese mythology, with demanding visuals.",
    badge: "4090 ULTRA",
    popular: true,
    cover: `${IMG}/2a9ffd51af7e68791e66c40f1b0787890d3f0887924a5d8a5f7ff723b6e78624.jpeg`,
  },
  {
    id: "god-of-war-ragnarok",
    title: "God of War Ragnarök",
    genre: "Action",
    rating: "18+",
    pricePerHour: 99,
    rig: "RTX 4090 Ultra",
    streamSpec: "4K 100FPS • RT Ultra",
    description: "A cinematic, story-driven action adventure across the Norse realms at maxed-out settings.",
    badge: "CINEMATIC",
    popular: true,
    cover: `${IMG}/6814fc75849e52a74bd0ba25178cc247a6c4d77dcafab1f023ac94e90465a98c.jpeg`,
  },
  {
    id: "spider-man-2",
    title: "Marvel's Spider-Man 2",
    genre: "Action",
    rating: "13+",
    pricePerHour: 99,
    rig: "RTX 4090 Ultra",
    streamSpec: "4K Ray Traced 120FPS",
    description: "Swing across a ray-traced New York as Peter and Miles with near-zero input lag.",
    badge: "WEB-SLINGER",
    popular: true,
    cover: `${IMG}/ae28eab785e5089dbc1a857af7a9113fa6b752e9a9d87986c2ae6cbef62e864f.jpeg`,
  },
  {
    id: "assassins-creed-shadows",
    title: "Assassin's Creed Shadows",
    genre: "Open World",
    rating: "18+",
    pricePerHour: 99,
    rig: "RTX 4090 Ultra",
    streamSpec: "4K 90FPS HDR",
    description: "Live the shinobi fantasy in feudal Japan with dynamic seasons and volumetric lighting.",
    badge: "FEUDAL JAPAN",
    cover: `${IMG}/c9fbac448b84b76df85da618de86f0cfa5b1dad14b8209dd9904543f5cd54a62.jpeg`,
  },
  {
    id: "alan-wake-2",
    title: "Alan Wake 2",
    genre: "Horror",
    rating: "18+",
    pricePerHour: 99,
    rig: "RTX 4090 Ultra",
    streamSpec: "4K Path Tracing • DLSS 3.5",
    description: "Survival horror with full path tracing — the best-looking game on our fleet.",
    badge: "FULL PATH TRACING",
    cover: `${IMG}/f3f031b0d1ad5d331cb515b47235dc8d5d956c2e49a80726ee1cf18f42defa8f.jpeg`,
  },
  {
    id: "elden-ring",
    title: "Elden Ring: Shadow of the Erdtree",
    genre: "RPG",
    rating: "16+",
    pricePerHour: 89,
    rig: "RTX 4080",
    streamSpec: "4K 60FPS Max Settings",
    description: "Explore the Land of Shadow and face towering bosses in the acclaimed action RPG.",
    badge: "EPIC RPG",
    popular: true,
    cover: `${IMG}/f7bf8e564db07db30b5c8b8486026e1da1955dc6379793494dd476fbbac7a011.jpeg`,
  },
  {
    id: "ghost-of-tsushima",
    title: "Ghost of Tsushima: Director's Cut",
    genre: "Action",
    rating: "18+",
    pricePerHour: 89,
    rig: "RTX 4080",
    streamSpec: "4K 120FPS",
    description: "Wage an unconventional war for the freedom of Tsushima with ultra-responsive combat.",
    badge: "SAMURAI",
    popular: true,
    cover: `${IMG}/a01dd9dbfc03a2ff5e70f29bada53700c88f85b200b580a23197eab0a84780a9.jpeg`,
  },
  {
    id: "dragons-dogma-2",
    title: "Dragon's Dogma 2",
    genre: "RPG",
    rating: "18+",
    pricePerHour: 89,
    rig: "RTX 4090 Ultra",
    streamSpec: "4K 80FPS RT",
    description: "An adventurer-driven open world where every journey becomes a story worth telling.",
    badge: "ACTION RPG",
    cover: `${IMG}/569fd5d42f0d556e09d0f64c725ccf953c504d360a1e556ba19b9b78642c438f.jpeg`,
  },
  {
    id: "silent-hill-2",
    title: "Silent Hill 2 Remake",
    genre: "Horror",
    rating: "18+",
    pricePerHour: 89,
    rig: "RTX 4090 Ultra",
    streamSpec: "4K 60FPS RT",
    description: "The definitive psychological horror remake — best experienced with the lights off.",
    badge: "SURVIVAL HORROR",
    cover: `${IMG}/a3fc5ccc133e2be21e39c6526b6be7c4776cc01f43e2856a7f5455929766f9fb.jpeg`,
  },
  {
    id: "horizon-forbidden-west",
    title: "Horizon Forbidden West",
    genre: "Open World",
    rating: "13+",
    pricePerHour: 89,
    rig: "RTX 4080",
    streamSpec: "4K 110FPS",
    description: "Hunt towering machine beasts across a lush post-apocalyptic America.",
    badge: "MACHINE HUNT",
    cover: `${IMG}/7cc85d519bb5f904bdfcc89f8a974625f6040f032a37f15e66791f7934cf52d1.jpeg`,
  },
  {
    id: "cod-warzone",
    title: "Call of Duty: Warzone",
    genre: "Shooter",
    rating: "18+",
    pricePerHour: 79,
    rig: "RTX 4080",
    streamSpec: "1440p 240FPS • Low Latency",
    description: "Battle-royale drop-ins with 240 FPS competitive streaming and minimal latency.",
    badge: "FAST ACTION",
    popular: true,
    cover: `${IMG}/042ea9533705b9f46c93e9cefd74f16d49ae678b1c42e1bb8e9d4d42ee95cede.jpeg`,
  },
  {
    id: "forza-horizon-5",
    title: "Forza Horizon 5",
    genre: "Racing",
    rating: "3+",
    pricePerHour: 79,
    rig: "RTX 4080",
    streamSpec: "4K 120FPS HDR",
    description: "Blast across vibrant Mexico in hundreds of the world's greatest cars.",
    badge: "OPEN RACING",
    popular: true,
    cover: `${IMG}/1102b14ce48e7dc047f0e31a7cbf95eb8df0f8b8ae16449f30c31d5a3a04b94b.jpeg`,
  },
  {
    id: "red-dead-redemption-2",
    title: "Red Dead Redemption 2",
    genre: "Open World",
    rating: "18+",
    pricePerHour: 79,
    rig: "RTX 4080",
    streamSpec: "4K Ultra 90FPS",
    description: "Arthur Morgan's epic frontier journey in breathtaking detail, streamed at 90 FPS.",
    badge: "ULTRA GRAPHICS",
    popular: true,
    cover: `${IMG}/a9042690a00ac12e2c47eab1113cbda7205795944a9fd38b7837ded5d6089d95.jpeg`,
  },
  {
    id: "resident-evil-4",
    title: "Resident Evil 4",
    genre: "Horror",
    rating: "18+",
    pricePerHour: 79,
    rig: "RTX 4080",
    streamSpec: "4K 120FPS HDR",
    description: "Tense survival horror with tight resource management and unforgettable boss fights.",
    badge: "SURVIVAL HORROR",
    cover: `${IMG}/2b8611c0f988ffa5362fe673f0365892ac39178b77bc404e4f18441b9201084b.jpeg`,
  },
  {
    id: "witcher-3",
    title: "The Witcher 3: Wild Hunt",
    genre: "RPG",
    rating: "18+",
    pricePerHour: 69,
    rig: "RTX 4080",
    streamSpec: "4K RT Ultra 80FPS",
    description: "Hunt monsters and follow a deep, branching story across a huge fantasy open world.",
    badge: "STORY RICH",
    cover: `${IMG}/437a4dbca703e67b4257ff572a6c382eb1db886ff320221de4e7040e90364900.jpeg`,
  },
  {
    id: "starfield",
    title: "Starfield",
    genre: "RPG",
    rating: "16+",
    pricePerHour: 79,
    rig: "RTX 4080",
    streamSpec: "4K 90FPS DLSS",
    description: "Chart the settled systems in Bethesda's epic space exploration RPG.",
    badge: "SPACE RPG",
    cover: `${IMG}/f2cabc57263b532a78eb01a4d6c85a9f8f0179f1d3545add8c4db276bcea9cbd.jpeg`,
  },
  {
    id: "ea-fc-25",
    title: "EA SPORTS FC 25",
    genre: "Sports",
    rating: "3+",
    pricePerHour: 79,
    rig: "RTX 4080",
    streamSpec: "4K 144FPS",
    description: "Fluid football with realistic gameplay — perfect for quick sessions with friends.",
    badge: "FOOTBALL",
    cover: `${IMG}/99872374ea34a36289a44342b66e04e2df8ad65ac9f24a9354b66f0a38c75533.jpeg`,
  },
  {
    id: "tekken-8",
    title: "Tekken 8",
    genre: "Action",
    rating: "16+",
    pricePerHour: 79,
    rig: "RTX 4080",
    streamSpec: "4K 60FPS Low Latency",
    description: "Brutal fighting action with a huge roster and a cinematic story mode.",
    badge: "FIGHTING",
    cover: `${IMG}/2b50384b825240f277de0c30a72153f0c0d01266caf38a86ca5a4d6a5113f33e.jpeg`,
  },
  {
    id: "f1-24",
    title: "F1 24",
    genre: "Racing",
    rating: "3+",
    pricePerHour: 79,
    rig: "RTX 4080",
    streamSpec: "4K Ray Traced 120FPS",
    description: "Drive the official F1 grid under the lights with ray-traced reflections.",
    badge: "ESPORTS",
    cover: `${IMG}/b7890ee9a0b248982c80f21a998a88a2310ce0d6c521f52aced742e4d6f61e63.jpeg`,
  },
  {
    id: "hogwarts-legacy",
    title: "Hogwarts Legacy",
    genre: "Open World",
    rating: "13+",
    pricePerHour: 79,
    rig: "RTX 4080",
    streamSpec: "4K RT Ultra 100FPS",
    description: "Learn spells, tame beasts and write your own story in the wizarding world.",
    badge: "MAGICAL RPG",
    cover: `${IMG}/d294bfdce620f738b34670f6093ca489fde86be6c9974d4ffd754a2002573fda.jpeg`,
  },
  {
    id: "helldivers-2",
    title: "Helldivers 2",
    genre: "Shooter",
    rating: "18+",
    pricePerHour: 79,
    rig: "RTX 4080",
    streamSpec: "4K 100FPS",
    description: "Spread managed democracy in the galaxy's best co-op shooter.",
    badge: "CO-OP SHOOTER",
    cover: `${IMG}/36658d66f0e812a5ce58f8a3b09e04c407695500a16eb3272d2b3611c6bb1f09.jpeg`,
  },
  {
    id: "valorant-pro",
    title: "VALORANT",
    genre: "Shooter",
    rating: "13+",
    pricePerHour: 59,
    rig: "RTX 4080",
    streamSpec: "1080p 360FPS Competitive",
    description: "Tactical 5v5 esports action streamed at 360 FPS for ranked grinding.",
    badge: "ESPORTS READY",
    cover: `${IMG}/3e6bb6866df96f90848f9281200d75a6e60360fe7dce933e40cde9dd4a5aabf3.jpeg`,
  },
  {
    id: "last-of-us-part-1",
    title: "The Last of Us Part I",
    genre: "Action",
    rating: "18+",
    pricePerHour: 79,
    rig: "RTX 4080",
    streamSpec: "4K 90FPS Ultra",
    description: "Joel and Ellie's haunting journey, rebuilt for modern hardware.",
    badge: "STORY RICH",
    cover: `${IMG}/f43421e7b18e18c86439f1c7e998e7ca881325abf7c2bf74edce673d8f6ae232.jpeg`,
  },
  {
    id: "crew-motorfest",
    title: "The Crew Motorfest",
    genre: "Racing",
    rating: "13+",
    pricePerHour: 69,
    rig: "RTX 4080",
    streamSpec: "4K 120FPS",
    description: "Non-stop car festival across the Hawaiian island of O'ahu.",
    badge: "CAR FESTIVAL",
    cover: `${IMG}/e08c88feed29ebedfdc656cbe687685aafbec829b7dc6d7a4b2b6e7f92312db3.jpeg`,
  },
  {
    id: "diablo-4",
    title: "Diablo IV: Vessel of Hatred",
    genre: "RPG",
    rating: "18+",
    pricePerHour: 79,
    rig: "RTX 4080",
    streamSpec: "4K 144FPS DLSS 3",
    description: "Descend into Sanctuary's darkest chapter with buttery-smooth high-FPS streaming.",
    badge: "ACTION RPG",
    cover: `${IMG}/4c6d8ea005bf51799d486045f7a9117ef8a0c02d3511ddf2bd6ffe5a7ffc4636.jpeg`,
  },
  {
    id: "dead-space",
    title: "Dead Space",
    genre: "Horror",
    rating: "18+",
    pricePerHour: 79,
    rig: "RTX 4080",
    streamSpec: "4K RT 90FPS",
    description: "The USG Ishimura's zero-gravity horror, rebuilt with modern lighting tech.",
    badge: "SCI-FI HORROR",
    cover: `${IMG}/01c9f1b21d2dd484744d5d6f33cf1ea382a98a77ae4e20f872120f621fc3fe47.jpeg`,
  },
];

export const FEATURED_GAME: Game = GAMES.find((g) => g.featured) ?? GAMES[0];

export function getGame(id: string | undefined): Game | undefined {
  return GAMES.find((g) => g.id === id);
}

export interface RigSpecs {
  gpu: string;
  cpu: string;
  ram: string;
  storage: string;
  upscaler: string;
}

export const RIG_SPECS: Record<Rig, RigSpecs> = {
  "RTX 4080": {
    gpu: "NVIDIA RTX 4080 16GB",
    cpu: "Ryzen 7 7800X3D",
    ram: "32GB DDR5",
    storage: "2TB NVMe SSD",
    upscaler: "DLSS 3 Quality",
  },
  "RTX 4090 Ultra": {
    gpu: "NVIDIA RTX 4090 24GB",
    cpu: "Ryzen 9 7950X3D",
    ram: "64GB DDR5",
    storage: "4TB NVMe SSD",
    upscaler: "DLSS 3.5 Frame Gen",
  },
};

export function formatHour12(hour: number): string {
  const h = ((hour % 24) + 24) % 24;
  const period = h < 12 ? "AM" : "PM";
  const display = h % 12 === 0 ? 12 : h % 12;
  return `${String(display).padStart(2, "0")}:00 ${period}`;
}

export function slotRangeLabel(hour: number): string {
  return `${formatHour12(hour)} - ${formatHour12(hour + 1)}`;
}
