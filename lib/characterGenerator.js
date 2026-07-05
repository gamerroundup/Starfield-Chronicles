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

  const paragraphs = [
    `Captain ${name} began their journey on the dusty, industrial fringes of the Settled Systems. Working under the classification of a ${background}, they quickly developed a reputation for their resourcefulness and adaptability in the face of frontier hazards. Imbued with distinct characteristics—specifically displaying qualities of ${traits || "a standard explorer"}—they learned early on that survival in the black space lanes requires more than just a functioning grav drive.`,
    
    `Their playstyle has always steered them toward ${playstyle.toLowerCase()} missions, whether that meant surveying uncharted mineral veins in deep star systems or boarding spacer-infested freighters to salvage valuable components. Over time, their traits have heavily influenced how they handle negotiations, combat encounters, and ship management, making them one of the most unpredictable pilots in the local sector.`,
    
    `Now, with their eyes fixed on the horizon and the mystery of Constellation calling from New Atlantis, Captain ${firstName} stands ready. Equipped with their specialized training and a deep-seated need to see what lies beyond the next jump, they are about to forge a chronicle that the United Colonies and Freestar Collective won't soon forget.`
  ];

  return paragraphs.join("\n\n");
}
