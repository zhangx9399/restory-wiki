import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { compile, run } from "@mdx-js/mdx";
import { cleanup, render, screen, within } from "@testing-library/react";
import * as jsxRuntime from "react/jsx-runtime";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

const featurePaths = [
  "src/data/system-requirements.ts",
  "src/content/system-requirements.mdx",
  "src/app/system-requirements/page.tsx",
] as const;
const featureFilesExist = featurePaths.every((path) => existsSync(join(process.cwd(), path)));

vi.mock("@/content/system-requirements.mdx", () => ({
  default: () => (
    <>
      <div className="quick-answer">Quick answer</div>
      <h2 id="official-minimum-system-requirements">Official Minimum System Requirements</h2>
      <h2 id="can-your-pc-run-restory">Can Your PC Run ReStory?</h2>
      <h2 id="storage-directx-and-windows-support">Storage, DirectX, and Windows Support</h2>
      <h2 id="vsync-and-frame-rate-troubleshooting">VSync and Frame-Rate Troubleshooting</h2>
      <h2 id="what-is-not-officially-confirmed">What Is Not Officially Confirmed</h2>
      <h2 id="frequently-asked-questions">Frequently Asked Questions</h2>
      <div className="faq-list">
        <details>
          <summary>Is 4 GB RAM the official minimum for ReStory?</summary>
          <p>Yes. The official Steam store lists 4 GB RAM in the Windows minimum requirements.</p>
        </details>
        <details>
          <summary>Does ReStory have official recommended PC requirements?</summary>
          <p>No. Steam currently publishes a minimum tier for Windows but no official recommended tier, so this page does not invent one.</p>
        </details>
        <details>
          <summary>What should I try if ReStory appears GPU-bound?</summary>
          <p>Update the game, test one graphics or resolution change at a time, close GPU-heavy overlays or background apps, and record your version and hardware if the issue continues. Older build/version note: official playtest patch #0.1.018 suggested disabling VSync and trying a 30 or 60 FPS target, but that older-build advice may not apply to or solve every current-release problem.</p>
        </details>
      </div>
      <h2 id="sources-and-evidence-notes">Sources and Evidence Notes</h2>
    </>
  ),
}));

afterEach(cleanup);

