import { describe, expect, it } from "vitest";

import { guideCategories, guideEntries } from "@/data/guides";
import { pageSeo, routes } from "@/data/site";
import { validateDescription, validateTitle } from "@/lib/seo-rules";

const expectedRoutes = {
  home: "/",
  guide: "/guide/",
  cleaning: "/guide/how-to-clean/",
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
    [139, false],
    [140, true],
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
    "keeps %s description within 140-160 characters",
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

  it("publishes only the cleaning guide at the cleaning route", () => {
    const published = guideEntries.filter(
      (entry) => entry.status === "published",
    );

    expect(published).toHaveLength(1);
    expect(published[0]).toMatchObject({
      title: "How to Clean Items",
      href: routes.cleaning,
    });
  });

  it("keeps coming-next guides unlinked", () => {
    const comingNext = guideEntries.filter(
      (entry) => entry.status === "coming-next",
    );

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
