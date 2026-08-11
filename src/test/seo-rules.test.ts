import { describe, expect, it } from "vitest";

import { pageSeo } from "@/data/site";
import { validateDescription, validateTitle } from "@/lib/seo-rules";

describe("page SEO", () => {
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

  it("uses a distinct H1 for every route", () => {
    const headings = Object.values(pageSeo).map((seo) => seo.h1);

    expect(new Set(headings).size).toBe(headings.length);
  });
});
