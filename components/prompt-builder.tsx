"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Music, Guitar, Sparkles, Check, Disc, AudioWaveformIcon as Waveform, Layers } from "lucide-react"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"

// Subcomponents
import PromptBuilderPresets from "./prompt-builder/PromptBuilderPresets"
import PromptBuilderGenres from "./prompt-builder/PromptBuilderGenres"
import PromptBuilderInstruments from "./prompt-builder/PromptBuilderInstruments"
import PromptBuilderElements from "./prompt-builder/PromptBuilderElements"
import PromptBuilderMoods from "./prompt-builder/PromptBuilderMoods"
import PromptBuilderSelected from "./prompt-builder/PromptBuilderSelected"

/**
 * Preset category data structure
 * @typedef {Object} PresetCategory
 * @property {string} name - The name of the preset
 * @property {string} description - A description of the preset's sound
 * @property {string[]} genres - Musical genres associated with the preset
 * @property {string[]} instruments - Instruments used in the preset
 * @property {string[]} moods - Moods or feelings evoked by the preset
 */

/**
 * Props for the PromptBuilder component
 * @interface PromptBuilderProps
 * @property {function} onBuiltPrompt - Callback function that receives the built prompt string
 * @property {string} [className] - Optional CSS class name for styling
 */
interface PromptBuilderProps {
  /** Callback function that receives the built prompt string */
  onBuiltPrompt: (prompt: string) => void
  /** Optional CSS class name for styling */
  className?: string
}

// Production elements categories
const PRODUCTION_ELEMENTS = {
  "Melodic Elements": [
    "Trap Melodies",
    "Vintage Melodies",
    "Synth Melodies",
    "Experimental Melodies",
    "Piano Melodies",
    "Guitar Melodies",
    "Orchestral Melodies",
    "Vocal Melodies",
    "Ambient Melodies",
    "Arpeggios",
    "Chord Progressions",
    "Bass Lines",
  ],
  "Drum Elements": [
    "Drum Loops",
    "Drum Breaks",
    "808 & Bass",
    "Percussion Loops",
    "Hihat Loops",
    "Drum Fills",
    "Kick Patterns",
    "Snare Patterns",
    "Cymbal Patterns",
    "Breakbeats",
    "Tribal Percussion",
    "Electronic Drums",
  ],
  "Sound Design": [
    "FX",
    "Risers",
    "Downlifters",
    "Impacts",
    "Transitions",
    "Textures",
    "Atmospheres",
    "Foley",
    "Glitches",
    "Drones",
    "Noise",
    "Granular Textures",
  ],
}

// Flatten production elements for easier access
const ALL_PRODUCTION_ELEMENTS = Object.values(PRODUCTION_ELEMENTS).flat()

