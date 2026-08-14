import { readFileSync } from "node:fs";
import { join } from "node:path";
import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import PaintingPage, { metadata } from "@/app/guide/painting/page";
import { pageSeo, routes } from "@/data/site";
import { absoluteUrl } from "@/lib/structured-data";

vi.mock("@/content/painting.mdx", () => ({
  default: () => (
    <>
      <div className="quick-answer">Quick answer</div>
      <h2 id="what-painting-does-in-restory">What Painting Does in ReStory</h2>
      <h2 id="getting-the-airbrush-and-color-palettes">
        Getting the Airbrush and Color Palettes
      </h2>
      <h2 id="painting-a-customer-device">Painting a Customer Device</h2>
      <h2 id="pattern-orders-and-custom-designs">
        Pattern Orders and Custom Designs
      </h2>
      <h2 id="known-limits-and-unconfirmed-details">
        Known Limits and Unconfirmed Details
      </h2>
      <h2 id="frequently-asked-questions">Frequently Asked Questions</h2>
      <div className="faq-list">
        <details>
          <summary>Where do the Airbrush and color palettes come from?</summary>
          <p>
            Official ReStory community information says both are purchased from the
            in-game shop and are used to change a device&apos;s appearance. Current
            sources do not establish an exact unlock level or permanent menu path.
          </p>
        </details>
        <details>
          <summary>Is device painting the same as shop customization?</summary>
          <p>
            No. Device painting changes a customer device&apos;s appearance, while
            shop customization changes the shop display itself. They are related
            creative systems, not the same task.
          </p>
        </details>
        <details>
          <summary>Can this guide guarantee a scoring formula for painting orders?</summary>
          <p>
            No. No reliable source supports a universal scoring formula for painting
            or pattern orders, so follow the current order brief and visible feedback
            without treating any player theory as guaranteed.
          </p>
        </details>
      </div>
      <h2 id="sources-and-evidence-notes">Sources and Evidence Notes</h2>
    </>
  ),
}));

afterEach(cleanup);

const expectedFaq = [
  {
    question: "Where do the Airbrush and color palettes come from?",
    answer:
      "Official ReStory community information says both are purchased from the in-game shop and are used to change a device's appearance. Current sources do not establish an exact unlock level or permanent menu path.",
  },
  {
    question: "Is device painting the same as shop customization?",
    answer:
      "No. Device painting changes a customer device's appearance, while shop customization changes the shop display itself. They are related creative systems, not the same task.",
  },
  {
    question: "Can this guide guarantee a scoring formula for painting orders?",
    answer:
      "No. No reliable source supports a universal scoring formula for painting or pattern orders, so follow the current order brief and visible feedback without treating any player theory as guaranteed.",
  },
] as const;

const h2Contract = [
  "What Painting Does in ReStory",
  "Getting the Airbrush and Color Palettes",
  "Painting a Customer Device",
  "Pattern Orders and Custom Designs",
  "Known Limits and Unconfirmed Details",
  "Frequently Asked Questions",
  "Sources and Evidence Notes",
] as const;

const tocHrefs = [
  "#what-painting-does-in-restory",
  "#getting-the-airbrush-and-color-palettes",
  "#painting-a-customer-device",
  "#pattern-orders-and-custom-designs",
  "#known-limits-and-unconfirmed-details",
  "#frequently-asked-questions",
  "#sources-and-evidence-notes",
] as const;

describe("painting page metadata", () => {
  it("uses the exact painting SEO fields and canonical route", () => {
    expect(metadata).toEqual({
      title: pageSeo.painting.title,
      description: pageSeo.painting.description,
      alternates: { canonical: routes.painting },
      openGraph: {
        title: pageSeo.painting.title,
        description: pageSeo.painting.description,
        type: "article",
        url: routes.painting,
      },
    });
    expect(metadata.title).toBe(
      "ReStory Painting Guide — Airbrush & Color Palettes",
    );
    expect(metadata.description).toBe(
      "Learn what the Airbrush and color palettes do in ReStory, how painting differs from shop customization, and which painting details remain unconfirmed.",
    );
  });
});

