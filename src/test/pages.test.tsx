import { render, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import GuidePage from "@/app/guide/page";
import { GuideCard } from "@/components/guide-card";
import { guideEntries } from "@/data/guides";
import { routes } from "@/data/site";

describe("MVP page inventory", () => {
  it("defines exactly the seven shipped routes in discovery order", () => {
    expect(Object.values(routes)).toEqual([
      "/",
      "/guide/",
      "/guide/how-to-clean/",
      "/demo/",
      "/guide/customize-display/",
      "/system-requirements/",
      "/guide/painting/",
    ]);
    expect(Object.values(routes)).toHaveLength(7);
  });

  it("publishes the first five real guides at their canonical routes", () => {
    const published = guideEntries.filter((guide) => guide.status === "published");

    expect(published).toEqual([
      expect.objectContaining({
        title: "Demo vs Full Game",
        href: routes.demo,
        status: "published",
      }),
      expect.objectContaining({
        title: "How to Clean Items",
        href: routes.cleaning,
        status: "published",
      }),
      expect.objectContaining({
        title: "Painting Guide",
        href: routes.painting,
        status: "published",
      }),
      expect.objectContaining({
        title: "Customize Your Shop",
        href: routes.customizeDisplay,
        status: "published",
      }),
      expect.objectContaining({
        title: "System Requirements",
        href: routes.systemRequirements,
        status: "published",
      }),
    ]);
  });

  it("never gives a coming-soon guide card an href", () => {
    const comingSoon = guideEntries.filter((guide) => guide.status === "coming-next");
    expect(comingSoon.map((guide) => guide.title)).toEqual([
      "Beginner Guide",
      "How to Sell Devices",
      "Missing Joystick",
    ]);

    for (const guide of comingSoon) {
      expect(Object.hasOwn(guide, "href")).toBe(false);
      const { container } = render(<GuideCard guide={guide} />);
      const card = container.querySelector(".guide-card");
      expect(card?.tagName).toBe("DIV");
      expect(within(card as HTMLElement).queryByRole("link")).not.toBeInTheDocument();
    }
  });

  it("renders the guide index with five linked published cards and three inert cards", () => {
    const { container } = render(<GuidePage />);
    const cards = Array.from(container.querySelectorAll(".guide-card"));

    expect(cards).toHaveLength(8);
    expect(cards.filter((card) => card.tagName === "A")).toHaveLength(5);
    expect(cards.filter((card) => card.tagName === "DIV")).toHaveLength(3);
  });
});
