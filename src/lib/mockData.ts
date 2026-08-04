import type { App, Project, BlogPost, TeamMember } from "@/types";

export const apps: App[] = [
  {
    id: "kharchamate",
    slug: "kharchamate",
    name: "KharchaMate",
    tagline: "Shared expenses, settled fast.",
    description:
      "KharchaMate helps roommates and groups track shared expenses, split bills fairly, and settle up without the awkward math. Built with offline-first sync and PIN-protected privacy.",
    status: "SHIPPED",
    category: "Finance",
    icon: "/icons/kharchamate.svg",
    screenshots: [],
    rating: 4.7,
    reviewCount: 128,
    downloadCount: 5400,
    versions: [
      {
        version: "2.4.1",
        date: "2026-07-18",
        notes: ["Fixed data reset on navigation bug", "PIN lock persistence improved", "Bill scanner accuracy boost"],
      },
      {
        version: "2.3.0",
        date: "2026-06-02",
        notes: ["Added AI expense analysis", "Voice expense entry", "Referral code system"],
      },
      {
        version: "2.0.0",
        date: "2026-04-14",
        notes: ["Google Sign-In integration", "Backup & restore", "Premium subscription launch"],
      },
    ],
    reviews: [
      { id: "r1", author: "Aditi R.", rating: 5, comment: "Finally splits bills without the group chat chaos.", date: "2026-07-20" },
      { id: "r2", author: "Rohan K.", rating: 4, comment: "Bill scanner is magic. Wish it supported more banks.", date: "2026-07-10" },
    ],
    releasedAt: "2026-04-14",
    updatedAt: "2026-07-18",
    packageName: "com.roomcharkha.app",
    tags: ["finance", "utility", "android"],
  },
  {
    id: "focusloop",
    slug: "focusloop",
    name: "FocusLoop",
    tagline: "Deep work, timed right.",
    description:
      "A minimal Pomodoro and deep-work tracker with ambient soundscapes and weekly focus analytics.",
    status: "BETA",
    category: "Productivity",
    icon: "/icons/focusloop.svg",
    screenshots: [],
    rating: 4.3,
    reviewCount: 41,
    downloadCount: 890,
    versions: [
      { version: "0.9.2", date: "2026-07-25", notes: ["Beta: ambient sound packs added"] },
      { version: "0.8.0", date: "2026-06-30", notes: ["Beta: initial public release"] },
    ],
    reviews: [],
    releasedAt: "2026-06-30",
    updatedAt: "2026-07-25",
    tags: ["productivity", "android"],
  },
  {
    id: "pixeljournal",
    slug: "pixeljournal",
    name: "PixelJournal",
    tagline: "A journal that fits in your pocket, pixel by pixel.",
    description:
      "Daily journaling app with mood tracking rendered as a generative pixel-art calendar.",
    status: "IN_DEV",
    category: "Lifestyle",
    icon: "/icons/pixeljournal.svg",
    screenshots: [],
    rating: 0,
    reviewCount: 0,
    downloadCount: 0,
    versions: [{ version: "0.1.0-alpha", date: "2026-07-28", notes: ["Internal alpha build"] }],
    reviews: [],
    releasedAt: "2026-07-28",
    updatedAt: "2026-07-28",
    tags: ["lifestyle", "android"],
  },
];

export const projects: Project[] = [
  {
    id: "p1",
    slug: "signal-board",
    name: "Signal Board",
    summary: "Internal status-board tool that inspired PGDevLabs' own build-status system.",
    description:
      "A lightweight Kanban-meets-CI status board built to track internal app releases across the studio.",
    status: "SHIPPED",
    stack: ["Next.js", "TypeScript", "Firebase"],
    repoUrl: "https://github.com/pgdevlabs/signal-board",
    coverImage: "",
    startedAt: "2026-02-01",
  },
  {
    id: "p2",
    slug: "changelog-cli",
    name: "changelog-cli",
    summary: "A CLI that generates styled changelogs from conventional commits.",
    description: "Open-source CLI tool used internally to auto-generate the changelog format used across PGDevLabs apps.",
    status: "BETA",
    stack: ["Node.js", "TypeScript"],
    repoUrl: "https://github.com/pgdevlabs/changelog-cli",
    coverImage: "",
    startedAt: "2026-05-10",
  },
];

export const blogPosts: BlogPost[] = [
  {
    id: "b1",
    slug: "why-we-build-in-public",
    title: "Why we build in public",
    excerpt: "Shipping fast means showing the messy middle, not just the launch tweet.",
    content: "Full post content goes here.",
    coverImage: "",
    author: "PGDevLabs Team",
    publishedAt: "2026-07-15",
    tags: ["engineering", "culture"],
    readMinutes: 4,
  },
  {
    id: "b2",
    slug: "kharchamate-postmortem",
    title: "KharchaMate: what broke, what we fixed",
    excerpt: "A honest look at the data-reset bug that nearly shipped, and how we caught it.",
    content: "Full post content goes here.",
    coverImage: "",
    author: "Raju",
    publishedAt: "2026-07-20",
    tags: ["postmortem", "kharchamate"],
    readMinutes: 6,
  },
];

export const team: TeamMember[] = [
  {
    id: "t1",
    name: "Raju",
    role: "Founder & Lead Developer",
    bio: "Builds mobile-first apps end to end — from Firebase architecture to Play Store launch.",
    avatar: "",
    socials: { github: "https://github.com/" },
  },
];
