import { readFileSync } from "node:fs";
import { join } from "node:path";
import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import CleaningPage, { metadata } from "@/app/guide/how-to-clean/page";
import { pageSeo, routes } from "@/data/site";
import { absoluteUrl } from "@/lib/structured-data";

vi.mock("@/content/how-to-clean.mdx", () => ({
  default: () => (
    <>
      <h2 id="how-cleaning-works-in-restory">How Cleaning Works in ReStory</h2>
      <h2 id="cleaning-the-first-pokia-device">Cleaning the First Pokia Device</h2>
      <h2 id="using-the-correct-workbench-area">Using the Correct Workbench Area</h2>
      <h2 id="why-dirt-is-not-disappearing">Why Dirt Is Not Disappearing</h2>
      <h2 id="cleaning-troubleshooting-checklist">Cleaning Troubleshooting Checklist</h2>
      <h2 id="sources-and-evidence-notes">Sources and Evidence Notes</h2>
    </>
  ),
}));

afterEach(cleanup);

const expectedFaq = [
  {
    question: "Why can I hear cleaning but the dirt stays visible?",
    answer:
      "The part may not be fully engaged, the wrong object may be selected, the input may not be registering, or the interface may be stuck. Player reports do not establish one universal cause or fix.",
  },
  {
    question: "Is the cleaning cup on the upper-right of the workbench?",
    answer:
      "A player-verified reply identifies the cup on the upper-right as the cleaning area. Treat that as a gameplay clue, not a permanent official control description.",
  },
  {
    question: "Should I reinstall the game immediately?",
    answer:
      "No. First check the selected part and cleaning area, re-enter the interaction, reload the current session, and restart the game before considering a reinstall.",
  },
] as const;

describe("cleaning page metadata", () => {
  it("uses the exact cleaning SEO fields without a title template", () => {
    expect(metadata).toEqual({
      title: pageSeo.cleaning.title,
      description: pageSeo.cleaning.description,
      alternates: { canonical: routes.cleaning },
      openGraph: {
        title: pageSeo.cleaning.title,
        description: pageSeo.cleaning.description,
        type: "article",
        url: routes.cleaning,
      },
    });
    expect(metadata.title).toBe("How to Clean Items in ReStory — First Device Guide");
  });
});

describe("CleaningPage", () => {
  it("renders the semantic hero and exactly one H1 inside main", () => {
    const { container } = render(<CleaningPage />);

    const main = container.querySelector("main#main-content");
    expect(main).toBeInTheDocument();
    const h1s = within(main as HTMLElement).getAllByRole("heading", { level: 1 });
    expect(h1s).toHaveLength(1);
    expect(h1s[0]).toHaveTextContent("How to Clean Items in ReStory");

    const hero = container.querySelector("header.page-hero");
    expect(hero).toBeInTheDocument();
    expect(
      within(hero as HTMLElement).getByText(
        "Repair & Cleaning · Evidence reviewed Aug 10, 2026",
        { selector: ".eyebrow" },
      ),
    ).toBeInTheDocument();
    expect(
      within(hero as HTMLElement).getByText(
        "Move the dirty component into the correct cleaning interaction, then use the scrubbing action. If dirt does not change, verify the part, station, input, and session before treating it as a bug.",
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
    expect(within(breadcrumbs).getByRole("link", { name: "Guides" })).toHaveAttribute(
      "href",
      "/guide",
    );
    expect(within(breadcrumbs).getByText("How to Clean")).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  it("uses the required article shell and sticky table of contents targets", () => {
    const { container } = render(<CleaningPage />);

    expect(container.querySelector("div.shell.article-shell > article.article")).toBeInTheDocument();
    expect(container.querySelector("div.shell.article-shell > aside.article-aside")).toBeInTheDocument();
    const aside = container.querySelector("aside.article-aside") as HTMLElement;
    expect(within(aside).getByRole("heading", { level: 2 })).toHaveTextContent(
      "On this page",
    );

    const expectedHrefs = [
      "#how-cleaning-works-in-restory",
      "#cleaning-the-first-pokia-device",
      "#using-the-correct-workbench-area",
      "#why-dirt-is-not-disappearing",
      "#cleaning-troubleshooting-checklist",
      "#frequently-asked-questions",
    ];
    expect(
      within(aside)
        .getAllByRole("link")
        .map((link) => link.getAttribute("href")),
    ).toEqual(expectedHrefs);

    expect(
      screen.getByRole("link", { name: "Back to all guides" }),
    ).toHaveAttribute("href", "/guide");
  });

  it("injects parseable Article, BreadcrumbList, and FAQPage data", () => {
    const { container } = render(<CleaningPage />);
    const schemas = Array.from(
      container.querySelectorAll<HTMLScriptElement>('script[type="application/ld+json"]'),
    ).map((script) => JSON.parse(script.textContent ?? "{}"));

    expect(schemas).toHaveLength(3);
    expect(schemas.find((schema) => schema["@type"] === "Article")).toEqual({
      "@context": "https://schema.org",
      "@type": "Article",
      headline: pageSeo.cleaning.h1,
      description: pageSeo.cleaning.description,
      dateModified: "2026-08-10",
      author: {
        "@type": "Organization",
        name: "ReStory Wiki",
      },
      mainEntityOfPage: absoluteUrl(routes.cleaning),
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
        {
          "@type": "ListItem",
          position: 3,
          name: "How to Clean",
          item: absoluteUrl(routes.cleaning),
        },
      ],
    });
    expect(schemas.find((schema) => schema["@type"] === "FAQPage")).toEqual({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: expectedFaq.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: item.answer,
        },
      })),
    });
  });

  it("keeps all visible FAQ questions and answers synchronized with schema", () => {
    const { container } = render(<CleaningPage />);
    const faqHeading = screen.getByRole("heading", {
      level: 2,
      name: "Frequently Asked Questions",
    });
    expect(faqHeading).toHaveAttribute("id", "frequently-asked-questions");

    const faqSchema = Array.from(
      container.querySelectorAll<HTMLScriptElement>('script[type="application/ld+json"]'),
    )
      .map((script) => JSON.parse(script.textContent ?? "{}"))
      .find((schema) => schema["@type"] === "FAQPage");

    for (const item of faqSchema.mainEntity) {
      expect(screen.getByText(item.name)).toBeInTheDocument();
      expect(screen.getByText(item.acceptedAnswer.text)).toBeInTheDocument();
    }
  });
});

