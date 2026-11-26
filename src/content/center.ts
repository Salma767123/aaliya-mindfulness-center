import type {
  ApproachStep,
  MindfulNote,
  Reason,
  Recognition,
  Service,
  Testimonial,
  Therapist,
  Value,
  VisionStage,
} from "@/types/content";
import { images } from "./images";

/* ------------------------------------------------------------------
   From the center's brochure (services, reasons, values, achievements).
   The one-line summaries under each service are connecting copy written
   for the website and should be reviewed by the center.
   ------------------------------------------------------------------ */

export const services: Service[] = [
  {
    slug: "psychological-counseling",
    index: "01",
    title: "Psychological Counseling",
    summary:
      "A private, unhurried space to talk through what is weighing on you, alone, as a couple or as a family.",
    items: [
      "Individual Counseling",
      "Family Counseling",
      "Marriage & Relationship Counseling",
      "Adolescent Counseling",
      "Stress & Anxiety Management",
      "Grief & Emotional Support",
    ],
    image: images.conversation,
  },
  {
    slug: "mindfulness-wellness",
    index: "02",
    title: "Mindfulness & Wellness",
    summary:
      "Practices that steady attention and soften stress, so that awareness becomes part of ordinary days.",
    items: [
      "Mindfulness-Based Stress Reduction",
      "Emotional Intelligence Development",
      "Self-Awareness & Personal Growth Workshops",
      "Resilience Building Sessions",
    ],
    image: images.meditation,
  },
  {
    slug: "training-development",
    index: "03",
    title: "Training & Development",
    summary:
      "Programmes for workplaces that want their people to feel well, lead with empathy and work sustainably.",
    items: [
      "Corporate Wellness Programs",
      "Work-Life Balance Workshops",
      "Employee Mental Health Programs",
      "Leadership & Emotional Intelligence Training",
      "Team Well-being Initiatives",
    ],
    image: images.trainingRoom,
  },
  {
    slug: "educational-programs",
    index: "04",
    title: "Educational Programs",
    summary:
      "Support for students, parents and schools, from early awareness to guidance at the points where choices matter.",
    items: [
      "School Mental Health Awareness",
      "Student Counseling Services",
      "Career Guidance Programs",
      "Life Skills Development",
      "Parent Guidance Sessions",
    ],
    image: images.studyWriting,
  },
  {
    slug: "community-outreach",
    index: "05",
    title: "Community Outreach",
    summary:
      "Taking mental health conversations beyond the consulting room and into neighbourhoods, institutions and partner organizations.",
    items: [
      "Drug Awareness Programs",
      "Women Empowerment Initiatives",
      "Mental Health Awareness Campaigns",
      "Social Well-being Workshops",
      "NGO Partnership Programs",
    ],
    image: images.communityCircle,
  },
];

/**
 * "Why choose Aaliya". The titles are the brochure's, word for word. The line under
 * each is connecting copy written for the website and should be reviewed by the center.
 */
export const reasons: Reason[] = [
  {
    title: "Professional and Ethical Practice",
    description: "Clear boundaries, honest guidance and respect for every person who comes to us.",
    icon: "shield",
  },
  {
    title: "Confidential & Compassionate Care",
    description: "What you share stays private, and it is met with warmth, never judgement.",
    icon: "lock",
  },
  {
    title: "Evidence-Based Psychological Approaches",
    description: "Methods grounded in established psychological research, chosen to suit you.",
    icon: "flask",
  },
  {
    title: "Experienced Mental Health Expertise",
    description: "Guidance from practitioners who work with these concerns every day.",
    icon: "medal",
  },
  {
    title: "Customized Programs for Individuals, Institutions & Organizations",
    description: "From one-to-one sessions to programmes shaped for schools, colleges and workplaces.",
    icon: "sliders",
  },
  {
    title: "Holistic Focus on Mind, Emotion & Well-being",
    description: "Attention to thoughts, feelings and daily life together, not one in isolation.",
    icon: "lotus",
  },
  {
    title: "Community-Centered Mental Health Initiatives",
    description: "Awareness talks and outreach that carry mental health support into the community.",
    icon: "people",
  },
];

export const values: Value[] = [
  { title: "Compassion", description: "We care with empathy and understanding." },
  { title: "Integrity", description: "We uphold the highest standards of ethics and confidentiality." },
  { title: "Empowerment", description: "We empower individuals to discover their strengths and potential." },
  { title: "Growth", description: "We inspire continuous personal and emotional development." },
  { title: "Mindfulness", description: "We promote awareness, balance and purposeful living." },
];

/**
 * The vision from the brochure, told in three widening circles on the home page.
 * The phrases, read in order, are the vision statement word for word (see site.vision).
 * Labels and captions are connecting copy written for the website.
 */
