import { describe, expect, it } from "vitest";

import { guideCategories, guideEntries } from "@/data/guides";
import { pageSeo, routes } from "@/data/site";
import { validateDescription, validateTitle } from "@/lib/seo-rules";

const expectedRoutes = {
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

describe("SEO validation rules", () => {
  it.each([
    [29, false],
    [30, true],
    [60, true],
    [61, false],
  ])("validates a %i-character title as %s", (length, expected) => {
    expect(validateTitle("x".repeat(length))).toBe(expected);
  });

  it.each([
    [129, false],
    [130, true],
    [160, true],
    [161, false],
  ])("validates a %i-character description as %s", (length, expected) => {
    expect(validateDescription("x".repeat(length))).toBe(expected);
  });
});

describe("page SEO", () => {
  it("defines the exact routes once", () => {
    expect(routes).toEqual(expectedRoutes);
    expect(Object.keys(pageSeo)).toEqual(Object.keys(expectedRoutes));
    expect(
      Object.fromEntries(
        Object.entries(pageSeo).map(([key, seo]) => [key, seo.path]),
      ),
    ).toEqual(expectedRoutes);
    expect(new Set(Object.values(pageSeo).map((seo) => seo.path)).size).toBe(
      Object.keys(expectedRoutes).length,
    );
  });

  it.each(Object.entries(pageSeo))(
    "keeps %s title within 30-60 characters",
    (_, seo) => {
      expect(validateTitle(seo.title)).toBe(true);
    },
  );

  it.each(Object.entries(pageSeo))(
    "keeps %s description within 130-160 characters",
    (_, seo) => {
      expect(validateDescription(seo.description)).toBe(true);
    },
  );

  it.each(["title", "description", "h1"] as const)(
    "uses a distinct %s for every route",
    (field) => {
      const values = Object.values(pageSeo).map((seo) => seo[field]);

      expect(new Set(values).size).toBe(values.length);
    },
  );
});

describe("guide data", () => {
  it("defines exactly eight guides and four unique categories", () => {
    expect(guideEntries).toHaveLength(8);
    expect(guideCategories).toHaveLength(4);
    expect(new Set(guideCategories).size).toBe(guideCategories.length);
  });

  it("publishes the first five real guides at defined routes", () => {
    const published = guideEntries.filter(
      (entry) => entry.status === "published",
    );

    expect(published.map(({ title, href }) => ({ title, href }))).toEqual([
      { title: "Demo vs Full Game", href: routes.demo },
      { title: "How to Clean Items", href: routes.cleaning },
      { title: "Painting Guide", href: routes.painting },
      { title: "Customize Your Shop", href: routes.customizeDisplay },
      { title: "System Requirements", href: routes.systemRequirements },
    ]);
  });

  it("keeps coming-next guides unlinked", () => {
    const comingNext = guideEntries.filter(
      (entry) => entry.status === "coming-next",
    );

    expect(comingNext.map((entry) => entry.title)).toEqual([
      "Beginner Guide",
      "How to Sell Devices",
      "Missing Joystick",
    ]);
    expect(comingNext.every((entry) => !("href" in entry))).toBe(true);
  });

  it("links every published guide to a defined route", () => {
    const definedRoutes = Object.values(routes);
    const published = guideEntries.filter(
      (entry) => entry.status === "published",
    );

    expect(published.every((entry) => definedRoutes.includes(entry.href))).toBe(
      true,
    );
  });
});
