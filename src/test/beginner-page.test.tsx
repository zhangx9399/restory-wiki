import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { compile, run } from "@mdx-js/mdx";
import { cleanup, render, screen, within } from "@testing-library/react";
import rehypeSlug from "rehype-slug";
import * as jsxRuntime from "react/jsx-runtime";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { FaqList } from "@/components/faq-list";
import { beginnerFaqItems } from "@/data/beginner";

const featurePaths = [
  "src/data/beginner.ts",
  "src/content/beginner.mdx",
  "src/app/guide/beginner/page.tsx",
] as const;
const featureFilesExist = featurePaths.every((path) =>
  existsSync(join(process.cwd(), path)),
);

const h2Contract = [
  "What to Know Before Starting",
  "Your First Repair Route",
  "Cleaning and Reassembly Basics",
  "Painting and Shop Customization",
  "Managing Time, Parts, and Customer Work",
  "Beginner Mistakes to Avoid",
  "What to Read Next",
  "Frequently Asked Questions",
  "Sources and Evidence Notes",
] as const;

const tocHrefs = [
  "#what-to-know-before-starting",
  "#your-first-repair-route",
  "#cleaning-and-reassembly-basics",
  "#painting-and-shop-customization",
  "#managing-time-parts-and-customer-work",
  "#beginner-mistakes-to-avoid",
  "#what-to-read-next",
  "#frequently-asked-questions",
  "#sources-and-evidence-notes",
] as const;

const expectedFaq = [
  {
    question: "What should a new ReStory player do first?",
    answer:
      "Start with the current tutorial or first available customer job, read its brief, and inspect the device before removing parts. Follow the tools and feedback shown in your build instead of assuming every save has one fixed sequence.",
  },
  {
    question: "Do I need to learn every shop system immediately?",
    answer:
      "No. Learn the repair loop first: inspect, disassemble carefully, clean or replace only what the job requires, reassemble, test, and return the device. Painting and shop display customization can wait until their tools and options appear in your version.",
  },
  {
    question: "Which guide should I read next?",
    answer:
      "Read the cleaning guide for the first hands-on repair skill. Use the painting or shop customization guide when those systems appear, the demo guide for demo limits, and system requirements for PC compatibility.",
  },
] as const;