function headingSlug(heading: string) {
  return heading
    .trim()
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

describe("system requirements feature files", () => {
  it("creates the route, content, and shared data files", () => {
    expect(featurePaths.filter((path) => !existsSync(join(process.cwd(), path)))).toEqual([]);
  });
});

describe.skipIf(!featureFilesExist)("system requirements page metadata and shell", () => {
  let SystemRequirementsPage: () => React.ReactNode;
  let metadata: Record<string, unknown>;
  let pageSeo: typeof import("@/data/site").pageSeo;
  let routes: typeof import("@/data/site").routes;

  beforeAll(async () => {
    const pageModule = await import("@/app/system-requirements/page");
    const siteModule = await import("@/data/site");
    SystemRequirementsPage = pageModule.default;
    metadata = pageModule.metadata as Record<string, unknown>;
    pageSeo = siteModule.pageSeo;
    routes = siteModule.routes;
  });

  it("uses the exact SEO fields and canonical route", () => {
    expect(routes.systemRequirements).toBe("/system-requirements/");
    expect(pageSeo.systemRequirements).toEqual({
      path: "/system-requirements/",
      title: "ReStory System Requirements — Can Your PC Run It?",
      description:
        "Check ReStory's official minimum PC requirements, storage and DirectX needs, and version-labeled VSync and frame-rate troubleshooting advice.",
      h1: "ReStory System Requirements",
    });
    expect(metadata).toEqual({
      title: pageSeo.systemRequirements.title,
      description: pageSeo.systemRequirements.description,
      alternates: { canonical: routes.systemRequirements },
      openGraph: {
        title: pageSeo.systemRequirements.title,
        description: pageSeo.systemRequirements.description,
        type: "article",
        url: routes.systemRequirements,
      },
    });
  });

  it("renders one H1, Home/System Requirements breadcrumbs, and the cleaning article shell", () => {
    const { container } = render(<SystemRequirementsPage />);
    const main = container.querySelector("main#main-content") as HTMLElement;
    expect(main).toBeInTheDocument();
    const h1s = within(main).getAllByRole("heading", { level: 1 });
    expect(h1s).toHaveLength(1);
    expect(h1s[0]).toHaveTextContent("ReStory System Requirements");

    const hero = container.querySelector("header.page-hero") as HTMLElement;
    const breadcrumbs = within(hero).getByRole("navigation", { name: "Breadcrumb" });
    expect(within(breadcrumbs).getByRole("link", { name: "Home" })).toHaveAttribute("href", "/");
    expect(within(breadcrumbs).getByText("System Requirements")).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(within(breadcrumbs).queryByText("Guides")).not.toBeInTheDocument();
    expect(container.querySelector("div.shell.article-shell > article.article")).toBeInTheDocument();
    expect(container.querySelector("div.shell.article-shell > aside.article-aside")).toBeInTheDocument();
  });

  it("links all seven table-of-contents anchors in the required order", () => {
    const { container } = render(<SystemRequirementsPage />);
    const aside = container.querySelector("aside.article-aside") as HTMLElement;
    expect(within(aside).getByRole("heading", { level: 2 })).toHaveTextContent("On this page");
    expect(within(aside).getAllByRole("link").map((link) => link.getAttribute("href"))).toEqual([
      "#official-minimum-system-requirements",
      "#can-your-pc-run-restory",
      "#storage-directx-and-windows-support",
      "#vsync-and-frame-rate-troubleshooting",
      "#what-is-not-officially-confirmed",
      "#frequently-asked-questions",
      "#sources-and-evidence-notes",
    ]);
  });

  it("renders the three required related guide links", () => {
    const { container } = render(<SystemRequirementsPage />);
    const main = container.querySelector("main#main-content") as HTMLElement;
    const related = within(main).getByRole("navigation", { name: "Related guides" });

    expect(
      within(related).getAllByRole("link").map((link) => ({
        name: link.textContent,
        href: link.getAttribute("href"),
      })),
    ).toEqual([
      { name: "Demo guide", href: "/demo" },
      { name: "All ReStory guides", href: "/guide" },
      { name: "Cleaning guide", href: "/guide/how-to-clean" },
    ]);
  });

  it("injects Article, BreadcrumbList, and FAQPage schemas with the review date", () => {
    const { container } = render(<SystemRequirementsPage />);
    const schemas = Array.from(
      container.querySelectorAll<HTMLScriptElement>('script[type="application/ld+json"]'),
    ).map((script) => JSON.parse(script.textContent ?? "{}"));
    expect(schemas).toHaveLength(3);

    const article = schemas.find((schema) => schema["@type"] === "Article");
    expect(article).toMatchObject({
      "@context": "https://schema.org",
      "@type": "Article",
      headline: "ReStory System Requirements",
      description: pageSeo.systemRequirements.description,
      dateModified: "2026-08-14",
      author: { "@type": "Organization", name: "ReStory Wiki" },
    });
    expect(article.mainEntityOfPage).toMatch(/\/system-requirements\/$/);

    const breadcrumb = schemas.find((schema) => schema["@type"] === "BreadcrumbList");
    expect(breadcrumb.itemListElement.map((item: { name: string }) => item.name)).toEqual([
      "Home",
      "System Requirements",
    ]);
    expect(breadcrumb.itemListElement[1].item).toMatch(/\/system-requirements\/$/);

    const faq = schemas.find((schema) => schema["@type"] === "FAQPage");
    expect(faq.mainEntity).toHaveLength(3);
    for (const item of faq.mainEntity) {
      expect(screen.getByText(item.name)).toBeInTheDocument();
      expect(screen.getByText(item.acceptedAnswer.text)).toBeInTheDocument();
    }
  });
});

describe.skipIf(!featureFilesExist)("system requirements real MDX contract", () => {
  const mdxPath = join(process.cwd(), "src/content/system-requirements.mdx");
  const dataPath = join(process.cwd(), "src/data/system-requirements.ts");
  const pagePath = join(process.cwd(), "src/app/system-requirements/page.tsx");

  it("has no H1 and preserves the exact seven-H2 hierarchy", () => {
    const mdx = readFileSync(mdxPath, "utf8");
    expect(mdx).not.toMatch(/^#\s+/m);
    expect(Array.from(mdx.matchAll(/^##\s+(.+)$/gm), (match) => match[1])).toEqual([
      "Official Minimum System Requirements",
      "Can Your PC Run ReStory?",
      "Storage, DirectX, and Windows Support",
      "VSync and Frame-Rate Troubleshooting",
      "What Is Not Officially Confirmed",
      "Frequently Asked Questions",
      "Sources and Evidence Notes",
    ]);
    expect(mdx.indexOf('<div className="quick-answer">')).toBeGreaterThanOrEqual(0);
    expect(mdx.indexOf('<div className="quick-answer">')).toBeLessThan(
      mdx.indexOf("## Official Minimum System Requirements"),
    );
    expect(mdx).toMatch(/\*\*Quick answer:\*\*/i);
  });

  it("keeps seven unique real-MDX H2 slugs synchronized with the TOC hrefs", () => {
    const mdx = readFileSync(mdxPath, "utf8");
    const page = readFileSync(pagePath, "utf8");
    const h2Slugs = Array.from(mdx.matchAll(/^##\s+(.+)$/gm), (match) =>
      headingSlug(match[1]),
    );
    const tocHrefs = Array.from(
      page.matchAll(/\[\s*"[^"]+",\s*"(#[^"]+)"\s*\]/g),
      (match) => match[1],
    );

    expect(h2Slugs).toHaveLength(7);
    expect(new Set(h2Slugs).size).toBe(7);
    expect(tocHrefs).toHaveLength(7);
    expect(new Set(tocHrefs).size).toBe(7);
    expect(tocHrefs).toEqual(h2Slugs.map((slug) => `#${slug}`));
  });

  it("compiles the real MDX minimum requirements as an accessible table", async () => {
    const mdx = readFileSync(mdxPath, "utf8")
      .replace(/^import .+;$/gm, "")
      .replace("<FaqList items={systemRequirementsFaqItems} />", "<div />");
    const compiled = await compile(mdx, { outputFormat: "function-body" });
    const { default: RealSystemRequirementsContent } = await run(compiled, {
      ...jsxRuntime,
      baseUrl: import.meta.url,
    });
    const { container } = render(<RealSystemRequirementsContent />);
    const table = container.querySelector("table");

    expect(table).toBeInTheDocument();
    expect(table?.querySelector("thead")).toBeInTheDocument();
    expect(
      within(table as HTMLTableElement)
        .getAllByRole("columnheader")
        .map((header) => header.textContent),
    ).toEqual(["Component", "Official Windows minimum"]);
    expect(
      within(table as HTMLTableElement)
        .getAllByRole("row")
        .slice(1)
        .map((row) => [
          within(row).getByRole("rowheader").textContent,
          within(row).getByRole("cell").textContent,
        ]),
    ).toEqual([
      ["Operating system", "Windows 10 x64"],
      ["Processor", "2 cores / 4 threads"],
      ["Memory", "4 GB RAM"],
      ["Graphics", "GTX 750 Ti"],
      ["DirectX", "DirectX 11"],
      ["Storage", "1 GB available space"],
    ]);
  });

  it("contains every official Windows minimum and explicitly rejects an invented recommended tier", () => {
    const mdx = readFileSync(mdxPath, "utf8");
    for (const requirement of [
      "Windows 10 x64",
      "2 cores / 4 threads",
      "4 GB RAM",
      "GTX 750 Ti",
      "DirectX 11",
      "1 GB available space",
    ]) {
      expect(mdx).toContain(requirement);
    }
    expect(mdx).toMatch(/official(?:ly)? (?:has|have|does|did|publishes?).{0,90}no recommended|no official recommended|official recommended.{0,50}(?:not published|not available|does not exist)/i);
    expect(mdx).not.toMatch(/^\|\s*Recommended\s*\|/im);
    expect(mdx).not.toMatch(/^Recommended:\s/im);
  });

  it("labels every VSync and 30/60 FPS paragraph as older-build advice with no current guarantee", () => {
    const mdx = readFileSync(mdxPath, "utf8");
    const paragraphs = mdx.split(/\n\s*\n/).filter(Boolean);
    const adviceParagraphs = paragraphs.filter(
      (paragraph) =>
        !paragraph.startsWith("#") &&
        /VSync|30\s*FPS|60\s*FPS|30 or 60 FPS/i.test(paragraph),
    );
    expect(adviceParagraphs.length).toBeGreaterThanOrEqual(3);
    for (const paragraph of adviceParagraphs) {
      expect(paragraph).toMatch(/older build\/version note/i);
      expect(paragraph).toContain("#0.1.018");
      expect(paragraph).toMatch(/may not (?:apply to|solve).{0,60}(?:current|every|all)/i);
    }
    expect(mdx).not.toMatch(/guarantee(?:d|s)? (?:a )?(?:fix|solution)/i);
  });

  it("renders exactly three FAQs from one shared source with the required answers", () => {
    const mdx = readFileSync(mdxPath, "utf8");
    const data = readFileSync(dataPath, "utf8");
    const page = readFileSync(pagePath, "utf8");
    expect(mdx).toContain('import { FaqList } from "@/components/faq-list";');
    expect(mdx).toContain('import { systemRequirementsFaqItems } from "@/data/system-requirements";');
    expect(mdx).toContain("<FaqList items={systemRequirementsFaqItems} />");
    expect(page).toContain('import { systemRequirementsFaqItems } from "@/data/system-requirements";');
    expect(page).not.toContain("const systemRequirementsFaqItems =");

    expect(data.match(/question:/g)).toHaveLength(3);
    expect(data).toContain("Is 4 GB RAM the official minimum for ReStory?");
    expect(data).toMatch(/official Steam store lists 4 GB RAM/i);
    expect(data).toContain("Does ReStory have official recommended PC requirements?");
    expect(data).toMatch(/no official recommended tier/i);
    expect(data).toContain("What should I try if ReStory appears GPU-bound?");
    expect(data).toMatch(/Older build\/version note/i);
    expect(data).toContain("#0.1.018");
    expect(data).toMatch(/may not (?:apply to|solve).{0,70}(?:current|every|all)/i);
  });

  it("uses the three required sources and identifies their evidence limits", () => {
    const mdx = readFileSync(mdxPath, "utf8");
    expect(mdx).toContain("https://store.steampowered.com/app/3812600/ReStory_Chill_Electronic_Repairs/");
    expect(mdx).toContain("https://www.pcgamingwiki.com/wiki/ReStory%3A_Chill_Electronics_Repairs");
    expect(mdx).toContain("https://steamcommunity.com/app/3812600/allnews/");
    expect(mdx).toMatch(/PCGamingWiki.{0,100}(?:third-party|community-maintained)/i);
    expect(mdx).toMatch(/Steam.{0,80}(?:official|primary)/i);
    expect(mdx).toContain("Last evidence review: Aug 14, 2026");
  });

  it("stays within 900-1300 cleaned English words", () => {
    const mdx = readFileSync(mdxPath, "utf8");
    const prose = mdx
      .replace(/^import .+;$/gm, " ")
      .replace(/https?:\/\/\S+/g, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/[#[\]()*_`>|-]/g, " ");
    const words = prose.match(/[A-Za-z0-9]+(?:['’][A-Za-z0-9]+)?/g) ?? [];
    expect(words.length).toBeGreaterThanOrEqual(900);
    expect(words.length).toBeLessThanOrEqual(1300);
  });
});
