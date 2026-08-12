import { render, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import GuidePage from "@/app/guide/page";
import { GuideCard } from "@/components/guide-card";
import { guideEntries } from "@/data/guides";
import { routes } from "@/data/site";

describe("MVP page inventory", () => {
  it("defines exactly the three shipped routes", () => {
    expect(Object.values(routes)).toEqual([
      "/",
      "/guide/",
      "/guide/how-to-clean/",
    ]);
    expect(Object.values(routes)).toHaveLength(3);
  });

  it("publishes only the cleaning guide", () => {
    const published = guideEntries.filter((guide) => guide.status === "published");

    expect(published).toEqual([
      expect.objectContaining({
        title: "How to Clean Items",
        href: routes.cleaning,
        status: "published",
      }),
    ]);
  });

  it("never gives a coming-soon guide card an href", () => {
    const comingSoon = guideEntries.filter((guide) => guide.status === "coming-next");
    expect(comingSoon).toHaveLength(7);

    for (const guide of comingSoon) {
      expect(Object.hasOwn(guide, "href")).toBe(false);
      const { container } = render(<GuideCard guide={guide} />);
      const card = container.querySelector(".guide-card");
      expect(card?.tagName).toBe("DIV");
      expect(within(card as HTMLElement).queryByRole("link")).not.toBeInTheDocument();
    }
  });

  it("renders the guide index with one linked published card and seven inert cards", () => {
    const { container } = render(<GuidePage />);
    const cards = Array.from(container.querySelectorAll(".guide-card"));

    expect(cards).toHaveLength(8);
    expect(cards.filter((card) => card.tagName === "A")).toHaveLength(1);
    expect(cards.filter((card) => card.tagName === "DIV")).toHaveLength(7);
    expect(cards.find((card) => card.tagName === "A")).toHaveAttribute(
      "href",
      "/guide/how-to-clean",
    );
  });
});
