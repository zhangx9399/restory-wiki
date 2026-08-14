import { readFileSync } from "node:fs";
import { join } from "node:path";
import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import DemoPage, { metadata } from "@/app/demo/page";
import { pageSeo, routes } from "@/data/site";
import { absoluteUrl } from "@/lib/structured-data";

vi.mock("@/content/demo.mdx", () => ({
  default: () => (
    <>
      <div className="quick-answer">Quick answer</div>
      <h2 id="where-to-download-the-restory-demo">
        Where to Download the ReStory Demo
      </h2>
      <h2 id="what-the-demo-includes">What the Demo Includes</h2>
      <h2 id="restory-demo-vs-full-game">ReStory Demo vs Full Game</h2>
      <h2 id="does-demo-progress-carry-over">
        Does Demo Progress Carry Over?
      </h2>
      <h2 id="demo-requirements-and-known-limits">
        Demo Requirements and Known Limits
      </h2>
      <h2 id="frequently-asked-questions">Frequently Asked Questions</h2>
      <div className="faq-list">
        <details>
          <summary>Where can I download the ReStory demo?</summary>
          <p>
            Use the separate ReStory demo listing on Steam, App ID 4146680. Check
            the live Steam page before downloading because availability can change.
          </p>
        </details>
        <details>
          <summary>What is different in the full game?</summary>
          <p>
            Official launch information describes more devices, characters, tool
            upgrades, storage, shelves, wall customization, and decorations in the
            full release.
          </p>
        </details>
        <details>
          <summary>Does ReStory demo progress carry over?</summary>
          <p>
            No equally authoritative official source was found for save transfer. A
            player report says their demo save did not transfer, so start the full
            game expecting that transfer may not be available and check current
            official guidance.
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
    question: "Where can I download the ReStory demo?",
    answer:
      "Use the separate ReStory demo listing on Steam, App ID 4146680. Check the live Steam page before downloading because availability can change.",
  },
  {
    question: "What is different in the full game?",
    answer:
      "Official launch information describes more devices, characters, tool upgrades, storage, shelves, wall customization, and decorations in the full release.",
  },
  {
    question: "Does ReStory demo progress carry over?",
    answer:
      "No equally authoritative official source was found for save transfer. A player report says their demo save did not transfer, so start the full game expecting that transfer may not be available and check current official guidance.",
  },
] as const;

const h2Entries = [
  ["Where to Download the ReStory Demo", "#where-to-download-the-restory-demo"],
  ["What the Demo Includes", "#what-the-demo-includes"],
  ["ReStory Demo vs Full Game", "#restory-demo-vs-full-game"],
  ["Does Demo Progress Carry Over?", "#does-demo-progress-carry-over"],
  [
    "Demo Requirements and Known Limits",
    "#demo-requirements-and-known-limits",
  ],
  ["Frequently Asked Questions", "#frequently-asked-questions"],
  ["Sources and Evidence Notes", "#sources-and-evidence-notes"],
] as const;

describe("demo page metadata", () => {
  it("uses the exact demo SEO fields and canonical route", () => {
    expect(metadata).toEqual({
      title: pageSeo.demo.title,
      description: pageSeo.demo.description,
      alternates: { canonical: routes.demo },
      openGraph: {
        title: pageSeo.demo.title,
        description: pageSeo.demo.description,
        type: "article",
        url: routes.demo,
      },
    });
    expect(metadata.title).toBe(
      "ReStory Demo Guide — Download, Content & Full Game",
    );
    expect(metadata.description).toBe(
      "Learn where to download the ReStory demo, what it includes, how it differs from the full game, and what is known about demo save progress.",
    );
    expect(Object.values(routes)).toContain("/demo/");
  });
});

describe("DemoPage", () => {
  it("renders one H1, breadcrumbs, and the evidence-reviewed hero", () => {
    const { container } = render(<DemoPage />);
    const main = container.querySelector("main#main-content");
    expect(main).toBeInTheDocument();

    const h1s = within(main as HTMLElement).getAllByRole("heading", { level: 1 });
    expect(h1s).toHaveLength(1);
    expect(h1s[0]).toHaveTextContent("ReStory Demo Guide");

    const hero = container.querySelector("header.page-hero") as HTMLElement;
    expect(hero).toBeInTheDocument();
    expect(
      within(hero).getByText("Demo Guide · Evidence reviewed Aug 14, 2026", {
        selector: ".eyebrow",
      }),
    ).toBeInTheDocument();

    const breadcrumbs = within(hero).getByRole("navigation", {
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
    expect(within(breadcrumbs).getByText("Demo Guide")).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  it("reuses the article shell and exposes exact TOC and related targets", () => {
    const { container } = render(<DemoPage />);
    expect(
      container.querySelector("div.shell.article-shell > article.article"),
    ).toBeInTheDocument();
    const aside = container.querySelector(
      "div.shell.article-shell > aside.article-aside",
    ) as HTMLElement;
    expect(aside).toBeInTheDocument();
    expect(within(aside).getByRole("heading", { level: 2 })).toHaveTextContent(
      "On this page",
    );
    expect(
      within(aside)
        .getAllByRole("link")
        .map((link) => link.getAttribute("href")),
    ).toEqual(h2Entries.map(([, href]) => href));

    expect(screen.getByRole("link", { name: "All ReStory guides" })).toHaveAttribute(
      "href",
      "/guide",
    );
    expect(
      screen.getByRole("link", { name: "System requirements" }),
    ).toHaveAttribute("href", "/system-requirements");
    expect(screen.getByRole("link", { name: "Cleaning guide" })).toHaveAttribute(
      "href",
      "/guide/how-to-clean",
    );
    const pageSource = readFileSync(
      join(process.cwd(), "src/app/demo/page.tsx"),
      "utf8",
    );
    expect(pageSource).toContain("href={routes.systemRequirements}");
    expect(pageSource).not.toContain('href="/system-requirements/"');
  });

  it("injects exactly Article, BreadcrumbList, and FAQPage schemas", () => {
    const { container } = render(<DemoPage />);
    const schemas = Array.from(
      container.querySelectorAll<HTMLScriptElement>(
        'script[type="application/ld+json"]',
      ),
    ).map((script) => JSON.parse(script.textContent ?? "{}"));

    expect(schemas).toHaveLength(3);
    expect(schemas.find((schema) => schema["@type"] === "Article")).toEqual({
      "@context": "https://schema.org",
      "@type": "Article",
      headline: pageSeo.demo.h1,
      description: pageSeo.demo.description,
      dateModified: "2026-08-14",
      author: {
        "@type": "Organization",
        name: "ReStory Wiki",
      },
      mainEntityOfPage: absoluteUrl(routes.demo),
    });
    expect(
      schemas.find((schema) => schema["@type"] === "BreadcrumbList"),
    ).toEqual({
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
          name: "Demo Guide",
          item: absoluteUrl(routes.demo),
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

  it("keeps each visible FAQ entry synchronized with FAQPage schema", () => {
    const { container } = render(<DemoPage />);
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
});

describe("demo MDX content contract", () => {
  const mdxPath = join(process.cwd(), "src/content/demo.mdx");
  const pagePath = join(process.cwd(), "src/app/demo/page.tsx");
  const dataPath = join(process.cwd(), "src/data/demo.ts");

  it("uses the required H2 order without adding an MDX H1", () => {
    const mdx = readFileSync(mdxPath, "utf8");
    expect(mdx).not.toMatch(/^#\s+/m);
    expect(Array.from(mdx.matchAll(/^##\s+(.+)$/gm), (match) => match[1])).toEqual(
      h2Entries.map(([heading]) => heading),
    );
  });

  it("puts exactly one Quick Answer before the first H2", () => {
    const mdx = readFileSync(mdxPath, "utf8");
    expect(mdx.match(/<div className="quick-answer">/g)).toHaveLength(1);
    expect(mdx).toMatch(/\*\*Quick answer:\*\*/);
    expect(mdx.indexOf('<div className="quick-answer">')).toBeLessThan(
      mdx.indexOf("## Where to Download the ReStory Demo"),
    );
    const quickAnswer = mdx.split("## Where to Download the ReStory Demo")[0];
    expect(quickAnswer).toMatch(/separate Steam (?:listing|page)/i);
    expect(quickAnswer).toMatch(/save transfer is not officially confirmed/i);
  });

  it("uses shared FAQ data for both visible content and schema", () => {
    const mdx = readFileSync(mdxPath, "utf8");
    const pageSource = readFileSync(pagePath, "utf8");
    const dataSource = readFileSync(dataPath, "utf8");

    expect(mdx).toContain('import { FaqList } from "@/components/faq-list";');
    expect(mdx).toContain('import { demoFaqItems } from "@/data/demo";');
    expect(mdx).toContain("<FaqList items={demoFaqItems} />");
    expect(pageSource).toContain('import { demoFaqItems } from "@/data/demo";');
    expect(pageSource).not.toContain("const demoFaqItems =");
    expect(dataSource).toContain('question: "Where can I download the ReStory demo?"');
    expect(dataSource).toContain('question: "What is different in the full game?"');
    expect(dataSource).toContain(
      'question: "Does ReStory demo progress carry over?"',
    );
  });

  it("labels all three required sources and their evidence limits", () => {
    const mdx = readFileSync(mdxPath, "utf8");
    expect(mdx).toContain("https://store.steampowered.com/app/4146680");
    expect(mdx).toContain("https://steamcommunity.com/app/3812600/allnews/");
    expect(mdx).toContain(
      "https://www.reddit.com/r/Games/comments/1vh8gz7/restory_chill_electronics_repairs_review_thread/",
    );
    expect(mdx.match(/\*\*(?:Official source|Player report) \u2014/g)).toHaveLength(3);
    expect(mdx).toContain("Last evidence review: Aug 14, 2026");
    expect(mdx).toMatch(/no equally authoritative official confirmation/i);
  });

  it("stays within 900–1,300 cleaned English words without unsafe promises", () => {
    const mdx = readFileSync(mdxPath, "utf8");
    const cleaned = mdx
      .replace(/^import\s.+;$/gm, " ")
      .replace(/https?:\/\/\S+/g, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/\[[^\]]+\]\([^)]*\)/g, (match) => match.replace(/\]\([^)]*\)/, ""))
      .replace(/[#[\]()*_`>-]/g, " ");
    const words = cleaned.match(/[A-Za-z0-9]+(?:['’][A-Za-z0-9]+)?/g) ?? [];

    expect(words.length).toBeGreaterThanOrEqual(900);
    expect(words.length).toBeLessThanOrEqual(1300);
    expect(`${mdx}\n${readFileSync(dataPath, "utf8")}`).not.toMatch(
      /guarantee(?:d|s)?|demo (?:lasts|length is)|save (?:will|does) carry over/i,
    );
  });
});