// Instrument categories and data
const INSTRUMENTS = [
  // Electronic & Synths
  "303 Acid Bass",
  "808 Hip Hop Beat",
  "909 Kick",
  "ARP 2600",
  "ARP Odyssey",
  "Analog Synth",
  "Buchla Synths",
  "Clavinet",
  "Digital Piano",
  "DX7 FM Synth",
  "Fairlight CMI",
  "Juno-106",
  "Jupiter-8",
  "Korg M1",
  "Mellotron",
  "Minimoog",
  "Moog Bass",
  "Moog Oscillations",
  "Nord Lead",
  "Oberheim OB-Xa",
  "PPG Wave",
  "Prophet-5",
  "Rhodes Piano",
  "Roland D-50",
  "Roland JD-800",
  "Roland Jupiter-8",
  "Roland TB-303",
  "Sequential Circuits",
  "String Ensemble",
  "TR-808 Drum Machine",
  "TR-909 Drum Machine",
  "Virus TI",
  "Vocoder",
  "Wurlitzer",
  "Yamaha CS-80",
  "Yamaha DX7",

  // Strings
  "Acoustic Guitar",
  "Banjo",
  "Bass Guitar",
  "Bouzouki",
  "Cello",
  "Chapman Stick",
  "Charango",
  "Classical Guitar",
  "Double Bass",
  "Electric Guitar",
  "Fender Precision Bass",
  "Fender Jazz Bass",
  "Fender Stratocaster",
  "Fender Telecaster",
  "Fiddle",
  "Flamenco Guitar",
  "Gibson Les Paul",
  "Gibson SG",
  "Harp",
  "Koto",
  "Lute",
  "Lyre",
  "Mandolin",
  "Oud",
  "Pipa",
  "Precision Bass",
  "Rickenbacker Bass",
  "Shamisen",
  "Shredding Guitar",
  "Sitar",
  "Slide Guitar",
  "Steel Guitar",
  "Ukulele",
  "Viola",
  "Viola Ensemble",
  "Violin",
  "Warm Acoustic Guitar",
  "12-String Guitar",

  // Wind & Brass
  "Alto Saxophone",
  "Bagpipes",
  "Bass Clarinet",
  "Bassoon",
  "Clarinet",
  "Didgeridoo",
  "English Horn",
  "Flute",
  "French Horn",
  "Harmonica",
  "Oboe",
  "Ocarina",
  "Pan Flute",
  "Piccolo",
  "Recorder",
  "Soprano Saxophone",
  "Tenor Saxophone",
  "Trombone",
  "Trumpet",
  "Tuba",
  "Woodwinds",

  // Percussion
  "Bongos",
  "Cajon",
  "Castanets",
  "Conga Drums",
  "Cowbell",
  "Crash Cymbal",
  "Djembe",
  "Drumline",
  "Frame Drum",
  "Funk Drums",
  "Glockenspiel",
  "Gretsch Drums",
  "Hang Drum",
  "Hi-Hat",
  "Kalimba",
  "Ludwig Drums",
  "Maracas",
  "Marimba",
  "Mbira",
  "Ocean Drum",
  "Pearl Drums",
  "Rain Stick",
  "Ride Cymbal",
  "Shaker",
  "Snare Drum",
  "Steel Drum",
  "Tabla",
  "Taiko Drums",
  "Tambourine",
  "Timpani",
  "Tom-Toms",
  "Triangle",
  "Vibraphone",
  "Wood Block",
  "Xylophone",
  "Zildjian Cymbals",

  // Keys
  "Accordion",
  "Celesta",
  "Church Organ",
  "Clavichord",
  "Clavinet",
  "Grand Piano",
  "Hammond B3 Organ",
  "Hammond Organ",
  "Harpsichord",
  "Honky-Tonk Piano",
  "Melodica",
  "Pipe Organ",
  "Ragtime Piano",
  "Smooth Pianos",
  "Toy Piano",
  "Upright Piano",

  // World & Traditional
  "Balalaika",
  "Balalaika Ensemble",
  "Bamboo Flute",
  "Berimbau",
  "Bodhrán",
  "Dulcimer",
  "Erhu",
  "Gamelan",
  "Guzheng",
  "Hurdy-gurdy",
  "Jaw Harp",
  "Kantele",
  "Ney",
  "Persian Tar",
  "Qanun",
  "Sarangi",
  "Shakuhachi",
  "Tanpura",
  "Theremin",
  "Zither",

  // Amplifiers & Effects
  "Fender Twin Reverb",
  "Marshall Stack",
  "Mesa Boogie",
  "Vox AC30",
  "Wah-Wah Pedal",
  "Fuzz Pedal",
  "Talk Box",
  "Phaser",
  "Flanger",
  "Chorus",
  "Delay",
  "Reverb",
]

