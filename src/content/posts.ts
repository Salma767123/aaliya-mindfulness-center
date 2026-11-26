import type { Post } from "@/types/content";
import { images } from "./images";

/**
 * Stand-in articles so the journal layouts can be reviewed with realistic
 * copy. They are general wellness writing, not clinical advice, and are
 * meant to be replaced from the admin panel (Blog Management).
 */
export const postCategories = ["Mindfulness", "Emotional Health", "Counseling", "Family & Parenting", "Workplace"] as const;

export const posts: Post[] = [
  {
    slug: "five-quiet-minutes-mindful-breathing",
    title: "Five quiet minutes: a beginner's guide to mindful breathing",
    excerpt:
      "You do not need a cushion, an app or an empty house. You need five minutes and a willingness to notice.",
    category: "Mindfulness",
    date: "2026-11-10",
    readMinutes: 4,
    cover: images.facingSea,
    featured: true,
    sample: true,
    body: [
      {
        type: "p",
        text: "Most of us breathe around twenty thousand times a day and notice almost none of it. Mindful breathing simply asks you to notice a few of those breaths on purpose. It is one of the gentlest ways to begin a mindfulness practice, because the breath is always with you.",
      },
      { type: "h2", text: "A simple way to begin" },
      {
        type: "list",
        items: [
          "Sit comfortably, with your feet on the floor and your hands resting where they fall.",
          "Let your eyes close, or rest your gaze on a point in front of you.",
          "Breathe in through the nose and feel the air arrive. Breathe out slowly and feel it leave.",
          "When your mind wanders, and it will, notice where it went and return to the next breath.",
        ],
      },
      {
        type: "quote",
        text: "The moment you notice that your mind has wandered is not a failure of the practice. It is the practice.",
      },
      { type: "h2", text: "What to expect" },
      {
        type: "p",
        text: "Some days five minutes will feel restful. On others it will feel long and noisy. Both are normal. The aim is not to empty the mind or to feel calm on demand, but to become a little more familiar with what is already there.",
      },
      {
        type: "p",
        text: "Try the same five minutes at the same time each day for a week, perhaps after waking or before sleep. Small and regular tends to work better than long and occasional.",
      },
    ],
  },
  {
    slug: "stress-or-anxiety-telling-them-apart",
    title: "Stress or anxiety? Learning to tell them apart",
    excerpt:
      "The two can feel alike in the body, but they often ask for different kinds of care. A few questions can help you tell which one is visiting.",
    category: "Emotional Health",
    date: "2026-10-22",
    readMinutes: 5,
    cover: images.morningWindow,
    sample: true,
    body: [
      {
        type: "p",
        text: "A tight chest, a restless night, a short temper. Stress and anxiety share many of the same signals, which is why the words are so often used for each other. Looking at where the feeling comes from, and how long it stays, can make the picture clearer.",
      },
      { type: "h2", text: "Stress usually has an address" },
      {
        type: "p",
        text: "Stress tends to be a response to something you can point to: a deadline, an exam, a move, a difficult week at home. When the situation eases, the feeling usually eases with it.",
      },
      { type: "h2", text: "Anxiety often stays after the reason has gone" },
      {
        type: "p",
        text: "Anxiety can linger without a clear cause, or feel larger than the situation in front of you. It often shows up as worry about what might happen, rather than pressure from what is happening.",
      },
      { type: "h2", text: "Questions worth asking yourself" },
      {
        type: "list",
        items: [
          "Can I name what this feeling is about?",
          "Does it fade when the situation changes, or does it follow me?",
          "Is it getting in the way of sleep, work or the people I care about?",
        ],
      },
      {
        type: "p",
        text: "Neither stress nor anxiety is a weakness, and you do not have to work out which one it is alone. If the feeling has been with you for a while, or is making daily life harder, speaking with a mental health professional is a sound next step.",
      },
    ],
  },
  {
    slug: "what-happens-in-a-first-counseling-session",
    title: "What happens in a first counseling session",
    excerpt:
      "Not knowing what to expect keeps many people from making the first appointment. Here is what that first hour is usually for.",
    category: "Counseling",
    date: "2026-10-05",
    readMinutes: 4,
    cover: images.conversation,
    sample: true,
    body: [
      {
        type: "p",
        text: "Walking into a first counseling session can feel like a large step. It helps to know that nothing dramatic is expected of you. The first meeting is mostly a conversation, and you decide how much of it to share.",
      },
      { type: "h2", text: "You set the pace" },
      {
        type: "p",
        text: "A counselor will usually ask what brings you in and what you hope might change. There are no right answers. \"I am not sure, I just know something feels off\" is a perfectly good place to begin.",
      },
      { type: "h2", text: "What you say stays private" },
      {
        type: "p",
        text: "Confidentiality is the ground that counseling stands on. Your counselor will explain how your privacy is protected, and the rare situations where safety has to come first, before you begin.",
      },
      {
        type: "quote",
        text: "You do not have to arrive with the right words. You only have to arrive.",
      },
      { type: "h2", text: "You leave with a sense of direction" },
      {
        type: "p",
        text: "By the end of the first session you will usually have talked about what further sessions could look like and how often it makes sense to meet. You are always free to ask questions, and to take time before deciding.",
      },
    ],
  },
  {
    slug: "helping-your-teenager-open-up",
    title: "Helping your teenager open up, without forcing the conversation",
    excerpt:
      "Adolescents talk when they feel safe, not when they are questioned. A few shifts in how we listen can keep the door open.",
    category: "Family & Parenting",
    date: "2026-09-18",
    readMinutes: 5,
    cover: images.parentChild,
    sample: true,
    body: [
      {
        type: "p",
        text: "Many parents notice the same change around the early teenage years: the child who once told you everything now answers in single words. This is a normal part of growing up, and it does not mean the relationship is closing. It means the way in has moved.",
      },
      { type: "h2", text: "Choose side-by-side moments" },
      {
        type: "p",
        text: "Teenagers often find it easier to talk while doing something else, in the car, while cooking, on a walk. Sitting them down for a serious talk can feel like an interview.",
      },
      { type: "h2", text: "Listen before you advise" },
      {
        type: "list",
        items: [
          "Let them finish, even when you can already see the solution.",
          "Reflect what you heard: \"That sounds really frustrating.\"",
          "Ask whether they want help or simply want you to listen.",
        ],
      },
      { type: "h2", text: "Stay steady when it is hard to hear" },
      {
        type: "p",
        text: "If a teenager shares something worrying and meets alarm or anger, they learn to share less. A calm \"thank you for telling me\" keeps the next conversation possible.",
      },
      {
        type: "p",
        text: "If you notice lasting changes in mood, sleep, appetite or school life, or your child seems withdrawn for weeks, adolescent counseling can give them a space of their own, and can support you as a parent too.",
      },
    ],
  },
  {
    slug: "work-life-balance-is-a-practice",
    title: "Work-life balance is a practice, not a destination",
    excerpt:
      "Balance is rarely a perfect split. It is a set of small, repeated choices about where your attention goes.",
    category: "Workplace",
    date: "2026-08-30",
    readMinutes: 4,
    cover: images.teamMeeting,
    sample: true,
    body: [
      {
        type: "p",
        text: "We tend to speak of work-life balance as a place we will reach one day, once the project ends or the busy season passes. In practice it behaves more like a habit: something maintained in small ways, most days, rather than achieved once.",
      },
      { type: "h2", text: "Small boundaries, kept often" },
      {
        type: "list",
        items: [
          "Give the working day a clear end, even a symbolic one such as a short walk or changing clothes.",
          "Protect one part of the day from screens, such as a meal or the hour before bed.",
          "Take pauses before you feel you need them, not after.",
        ],
      },
      { type: "h2", text: "What workplaces can do" },
      {
        type: "p",
        text: "Well-being is not only an individual responsibility. Teams that talk openly about workload, respect time off and make it normal to ask for help tend to see people stay well and stay longer.",
      },
      {
        type: "p",
        text: "If rest no longer restores you, or work has started to feel heavy most days, treat that as information rather than a personal failing. It is worth talking about.",
      },
    ],
  },
  {
    slug: "grief-has-no-timetable",
    title: "Grief has no timetable",
    excerpt:
      "There is no correct way to mourn and no date by which you should be finished. Some thoughts on living alongside loss.",
    category: "Emotional Health",
    date: "2026-08-12",
    readMinutes: 4,
    cover: images.dimWindow,
    sample: true,
    body: [
      {
        type: "p",
        text: "After a loss, people are often told, kindly, that time heals. It is closer to the truth to say that time changes grief. It becomes less sharp and less constant, but it does not follow a schedule, and it rarely moves in a straight line.",
      },
      { type: "h2", text: "Grief comes in waves" },
      {
        type: "p",
        text: "A song, a smell or an ordinary Tuesday can bring it all back, months or years later. This is not a setback. It is what love looks like when the person is no longer here.",
      },
      {
        type: "quote",
        text: "Grief does not need to be solved. It needs to be accompanied.",
      },
      { type: "h2", text: "What can help" },
      {
        type: "list",
        items: [
          "Let yourself feel what you feel, without judging it as too much or too little.",
          "Keep simple routines: meals, sleep, a little movement.",
          "Stay near people who let you speak about the person you have lost.",
        ],
      },
      {
        type: "p",
        text: "If grief feels unbearably heavy, or you find yourself unable to manage daily life for a long stretch, grief and emotional support counseling offers company through it. You do not have to carry it alone.",
      },
    ],
  },
];