vi.mock("@/content/beginner.mdx", () => ({
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

describe("beginner feature files", () => {
  it("creates the beginner route, content, and shared data modules", () => {
    expect(
      featurePaths.filter((path) => !existsSync(join(process.cwd(), path))),
    ).toEqual([]);
  });
});

describe.skipIf(!featureFilesExist)("beginner metadata and page shell", () => {
  let BeginnerPage: () => React.ReactNode;
  let metadata: Record<string, unknown>;
  let pageSeo: typeof import("@/data/site").pageSeo;
  let routes: typeof import("@/data/site").routes;

  beforeAll(async () => {
    const pageModule = await import("@/app/guide/beginner/page");
    const siteModule = await import("@/data/site");
    BeginnerPage = pageModule.default;
    metadata = pageModule.metadata as Record<string, unknown>;
    pageSeo = siteModule.pageSeo;
    routes = siteModule.routes;
  });

  it("uses the exact unique SEO fields, canonical, and Open Graph route", () => {
    expect(routes.beginner).toBe("/guide/beginner/");
    expect(pageSeo.beginner).toEqual({
      path: "/guide/beginner/",
      title: "ReStory Beginner Guide — Your First Repair Route",
      description:
        "Start ReStory with a practical first repair route, cleaning and reassembly basics, shop priorities, time management, and evidence-labeled next steps.",
      h1: "ReStory Beginner Guide",
    });
    expect(metadata).toEqual({
      title: pageSeo.beginner.title,
      description: pageSeo.beginner.description,
      alternates: { canonical: routes.beginner },
      openGraph: {
        title: pageSeo.beginner.title,
        description: pageSeo.beginner.description,
        type: "article",
        url: routes.beginner,
      },
    });
  });

  it("renders a semantic hero, Guide breadcrumb, one H1, article, and TOC", () => {
    const { container } = render(<BeginnerPage />);
    const main = container.querySelector("main#main-content") as HTMLElement;
    const hero = container.querySelector("header.page-hero") as HTMLElement;

    expect(main).toBeInTheDocument();
    expect(within(main).getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(within(main).getByRole("heading", { level: 1 })).toHaveTextContent(
      "ReStory Beginner Guide",
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
    expect(within(breadcrumbs).getByText("Beginner Guide")).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(
      container.querySelector("div.shell.article-shell > article.article"),
    ).toBeInTheDocument();
    expect(container.querySelector("aside.article-aside")).toBeInTheDocument();
  });

  it("points the TOC at nine unique rendered targets in contract order", () => {
    const { container } = render(<BeginnerPage />);
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

  it("injects Article, BreadcrumbList, and FAQPage schemas dated Aug 18", () => {
    const { container } = render(<BeginnerPage />);
    const schemas = Array.from(
      container.querySelectorAll<HTMLScriptElement>(
        'script[type="application/ld+json"]',
      ),
    ).map((script) => JSON.parse(script.textContent ?? "{}"));

    expect(schemas).toHaveLength(3);
    expect(schemas.find((schema) => schema["@type"] === "Article")).toMatchObject({
      "@context": "https://schema.org",
      "@type": "Article",
      headline: pageSeo.beginner.h1,
      description: pageSeo.beginner.description,
      dateModified: "2026-08-18",
      author: { "@type": "Organization", name: "ReStory Wiki" },
    });
    expect(
      schemas.find((schema) => schema["@type"] === "Article").mainEntityOfPage,
    ).toMatch(/\/guide\/beginner\/$/);
    expect(
      schemas
        .find((schema) => schema["@type"] === "BreadcrumbList")
        .itemListElement.map((item: { name: string }) => item.name),
    ).toEqual(["Home", "Guide", "Beginner Guide"]);
    const faq = schemas.find((schema) => schema["@type"] === "FAQPage");
    expect(faq.mainEntity).toEqual(
      expectedFaq.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: { "@type": "Answer", text: item.answer },
      })),
    );
  });

  it("keeps all three visible FAQ answers synchronized with the shared schema data", () => {
    const { container } = render(<BeginnerPage />);
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

  it("uses shared routes for the six related guides", () => {
    const { container } = render(<BeginnerPage />);
    const related = within(container).getByRole("navigation", {
      name: "Related guides",
    });
    expect(
      within(related).getAllByRole("link").map((link) => ({
        name: link.textContent,
        href: link.getAttribute("href"),
      })),
    ).toEqual([
      { name: "Demo guide", href: "/demo" },
      { name: "Cleaning guide", href: "/guide/how-to-clean" },
      { name: "Painting guide", href: "/guide/painting" },
      { name: "Customize Display guide", href: "/guide/customize-display" },
      { name: "System Requirements", href: "/system-requirements" },
      { name: "How to Sell Devices", href: "/guide/how-to-sell-devices" },
    ]);

    const pageSource = readFileSync(
      join(process.cwd(), "src/app/guide/beginner/page.tsx"),
      "utf8",
    );
    for (const routeKey of [
      "demo",
      "cleaning",
      "painting",
      "customizeDisplay",
      "systemRequirements",
      "howToSellDevices",
    ]) {
      expect(pageSource).toContain(`href={routes.${routeKey}}`);
    }
    expect(pageSource).not.toContain('href="/guide/how-to-sell-devices/"');
  });
});

describe.skipIf(!featureFilesExist)("beginner real MDX content contract", () => {
  const mdxPath = join(process.cwd(), "src/content/beginner.mdx");
  const dataPath = join(process.cwd(), "src/data/beginner.ts");
  const pagePath = join(process.cwd(), "src/app/guide/beginner/page.tsx");

  it("has no H1, puts Quick Answer first, and preserves the exact H2 order", () => {
    const mdx = readFileSync(mdxPath, "utf8");
    expect(mdx).not.toMatch(/^#\s+/m);
    expect(Array.from(mdx.matchAll(/^##\s+(.+)$/gm), (match) => match[1])).toEqual(
      h2Contract,
    );
    expect(mdx).toMatch(/\*\*Quick answer:\*\*/i);
    expect(mdx.indexOf('<div className="quick-answer">')).toBeGreaterThanOrEqual(0);
    expect(mdx.indexOf('<div className="quick-answer">')).toBeLessThan(
      mdx.indexOf("## What to Know Before Starting"),
    );
  });

  it("compiles real MDX into nine unique H2 IDs exactly equal to the source TOC", async () => {
    const mdx = readFileSync(mdxPath, "utf8")
      .replace(/^import .+;$/gm, "")
      .replace("<FaqList items={beginnerFaqItems} />", "<div />");
    const compiled = await compile(mdx, {
      outputFormat: "function-body",
      rehypePlugins: [rehypeSlug],
    });
    const { default: RealBeginnerContent } = await run(compiled, {
      ...jsxRuntime,
      baseUrl: import.meta.url,
    });
    const { container } = render(<RealBeginnerContent />);
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

  it("uses one shared FAQ source for exactly the three required questions", () => {
    const mdx = readFileSync(mdxPath, "utf8");
    const data = readFileSync(dataPath, "utf8");
    expect(mdx).toContain('import { beginnerFaqItems } from "@/data/beginner";');
    expect(mdx).toContain("<FaqList items={beginnerFaqItems} />");
    expect(data.match(/question:/g)).toHaveLength(3);
    for (const item of expectedFaq) {
      expect(data).toContain(item.question);
      expect(data).toContain(item.answer);
    }
  });

  it("renders the production FAQ component from the shared beginner data", () => {
    const { container } = render(<FaqList items={beginnerFaqItems} />);
    const faqList = container.querySelector(".faq-list") as HTMLElement;

    expect(beginnerFaqItems).toEqual(expectedFaq);
    expect(within(faqList).getAllByRole("group")).toHaveLength(3);
    for (const item of beginnerFaqItems) {
      expect(within(faqList).getByText(item.question)).toBeInTheDocument();
      expect(within(faqList).getByText(item.answer)).toBeInTheDocument();
    }
  });

  it("attributes shop layout claims to the official launch announcement", () => {
    const mdx = readFileSync(mdxPath, "utf8");
    const launchAnnouncement =
      "https://store.steampowered.com/news/app/3812600/view/1839676055897780";
    const customizationSection = mdx
      .split("## Painting and Shop Customization")[1]
      ?.split("## Managing Time, Parts, and Customer Work")[0];
    const sourceNote = mdx
      .split(/\n- /)
      .find(
        (paragraph) =>
          paragraph.startsWith("**Grade A") &&
          paragraph.includes(launchAnnouncement),
      );

    expect(customizationSection).toContain(launchAnnouncement);
    expect(customizationSection).toMatch(/official (?:launch announcement|Steam news)/i);
    expect(sourceNote).toMatch(/Grade A — Official source/);
    expect(sourceNote).toMatch(/walls?.{0,80}shel(?:f|ves).{0,80}storage.{0,80}decorations?/i);
  });

  it("recommends only published next reads without implementation language", () => {
    const mdx = readFileSync(mdxPath, "utf8");
    const readNextSection = mdx
      .split("## What to Read Next")[1]
      ?.split("## Frequently Asked Questions")[0];

    expect(readNextSection).not.toMatch(
      /integration|shared route|hard-code|selling-devices|unavailable/i,
    );
    expect(readNextSection).toMatch(
      /cleaning guide[\s\S]*painting guide[\s\S]*Customize Display[\s\S]*demo guide[\s\S]*System Requirements/i,
    );
  });

  it("links at least three sources safely and labels evidence limits explicitly", () => {
    const mdx = readFileSync(mdxPath, "utf8");
    const externalLinks = Array.from(
      mdx.matchAll(
        /<a\s+href="(https?:\/\/[^"]+)"\s+target="_blank"\s+rel="noopener noreferrer">/g,
      ),
      (match) => match[1],
    );

    expect(externalLinks.length).toBeGreaterThanOrEqual(3);
    expect(new Set(externalLinks).size).toBeGreaterThanOrEqual(3);
    expect(mdx).toMatch(/Grade A — Official source/);
    expect(mdx).toMatch(/Grade B — Visible gameplay/);
    expect(mdx).toMatch(/Grade C — Player report/);
    expect(mdx).toMatch(/official sources establish facts/i);
    expect(mdx).toMatch(/visible gameplay corroborates/i);
    expect(mdx).toMatch(/player reports? (?:are|is) report-only/i);
    expect(mdx).toMatch(/no fixed universal beginner sequence/i);
    expect(mdx).toMatch(/version|build/i);
  });
});