// Music genre categories and data
const MUSIC_GENRES = [
  // Electronic
  "Acid House",
  "Acid Jazz",
  "Ambient",
  "Big Beat",
  "Breakbeat",
  "Breakcore",
  "Chillout",
  "Chillwave",
  "Chiptune",
  "Deep House",
  "Downtempo",
  "Drum & Bass",
  "Dub Techno",
  "Dubstep",
  "EDM",
  "Electro",
  "Electro Swing",
  "Electronica",
  "Future Bass",
  "Future Garage",
  "Garage",
  "Glitch Hop",
  "Grime",
  "Hardstyle",
  "House",
  "Hyperpop",
  "IDM",
  "Jungle",
  "Liquid DnB",
  "Lo-Fi Hip Hop",
  "Minimal Techno",
  "Moombahton",
  "Neurofunk",
  "Progressive House",
  "Psytrance",
  "Synthpop",
  "Synthwave",
  "Tech House",
  "Techno",
  "Trance",
  "Trap",
  "Trip Hop",
  "UK Garage",
  "Vaporwave",
  "Witch House",

  // Rock & Alternative
  "Alternative Rock",
  "Arena Rock",
  "Art Rock",
  "Blues Rock",
  "Classic Rock",
  "Desert Rock",
  "Emo",
  "Folk Rock",
  "Funk Metal",
  "Garage Rock",
  "Glam Rock",
  "Gothic Rock",
  "Grunge",
  "Hard Rock",
  "Indie Rock",
  "Krautrock",
  "Math Rock",
  "Metal",
  "New Wave",
  "Noise Rock",
  "Post-Hardcore",
  "Post-Punk",
  "Post-Rock",
  "Progressive Rock",
  "Psychedelic Rock",
  "Punk Rock",
  "Shoegaze",
  "Soft Rock",
  "Southern Rock",
  "Space Rock",
  "Stoner Rock",
  "Surf Rock",

  // Hip Hop & Urban
  "Boom Bap",
  "Bounce",
  "Cloud Rap",
  "Conscious Hip Hop",
  "Crunk",
  "Drill",
  "East Coast Hip Hop",
  "G-Funk",
  "Gangsta Rap",
  "Hip Hop",
  "Horrorcore",
  "Jazz Rap",
  "Memphis Rap",
  "Mumble Rap",
  "New Jack Swing",
  "Old School Hip Hop",
  "Phonk",
  "Southern Hip Hop",
  "Trap",
  "West Coast Hip Hop",

  // Jazz & Blues
  "Acid Jazz",
  "Afro-Cuban Jazz",
  "Bebop",
  "Big Band",
  "Blues",
  "Bossa Nova",
  "Chicago Blues",
  "Cool Jazz",
  "Delta Blues",
  "Free Jazz",
  "Fusion",
  "Gospel Blues",
  "Hard Bop",
  "Jazz",
  "Jazz Fusion",
  "Latin Jazz",
  "Modal Jazz",
  "Neo-Soul",
  "Nu Jazz",
  "Smooth Jazz",
  "Soul Jazz",
  "Swing",
  "Texas Blues",

  // World & Traditional
  "Afrobeat",
  "Bachata",
  "Balearic Beat",
  "Bengal Baul",
  "Bhangra",
  "Bluegrass",
  "Bollywood",
  "Bossa Nova",
  "Calypso",
  "Celtic",
  "Celtic Folk",
  "Cumbia",
  "Dancehall",
  "Fado",
  "Flamenco",
  "Folk",
  "Highlife",
  "Indian Classical",
  "Irish Folk",
  "J-Pop",
  "K-Pop",
  "Klezmer",
  "Mambo",
  "Mariachi",
  "Merengue",
  "Polka",
  "Qawwali",
  "Raga",
  "Reggae",
  "Reggaeton",
  "Rumba",
  "Salsa",
  "Samba",
  "Ska",
  "Soca",
  "Tango",
  "Traditional Chinese",
  "Zouk",

  // Classical & Orchestral
  "Baroque",
  "Chamber Music",
  "Choral",
  "Classical",
  "Contemporary Classical",
  "Impressionist",
  "Medieval",
  "Minimalist",
  "Modern Classical",
  "Neoclassical",
  "Opera",
  "Orchestral",
  "Orchestral Score",
  "Renaissance",
  "Romantic",
  "Sacred Music",
  "String Quartet",
  "Symphony",

  // Pop & Contemporary
  "Adult Contemporary",
  "Art Pop",
  "Bedroom Pop",
  "Bubblegum Pop",
  "Chamber Pop",
  "Contemporary R&B",
  "Dance Pop",
  "Dark Pop",
  "Dream Pop",
  "Electropop",
  "Indie Pop",
  "J-Pop",
  "K-Pop",
  "Pop",
  "Pop Punk",
  "Pop Rock",
  "Power Pop",
  "Synth Pop",
  "Teen Pop",

  // Soul & R&B
  "60s Soul",
  "70s Soul",
  "80s R&B",
  "90s R&B",
  "Chicago Soul",
  "Doo-wop",
  "Memphis Soul",
  "Motown",
  "Philly Soul",
  "Quiet Storm",
  "Soul",
  "Southern Soul",

  // Other
  "Acoustic",
  "Ambient",
  "Cinematic",
  "Country",
  "Experimental",
  "Film Score",
  "Funk",
  "Gospel",
  "Lounge",
  "Meditation",
  "Musical Theater",
  "New Age",
  "R&B",
  "Soul",
  "Spoken Word",
]

