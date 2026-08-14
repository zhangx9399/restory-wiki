import { routes } from "@/data/site";

export const guideCategories = [
  "Getting Started",
  "Repair & Cleaning",
  "Shop & Customization",
  "Technical Help",
] as const;

export type GuideCategory = (typeof guideCategories)[number];

export type GuideStatus = "published" | "coming-next";

type GuideEntryDetails = Readonly<{
  title: string;
  description: string;
  category: GuideCategory;
}>;

export type GuideEntry =
  | (GuideEntryDetails &
      Readonly<{
        status: "published";
        href: string;
      }>)
  | (GuideEntryDetails &
      Readonly<{
        status: "coming-next";
        href?: never;
      }>);

export const guideEntries = [
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
    href: routes.demo,
    status: "published",
  },
  {
    title: "How to Clean Items",
    description:
      "Clean the first Pokia device and troubleshoot dirt that will not disappear.",
    category: "Repair & Cleaning",
    href: routes.cleaning,
    status: "published",
  },
  {
    title: "Painting Guide",
    description: "Airbrush, color palettes, and known customization limits.",
    category: "Repair & Cleaning",
    href: routes.painting,
    status: "published",
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
    href: routes.customizeDisplay,
    status: "published",
  },
  {
    title: "System Requirements",
    description:
      "Official minimum specifications and version-labeled performance advice.",
    category: "Technical Help",
    href: routes.systemRequirements,
    status: "published",
  },
  {
    title: "Missing Joystick",
    description:
      "Evidence-labeled reports and safe troubleshooting without invented fixes.",
    category: "Technical Help",
    status: "coming-next",
  },
] as const satisfies readonly GuideEntry[];