describe("PaintingPage", () => {
  it("renders the semantic hero, Guide breadcrumb, and exactly one H1", () => {
    const { container } = render(<PaintingPage />);
    const main = container.querySelector("main#main-content");

    expect(main).toBeInTheDocument();
    const h1s = within(main as HTMLElement).getAllByRole("heading", { level: 1 });
    expect(h1s).toHaveLength(1);
    expect(h1s[0]).toHaveTextContent("ReStory Painting Guide");

    const hero = container.querySelector("header.page-hero") as HTMLElement;
    expect(hero).toBeInTheDocument();
    expect(
      within(hero).getByText(
        "Painting & Customization · Evidence reviewed Aug 14, 2026",
        { selector: ".eyebrow" },
      ),
    ).toBeInTheDocument();

    const breadcrumbs = within(hero).getByRole("navigation", {
      name: "Breadcrumb",
    });
    expect(within(breadcrumbs).getByRole("link", { name: "Home" })).toHaveAttribute(
      "href",
      "/",
    );
    expect(
      within(breadcrumbs).getByRole("link", { name: "Guides" }),
    ).toHaveAttribute("href", "/guide");
    expect(within(breadcrumbs).getByText("Painting Guide")).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  it("reuses the article shell and points the TOC at seven unique real targets", () => {
    const { container } = render(<PaintingPage />);

    expect(
      container.querySelector("div.shell.article-shell > article.article"),
    ).toBeInTheDocument();
    const aside = container.querySelector("aside.article-aside") as HTMLElement;
    expect(aside).toBeInTheDocument();
    const links = within(aside).getAllByRole("link");
    expect(links.map((link) => link.getAttribute("href"))).toEqual(tocHrefs);
    expect(new Set(tocHrefs).size).toBe(tocHrefs.length);

    for (const href of tocHrefs) {
      expect(container.querySelectorAll(href)).toHaveLength(1);
    }
  });

  it("injects parseable Article, BreadcrumbList, and FAQPage data", () => {
    const { container } = render(<PaintingPage />);
    const schemas = Array.from(
      container.querySelectorAll<HTMLScriptElement>(
        'script[type="application/ld+json"]',
      ),
    ).map((script) => JSON.parse(script.textContent ?? "{}"));

    expect(schemas).toHaveLength(3);
    expect(schemas.find((schema) => schema["@type"] === "Article")).toEqual({
      "@context": "https://schema.org",
      "@type": "Article",
      headline: pageSeo.painting.h1,
      description: pageSeo.painting.description,
      dateModified: "2026-08-14",
      author: { "@type": "Organization", name: "ReStory Wiki" },
      mainEntityOfPage: absoluteUrl(routes.painting),
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
          name: "Guide",
          item: absoluteUrl(routes.guide),
        },
        {
          "@type": "ListItem",
          position: 3,
          name: "Painting Guide",
          item: absoluteUrl(routes.painting),
        },
      ],
    });
    expect(schemas.find((schema) => schema["@type"] === "FAQPage")).toEqual({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: expectedFaq.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: { "@type": "Answer", text: item.answer },
      })),
    });
  });

  it("keeps the three visible FAQ entries synchronized with FAQPage", () => {
    const { container } = render(<PaintingPage />);
    const faqSchema = Array.from(
      container.querySelectorAll<HTMLScriptElement>(
        'script[type="application/ld+json"]',
      ),
    )
      .map((script) => JSON.parse(script.textContent ?? "{}"))
      .find((schema) => schema["@type"] === "FAQPage");

    expect(faqSchema.mainEntity).toHaveLength(3);
    for (const item of faqSchema.mainEntity) {
      expect(screen.getByText(item.name)).toBeInTheDocument();
      expect(screen.getByText(item.acceptedAnswer.text)).toBeInTheDocument();
    }
  });

  it("links to Customize Display, Guide, and Cleaning", () => {
    render(<PaintingPage />);

    expect(screen.getByRole("link", { name: "Customize Display" })).toHaveAttribute(
      "href",
      "/guide/customize-display",
    );
    expect(screen.getByRole("link", { name: "Guide" })).toHaveAttribute(
      "href",
      "/guide",
    );
    expect(screen.getByRole("link", { name: "Cleaning" })).toHaveAttribute(
      "href",
      "/guide/how-to-clean",
    );
  });
});