// Mood and description categories
const MOODS_DESCRIPTIONS = [
  // Energy & Tempo
  "Aggressive",
  "Bouncy",
  "Chill",
  "Danceable",
  "Driving",
  "Energetic",
  "Fast-Paced",
  "Frantic",
  "Groovy",
  "High Energy",
  "Hypnotic",
  "Intense",
  "Laid-Back",
  "Lazy",
  "Lively",
  "Mellow",
  "Punchy",
  "Relaxed",
  "Slow Burn",
  "Tight Groove",
  "Upbeat",
  "Uplifting",

  // Emotion & Atmosphere
  "Ambient",
  "Angry",
  "Anxious",
  "Atmospheric",
  "Bittersweet",
  "Blissful",
  "Brooding",
  "Cathartic",
  "Celebratory",
  "Contemplative",
  "Dark",
  "Dreamy",
  "Emotional",
  "Epic",
  "Ethereal",
  "Euphoric",
  "Haunting",
  "Hopeful",
  "Intimate",
  "Joyful",
  "Melancholic",
  "Mysterious",
  "Nostalgic",
  "Ominous",
  "Peaceful",
  "Playful",
  "Romantic",
  "Sad",
  "Sensual",
  "Serene",
  "Sinister",
  "Soothing",
  "Spiritual",
  "Suspenseful",
  "Triumphant",
  "Unsettling",
  "Warm",
  "Whimsical",

  // Production & Sound
  "Acoustic",
  "Analog Warmth",
  "Auto-Tuned",
  "Bright Tones",
  "Clean Production",
  "Compressed",
  "Crispy",
  "Crunchy Distortion",
  "Deep Bass",
  "Dirty",
  "Distorted",
  "Dynamic",
  "Echo",
  "Fat Beats",
  "Filtered",
  "Glitchy Effects",
  "Gritty",
  "Heavy Reverb",
  "Hi-Fi",
  "Huge Drop",
  "Live Performance",
  "Lo-Fi",
  "Lush",
  "Minimal",
  "Muddy",
  "Organic",
  "Overdriven",
  "Polished",
  "Raw",
  "Rich Harmonies",
  "Rich Orchestration",
  "Saturated Tones",
  "Shimmering",
  "Smooth",
  "Spacey",
  "Sparse",
  "Stereo Wide",
  "Subdued",
  "Sustained Chords",
  "Swirling Phasers",
  "Textured",
  "Thick",
  "Thin",
  "Vintage",
  "Wall of Sound",
  "Warm",
  "Wet",

  // Style & Character
  "Abstract",
  "Adventurous",
  "Anthemic",
  "Avant-Garde",
  "Catchy",
  "Cinematic",
  "Classic",
  "Commercial",
  "Complex",
  "Contemporary",
  "Cosmic",
  "Crossover",
  "Cutting Edge",
  "Eclectic",
  "Edgy",
  "Elegant",
  "Experimental",
  "Futuristic",
  "Hypnotic",
  "Improvisational",
  "Infectious",
  "Innovative",
  "Mainstream",
  "Meditative",
  "Melodic",
  "Minimalist",
  "Modern",
  "Orchestral",
  "Organic",
  "Otherworldly",
  "Percussive",
  "Polyrhythmic",
  "Psychedelic",
  "Quirky",
  "Retro",
  "Rhythmic",
  "Simple",
  "Sophisticated",
  "Strange",
  "Syncopated",
  "Traditional",
  "Trippy",
  "Underground",
  "Unique",
  "Virtuoso",
  "Weird",
  "World Music",
]

/**
 * Preset categories organized by musical style
 * Each category contains an array of preset configurations
 */