describe("cleaning MDX content contract", () => {
  const mdx = readFileSync(join(process.cwd(), "src/content/how-to-clean.mdx"), "utf8");

  it("contains no H1 and preserves the required H2 and H3 hierarchy", () => {
    expect(mdx).not.toMatch(/^#\s+/m);
    expect(Array.from(mdx.matchAll(/^##\s+(.+)$/gm), (match) => match[1])).toEqual([
      "How Cleaning Works in ReStory",
      "Cleaning the First Pokia Device",
      "Using the Correct Workbench Area",
      "Why Dirt Is Not Disappearing",
      "Cleaning Troubleshooting Checklist",
      "Sources and Evidence Notes",
    ]);
    expect(Array.from(mdx.matchAll(/^###\s+(.+)$/gm), (match) => match[1])).toEqual([
      "The part is near the station but not engaged",
      "The wrong object is selected",
      "The input is not registering correctly",
      "The current session may be stuck",
    ]);
  });

  it("includes the labeled quick answer and exactly eight checklist items", () => {
    expect(mdx).toContain('<div className="quick-answer">');
    expect(mdx).toContain(
      "Remove the dirty part, move it into the cleaning area by the cup on the upper-right of the workbench, enter the cleaning interaction, and use the scrubbing action.",
    );
    expect(mdx).toContain("player clue");
    expect(mdx).toContain("not a fixed official control instruction");

    const checklist = mdx
      .split("## Cleaning Troubleshooting Checklist")[1]
      ?.split("## Sources and Evidence Notes")[0];
    expect(checklist).toBeDefined();
    expect(checklist?.match(/^\d+\.\s+/gm)).toHaveLength(8);
  });

  it("uses all three required sources with explicit evidence limits", () => {
    expect(mdx).toContain(
      "https://store.steampowered.com/app/3812600/ReStory_Chill_Electronic_Repairs/",
    );
    expect(mdx).toContain(
      "https://steamcommunity.com/app/3812600/discussions/1/684114096137749161/",
    );
    expect(mdx).toContain(
      "https://steamcommunity.com/app/3812600/discussions/1/",
    );
    expect(mdx).toContain("core repair loop");
    expect(mdx).toContain("does not establish a universal fix");
    expect(mdx).toContain("Last evidence review: Aug 10, 2026");
    expect(mdx).toContain("major game update");
  });

  it("stays within the editorial word-count range and avoids invented certainty", () => {
    const prose = mdx
      .replace(/https?:\/\/\S+/g, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/[#[\]()*_`>-]/g, " ");
    const words = prose.match(/[A-Za-z0-9]+(?:['’][A-Za-z0-9]+)?/g) ?? [];
    expect(words.length).toBeGreaterThanOrEqual(900);
    expect(words.length).toBeLessThanOrEqual(1200);
    expect(mdx).not.toMatch(/guarantee(?:d|s)?/i);
    expect(mdx).not.toMatch(/official button name/i);
  });
});
