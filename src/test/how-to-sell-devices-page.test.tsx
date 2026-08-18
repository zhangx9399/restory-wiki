import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { compile, run } from "@mdx-js/mdx";
import { cleanup, render, screen, within } from "@testing-library/react";
import rehypeSlug from "rehype-slug";
import * as jsxRuntime from "react/jsx-runtime";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { FaqList } from "@/components/faq-list";

const featurePaths = [
  "src/data/how-to-sell-devices.ts",
  "src/content/how-to-sell-devices.mdx",
  "src/app/guide/how-to-sell-devices/page.tsx",
] as const;
const featureFilesExist = featurePaths.every((path) =>
  existsSync(join(process.cwd(), path)),
);

const h2Contract = [
  "How Device Selling Fits the Shop Loop",
  "Checking a Device Before Buying or Repairing",
  "Tracking Parts and Repair Costs",
  "Preparing a Device for Sale",
  "Comparing Cost, Condition, and Sale Value",
  "Selling Mistakes and Unconfirmed Mechanics",
  "A Safe Profit Checklist",
  "Frequently Asked Questions",
  "Sources and Evidence Notes",
] as const;

const tocHrefs = [
  "#how-device-selling-fits-the-shop-loop",
  "#checking-a-device-before-buying-or-repairing",
  "#tracking-parts-and-repair-costs",
  "#preparing-a-device-for-sale",
  "#comparing-cost-condition-and-sale-value",
  "#selling-mistakes-and-unconfirmed-mechanics",
  "#a-safe-profit-checklist",
  "#frequently-asked-questions",
  "#sources-and-evidence-notes",
] as const;

const expectedFaq = [
  {
    question: "How do I judge whether a device is worth selling?",
    answer:
      "Compare the device's likely sale value with every cost you can observe, including acquisition, replacement parts, and other displayed expenses. Leave a buffer for uncertainty because no universal profit calculation is officially confirmed.",
  },
  {
    question: "Can this guide guarantee a profit?",
    answer:
      "No. Marketplace balancing has changed across versions, and neither official store material nor the cited developer reply confirms a permanent pricing formula. Use current in-game values and treat player examples as reports only.",
  },
  {
    question: "What should I check before listing a repaired device?",
    answer:
      "Recheck assembly, visible condition, and any testing feedback available in your current build. Then confirm the displayed sale value against your recorded costs before you list the device.",
  },
] as const;

vi.mock("@/content/how-to-sell-devices.mdx", () => ({
  default: () => (
    <>
      <div className="quick-answer">Quick answer</div>
      {h2Contract.slice(0, 7).map((heading, index) => (
        <h2 id={tocHrefs[index].slice(1)} key={heading}>
          {heading}
        </h2>
      ))}
      <h2 id="frequently-asked-questions">Frequently Asked Questions</h2>
      <div className="faq-list">
        {expectedFaq.map((item) => (
          <details key={item.question}>
            <summary>{item.question}</summary>
            <p>{item.answer}</p>
          </details>
        ))}
      </div>
      <h2 id="sources-and-evidence-notes">Sources and Evidence Notes</h2>
    </>
  ),
}));

afterEach(cleanup);

describe("device selling feature files", () => {
  it("creates the route, content, and shared FAQ data modules", () => {
    expect(
      featurePaths.filter((path) => !existsSync(join(process.cwd(), path))),
    ).toEqual([]);
  });
});