const PRESET_CATEGORIES = {
  "Classic Soul & R&B": [
    {
      name: "Love T.K.O.",
      description: "Smooth 80s R&B soul inspired by Teddy Pendergrass",
      genres: ["Soul", "R&B", "Smooth Jazz"],
      instruments: ["Rhodes Piano", "Electric Bass", "Smooth Drums", "Soul Guitar", "Hammond Organ"],
      moods: ["Smooth", "Warm", "Soulful", "Intimate", "Analog Warmth"],
    },
    {
      name: "Fire and Desire",
      description: "Soulful R&B duet inspired by Rick James & Teena Marie",
      genres: ["Soul", "R&B", "Funk"],
      instruments: ["Synthesizer", "String Ensemble", "Bass Guitar", "Electric Guitar", "Drums"],
      moods: ["Sensual", "Smooth", "Warm", "Intimate", "Soulful"],
    },
    {
      name: "What's Going On",
      description: "Socially conscious soul inspired by Marvin Gaye",
      genres: ["Soul", "Motown", "Gospel"],
      instruments: ["String Section", "Conga Drums", "Electric Piano", "Tenor Saxophone", "Vibraphone"],
      moods: ["Contemplative", "Spiritual", "Smooth", "Rich Orchestration", "Emotional"],
    },
    {
      name: "Let's Stay Together",
      description: "Memphis soul inspired by Al Green",
      genres: ["Soul", "Memphis Soul", "R&B"],
      instruments: ["Hammond Organ", "Horns Section", "Electric Guitar", "Tight Drums", "Gospel Piano"],
      moods: ["Romantic", "Warm", "Groovy", "Smooth", "Uplifting"],
    },
    {
      name: "Superstition",
      description: "Funky soul inspired by Stevie Wonder",
      genres: ["Funk", "Soul", "R&B"],
      instruments: ["Clavinet", "Moog Bass", "Funk Drums", "Brass Section", "Talk Box"],
      moods: ["Funky", "Groovy", "Energetic", "Syncopated", "Infectious"],
    },
    {
      name: "Move On Up",
      description: "Uplifting soul inspired by Curtis Mayfield",
      genres: ["Soul", "Funk", "Gospel"],
      instruments: ["Wah-Wah Guitar", "Brass Section", "Percussion", "String Section", "Gospel Organ"],
      moods: ["Uplifting", "Triumphant", "Energetic", "Spiritual", "Anthemic"],
    },
    {
      name: "Theme from Shaft",
      description: "Cinematic soul inspired by Isaac Hayes",
      genres: ["Soul", "Funk", "Film Score"],
      instruments: ["Wah-Wah Guitar", "Orchestra", "Hi-Hat", "Electric Piano", "Flute"],
      moods: ["Cinematic", "Cool", "Groovy", "Dramatic", "Sophisticated"],
    },
    {
      name: "Between the Sheets",
      description: "Smooth quiet storm inspired by The Isley Brothers",
      genres: ["R&B", "Soul", "Quiet Storm"],
      instruments: ["Electric Guitar", "Rhodes Piano", "Smooth Bass", "Soft Drums", "String Pads"],
      moods: ["Sensual", "Smooth", "Intimate", "Laid-Back", "Romantic"],
    },
    {
      name: "Never Too Much",
      description: "Upbeat R&B inspired by Luther Vandross",
      genres: ["R&B", "Soul", "Dance"],
      instruments: ["Synth Bass", "Electric Piano", "Brass Hits", "Disco Strings", "Vocoder"],
      moods: ["Joyful", "Danceable", "Upbeat", "Celebratory", "Smooth"],
    },
    {
      name: "I Feel for You",
      description: "Electronic funk inspired by Chaka Khan",
      genres: ["Funk", "R&B", "Electronic"],
      instruments: ["Synth Bass", "Vocoder", "Electronic Drums", "Harmonica", "Synthesizers"],
      moods: ["Funky", "Electronic", "Danceable", "Energetic", "Futuristic"],
    },
    {
      name: "Brown Sugar",
      description: "Neo-soul inspired by D'Angelo",
      genres: ["Neo-Soul", "R&B", "Hip Hop Soul"],
      instruments: ["Vintage Keys", "Live Drums", "Jazz Guitar", "Upright Bass", "Wurlitzer"],
      moods: ["Smooth", "Organic", "Groovy", "Warm", "Sophisticated"],
    },
    {
      name: "On & On",
      description: "Alternative soul inspired by Erykah Badu",
      genres: ["Neo-Soul", "Alternative R&B", "Hip Hop Soul"],
      instruments: ["Rhodes Piano", "Analog Bass", "Rim Shots", "Jazz Flute", "Vinyl Crackle"],
      moods: ["Ethereal", "Spiritual", "Laid-Back", "Organic", "Meditative"],
    },
    {
      name: "Sexual Healing",
      description: "Electronic soul inspired by Marvin Gaye's later work",
      genres: ["Soul", "R&B", "Electronic"],
      instruments: ["TR-808 Drum Machine", "Synthesizers", "Electric Piano", "Vocoder", "Smooth Bass"],
      moods: ["Sensual", "Electronic", "Smooth", "Intimate", "Futuristic"],
    },
    {
      name: "I Want You Back",
      description: "Motown pop-soul inspired by The Jackson 5",
      genres: ["Motown", "Soul", "Pop"],
      instruments: ["Funk Bass", "Tambourine", "Electric Piano", "Strings", "Congas"],
      moods: ["Upbeat", "Joyful", "Energetic", "Youthful", "Catchy"],
    },
    {
      name: "Ain't No Sunshine",
      description: "Melancholic soul inspired by Bill Withers",
      genres: ["Soul", "Blues", "R&B"],
      instruments: ["Acoustic Guitar", "String Section", "Electric Piano", "Soft Drums", "Harmonica"],
      moods: ["Melancholic", "Intimate", "Sparse", "Emotional", "Raw"],
    },
  ],
  "Electronic & Modern": [
    {
      name: "Trap Soul",
      description: "Melodic trap with soulful R&B elements",
      genres: ["Trap", "Neo-Soul", "Contemporary R&B"],
      instruments: ["808 Hip Hop Beat", "Rhodes Piano", "Analog Synth", "Auto-Tuned"],
      moods: ["Emotional", "Smooth", "Melodic", "Dark", "Atmospheric"],
    },
    {
      name: "Lo-Fi Study",
      description: "Relaxing beats for focus and concentration",
      genres: ["Lo-Fi Hip Hop", "Chillout", "Jazz"],
      instruments: ["Vinyl", "Jazz Guitar", "Rhodes Piano", "Soft Drums"],
      moods: ["Relaxed", "Nostalgic", "Warm", "Mellow", "Peaceful"],
    },
    {
      name: "Phonk Drift",
      description: "Dark Memphis-inspired phonk for late night drives",
      genres: ["Phonk", "Memphis Rap", "Trap"],
      instruments: ["TR-808 Drum Machine", "Distorted Bass", "Cowbell", "Chopped Vocals"],
      moods: ["Dark", "Aggressive", "Hypnotic", "Gritty", "Underground"],
    },
    {
      name: "Future Garage",
      description: "UK-inspired atmospheric electronic music",
      genres: ["Future Garage", "UK Garage", "Dubstep"],
      instruments: ["Sub Bass", "Vocal Chops", "Ambient Pads", "Shuffled Drums"],
      moods: ["Atmospheric", "Melancholic", "Ethereal", "Deep Bass", "Spacey"],
    },
    {
      name: "Synthwave Nights",
      description: "Retro-futuristic 80s inspired electronic",
      genres: ["Synthwave", "Synthpop", "Retrowave"],
      instruments: ["DX7 FM Synth", "Juno-106", "TR-909 Drum Machine", "Analog Synth"],
      moods: ["Nostalgic", "Futuristic", "Neon", "Driving", "Cinematic"],
    },
    {
      name: "Drill Energy",
      description: "Hard-hitting UK/Chicago drill beats",
      genres: ["Drill", "Trap", "Grime"],
      instruments: ["808 Slides", "Hi-Hat Rolls", "Dark Piano", "Aggressive Bass"],
      moods: ["Aggressive", "Dark", "Intense", "Hard-Hitting", "Street"],
    },
    {
      name: "Hyperpop Chaos",
      description: "Maximalist pop with extreme production",
      genres: ["Hyperpop", "Glitch Pop", "PC Music"],
      instruments: ["Pitched Vocals", "Distorted Synths", "Glitch Effects", "Heavy Compression"],
      moods: ["Chaotic", "Energetic", "Futuristic", "Playful", "Experimental"],
    },
    {
      name: "Dark Techno",
      description: "Industrial warehouse techno",
      genres: ["Techno", "Industrial", "Dark Techno"],
      instruments: ["Analog Kick", "Acid Bass", "Metallic Percussion", "Distorted Synths"],
      moods: ["Dark", "Hypnotic", "Industrial", "Relentless", "Underground"],
    },
  ],
  "Ambient & Atmospheric": [
    {
      name: "Ambient Meditation",
      description: "Peaceful soundscapes for relaxation",
      genres: ["Ambient", "New Age", "Meditation"],
      instruments: ["Soft Pads", "Nature Sounds", "Tibetan Bowls", "Gentle Strings"],
      moods: ["Peaceful", "Meditative", "Ethereal", "Calming", "Spiritual"],
    },
    {
      name: "Bedroom Pop",
      description: "Intimate indie pop with DIY aesthetics",
      genres: ["Bedroom Pop", "Indie Pop", "Dream Pop"],
      instruments: ["Soft Guitar", "Vintage Keys", "Gentle Drums", "Warm Vocals"],
      moods: ["Intimate", "Dreamy", "Lo-Fi", "Nostalgic", "Warm"],
    },
  ],
  "Jazz & World": [
    {
      name: "Jazz Fusion",
      description: "Complex jazz with modern electronic elements",
      genres: ["Jazz Fusion", "Nu Jazz", "Acid Jazz"],
      instruments: ["Electric Guitar", "Fretless Bass", "Rhodes Piano", "Saxophone"],
      moods: ["Sophisticated", "Complex", "Groovy", "Improvisational", "Smooth"],
    },
    {
      name: "Afrobeat Fusion",
      description: "Modern African rhythms with electronic production",
      genres: ["Afrobeat", "Afro-Fusion", "World Music"],
      instruments: ["Talking Drum", "Percussion", "Electric Guitar", "Brass Section"],
      moods: ["Rhythmic", "Uplifting", "Danceable", "Vibrant", "Cultural"],
    },
  ],
  "Rock & Alternative": [
    {
      name: "Classic Rock",
      description: "Vintage rock sound with powerful guitars",
      genres: ["Classic Rock", "Blues Rock", "Hard Rock"],
      instruments: ["Fender Stratocaster", "Marshall Stack", "Ludwig Drums", "Hammond Organ"],
      moods: ["Energetic", "Raw", "Powerful", "Driving", "Vintage"],
    },
    {
      name: "Psychedelic Rock",
      description: "Mind-bending sounds inspired by 60s psychedelia",
      genres: ["Psychedelic Rock", "Acid Rock", "Space Rock"],
      instruments: ["Fuzz Guitar", "Mellotron", "Phaser", "Sitars", "Wah-Wah Pedal"],
      moods: ["Trippy", "Experimental", "Cosmic", "Swirling", "Hypnotic"],
    },
  ],
}

