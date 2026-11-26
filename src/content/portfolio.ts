import type { PortfolioEntry } from "@/types/content";
import { images } from "./images";

/**
 * Portfolio entries. The headings follow the achievements and programme
 * areas in the center's brochure. Descriptions are stand-in copy, and no
 * dates, venues or numbers are stated, so that real details and photographs
 * can be added from the admin panel (Portfolio Management).
 */
export const portfolioCategories = ["Speaking", "Media", "Writing", "Training", "Education", "Community"] as const;

export const portfolio: PortfolioEntry[] = [
  {
    slug: "mental-health-awareness-talks",
    title: "Mental health awareness talks",
    category: "Speaking",
    scope: "Across Tamil Nadu",
    summary:
      "Public talks that bring mental health into the open, for audiences who may never have had the chance to ask their questions.",
    body: [
      "Awareness begins with conversation. These talks are given to public, institutional and community audiences across Tamil Nadu, in plain language and with room for questions.",
      "Each talk is shaped around its audience, whether that is a hall of students, a staff gathering or a neighbourhood group, and covers how to recognise distress, how to respond, and where to turn for support.",
    ],
    highlights: ["Mental Health Awareness Campaigns", "Stress & Anxiety Management", "Social Well-being Workshops"],
    cover: images.auditorium,
    gallery: [images.microphone, images.workshop, images.groupSession],
    sample: true,
  },
  {
    slug: "television-programmes",
    title: "Television programmes",
    category: "Media",
    scope: "Guest speaker",
    summary:
      "Appearances as a guest speaker on television programmes, carrying conversations about emotional well-being to a wider audience.",
    body: [
      "Television reaches homes that a clinic never will. As a guest speaker, the focus is on practical, stigma-free guidance that viewers can relate to their own families and working lives.",
      "Programme names, dates and clips can be added here as they are made available.",
    ],
    highlights: ["Mental Health Awareness Campaigns", "Family Counseling", "Parent Guidance Sessions"],
    cover: images.microphone,
    gallery: [images.morningWindow, images.warmMug, images.dimWindow],
    sample: true,
  },
  {
    slug: "published-psychological-articles",
    title: "Published psychological articles",
    category: "Writing",
    scope: "Author",
    summary:
      "Writing that translates psychological ideas into everyday language, for readers looking to understand themselves and each other.",
    body: [
      "Good psychological writing meets readers where they are. These articles take up everyday concerns such as stress, relationships, parenting and resilience, and offer clear, grounded perspectives.",
      "A list of publications, with links where available, can be added here.",
    ],
    highlights: ["Emotional Intelligence Development", "Self-Awareness & Personal Growth", "Resilience Building"],
    cover: images.journal,
    gallery: [images.booksWindow, images.notebookLight, images.teaBook],
    sample: true,
  },
  {
    slug: "training-for-organizations",
    title: "Training for government, educational & social organizations",
    category: "Training",
    scope: "Trainer",
    summary:
      "Programmes designed with institutions, so that the people who serve others are supported themselves.",
    body: [
      "Organizations that care for the public carry a particular kind of load. Training is built in consultation with each institution, around the realities of its staff and the people they serve.",
      "Sessions combine psychological understanding with practical skills that participants can use the next morning.",
    ],
    highlights: [
      "Leadership & Emotional Intelligence Training",
      "Employee Mental Health Programs",
      "Team Well-being Initiatives",
    ],
    cover: images.trainingRoom,
    gallery: [images.workshop, images.teamMeeting, images.groupSession],
    sample: true,
  },
  {
    slug: "corporate-wellness-programmes",
    title: "Corporate wellness programmes",
    category: "Training",
    scope: "For workplaces",
    summary:
      "Workshops that help teams notice stress early, communicate with empathy and build a sustainable way of working.",
    body: [
      "Well-being at work is built in ordinary moments: how meetings are run, how workload is discussed, how people are treated on a hard day. These programmes give teams a shared language for all of it.",
      "Formats range from single workshops to longer programmes, tailored to each organization.",
    ],
    highlights: ["Corporate Wellness Programs", "Work-Life Balance Workshops", "Employee Mental Health Programs"],
    cover: images.teamMeeting,
    gallery: [images.trainingRoom, images.notebookLight, images.monsteraLight],
    sample: true,
  },
  {
    slug: "school-mental-health-awareness",
    title: "School mental health awareness",
    category: "Education",
    scope: "Students, parents & teachers",
    summary:
      "Age-appropriate sessions that help students understand their emotions, and help the adults around them respond well.",
    body: [
      "The earlier young people learn to recognise and talk about what they feel, the better prepared they are for everything that follows. School programmes work with students, parents and teachers together.",
      "Alongside awareness sessions, the center offers student counseling, career guidance, life skills development and parent guidance.",
    ],
    highlights: [
      "School Mental Health Awareness",
      "Student Counseling Services",
      "Career Guidance Programs",
      "Life Skills Development",
      "Parent Guidance Sessions",
    ],
    cover: images.studyWriting,
    gallery: [images.groupSession, images.parentChild, images.booksWindow],
    sample: true,
  },
  {
    slug: "community-outreach-initiatives",
    title: "Community outreach initiatives",
    category: "Community",
    scope: "With NGOs & local groups",
    summary:
      "Programmes that take support to where people already gather, in partnership with organizations rooted in their communities.",
    body: [
      "Mental health is shaped by the communities we live in. Outreach work includes drug awareness programmes, women empowerment initiatives and social well-being workshops, delivered with NGO and community partners.",
      "Partner names and programme records can be added here as they are documented.",
    ],
    highlights: [
      "Drug Awareness Programs",
      "Women Empowerment Initiatives",
      "Social Well-being Workshops",
      "NGO Partnership Programs",
    ],
    cover: images.communityCircle,
    gallery: [images.grassCircle, images.supportHands, images.lotusField],
    sample: true,
  },
];