export const visionStages: VisionStage[] = [
  {
    phrase: "To become a leading center for mental wellness and mindfulness,",
    label: "A leading center",
    ring: "Mental wellness & mindfulness",
    caption:
      "Counseling, mindfulness practice and mental health education, brought together under one roof in Madurai.",
  },
  {
    phrase: "fostering emotionally resilient individuals",
    emphasis: ["resilient"],
    label: "Resilient individuals",
    ring: "Emotionally resilient individuals",
    caption:
      "Whether you come alone, as a couple or as a family, the work begins the same way: with careful listening, in confidence.",
  },
  {
    phrase: "and healthier communities.",
    emphasis: ["healthier"],
    label: "Healthier communities",
    ring: "Healthier communities",
    caption:
      "From there the work reaches outward, into schools, workplaces and communities across Tamil Nadu.",
  },
];

export const achievements: string[] = [
  "Mental Health Awareness Speaker across Tamil Nadu",
  "Recipient of Multiple Women's Achievement Awards",
  "Guest Speaker on Television Programs",
  "Published Author of Psychological Articles",
  "Trainer for Government, Educational, and Social Organizations",
];

/**
 * The same five, as the home page introduces them: each with a short label for where
 * that work is seen, a small drawing and a photograph of that kind of work. The titles
 * are the brochure's; the labels are connecting copy written for the website.
 */
export const recognition: Recognition[] = [
  { title: achievements[0], label: "On stage", icon: "microphone", image: images.auditorium, focus: "50% 70%" },
  { title: achievements[1], label: "Recognised", icon: "trophy", image: images.trophy, focus: "50% 35%" },
  { title: achievements[2], label: "On television", icon: "television", image: images.studioCamera, focus: "60% 50%" },
  { title: achievements[3], label: "In print", icon: "book", image: images.studyWriting },
  { title: achievements[4], label: "In training rooms", icon: "board", image: images.workshop },
];

/* ------------------------------------------------------------------
   Therapist profile. Name, portrait and qualifications were not in the
   supplied material, so they are left as clearly marked placeholders.
   ------------------------------------------------------------------ */

export const therapist: Therapist = {
  name: null,
  role: "Founder & Lead Therapist",
  intro:
    "The center is led by a mental health professional whose work reaches well beyond the consulting room, into classrooms, workplaces, television studios and community halls across Tamil Nadu.",
  summary: "Work that reaches well beyond the consulting room",
  bio: [
    "The practice brings together counseling, mindfulness and public education: speaking on mental health awareness across Tamil Nadu, appearing as a guest speaker on television programmes, and writing on psychology for a general readership.",
    "As a trainer, the founder works with government, educational and social organizations, shaping each programme around the people in the room. This work has been recognised with multiple women's achievement awards.",
  ],
  portrait: null,
  qualifications: [
    { title: "Degree or professional qualification", detail: "Institution · Year", placeholder: true },
    { title: "Clinical training or certification", detail: "Awarding body · Year", placeholder: true },
    { title: "Professional memberships", detail: "Organization · Registration details", placeholder: true },
    { title: "Years in practice", detail: "Experience summary", placeholder: true },
  ],
  achievements,
  recognition,
};

/* ------------------------------------------------------------------
   Website copy drafted for this build. General in nature; to be reviewed
   and edited by the center.
   ------------------------------------------------------------------ */

export const approach: ApproachStep[] = [
  {
    index: "01",
    title: "A first conversation",
    description: "We begin by listening, at your pace and in complete confidence.",
  },
  {
    index: "02",
    title: "Understanding together",
    description: "We look at the whole picture: mind, emotion and daily life.",
  },
  {
    index: "03",
    title: "A plan shaped around you",
    description: "An evidence-based way forward, agreed with you.",
  },
  {
    index: "04",
    title: "Growth that lasts",
    description: "Skills to carry with you: awareness, resilience and balance.",
  },
];

export const mindfulNotes: MindfulNote[] = [
  {
    title: "Name what you feel",
    body: "Putting a feeling into words, such as \"I am anxious\" or \"I am tired\", can make it easier to hold. Naming is not fixing. It is noticing.",
  },
  {
    title: "Come back to the senses",
    body: "When thoughts race, look for five things you can see, four you can touch, three you can hear, two you can smell and one you can taste.",
  },
  {
    title: "Rest is not a reward",
    body: "Sleep, pauses and unhurried time are part of mental health, not something to be earned after everything else is done.",
  },
];

export const testimonials: Testimonial[] = [
  {
    id: "t1",
    quote:
      "I came in unsure of what to say. I left the first session feeling heard for the first time in a long while.",
    attribution: "Individual counseling client",
    context: "Psychological Counseling",
    sample: true,
  },
  {
    id: "t2",
    quote:
      "The sessions gave our family a calmer way of talking to each other. Small changes, but they have stayed with us.",
    attribution: "Parent, family counseling",
    context: "Family Counseling",
    sample: true,
  },
  {
    id: "t3",
    quote:
      "Our team still uses the breathing practice from the workshop before difficult meetings. It was practical and warm, not a lecture.",
    attribution: "HR lead, corporate wellness programme",
    context: "Training & Development",
    sample: true,
  },
  {
    id: "t4",
    quote:
      "Students asked questions they had never asked a teacher. The awareness session opened a door for our school.",
    attribution: "School coordinator",
    context: "Educational Programs",
    sample: true,
  },
];
