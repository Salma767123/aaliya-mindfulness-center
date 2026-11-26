import type { Video } from "@/types/content";
import { images } from "./images";

/**
 * Stand-in video entries. Titles and posters are samples; `youtubeId` is null
 * until real videos are linked from the admin panel (Video Management).
 * To test playback now, paste any YouTube video id into `youtubeId`.
 */
export const videoCategories = ["Mindfulness", "Awareness Talks", "Family & Parenting", "Workplace Well-being"] as const;

export const videos: Video[] = [
  {
    id: "three-minute-breathing-space",
    title: "A three-minute breathing space",
    description:
      "A short guided pause you can take anywhere: at your desk, on a bus, before a difficult conversation.",
    category: "Mindfulness",
    duration: "3:10",
    youtubeId: null,
    poster: images.facingSea,
    featured: true,
    sample: true,
  },
  {
    id: "why-awareness-matters",
    title: "Why mental health awareness matters",
    description: "An awareness talk on recognising distress early and why asking for help is a strength.",
    category: "Awareness Talks",
    duration: "14:05",
    youtubeId: null,
    poster: images.auditorium,
    sample: true,
  },
  {
    id: "listening-to-teenagers",
    title: "Talking with teenagers: listen first, advise later",
    description: "Practical ways for parents to keep the conversation open through the adolescent years.",
    category: "Family & Parenting",
    duration: "11:20",
    youtubeId: null,
    poster: images.parentChild,
    sample: true,
  },
  {
    id: "stress-before-burnout",
    title: "Noticing stress before it becomes burnout",
    description: "Early signs to watch for at work, and small adjustments that protect your energy.",
    category: "Workplace Well-being",
    duration: "8:45",
    youtubeId: null,
    poster: images.teamMeeting,
    sample: true,
  },
  {
    id: "grounding-in-anxious-moments",
    title: "Grounding yourself in anxious moments",
    description: "A simple sensory exercise to steady yourself when worry starts to build.",
    category: "Mindfulness",
    duration: "5:30",
    youtubeId: null,
    poster: images.rippleReflection,
    sample: true,
  },
  {
    id: "emotional-intelligence-at-work",
    title: "Emotional intelligence at work",
    description: "What it looks like in everyday leadership, and how teams can practise it together.",
    category: "Workplace Well-being",
    duration: "9:15",
    youtubeId: null,
    poster: images.trainingRoom,
    sample: true,
  },
  {
    id: "supporting-someone-grieving",
    title: "Supporting someone who is grieving",
    description: "What helps, what does not, and how to stay present when you do not know what to say.",
    category: "Awareness Talks",
    duration: "7:40",
    youtubeId: null,
    poster: images.warmMug,
    sample: true,
  },
];
