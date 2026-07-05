const FIRST_NAMES = [
  "Helena", "Jaxom", "Vane", "Corin", "Sera", "Kaelen", "Valerie", "Garrick", "Zarek", "Talia",
  "Riddick", "Kira", "Dax", "Cassian", "Vesper", "Leo", "Nova", "Aero", "Caelum", "Lyra",
  "Orion", "Selene", "Zephyr", "Atlas", "Vega", "Rigel", "Deneb", "Altair", "Sirius", "Polaris",
  "Castor", "Pollux", "Astra", "Cosmo", "Luna", "Sol", "Phoenix", "Titan", "Rhea", "Io",
  "Europa", "Ganymede", "Callisto", "Oberon", "Titania", "Puck", "Ariel", "Umbriel", "Miranda",
  "Triton", "Nereid", "Charon", "Pluto", "Ceres", "Eris", "Makemake", "Haumea", "Sedna", "Quaoar",
  "Orcus", "Salacia", "Varda", "Manwë", "Ulmo", "Aulë", "Oromë", "Mandos", "Lórien", "Tulkas",
  "Elentári", "Yavanna", "Nienna", "Estë", "Vairë", "Vána", "Nessa", "Melkor", "Manwë", "Varda",
  "Marcus", "Elena", "Devin", "Sarah", "Barrett", "Sam", "Andreja", "Matteo", "Noel", "Walter",
  "Vlad", "Logan", "Kora", "Hadrian", "Percival", "Vae", "Victis", "Francois", "Sanan", "Aja"
];

const LAST_NAMES = [
  "Thorne", "Vance", "Kross", "Solis", "Ryder", "Kane", "Vanguard", "Ranger", "Starborn", "Constellation",
  "Gidian", "Valerius", "Caelum", "Nova", "Astra", "Cosmos", "Lunas", "Sols", "Phoenix", "Titans",
  "Rheas", "Ios", "Europas", "Ganymedes", "Callistos", "Oberons", "Titanias", "Pucks", "Ariels", "Umbriels",
  "Mirandas", "Tritons", "Nereids", "Charons", "Plutos", "Ceress", "Eriss", "Makemakes", "Haumeas", "Sednas",
  "Quaoars", "Orcuss", "Salacias", "Vardas", "Manwës", "Ulmos", "Aulës", "Oromës", "Mandoss", "Lóriens",
  "Tulkass", "Elentáris", "Yavannas", "Niennas", "Estës", "Vairës", "Vánas", "Nessas", "Melkors", "Manwës",
  "Vardas", "Coe", "Morgan", "Barrett", "Vanguard", "Ranger", "Sanon", "Kamil", "Yasin", "Tuala",
  "Logan", "Kora", "Hadrian", "Percival", "Vae", "Victis", "Francois", "Sanan", "Aja", "Hardin",
  "Blake", "Wilcox", "Endeavor", "Stellar", "Cross", "Apex", "Zenith", "Nadir", "Eclipse", "Horizon"
];

const BACKGROUNDS = [
  "Beast Hunter", "Bouncer", "Bounty Hunter", "Chef", "Combat Medic",
  "Cyber Runner", "Cyberneticist", "Diplomat", "Explorer", "Gangster",
  "Homesteader", "Industrialist", "Long Hauler", "Pilgrim", "Scientist",
  "Ronin", "Sculptor", "Soldier", "Space Scoundrel", "Xenobiologist",
  "[FILE NOT FOUND]"
];

const TRAITS = [
  { name: "Alien DNA", incompatible: [] },
  { name: "Dream Home", incompatible: [] },
  { name: "Empath", incompatible: [] },
  { name: "Extrovert", incompatible: ["Introvert"] },
  { name: "Introvert", incompatible: ["Extrovert"] },
  { name: "Freestar Collective Settler", incompatible: ["Neon Street Rat", "United Colonies Native"] },
  { name: "Neon Street Rat", incompatible: ["Freestar Collective Settler", "United Colonies Native"] },
  { name: "United Colonies Native", incompatible: ["Freestar Collective Settler", "Neon Street Rat"] },
  { name: "Hero Worshipped", incompatible: [] },
  { name: "Kid Stuff", incompatible: [] },
  { name: "Raised Enlightened", incompatible: ["Raised Universal", "Serpent's Embrace"] },
  { name: "Raised Universal", incompatible: ["Raised Enlightened", "Serpent's Embrace"] },
  { name: "Serpent's Embrace", incompatible: ["Raised Enlightened", "Raised Universal"] },
  { name: "Spaced", incompatible: ["Terra Firma"] },
  { name: "Terra Firma", incompatible: ["Spaced"] },
  { name: "Taskmaster", incompatible: [] },
  { name: "Wanted", incompatible: [] }
];

