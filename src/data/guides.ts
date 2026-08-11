export type GuideStatus = "published" | "coming-next";

export type GuideCategory =
  | "Getting Started"
  | "Repair & Cleaning"
  | "Shop & Customization"
  | "Technical Help";

export interface GuideEntry {
  title: string;
  description: string;
  category: GuideCategory;
  href?: string;
  status: GuideStatus;
}

export const guideCategories: readonly GuideCategory[] = [
  "Getting Started",
  "Repair & Cleaning",
  "Shop & Customization",
  "Technical Help",
];

export const guideEntries: readonly GuideEntry[] = [
  {
    title: "Beginner Guide",
    description:
      "The recommended route through ReStory's first repairs and shop systems.",
    category: "Getting Started",
    status: "coming-next",
  },
  {
    title: "Demo vs Full Game",
    description:
      "What the demo includes and which details still need official confirmation.",
    category: "Getting Started",
    status: "coming-next",
  },
  {
    title: "How to Clean Items",
    description:
      "Clean the first Pokia device and troubleshoot dirt that will not disappear.",
    category: "Repair & Cleaning",
    href: "/guide/how-to-clean/",
    status: "published",
  },
  {
    title: "Painting Guide",
    description: "Airbrush, color palettes, and known customization limits.",
    category: "Repair & Cleaning",
    status: "coming-next",
  },
  {
    title: "How to Sell Devices",
    description:
      "Compare parts costs before repairing and reselling marketplace devices.",
    category: "Shop & Customization",
    status: "coming-next",
  },
  {
    title: "Customize Your Shop",
    description:
      "Understand gadget painting, walls, shelves, storage, and decorations.",
    category: "Shop & Customization",
    status: "coming-next",
  },
  {
    title: "System Requirements",
    description:
      "Official minimum specifications and version-labeled performance advice.",
    category: "Technical Help",
    status: "coming-next",
  },
  {
    title: "Missing Joystick",
    description:
      "Evidence-labeled reports and safe troubleshooting without invented fixes.",
    category: "Technical Help",
    status: "coming-next",
  },
];