describe("painting MDX content contract", () => {
  const mdx = readFileSync(
    join(process.cwd(), "src/content/painting.mdx"),
    "utf8",
  );
  const pageSource = readFileSync(
    join(process.cwd(), "src/app/guide/painting/page.tsx"),
    "utf8",
  );

  it("contains no H1 and preserves the exact seven-H2 order", () => {
    expect(mdx).not.toMatch(/^#\s+/m);
    expect(Array.from(mdx.matchAll(/^##\s+(.+)$/gm), (match) => match[1])).toEqual(
      h2Contract,
    );
  });

  it("places a labeled Quick Answer before the first H2", () => {
    expect(mdx).toContain('<div className="quick-answer">');
    expect(mdx).toMatch(/\*\*Quick answer:\*\*/);
    expect(mdx.indexOf('<div className="quick-answer">')).toBeLessThan(
      mdx.indexOf("## What Painting Does in ReStory"),
    );
  });

  it("renders FAQ from the same shared data used by the schema", () => {
    expect(mdx).toContain('import { FaqList } from "@/components/faq-list";');
    expect(mdx).toContain('import { paintingFaqItems } from "@/data/painting";');
    expect(mdx).toContain("<FaqList items={paintingFaqItems} />");
    expect(pageSource).toContain(
      'import { paintingFaqItems } from "@/data/painting";',
    );
    expect(pageSource).not.toContain("const paintingFaqItems =");
  });

  it("uses the three required sources and states their evidence grades and limits", () => {
    expect(mdx).toContain("https://steamcommunity.com/app/3812600/allnews/");
    expect(mdx).toContain("https://steamcommunity.com/app/3812600/");
    expect(mdx).toContain("https://www.youtube.com/watch?v=x6lq9h_5Xa0");
    expect(mdx).toMatch(/official (?:Steam )?community/i);
    expect(mdx).toMatch(/Demo[^.]*painting[^.]*community designs/i);
    expect(mdx).toContain("visible gameplay corroboration");
    expect(mdx).toContain("player discussion");
    expect(mdx).toMatch(/B-grade|Grade B/);
    expect(mdx).toMatch(/C-grade|Grade C/);
  });

  it("limits official claims to supported painting facts", () => {
    expect(mdx).toMatch(/Airbrush[^.]*color palettes[^.]*in-game shop/i);
    expect(mdx).toMatch(/Airbrush[^.]*device(?:'s)? appearance|device appearance[^.]*Airbrush/i);
    expect(mdx).not.toMatch(/official(?:ly)?[^.]*pattern order/i);
    expect(mdx).not.toMatch(/official(?:ly)?[^.]*scoring/i);
  });

  it("qualifies every risky implementation detail in the same paragraph", () => {
    const paragraphs = mdx.split(/\n\s*\n/).filter(Boolean);
    const riskyDetail =
      /\b(?:permanent button|menu path|unlock level|undo(?: method)?|paint coverage|paint consumption|color consumption|scoring formula)\b/i;
    const qualification =
      /\b(?:unconfirmed|not (?:officially )?confirmed|does not (?:confirm|document|establish)|no reliable source|unknown)\b/i;
    const riskyParagraphs = paragraphs.filter((paragraph) => riskyDetail.test(paragraph));

    expect(riskyParagraphs.length).toBeGreaterThanOrEqual(5);
    for (const paragraph of riskyParagraphs) {
      expect(paragraph, paragraph).toMatch(qualification);
    }
  });

  it("keeps pattern orders limited to B/C corroboration", () => {
    const patternSection = mdx
      .split("## Pattern Orders and Custom Designs")[1]
      ?.split("## Known Limits and Unconfirmed Details")[0];

    expect(patternSection).toMatch(/pattern orders?/i);
    expect(patternSection).toContain("visible gameplay corroboration");
    expect(patternSection).toContain("player discussion");
    expect(patternSection).toMatch(/does not (?:establish|confirm|prove)/i);
    expect(patternSection).toMatch(/controls?|scoring formula/i);
  });

  it("stays between 900 and 1,300 cleaned words", () => {
    const prose = mdx
      .replace(/^import .+;$/gm, " ")
      .replace(/https?:\/\/\S+/g, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
      .replace(/^[#*-]+\s*/gm, " ")
      .replace(/[#[\]()*_`>-]/g, " ");
    const words = prose.match(/[A-Za-z0-9]+(?:['’][A-Za-z0-9]+)?/g) ?? [];

    expect(words.length).toBeGreaterThanOrEqual(900);
    expect(words.length).toBeLessThanOrEqual(1300);
  });
});
