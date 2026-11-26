import type { ImageAsset } from "@/types/content";

/**
 * Photography used across the site. Files live in /public/images.
 * Sources are listed in IMAGE-CREDITS.md. Replace any of these with the
 * center's own photographs when they are available.
 */
function img(file: string, width: number, height: number, alt: string): ImageAsset {
  return { src: `/images/${file}.jpg`, width, height, alt };
}

export const images = {
  meditationStudio: img("meditation-studio", 1600, 2400, "A person seated cross-legged in meditation, hands resting in a mudra"),
  meditationForest: img("meditation-forest", 1600, 2400, "A woman sitting cross-legged in a forest, eyes closed, face turned to the sunlight"),
  lakeside: img("lakeside", 1600, 2223, "A person sitting quietly at the edge of a still forest lake"),
  counselingHands: img("counseling-hands", 1800, 1200, "Two people seated close together in conversation, hands folded"),
  counselingNotes: img("counseling-notes", 1800, 1013, "A counselor holding a clipboard and pen during a session"),
  lotus: img("lotus", 1600, 2400, "A white lotus resting on still, dark water among lily pads"),
  stones: img("stones", 1400, 2489, "River stones balanced in a stack beside a misty lake"),
  stonesSunrise: img("stones-sunrise", 1500, 2250, "Balanced stones reflected in calm water at sunrise"),
  swanLake: img("swan-lake", 2400, 1600, "A white swan gliding across a calm green lake"),
  mistyLake: img("misty-lake", 2400, 1626, "Mist lifting over a forest lake"),
  forestLake: img("forest-lake", 2400, 1601, "A still mountain lake reflecting a green forest"),
  leafDew: img("leaf-dew", 1400, 1867, "A green leaf beaded with dew"),
  leaves: img("leaves", 1400, 1867, "Broad green leaves seen from above"),
  ripples: img("ripples", 2400, 1600, "Gentle ripples moving across green water"),
  rippleReflection: img("ripple-reflection", 2000, 1333, "Leaves reflected in softly rippling water"),
  lotusField: img("lotus-field", 1500, 2250, "Lotus flowers rising above wide green leaves"),
  room: img("room", 2000, 1334, "A bright, quiet room with white chairs and plants"),
  interiorPlants: img("interior-plants", 1500, 2000, "A calm corner of a room with plants in soft light"),
  windowPlant: img("window-plant", 1500, 2250, "A potted plant on a ledge beside a sunlit window"),
  monsteraLight: img("monstera-light", 1500, 2262, "Sunlight falling across houseplants against a wall"),
  conversation: img("conversation", 2000, 1333, "Two people talking across a table, hands resting beside their cups"),
  supportHands: img("support-hands", 1500, 2250, "Two people holding hands across a table"),
  teaBook: img("tea-book", 1500, 2250, "A cup of tea held over an open book"),
  warmMug: img("warm-mug", 1800, 1200, "Hands wrapped around a warm cup"),
  journal: img("journal", 1500, 2250, "A person writing in a journal"),
  notebookLight: img("notebook-light", 1500, 2250, "A notebook and a cup on a small table in slatted sunlight"),
  facingSea: img("facing-sea", 2000, 1333, "A person sitting quietly, looking out over the sea"),
  meditation: img("meditation", 2000, 1600, "A person seated in stillness on a hill above a wide valley"),
  workshop: img("workshop", 2000, 1333, "A group listening to a presentation in a workshop room"),
  trainingRoom: img("training-room", 2000, 1336, "Participants taking notes during a workshop in a sunlit room"),
  auditorium: img("auditorium", 2000, 1333, "A speaker addressing a full auditorium"),
  microphone: img("microphone", 2000, 1333, "A microphone in front of a softly blurred audience"),
  studyWriting: img("study-writing", 1500, 2247, "A hand writing notes on paper"),
  teamMeeting: img("team-meeting", 2000, 1319, "Colleagues in conversation around a meeting table"),
  communityCircle: img("community-circle", 2000, 1180, "People seated in a circle on a lawn, in discussion"),
  grassCircle: img("grass-circle", 2000, 1333, "A group sitting together on the grass"),
  groupSession: img("group-session", 1500, 2245, "People seated together in a bright room, listening"),
  parentChild: img("parent-child", 2000, 1333, "An adult's hand reaching for a child's hand"),
  morningWindow: img("morning-window", 2000, 1333, "Morning sun breaking through a window"),
  booksWindow: img("books-window", 1500, 2250, "Open books beside a window at dusk"),
  dimWindow: img("dim-window", 2000, 1333, "Soft light through sheer curtains in a quiet room"),
  trophy: img("trophy", 1280, 1067, "A gold trophy cup standing against a plain pale wall"),
  studioCamera: img("studio-camera", 1600, 1067, "A broadcast camera with a teleprompter in a television studio"),
} as const;

/**
 * Artwork for the home hero: the seated figure, the water lotus and the swan,
 * each made from an image supplied by the center (see IMAGE-CREDITS.md).
 * Everything else in the hero is drawn in code. Files live in
 * /public/images/hero.
 */
export const cutouts = {
  figure: {
    src: "/images/hero/meditation-silhouette.webp",
    width: 839,
    height: 936,
    alt: "A woman seated cross-legged in meditation, in silhouette, hands resting on her knees",
  },
  lotus: { src: "/images/hero/water-lotus.webp", width: 900, height: 515, alt: "A pink lotus flower" },
  swan: { src: "/images/hero/swan.webp", width: 1100, height: 580, alt: "A white swan on the water, wings raised" },
} as const satisfies Record<string, ImageAsset>;
