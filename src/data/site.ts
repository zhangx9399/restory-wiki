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
  demo: "/demo/",
  customizeDisplay: "/guide/customize-display/",
  systemRequirements: "/system-requirements/",
  painting: "/guide/painting/",
  beginner: "/guide/beginner/",
  howToSellDevices: "/guide/how-to-sell-devices/",
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
  demo: {
    path: routes.demo,
    title: "ReStory Demo Guide — Download, Content & Full Game",
    description:
      "Learn where to download the ReStory demo, what it includes, how it differs from the full game, and what is known about demo save progress.",
    h1: "ReStory Demo Guide",
  },
  customizeDisplay: {
    path: routes.customizeDisplay,
    title: "How to Customize Your Shop in ReStory",
    description:
      "Understand ReStory shop customization, including walls, shelf styles, storage, decorations, and how shop changes differ from gadget painting.",
    h1: "How to Customize Your Shop in ReStory",
  },
  systemRequirements: {
    path: routes.systemRequirements,
    title: "ReStory System Requirements — Can Your PC Run It?",
    description:
      "Check ReStory's official minimum PC requirements, storage and DirectX needs, and version-labeled VSync and frame-rate troubleshooting advice.",
    h1: "ReStory System Requirements",
  },
  painting: {
    path: routes.painting,
    title: "ReStory Painting Guide — Airbrush & Color Palettes",
    description:
      "Learn what the Airbrush and color palettes do in ReStory, how painting differs from shop customization, and which painting details remain unconfirmed.",
    h1: "ReStory Painting Guide",
  },
  beginner: {
    path: routes.beginner,
    title: "ReStory Beginner Guide — Your First Repair Route",
    description:
      "Start ReStory with a practical first repair route, cleaning and reassembly basics, shop priorities, time management, and evidence-labeled next steps.",
    h1: "ReStory Beginner Guide",
  },
  howToSellDevices: {
    path: routes.howToSellDevices,
    title: "How to Sell Devices in ReStory — Safe Profit Guide",
    description:
      "Learn how to inspect, repair, price, and sell devices in ReStory while tracking costs, avoiding unsupported profit claims, and using evidence safely.",
    h1: "How to Sell Devices in ReStory",
  },
} as const;