// Flatten the categories for the main preset list
const PRESET_COMBINATIONS = Object.values(PRESET_CATEGORIES).flat()

// Main PromptBuilder component using extracted subcomponents
export default function PromptBuilder({ onBuiltPrompt, className }: PromptBuilderProps) {
  // State for selected items
  const [selectedInstruments, setSelectedInstruments] = useState<string[]>([])
  const [selectedGenres, setSelectedGenres] = useState<string[]>([])
  const [selectedMoods, setSelectedMoods] = useState<string[]>([])
  const [selectedElements, setSelectedElements] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [activeCategory, setActiveCategory] = useState<string>("All")
  const [activeElementCategory, setActiveElementCategory] = useState<string>("All")

  // Toggle logic
  const toggleItem = useCallback((item: string, category: "instruments" | "genres" | "moods" | "elements") => {
    switch (category) {
      case "instruments":
        setSelectedInstruments((prev) => (prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]))
        break
      case "genres":
        setSelectedGenres((prev) => (prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]))
        break
      case "moods":
        setSelectedMoods((prev) => (prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]))
        break
      case "elements":
        setSelectedElements((prev) => (prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]))
        break
    }
  }, [])

  // Build prompt logic
  const buildPrompt = useCallback(() => {
    const promptParts = []
    if (selectedGenres.length > 0) promptParts.push(selectedGenres.join(", "))
    if (selectedMoods.length > 0) promptParts.push(selectedMoods.join(", "))
    if (selectedElements.length > 0) promptParts.push(selectedElements.join(", "))
    if (selectedInstruments.length > 0) promptParts.push(`with ${selectedInstruments.join(", ")}`)
    const finalPrompt = promptParts.join(" ")
    if (finalPrompt) onBuiltPrompt(finalPrompt)
  }, [selectedGenres, selectedMoods, selectedInstruments, selectedElements, onBuiltPrompt])

  // Clear all
  const clearAllSelections = useCallback(() => {
    setSelectedInstruments([])
    setSelectedGenres([])
    setSelectedMoods([])
    setSelectedElements([])
  }, [])

  // Filtering
  const filterItemsBySearchTerm = useCallback(
    (items: string[]) => {
      if (!searchTerm) return items
      return items.filter((item) => item.toLowerCase().includes(searchTerm.toLowerCase()))
    },
    [searchTerm],
  )

  // Preset logic
  const applyPresetConfiguration = useCallback(
    (preset: (typeof PRESET_COMBINATIONS)[0]) => {
      setSelectedGenres([...preset.genres])
      setSelectedInstruments([...preset.instruments])
      setSelectedMoods([...preset.moods])
      setSelectedElements([])
      setTimeout(() => {
        const parts = []
        parts.push(preset.genres.join(", "))
        parts.push(preset.moods.join(", "))
        parts.push(`with ${preset.instruments.join(", ")}`)
        const prompt = parts.join(" ")
        onBuiltPrompt(prompt)
      }, 0)
    },
    [onBuiltPrompt],
  )

  // Category filtering for presets/elements
  const getFilteredPresetsByCategory = useCallback(() => {
    return activeCategory === "All"
      ? PRESET_COMBINATIONS
      : PRESET_CATEGORIES[activeCategory as keyof typeof PRESET_CATEGORIES] || []
  }, [activeCategory])

  const getFilteredElementsByCategory = useCallback(() => {
    if (activeElementCategory === "All") {
      return ALL_PRODUCTION_ELEMENTS
    }
    return PRODUCTION_ELEMENTS[activeElementCategory as keyof typeof PRODUCTION_ELEMENTS] || []
  }, [activeElementCategory])

  // Preset search filtering
  const getSearchFilteredPresets = useCallback(() => {
    const categoryFilteredPresets = getFilteredPresetsByCategory()
    if (!searchTerm) return categoryFilteredPresets
    return categoryFilteredPresets.filter(
      (preset) =>
        preset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        preset.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        preset.genres.some((genre) => genre.toLowerCase().includes(searchTerm.toLowerCase())) ||
        preset.instruments.some((instrument) => instrument.toLowerCase().includes(searchTerm.toLowerCase())) ||
        preset.moods.some((mood) => mood.toLowerCase().includes(searchTerm.toLowerCase())),
    )
  }, [searchTerm, getFilteredPresetsByCategory])

  const filteredPresets = getSearchFilteredPresets()
  const filteredElements = filterItemsBySearchTerm(getFilteredElementsByCategory())
  const hasSelections =
    selectedInstruments.length > 0 ||
    selectedGenres.length > 0 ||
    selectedMoods.length > 0 ||
    selectedElements.length > 0

  return (
    <Card className={cn("bg-gray-900/90 border-gray-800", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Music className="h-5 w-5 text-purple-400" />
          <CardTitle>Prompt Builder</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <Tabs defaultValue="presets" className="flex flex-col">
          <TabsList
            className="w-full grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 bg-gray-800/50 rounded-none overflow-x-auto scrollbar-hide min-w-0"
          >
            <TabsTrigger value="presets" className="data-[state=active]:bg-purple-900/50 text-xs sm:text-sm truncate">
              <Sparkles className="h-4 w-4 mr-2" />
              Presets
            </TabsTrigger>
            <TabsTrigger value="genres" className="data-[state=active]:bg-purple-900/50 text-xs sm:text-sm truncate">
              <Disc className="h-4 w-4 mr-2" />
              Genres ({selectedGenres.length})
            </TabsTrigger>
            <TabsTrigger value="instruments" className="data-[state=active]:bg-purple-900/50 text-xs sm:text-sm truncate">
              <Guitar className="h-4 w-4 mr-2" />
              Instruments ({selectedInstruments.length})
            </TabsTrigger>
            <TabsTrigger value="elements" className="data-[state=active]:bg-purple-900/50 text-xs sm:text-sm truncate">
              <Layers className="h-4 w-4 mr-2" />
              Elements ({selectedElements.length})
            </TabsTrigger>
            <TabsTrigger value="moods" className="data-[state=active]:bg-purple-900/50 text-xs sm:text-sm truncate">
              <Waveform className="h-4 w-4 mr-2" />
              Moods ({selectedMoods.length})
            </TabsTrigger>
          </TabsList>

          {/* Presets Tab */}
          <TabsContent value="presets" className="mt-0">
            <PromptBuilderPresets
              filteredPresets={filteredPresets}
              activeCategory={activeCategory}
              setActiveCategory={setActiveCategory}
              applyPresetConfiguration={applyPresetConfiguration}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              hasSelections={hasSelections}
              clearAllSelections={clearAllSelections}
              PRESET_CATEGORIES={PRESET_CATEGORIES}
            />
          </TabsContent>

          {/* Genres Tab */}
          <TabsContent value="genres" className="mt-0">
            <PromptBuilderGenres
              genres={MUSIC_GENRES}
              selectedGenres={selectedGenres}
              toggleGenre={(genre) => toggleItem(genre, "genres")}
              filterItemsBySearchTerm={filterItemsBySearchTerm}
              searchTerm={searchTerm}
            />
          </TabsContent>

          {/* Instruments Tab */}
          <TabsContent value="instruments" className="mt-0">
            <PromptBuilderInstruments
              instruments={INSTRUMENTS}
              selectedInstruments={selectedInstruments}
              toggleInstrument={(instrument) => toggleItem(instrument, "instruments")}
              filterItemsBySearchTerm={filterItemsBySearchTerm}
              searchTerm={searchTerm}
            />
          </TabsContent>

          {/* Elements Tab */}
          <TabsContent value="elements" className="mt-0">
            <PromptBuilderElements
              filteredElements={filteredElements}
              selectedElements={selectedElements}
              toggleElement={(element) => toggleItem(element, "elements")}
              PRODUCTION_ELEMENTS={PRODUCTION_ELEMENTS}
              activeElementCategory={activeElementCategory}
              setActiveElementCategory={setActiveElementCategory}
              filterItemsBySearchTerm={filterItemsBySearchTerm}
            />
          </TabsContent>

          {/* Moods Tab */}
          <TabsContent value="moods" className="mt-0">
            <PromptBuilderMoods
              moods={MOODS_DESCRIPTIONS}
              selectedMoods={selectedMoods}
              toggleMood={(mood) => toggleItem(mood, "moods")}
              filterItemsBySearchTerm={filterItemsBySearchTerm}
              searchTerm={searchTerm}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex flex-col gap-4 p-4 border-t border-gray-800">
        {/* Selected Items Display */}
        <PromptBuilderSelected
          selectedGenres={selectedGenres}
          selectedInstruments={selectedInstruments}
          selectedElements={selectedElements}
          selectedMoods={selectedMoods}
          toggleItem={toggleItem}
        />
        {/* Build Prompt Button */}
        <Button
          onClick={buildPrompt}
          disabled={!hasSelections}
          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          aria-disabled={!hasSelections}
        >
          <Check className="h-4 w-4 mr-2" />
          Build Prompt (
          {selectedInstruments.length + selectedGenres.length + selectedMoods.length + selectedElements.length} selections)
        </Button>
      </CardFooter>
    </Card>
  )
}
