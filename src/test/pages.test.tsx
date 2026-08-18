import { cleanup, render, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import GuidePage from "@/app/guide/page";
import { GuideCard } from "@/components/guide-card";
import { guideEntries } from "@/data/guides";
import { routes } from "@/data/site";

afterEach(cleanup);

describe("MVP page inventory", () => {
  it("defines exactly the ten shipped routes in discovery order", () => {
    expect(Object.values(routes)).toEqual([
      "/",
      "/guide/",
      "/guide/how-to-clean/",
      "/demo/",
      "/guide/customize-display/",
      "/system-requirements/",
      "/guide/painting/",
      "/guide/beginner/",
      "/guide/how-to-sell-devices/",
      "/guide/missing-joystick/",
    ]);
    expect(Object.values(routes)).toHaveLength(10);
  });

  it("publishes all eight real guides at their canonical routes", () => {
    const published = guideEntries.filter((guide) => guide.status === "published");

    expect(published).toEqual([
      expect.objectContaining({
        title: "Beginner Guide",
        href: routes.beginner,
        status: "published",
      }),
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
        title: "How to Sell Devices",
        href: routes.howToSellDevices,
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
      expect.objectContaining({
        title: "Missing Joystick",
        href: routes.missingJoystick,
        status: "published",
      }),
    ]);
  });

  it("gives every published guide card its canonical href", () => {
    for (const guide of guideEntries) {
      expect(guide.status).toBe("published");
      const { container } = render(<GuideCard guide={guide} />);
      const card = container.querySelector(".guide-card");
      expect(card?.tagName).toBe("A");
      expect(card).toHaveAttribute("href", guide.href.replace(/\/$/, ""));
      expect(within(card as HTMLElement).getByRole("heading", { level: 3 })).toHaveTextContent(
        guide.title,
      );
    }
  });

  it("renders the guide index with eight linked published cards", () => {
    const { container } = render(<GuidePage />);
    const cards = Array.from(container.querySelectorAll(".guide-card"));

    expect(cards).toHaveLength(8);
    expect(cards.filter((card) => card.tagName === "A")).toHaveLength(8);
    expect(cards.filter((card) => card.tagName === "DIV")).toHaveLength(0);
  });
});