export function generateRandomCharacter() {
  const firstName = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
  const lastName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
  const name = `${firstName} ${lastName}`;

  const background = BACKGROUNDS[Math.floor(Math.random() * BACKGROUNDS.length)];

  // Choose 1-3 traits with compatibility checks
  const selectedTraits = [];
  const traitCount = Math.floor(Math.random() * 3) + 1; // 1 to 3 traits
  const availableTraits = [...TRAITS];

  // Shuffle available traits
  for (let i = availableTraits.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [availableTraits[i], availableTraits[j]] = [availableTraits[j], availableTraits[i]];
  }

  for (const trait of availableTraits) {
    if (selectedTraits.length >= traitCount) break;

    // Check compatibility with already selected traits
    const isCompatible = selectedTraits.every(t => {
      const traitInfo = TRAITS.find(ti => ti.name === t);
      return !traitInfo.incompatible.includes(trait.name) && !trait.incompatible.includes(t);
    });

    if (isCompatible) {
      selectedTraits.push(trait.name);
    }
  }

  return {
    name,
    background,
    traits: selectedTraits.join(", ")
  };
}

export function generateLocalBiography(name, background, traits, playstyle) {
  const nameParts = name.split(" ");
  const firstName = nameParts[0] || "Explorer";
  const traitList = traits || "adaptable instincts";

  const p1Templates = [
    `Captain ${name} cut their teeth on the harsh, airless moons of the outer rim. Working under the code of a ${background}, they established themselves as a pilot who could handle any crisis. Carrying the weight of ${traitList}, their early years were defined by close-calls and sudden jumps, forging a deep resilience that serves them to this day.`,
    
    `Growing up in the high-tech, neon-drenched corridors of Volii Alpha, ${name} rejected the corporate mold to carve out a living as a ${background}. Marked by their ${traitList}, they navigated the seedier sectors of the Settled Systems, learning that survival often depends on knowing when to shoot and when to trade.`,
    
    `Before they ever stepped into the cockpit, ${name} spent years on the frontier, classified as a ${background}. Their distinct traits—chiefly their ${traitList}—guided them through isolated survey missions and hostile star systems. This background instilled a deep familiarity with the quiet, dangerous corners of the galaxy.`,
    
    `Born to a family of long-haul asteroid miners, ${name} was practically raised in zero-g. Their path led them to work as a ${background}, where their ${traitList} made them a standout crew member. They grew accustomed to the hum of the reactor and the constant search for the next big score.`,
    
    `The official dossier for Captain ${name} contains several redacted files, listing them simply as a ${background} with a history of ${traitList}. Rumors in Cydonia claim they were involved in classified experiments, but whatever their origins, they have transitioned into one of the most capable freelance captains in the sector.`,
    
    `Hailing from the agricultural colonies of the Freestar Collective, ${name} left the soil behind to become a ${background}. Influenced by their ${traitList}, they adapted quickly to the cutthroat space lanes, combining colony common-sense with high-orbit technical skills.`
  ];

  const p2PlaystyleTemplates = {
    "Exploration": [
      `Their journey has always been guided by exploration. Whether surveying mineral deposits on barren rocks or plotting jumps into uncharted star systems, they focus on mapping the unknown. Over time, their background has helped them fine-tune their scanners, making them an expert at finding hidden anomalies.`,
      `They live for discovery, constantly jumping to distant orbits to survey planetary resources. Their playstyle is defined by mapping outposts, cataloging new flora, and seeking out ancient ruins. This constant drive to explore has brought them to the very edge of settled space.`,
      `With their ship configured for astrodynamics and long-range scanning, they search out gravitational anomalies. They have spent cycles charting safe grav-jump paths and cataloging mineral veins, driven by the belief that the next discovery is the one that changes everything.`
    ],
    "Action": [
      `They are no stranger to hot zones. Their missions often involve tracking down spacer wolfpacks, raiding pirate outposts, or working security detail in contested space. Their playstyle relies on heavy ballistics and tactical maneuvers, ensuring they always have the upper hand in a firefight.`,
      `When weapons are drawn, they are in their element. They have built a reputation for clearing out Crimson Fleet hideouts and resolving hostile takeovers on remote outposts. Their background has given them the combat discipline needed to survive the deadliest close-quarters boarding actions.`,
      `They specialize in tactical combat and rapid response. From skirmishes with ecliptic mercenaries to bounty hunts in the Cheyenne system, they rely on quick reflexes and modified particle beams to get the job done.`
    ],
    "Survival": [
      `Survival is the only metric that matters in the black. They focus on establishing self-sustaining outposts, harvesting gas giants, and managing resources under extreme environmental hazards. Their playstyle is methodical and resource-heavy, preparing them for the worst the galaxy can throw at them.`,
      `They excel at building outposts under extreme conditions. Whether dealing with toxic atmospheres or freezing temperatures, they know how to extract raw materials and keep their crew alive. This survivalist approach has made them a master of resource management and engineering.`,
      `Their career is built on frontier homesteading and logistics. They manage cargo links, extract rare minerals, and build shields against solar radiation, viewing the universe as a series of technical challenges to be solved.`
    ],
    "Bounty Hunter": [
      `They operate in the grey areas of frontier law. Tracking wanted fugitives across the Settled Systems, they collect bounties and bring in targets, dead or alive. Their playstyle is analytical and relentless, utilizing targeting systems to disable engines and board quarry.`,
      `To them, every system has a price. They work the contracts no one else wants, hunting down spacers and smugglers who flee the major factions. Their reputation as a cold, efficient tracker precedes them from Neon to New Atlantis.`,
      `They are a specialist in ship-to-ship disabling actions. They track targets to the ends of the space lanes, disable their shields, and board with shotguns ready. The bounty board is their only compass, and they never miss a payout.`
    ],
    "Corporate": [
      `They operate in the high-stakes world of corporate espionage and contract negotiation. Working in the shadows of Ryujin Industries, they specialize in stealth, security bypasses, and commerce. Their playstyle relies on persuasion and security decrypters rather than raw firepower.`,
      `They know that words and credits are often deadlier than laser fire. Operating out of corporate boardrooms and back alleys, they execute sensitive acquisitions and bypass high-level security grids to secure proprietary data.`,
      `Their career is defined by corporate logistics and industrial dominance. They manage shipping routes, negotiate deals with major manufacturers, and run corporate ops, viewing the galaxy as one giant market ready to be cornered.`
    ]
  };

  const p3Templates = [
    `Now, with their eyes fixed on the horizon and a mysterious metal artifact resting in their cargo hold, Captain ${firstName} stands ready. Constellation's call in New Atlantis promises answers to questions they didn't even know they had, and they are ready to jump.`,
    
    `As the engines warm and the grav drive spins up, Captain ${firstName} looks out at the stars. The discovery of a strange gravitational signature has set them on a new path, one that leads straight to the Lodge and the mysteries of deep space.`,
    
    `With their credentials registered and their ship fueled, Captain ${firstName} is preparing for their next big flight. The Settled Systems are vast and dangerous, but their unique skills ensure they are ready for whatever lies beyond the next jump.`,
    
    `The frontier is calling, and Captain ${firstName} has no intention of staying grounded. Armed with their background and motivated by the search for ancient secrets, they are about to make their mark on the space lanes.`,
    
    `Standing on the landing pad in New Atlantis, Captain ${firstName} watches the shuttles rise into the sky. Their journey has just begun, and as they prepare to join Constellation, they know their story will be written in the stars.`
  ];

  // Select random templates
  const p1 = p1Templates[Math.floor(Math.random() * p1Templates.length)];
  const playstyleList = p2PlaystyleTemplates[playstyle] || p2PlaystyleTemplates["Exploration"];
  const p2 = playstyleList[Math.floor(Math.random() * playstyleList.length)];
  const p3 = p3Templates[Math.floor(Math.random() * p3Templates.length)];

  return `${p1}\n\n${p2}\n\n${p3}`;
}