describe.skipIf(!featureFilesExist)("device selling metadata and page shell", () => {
  let SellingPage: () => React.ReactNode;
  let metadata: Record<string, unknown>;
  let pageSeo: typeof import("@/data/site").pageSeo;
  let routes: typeof import("@/data/site").routes;

  beforeAll(async () => {
    const pageModule = await import("@/app/guide/how-to-sell-devices/page");
    const siteModule = await import("@/data/site");
    SellingPage = pageModule.default;
    metadata = pageModule.metadata as Record<string, unknown>;
    pageSeo = siteModule.pageSeo;
    routes = siteModule.routes;
  });

  it("uses exact unique SEO fields, canonical, and Open Graph metadata", () => {
    expect(routes.howToSellDevices).toBe("/guide/how-to-sell-devices/");
    expect(pageSeo.howToSellDevices).toEqual({
      path: "/guide/how-to-sell-devices/",
      title: "How to Sell Devices in ReStory — Safe Profit Guide",
      description:
        "Learn how to inspect, repair, price, and sell devices in ReStory while tracking costs, avoiding unsupported profit claims, and using evidence safely.",
      h1: "How to Sell Devices in ReStory",
    });
    expect(metadata).toEqual({
      title: pageSeo.howToSellDevices.title,
      description: pageSeo.howToSellDevices.description,
      alternates: { canonical: routes.howToSellDevices },
      openGraph: {
        title: pageSeo.howToSellDevices.title,
        description: pageSeo.howToSellDevices.description,
        type: "article",
        url: routes.howToSellDevices,
      },
    });
  });

  it("renders the semantic article shell, breadcrumb, one H1, and TOC", () => {
    const { container } = render(<SellingPage />);
    const main = container.querySelector("main#main-content") as HTMLElement;
    const hero = container.querySelector("header.page-hero") as HTMLElement;

    expect(main).toBeInTheDocument();
    expect(within(main).getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(within(main).getByRole("heading", { level: 1 })).toHaveTextContent(
      "How to Sell Devices in ReStory",
    );
    expect(hero).toBeInTheDocument();
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
    expect(within(breadcrumbs).getByText("How to Sell Devices")).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(
      container.querySelector("div.shell.article-shell > article.article"),
    ).toBeInTheDocument();
    expect(container.querySelector("aside.article-aside")).toBeInTheDocument();
  });

  it("points the TOC at nine unique rendered targets in contract order", () => {
    const { container } = render(<SellingPage />);
    const aside = container.querySelector("aside.article-aside") as HTMLElement;
    const hrefs = within(aside)
      .getAllByRole("link")
      .map((link) => link.getAttribute("href"));

    expect(hrefs).toEqual(tocHrefs);
    expect(new Set(hrefs).size).toBe(9);
    for (const href of tocHrefs) {
      expect(container.querySelectorAll(href)).toHaveLength(1);
    }
  });

  it("injects Article, BreadcrumbList, and shared FAQPage schemas", () => {
    const { container } = render(<SellingPage />);
    const schemas = Array.from(
      container.querySelectorAll<HTMLScriptElement>(
        'script[type="application/ld+json"]',
      ),
    ).map((script) => JSON.parse(script.textContent ?? "{}"));

    expect(schemas).toHaveLength(3);
    expect(schemas.find((schema) => schema["@type"] === "Article")).toMatchObject({
      "@context": "https://schema.org",
      "@type": "Article",
      headline: pageSeo.howToSellDevices.h1,
      description: pageSeo.howToSellDevices.description,
      dateModified: "2026-08-18",
      author: { "@type": "Organization", name: "ReStory Wiki" },
    });
    expect(
      schemas.find((schema) => schema["@type"] === "Article").mainEntityOfPage,
    ).toMatch(/\/guide\/how-to-sell-devices\/$/);
    expect(
      schemas
        .find((schema) => schema["@type"] === "BreadcrumbList")
        .itemListElement.map((item: { name: string }) => item.name),
    ).toEqual(["Home", "Guide", "How to Sell Devices"]);
    const faq = schemas.find((schema) => schema["@type"] === "FAQPage");
    expect(faq.mainEntity).toEqual(
      expectedFaq.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: { "@type": "Answer", text: item.answer },
      })),
    );
    for (const item of faq.mainEntity) {
      expect(screen.getByText(item.name)).toBeInTheDocument();
      expect(screen.getByText(item.acceptedAnswer.text)).toBeInTheDocument();
    }
  });

  it("uses shared routes for the five required related guides", () => {
    const { container } = render(<SellingPage />);
    const related = within(container).getByRole("navigation", {
      name: "Related guides",
    });
    expect(
      within(related).getAllByRole("link").map((link) => link.textContent),
    ).toEqual([
      "Beginner Guide",
      "Demo Guide",
      "Cleaning Guide",
      "Customize Display Guide",
      "System Requirements",
    ]);

    const pageSource = readFileSync(
      join(process.cwd(), "src/app/guide/how-to-sell-devices/page.tsx"),
      "utf8",
    );
    for (const routeKey of [
      "beginner",
      "demo",
      "cleaning",
      "customizeDisplay",
      "systemRequirements",
    ]) {
      expect(pageSource).toContain(`href={routes.${routeKey}}`);
    }
    expect(pageSource).not.toMatch(/missingJoystick|missing-joystick/);
  });
});

