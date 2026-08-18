import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import GuidePage, { metadata } from "@/app/guide/page";
import { SiteHeader } from "@/components/site-header";
import { guideCategories, guideEntries } from "@/data/guides";
import { pageSeo, routes } from "@/data/site";
import { absoluteUrl } from "@/lib/structured-data";

afterEach(cleanup);

const categorySections = [
  ["Getting Started", "getting-started"],
  ["Repair & Cleaning", "repair-cleaning"],
  ["Shop & Customization", "shop-customization"],
  ["Technical Help", "technical-help"],
] as const;

describe("guide page metadata", () => {
  it("uses the exact guide SEO fields and canonical route", () => {
    expect(metadata).toEqual({
      title: pageSeo.guide.title,
      description: pageSeo.guide.description,
      alternates: { canonical: routes.guide },
      openGraph: {
        title: pageSeo.guide.title,
        description: pageSeo.guide.description,
        url: routes.guide,
        type: "website",
      },
    });
  });
});

describe("GuidePage", () => {
  it("renders the required hero, breadcrumb semantics, and one H1", () => {
    const { container } = render(<GuidePage />);

    const main = container.querySelector("main#main-content");
    expect(main).toBeInTheDocument();
    const h1s = within(main as HTMLElement).getAllByRole("heading", { level: 1 });
    expect(h1s).toHaveLength(1);
    expect(h1s[0]).toHaveTextContent("ReStory Guides");

    const hero = container.querySelector("header.page-hero");
    expect(hero).toBeInTheDocument();
    expect(hero?.querySelector(":scope > div.shell")).toBeInTheDocument();
    expect(within(hero as HTMLElement).getByText("Source-labeled walkthroughs", {
      selector: ".eyebrow",
    })).toBeInTheDocument();
    expect(
      within(hero as HTMLElement).getByText(
        "Start with cleaning and expand into repairs, shop management, customization, and technical help. Every guide is published and ready to read.",
        { selector: "p.hero-copy" },
      ),
    ).toBeInTheDocument();

    const breadcrumbs = within(hero as HTMLElement).getByRole("navigation", {
      name: "Breadcrumb",
    });
    expect(within(breadcrumbs).getByRole("link", { name: "Home" })).toHaveAttribute(
      "href",
      "/",
    );
    expect(within(breadcrumbs).getByText("Guides")).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  it("renders all four categories in data order with stable section IDs", () => {
    const { container } = render(<GuidePage />);

    expect(guideCategories).toEqual(categorySections.map(([category]) => category));
    const headings = screen.getAllByRole("heading", { level: 2 });
    expect(headings.map((heading) => heading.textContent)).toEqual(
      categorySections.map(([category]) => category),
    );
    expect(
      headings.map((heading) => heading.closest("section")?.id),
    ).toEqual(categorySections.map(([, id]) => id));
    expect(container.querySelectorAll("main h1")).toHaveLength(1);
  });

  it("injects parseable CollectionPage and BreadcrumbList structured data", () => {
    const { container } = render(<GuidePage />);

    const scripts = Array.from(
      container.querySelectorAll<HTMLScriptElement>('script[type="application/ld+json"]'),
    );
    expect(scripts).toHaveLength(2);
    const schemas = scripts.map((script) => JSON.parse(script.textContent ?? "{}"));

    expect(schemas.find((schema) => schema["@type"] === "CollectionPage")).toEqual({
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: "ReStory Guides",
      description: pageSeo.guide.description,
      url: absoluteUrl(routes.guide),
    });
    expect(schemas.find((schema) => schema["@type"] === "BreadcrumbList")).toEqual({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: absoluteUrl(routes.home),
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Guides",
          item: absoluteUrl(routes.guide),
        },
      ],
    });
  });

  it("shows eight published guide links without Coming Next labels", () => {
    const { container } = render(<GuidePage />);

    const cards = Array.from(container.querySelectorAll<HTMLElement>(".guide-card"));
    expect(cards).toHaveLength(guideEntries.length);
    expect(cards).toHaveLength(8);
    expect(cards.map((card) => card.querySelector("h3")?.textContent)).toEqual(
      guideEntries.map((guide) => guide.title),
    );

    const publishedLinks = cards.filter((card) => card.tagName === "A");
    expect(publishedLinks.map((card) => card.getAttribute("href"))).toEqual([
      "/guide/beginner",
      "/demo",
      "/guide/how-to-clean",
      "/guide/painting",
      "/guide/how-to-sell-devices",
      "/guide/customize-display",
      "/system-requirements",
      "/guide/missing-joystick",
    ]);
    expect(publishedLinks).toHaveLength(8);
    expect(cards.filter((card) => card.tagName === "DIV")).toHaveLength(0);
    expect(container).not.toHaveTextContent("Coming next");
  });

  it("ends with the exact evidence policy note", () => {
    const { container } = render(<GuidePage />);

    const aside = container.querySelector("main aside.evidence-note");
    expect(aside).toBeInTheDocument();
    expect(aside).toBe(container.querySelector("main")?.lastElementChild);
    expect(within(aside as HTMLElement).getByText("Our content policy", {
      selector: "strong",
    })).toBeInTheDocument();
    expect(within(aside as HTMLElement).getByText(
      "Official sources establish game facts. Full gameplay can support visible actions. Player reports are labeled as reports and never presented as guaranteed fixes.",
      { selector: "p" },
    )).toBeInTheDocument();
  });

  it("provides a target for the Header repair anchor and defines every internal href", () => {
    const { container } = render(
      <>
        <SiteHeader />
        <GuidePage />
      </>,
    );

    const repairLink = screen.getByRole("link", { name: "Repair & Cleaning" });
    expect(repairLink).toHaveAttribute("href", "/guide#repair-cleaning");
    expect(container.querySelector("#repair-cleaning")).toBeInTheDocument();

    const knownInternalRoutes = new Set(
      Object.values(routes).map((route) =>
        route === "/" ? route : route.replace(/\/$/, ""),
      ),
    );
    const internalLinks = Array.from(container.querySelectorAll<HTMLAnchorElement>('a[href^="/"]'));
    for (const link of internalLinks) {
      const [path, fragment] = link.getAttribute("href")!.split("#");
      expect(knownInternalRoutes.has(path || "/")).toBe(true);
      if (fragment) {
        expect(container.querySelector(`#${fragment}`)).toBeInTheDocument();
      }
    }
  });
});
