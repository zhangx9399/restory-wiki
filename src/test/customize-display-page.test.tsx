import { readFileSync } from "node:fs";
import { join } from "node:path";
import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import CustomizeDisplayPage, {
  metadata,
} from "@/app/guide/customize-display/page";
import { pageSeo, routes } from "@/data/site";
import { absoluteUrl } from "@/lib/structured-data";

vi.mock("@/content/customize-display.mdx", () => ({
  default: () => (
    <>
      <div className="quick-answer">Quick answer</div>
      <h2 id="shop-customization-vs-gadget-painting">
        Shop Customization vs Gadget Painting
      </h2>
      <h2 id="what-you-can-customize">What You Can Customize</h2>
      <h2 id="walls-shelves-and-storage">Walls, Shelves, and Storage</h2>
      <h2 id="adding-and-arranging-decorations">
        Adding and Arranging Decorations
      </h2>
      <h2 id="customization-tips-and-version-notes">
        Customization Tips and Version Notes
      </h2>
      <h2 id="frequently-asked-questions">Frequently Asked Questions</h2>
      <div className="faq-list">
        <details>
          <summary>How is shop customization different from gadget painting?</summary>
          <p>
            Shop customization changes the room around your work: wall colors,
            shelf styles, storage shelving, and decorations. Gadget painting changes
            the devices themselves with the separately documented airbrush and color
            palettes.
          </p>
        </details>
        <details>
          <summary>Which shop customization elements are officially confirmed?</summary>
          <p>
            Official Steam news confirms paintable walls, changeable shelf styles,
            additional storage shelves for licenses, and placeable decorations.
          </p>
        </details>
        <details>
          <summary>When does shop customization unlock?</summary>
          <p>
            The current sources do not establish the exact unlock level or permanent
            menu path. Follow the current in-game interface and recheck official news
            after updates instead of relying on an unverified sequence.
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
    question: "How is shop customization different from gadget painting?",
    answer:
      "Shop customization changes the room around your work: wall colors, shelf styles, storage shelving, and decorations. Gadget painting changes the devices themselves with the separately documented airbrush and color palettes.",
  },
  {
    question: "Which shop customization elements are officially confirmed?",
    answer:
      "Official Steam news confirms paintable walls, changeable shelf styles, additional storage shelves for licenses, and placeable decorations.",
  },
  {
    question: "When does shop customization unlock?",
    answer:
      "The current sources do not establish the exact unlock level or permanent menu path. Follow the current in-game interface and recheck official news after updates instead of relying on an unverified sequence.",
  },
] as const;

const expectedHeadings = [
  "Shop Customization vs Gadget Painting",
  "What You Can Customize",
  "Walls, Shelves, and Storage",
  "Adding and Arranging Decorations",
  "Customization Tips and Version Notes",
  "Frequently Asked Questions",
  "Sources and Evidence Notes",
] as const;

describe("customize display page metadata", () => {
  it("uses the exact customization SEO fields and canonical route", () => {
    expect(metadata).toEqual({
      title: pageSeo.customizeDisplay.title,
      description: pageSeo.customizeDisplay.description,
      alternates: { canonical: routes.customizeDisplay },
      openGraph: {
        title: pageSeo.customizeDisplay.title,
        description: pageSeo.customizeDisplay.description,
        type: "article",
        url: routes.customizeDisplay,
      },
    });
    expect(metadata.title).toBe("How to Customize Your Shop in ReStory");
    expect(metadata.description).toBe(
      "Understand ReStory shop customization, including walls, shelf styles, storage, decorations, and how shop changes differ from gadget painting.",
    );
    expect(routes.customizeDisplay).toBe("/guide/customize-display/");
  });
});

describe("CustomizeDisplayPage", () => {
  it("renders the cleaning guide article shell, semantic hero, and breadcrumbs", () => {
    const { container } = render(<CustomizeDisplayPage />);

    const main = container.querySelector("main#main-content");
    expect(main).toBeInTheDocument();
    const h1s = within(main as HTMLElement).getAllByRole("heading", { level: 1 });
    expect(h1s).toHaveLength(1);
    expect(h1s[0]).toHaveTextContent("How to Customize Your Shop in ReStory");
    expect(
      container.querySelector("div.shell.article-shell > article.article"),
    ).toBeInTheDocument();
    expect(
      container.querySelector("div.shell.article-shell > aside.article-aside"),
    ).toBeInTheDocument();

    const hero = container.querySelector("header.page-hero") as HTMLElement;
    expect(
      within(hero).getByText(
        "Shop & Customization · Evidence reviewed Aug 14, 2026",
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
    expect(within(breadcrumbs).getByRole("link", { name: "Guide" })).toHaveAttribute(
      "href",
      "/guide",
    );
    expect(within(breadcrumbs).getByText("Customize Your Shop")).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  it("renders the exact table of contents and related guide links", () => {
    const { container } = render(<CustomizeDisplayPage />);
    const aside = container.querySelector("aside.article-aside") as HTMLElement;
    expect(within(aside).getByRole("heading", { level: 2 })).toHaveTextContent(
      "On this page",
    );
    expect(
      within(aside)
        .getAllByRole("link")
        .map((link) => link.getAttribute("href")),
    ).toEqual([
      "#shop-customization-vs-gadget-painting",
      "#what-you-can-customize",
      "#walls-shelves-and-storage",
      "#adding-and-arranging-decorations",
      "#customization-tips-and-version-notes",
      "#frequently-asked-questions",
      "#sources-and-evidence-notes",
    ]);
    expect(screen.getByRole("link", { name: "Cleaning guide" })).toHaveAttribute(
      "href",
      "/guide/how-to-clean",
    );
    expect(screen.getByRole("link", { name: "Back to all guides" })).toHaveAttribute(
      "href",
      "/guide",
    );
  });

  it("injects Article, BreadcrumbList, and FAQPage data", () => {
    const { container } = render(<CustomizeDisplayPage />);
    const schemas = Array.from(
      container.querySelectorAll<HTMLScriptElement>(
        'script[type="application/ld+json"]',
      ),
    ).map((script) => JSON.parse(script.textContent ?? "{}"));

    expect(schemas).toHaveLength(3);
    expect(schemas.find((schema) => schema["@type"] === "Article")).toEqual({
      "@context": "https://schema.org",
      "@type": "Article",
      headline: pageSeo.customizeDisplay.h1,
      description: pageSeo.customizeDisplay.description,
      dateModified: "2026-08-14",
      author: { "@type": "Organization", name: "ReStory Wiki" },
      mainEntityOfPage: absoluteUrl(routes.customizeDisplay),
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
          name: "Customize Your Shop",
          item: absoluteUrl(routes.customizeDisplay),
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

  it("keeps every visible FAQ synchronized with shared schema data", () => {
    const { container } = render(<CustomizeDisplayPage />);
    const faq = Array.from(
      container.querySelectorAll<HTMLScriptElement>(
        'script[type="application/ld+json"]',
      ),
    )
      .map((script) => JSON.parse(script.textContent ?? "{}"))
      .find((schema) => schema["@type"] === "FAQPage");

    expect(faq.mainEntity).toHaveLength(3);
    for (const item of faq.mainEntity) {
      expect(screen.getByText(item.name)).toBeInTheDocument();
      expect(screen.getByText(item.acceptedAnswer.text)).toBeInTheDocument();
    }
  });
});

describe("customization MDX content contract", () => {
  const mdx = readFileSync(
    join(process.cwd(), "src/content/customize-display.mdx"),
    "utf8",
  );
  const pageSource = readFileSync(
    join(process.cwd(), "src/app/guide/customize-display/page.tsx"),
    "utf8",
  );
  const faqData = readFileSync(
    join(process.cwd(), "src/data/customize-display.ts"),
    "utf8",
  );

  it("keeps Quick Answer before the exact H2 sequence and has no MDX H1", () => {
    expect(mdx).not.toMatch(/^#\s+/m);
    expect(Array.from(mdx.matchAll(/^##\s+(.+)$/gm), (match) => match[1])).toEqual(
      expectedHeadings,
    );
    expect(mdx).toContain('<div className="quick-answer">');
    expect(mdx).toMatch(/\*\*Quick answer:\*\*/i);
    expect(mdx.indexOf('<div className="quick-answer">')).toBeLessThan(
      mdx.indexOf("## Shop Customization vs Gadget Painting"),
    );
  });

  it("contains 900 to 1300 words of real English body content", () => {
    const prose = mdx
      .replace(/^import.+$/gm, "")
      .replace(/https?:\/\/\S+/g, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/[#*_[\]()`>-]/g, " ");
    const words = prose.match(/[A-Za-z0-9]+(?:['’-][A-Za-z0-9]+)*/g) ?? [];
    expect(words.length).toBeGreaterThanOrEqual(900);
    expect(words.length).toBeLessThanOrEqual(1300);
  });

  it("uses one shared three-item FAQ source for visible content and schema", () => {
    expect(mdx).toContain(
      'import { customizeDisplayFaqItems } from "@/data/customize-display";',
    );
    expect(mdx).toContain("<FaqList items={customizeDisplayFaqItems} />");
    expect(pageSource).toContain(
      'import { customizeDisplayFaqItems } from "@/data/customize-display";',
    );
    expect(pageSource).not.toContain("const customizeDisplayFaqItems =");
    expect(faqData.match(/question:/g)).toHaveLength(3);
    expect(faqData).toContain(
      "current sources do not establish the exact unlock level or permanent menu path",
    );
  });

  it("limits factual customization claims to the four official elements", () => {
    expect(mdx).toMatch(/official Steam news[^.]*paint(?:able| the) walls/i);
    expect(mdx).toMatch(/official Steam news[^.]*shelf (?:styles|appearance)/i);
    expect(mdx).toMatch(/storage shel(?:f|ves|ving)[^.]*licenses/i);
    expect(mdx).toMatch(/official Steam news[^.]*decorations/i);
    expect(mdx).toMatch(/airbrush[^.]*color palettes[^.]*gadgets|gadgets[^.]*airbrush[^.]*color palettes/i);
    expect(mdx).not.toMatch(/floor styles|counter styles|lighting styles|window styles/i);
  });

  it("cites all required sources and limits the gameplay video to corroboration", () => {
    expect(mdx).toContain("https://steamcommunity.com/app/3812600/");
    expect(mdx).toContain("https://steamcommunity.com/app/3812600/allnews/");
    expect(mdx).toContain("https://www.youtube.com/watch?v=x6lq9h_5Xa0");
    const videoParagraph = mdx
      .split(/\n\s*\n/)
      .find((paragraph) => paragraph.includes("x6lq9h_5Xa0"));
    expect(videoParagraph).toMatch(/visible gameplay corroboration/i);
    expect(videoParagraph).toMatch(/not evidence/i);
    expect(videoParagraph).toMatch(/controls|menu paths|unlock conditions/i);
    expect(mdx).toContain("Last evidence review: Aug 14, 2026");
  });

  it("rejects risky instructions without a limitation in the same paragraph", () => {
    const risky = /\bpress\b|\bclick\b|menu path|unlock level|available from level/i;
    const paragraphs = mdx.split(/\n\s*\n/).filter((paragraph) => risky.test(paragraph));
    expect(paragraphs.length).toBeGreaterThan(0);
    for (const paragraph of paragraphs) {
      expect(paragraph, paragraph).toMatch(
        /current sources do not establish|not documented|not evidence|does not provide/i,
      );
    }
  });
});