describe.skipIf(!featureFilesExist)("device selling real MDX content contract", () => {
  const mdxPath = join(process.cwd(), "src/content/how-to-sell-devices.mdx");
  const dataPath = join(process.cwd(), "src/data/how-to-sell-devices.ts");
  const pagePath = join(
    process.cwd(),
    "src/app/guide/how-to-sell-devices/page.tsx",
  );

  it("has no H1, puts Quick Answer first, and preserves exact H2 order", () => {
    const mdx = readFileSync(mdxPath, "utf8");
    expect(mdx).not.toMatch(/^#\s+/m);
    expect(Array.from(mdx.matchAll(/^##\s+(.+)$/gm), (match) => match[1])).toEqual(
      h2Contract,
    );
    expect(mdx).toMatch(/\*\*Quick answer:\*\*/i);
    expect(mdx.indexOf('<div className="quick-answer">')).toBeGreaterThanOrEqual(0);
    expect(mdx.indexOf('<div className="quick-answer">')).toBeLessThan(
      mdx.indexOf("## How Device Selling Fits the Shop Loop"),
    );
  });

  it("compiles real MDX into nine unique IDs exactly equal to the source TOC", async () => {
    const mdx = readFileSync(mdxPath, "utf8")
      .replace(/^import .+;$/gm, "")
      .replace("<FaqList items={howToSellDevicesFaqItems} />", "<div />");
    const compiled = await compile(mdx, {
      outputFormat: "function-body",
      rehypePlugins: [rehypeSlug],
    });
    const { default: RealSellingContent } = await run(compiled, {
      ...jsxRuntime,
      baseUrl: import.meta.url,
    });
    const { container } = render(<RealSellingContent />);
    const renderedHrefs = Array.from(container.querySelectorAll("h2"), (heading) =>
      `#${heading.id}`,
    );
    const pageSource = readFileSync(pagePath, "utf8");
    const tocSource = pageSource
      .split("const tableOfContents = [")[1]
      ?.split("] as const;")[0];
    const sourceHrefs = Array.from(
      tocSource?.matchAll(/"(#[a-z0-9-]+)"/g) ?? [],
      (match) => match[1],
    );

    expect(renderedHrefs).toEqual(tocHrefs);
    expect(sourceHrefs).toEqual(tocHrefs);
    expect(new Set(renderedHrefs).size).toBe(9);
    expect(new Set(sourceHrefs).size).toBe(9);
  });

  it("contains 900–1,200 cleaned English words", () => {
    const mdx = readFileSync(mdxPath, "utf8");
    const cleaned = mdx
      .replace(/^import .+;$/gm, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\[([^\]]+)\]\([^\)]+\)/g, "$1")
      .replace(/https?:\/\/\S+/g, " ")
      .replace(/[#*_`>|{}]/g, " ");
    const words = cleaned.match(/[A-Za-z0-9]+(?:['’-][A-Za-z0-9]+)*/g) ?? [];
    expect(words.length).toBeGreaterThanOrEqual(900);
    expect(words.length).toBeLessThanOrEqual(1200);
  });

  it("uses one shared FAQ source for exactly the three required questions", async () => {
    const mdx = readFileSync(mdxPath, "utf8");
    const data = readFileSync(dataPath, "utf8");
    const { howToSellDevicesFaqItems } = await import(
      "@/data/how-to-sell-devices"
    );

    expect(mdx).toContain('import { FaqList } from "@/components/faq-list";');
    expect(mdx).toContain(
      'import { howToSellDevicesFaqItems } from "@/data/how-to-sell-devices";',
    );
    expect(mdx).toContain("<FaqList items={howToSellDevicesFaqItems} />");
    expect(data.match(/question:/g)).toHaveLength(3);
    expect(howToSellDevicesFaqItems).toEqual(expectedFaq);

    const { container } = render(<FaqList items={howToSellDevicesFaqItems} />);
    const faqList = container.querySelector(".faq-list") as HTMLElement;
    expect(within(faqList).getAllByRole("group")).toHaveLength(3);
    for (const item of expectedFaq) {
      expect(within(faqList).getByText(item.question)).toBeInTheDocument();
      expect(within(faqList).getByText(item.answer)).toBeInTheDocument();
    }
  });

  it("uses primary sources safely and states their grades and limits", () => {
    const mdx = readFileSync(mdxPath, "utf8");
    const externalLinks = Array.from(
      mdx.matchAll(
        /<a\s+href="(https?:\/\/[^\"]+)"\s+target="_blank"\s+rel="noopener noreferrer">/g,
      ),
      (match) => match[1],
    );
    const officialGame =
      "https://store.steampowered.com/app/3812600/ReStory_Chill_Electronic_Repairs/";
    const officialDemo =
      "https://store.steampowered.com/app/4146680/ReStory_Chill_Electronic_Repairs_Demo/";
    const developerDiscussion =
      "https://steamcommunity.com/app/3812600/discussions/0/567037624436399525/";

    expect(new Set(externalLinks).size).toBeGreaterThanOrEqual(3);
    expect(externalLinks).toEqual(
      expect.arrayContaining([officialGame, officialDemo, developerDiscussion]),
    );
    expect(mdx).toMatch(/Grade A — Official source/);
    expect(mdx).toMatch(/Grade B — Developer reply/);
    expect(mdx).toMatch(/Grade C — Player report/);
    expect(mdx).toMatch(/version-labeled|demo-era|pre-release/i);
    expect(mdx).toMatch(
      /first acknowledge a demo-era issue and later say the full release rebalanced the marketplace and request frequency/i,
    );
    expect(mdx).toMatch(/no exact (?:pricing|sale|profit) formula is officially confirmed/i);
    expect(mdx).toMatch(/player reports? (?:are|is) report-only/i);
  });

  it("locally marks every risky pricing detail as unconfirmed or not guaranteed", () => {
    const mdx = readFileSync(mdxPath, "utf8");
    const riskyDetails = [
      "profit formula",
      "fixed margin",
      "guaranteed price",
      "demand algorithm",
      "sale multiplier",
    ];

    for (const detail of riskyDetails) {
      const paragraphs = mdx
        .split(/\n\s*\n/)
        .filter((paragraph) => paragraph.toLowerCase().includes(detail));
      expect(paragraphs.length).toBeGreaterThanOrEqual(1);
      for (const paragraph of paragraphs) {
        expect(paragraph).toMatch(
          /unconfirmed|not guaranteed|no official confirmation|not officially confirmed/i,
        );
      }
    }

    expect(mdx).toMatch(
      /seller stars?[\s\S]{0,180}not.{0,60}(?:stable|universal|guarantee)/i,
    );
    expect(mdx).toMatch(
      /listing text[\s\S]{0,180}not.{0,60}(?:stable|universal|guarantee)/i,
    );
    expect(mdx).toMatch(
      /purchase cost[\s\S]{0,180}not.{0,60}(?:stable|universal|guarantee)/i,
    );
    expect(mdx).toMatch(
      /repaired condition[\s\S]{0,180}not.{0,60}(?:stable|universal|guarantee)/i,
    );
  });
});
