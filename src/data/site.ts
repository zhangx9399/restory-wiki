import { getSiteOrigin } from "@/lib/site-url";

export const siteConfig = {
  name: "ReStory Wiki",
  origin: getSiteOrigin(),
  steamUrl:
    "https://store.steampowered.com/app/3812600/ReStory_Chill_Electronic_Repairs/",
  discordUrl: "https://discord.gg/restory",
  description:
    "Independent, source-labeled ReStory guides for repairs, shop management, demo details, and troubleshooting.",
} as const;

export const routes = {
  home: "/",
  guide: "/guide/",
  cleaning: "/guide/how-to-clean/",
} as const;

export const pageSeo = {
  home: {
    path: routes.home,
    title: "ReStory Wiki — Guides, Demo & Repair Tips",
    description:
      "Explore ReStory: Chill Electronics Repairs guides, demo details, system requirements, repair walkthroughs, customization tips, and troubleshooting help.",
    h1: "ReStory: Chill Electronics Repairs Guides",
  },
  guide: {
    path: routes.guide,
    title: "ReStory Guides — Beginner, Repair & Shop Help",
    description:
      "Browse ReStory guides for beginners, cleaning, repairs, shop management, customization, system requirements, and common troubleshooting questions.",
    h1: "ReStory Guides",
  },
  cleaning: {
    path: routes.cleaning,
    title: "How to Clean Items in ReStory — First Device Guide",
    description:
      "Learn how cleaning works in ReStory, where to place dirty parts, how to clean the first Pokia device, and what to check when dirt will not disappear.",
    h1: "How to Clean Items in ReStory",
  },
} as const;
