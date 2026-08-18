import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { compile, run } from "@mdx-js/mdx";
import { cleanup, render, screen, within } from "@testing-library/react";
import rehypeSlug from "rehype-slug";
import * as jsxRuntime from "react/jsx-runtime";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { FaqList } from "@/components/faq-list";

const featurePaths = [
  "src/data/missing-joystick.ts",
  "src/content/missing-joystick.mdx",
  "src/app/guide/missing-joystick/page.tsx",
] as const;
const featureFilesExist = featurePaths.every((path) =>
  existsSync(join(process.cwd(), path)),
);

const h2Contract = [
  "What Missing Joystick Can Mean",
  "Check the Device, Parts, and Work Area",
  "Recheck Selection and Assembly State",
  "Input and Session Troubleshooting",
  "What Player Reports Can and Cannot Prove",
  "When to Stop Repeating the Same Fix",
  "Missing Joystick Checklist",
  "Frequently Asked Questions",
  "Sources and Evidence Notes",
] as const;

const tocHrefs = [
  "#what-missing-joystick-can-mean",
  "#check-the-device-parts-and-work-area",
  "#recheck-selection-and-assembly-state",
  "#input-and-session-troubleshooting",
  "#what-player-reports-can-and-cannot-prove",
  "#when-to-stop-repeating-the-same-fix",
  "#missing-joystick-checklist",
  "#frequently-asked-questions",
  "#sources-and-evidence-notes",
] as const;

const expectedFaq = [
  {
    question: "How can I tell a missing physical part from an input problem?",
    answer:
      "Inspect the device and parts box first. A visible shelf or right work area is a December 2025 player-reported example, not a guaranteed location. Then confirm the selected object and current assembly prompt; a visible but unselectable part points to an input or session issue.",
  },
  {
    question: "Do player reports prove a guaranteed fix?",
    answer:
      "No. December 2025 Steam posts describe boxes on a shelf or right table and restarts that helped some players, but those reports are examples, not official resolutions or guarantees for the current build.",
  },
  {
    question: "When should I stop repeating a failed action?",
    answer:
      "Stop after one careful retry produces the same result. Record what is visible and the current prompt, preserve your save, and report the issue instead of looping, forcing destructive save actions, or treating the December 2025 player-reported restart as a guaranteed repair.",
  },
] as const;

vi.mock("@/content/missing-joystick.mdx", () => ({
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

describe("missing joystick feature files", () => {
  it("creates the route, content, and shared FAQ data modules", () => {
    expect(
      featurePaths.filter((path) => !existsSync(join(process.cwd(), path))),
    ).toEqual([]);
  });
});

describe.skipIf(!featureFilesExist)("missing joystick metadata and page shell", () => {
  let MissingJoystickPage: () => React.ReactNode;
  let metadata: Record<string, unknown>;
  let pageSeo: typeof import("@/data/site").pageSeo;
  let routes: typeof import("@/data/site").routes;

  beforeAll(async () => {
    const pageModule = await import("@/app/guide/missing-joystick/page");
    const siteModule = await import("@/data/site");
    MissingJoystickPage = pageModule.default;
    metadata = pageModule.metadata as Record<string, unknown>;
    pageSeo = siteModule.pageSeo;
    routes = siteModule.routes;
  });

  it("uses exact unique SEO fields, canonical, and Open Graph metadata", () => {
    expect(routes.missingJoystick).toBe("/guide/missing-joystick/");
    expect(pageSeo.missingJoystick).toEqual({
      path: "/guide/missing-joystick/",
      title: "ReStory Missing Joystick Guide — Safe Fixes",
      description:
        "Troubleshoot a missing joystick in ReStory by checking boxes, shelves, assembly state, inputs, and session issues without treating reports as guarantees.",
      h1: "ReStory Missing Joystick Guide",
    });
    expect(metadata).toEqual({
      title: pageSeo.missingJoystick.title,
      description: pageSeo.missingJoystick.description,
      alternates: { canonical: routes.missingJoystick },
      openGraph: {
        title: pageSeo.missingJoystick.title,
        description: pageSeo.missingJoystick.description,
        type: "article",
        url: routes.missingJoystick,
      },
    });
  });

  it("renders the semantic article shell, breadcrumb, one H1, and TOC", () => {
    const { container } = render(<MissingJoystickPage />);
    const main = container.querySelector("main#main-content") as HTMLElement;
    const hero = container.querySelector("header.page-hero") as HTMLElement;

    expect(main).toBeInTheDocument();
    expect(within(main).getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(within(main).getByRole("heading", { level: 1 })).toHaveTextContent(
      "ReStory Missing Joystick Guide",
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
    expect(within(breadcrumbs).getByText("Missing Joystick")).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(
      container.querySelector("div.shell.article-shell > article.article"),
    ).toBeInTheDocument();
    expect(container.querySelector("aside.article-aside")).toBeInTheDocument();
  });

  it("points the TOC at nine unique rendered targets in contract order", () => {
    const { container } = render(<MissingJoystickPage />);
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
    const { container } = render(<MissingJoystickPage />);
    const schemas = Array.from(
      container.querySelectorAll<HTMLScriptElement>(
        'script[type="application/ld+json"]',
      ),
    ).map((script) => JSON.parse(script.textContent ?? "{}"));

    expect(schemas).toHaveLength(3);
    expect(schemas.find((schema) => schema["@type"] === "Article")).toMatchObject({
      "@context": "https://schema.org",
      "@type": "Article",
      headline: pageSeo.missingJoystick.h1,
      description: pageSeo.missingJoystick.description,
      dateModified: "2026-08-18",
      author: { "@type": "Organization", name: "ReStory Wiki" },
    });
    expect(
      schemas.find((schema) => schema["@type"] === "Article").mainEntityOfPage,
    ).toMatch(/\/guide\/missing-joystick\/$/);
    expect(
      schemas
        .find((schema) => schema["@type"] === "BreadcrumbList")
        .itemListElement.map((item: { name: string }) => item.name),
    ).toEqual(["Home", "Guide", "Missing Joystick"]);
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
    const { container } = render(<MissingJoystickPage />);
    const related = within(container).getByRole("navigation", {
      name: "Related guides",
    });
    expect(
      within(related).getAllByRole("link").map((link) => ({
        label: link.textContent,
        href: link.getAttribute("href"),
      })),
    ).toEqual([
      { label: "Beginner Guide", href: "/guide/beginner" },
      { label: "Cleaning Guide", href: "/guide/how-to-clean" },
      { label: "Selling Guide", href: "/guide/how-to-sell-devices" },
      { label: "System Requirements", href: "/system-requirements" },
      { label: "All Guides", href: "/guide" },
    ]);

    const pageSource = readFileSync(
      join(process.cwd(), "src/app/guide/missing-joystick/page.tsx"),
      "utf8",
    );
    const routeBindings = [
      ["beginner", "/guide/beginner/"],
      ["cleaning", "/guide/how-to-clean/"],
      ["howToSellDevices", "/guide/how-to-sell-devices/"],
      ["systemRequirements", "/system-requirements/"],
      ["guide", "/guide/"],
    ] as const;
    for (const [routeKey, hardCodedHref] of routeBindings) {
      expect(pageSource).toContain(`href={routes.${routeKey}}`);
      expect(pageSource).not.toContain(`href="${hardCodedHref}"`);
    }
  });
});

describe.skipIf(!featureFilesExist)("missing joystick real MDX content contract", () => {
  const mdxPath = join(process.cwd(), "src/content/missing-joystick.mdx");
  const dataPath = join(process.cwd(), "src/data/missing-joystick.ts");
  const pagePath = join(process.cwd(), "src/app/guide/missing-joystick/page.tsx");

  it("has no H1, puts Quick Answer first, and preserves exact H2 order", () => {
    const mdx = readFileSync(mdxPath, "utf8");
    expect(mdx).not.toMatch(/^#\s+/m);
    expect(Array.from(mdx.matchAll(/^##\s+(.+)$/gm), (match) => match[1])).toEqual(
      h2Contract,
    );
    expect(mdx).toMatch(/\*\*Quick answer:\*\*/i);
    expect(mdx.indexOf('<div className="quick-answer">')).toBeGreaterThanOrEqual(0);
    expect(mdx.indexOf('<div className="quick-answer">')).toBeLessThan(
      mdx.indexOf("## What Missing Joystick Can Mean"),
    );
  });

  it("compiles real MDX into nine unique IDs exactly equal to the source TOC", async () => {
    const mdx = readFileSync(mdxPath, "utf8")
      .replace(/^import .+;$/gm, "")
      .replace("<FaqList items={missingJoystickFaqItems} />", "<div />");
    const compiled = await compile(mdx, {
      outputFormat: "function-body",
      rehypePlugins: [rehypeSlug],
    });
    const { default: RealMissingJoystickContent } = await run(compiled, {
      ...jsxRuntime,
      baseUrl: import.meta.url,
    });
    const { container } = render(<RealMissingJoystickContent />);
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
    const { missingJoystickFaqItems } = await import("@/data/missing-joystick");

    expect(mdx).toContain('import { FaqList } from "@/components/faq-list";');
    expect(mdx).toContain(
      'import { missingJoystickFaqItems } from "@/data/missing-joystick";',
    );
    expect(mdx).toContain("<FaqList items={missingJoystickFaqItems} />");
    expect(data.match(/question:/g)).toHaveLength(3);
    expect(missingJoystickFaqItems).toEqual(expectedFaq);

    const { container } = render(<FaqList items={missingJoystickFaqItems} />);
    const faqList = container.querySelector(".faq-list") as HTMLElement;
    expect(within(faqList).getAllByRole("group")).toHaveLength(3);
    for (const item of expectedFaq) {
      expect(within(faqList).getByText(item.question)).toBeInTheDocument();
      expect(within(faqList).getByText(item.answer)).toBeInTheDocument();
    }
  });

  it("uses verified primary URLs with source grades and adjacent evidence limits", () => {
    const mdx = readFileSync(mdxPath, "utf8");
    const externalLinks = Array.from(
      mdx.matchAll(
        /<a\s+href="(https?:\/\/[^"]+)"\s+target="_blank"\s+rel="noopener noreferrer">/g,
      ),
      (match) => match[1],
    );
    const officialGame =
      "https://store.steampowered.com/app/3812600/ReStory_Chill_Electronic_Repairs/";
    const atariAnnouncement =
      "https://steamcommunity.com/games/3812600/announcements/detail/526493182068785306";
    const playerDiscussion =
      "https://steamcommunity.com/app/3812600/discussions/1/750542279460079428/";
    const allowlist = [officialGame, atariAnnouncement, playerDiscussion];
    const announcementParagraphs = mdx
      .split(/\n\s*\n/)
      .filter((paragraph) => paragraph.includes(atariAnnouncement));
    const discussionParagraphs = mdx
      .split(/\n\s*\n/)
      .filter((paragraph) => paragraph.includes(playerDiscussion));

    expect(new Set(externalLinks).size).toBeGreaterThanOrEqual(3);
    expect(externalLinks).toEqual(expect.arrayContaining(allowlist));
    expect(externalLinks.every((url) => allowlist.includes(url))).toBe(true);
    expect(announcementParagraphs.length).toBeGreaterThanOrEqual(1);
    expect(announcementParagraphs.join(" ")).toMatch(
      /four screws.{0,160}motherboard.{0,160}joystick.{0,160}(?:top and bottom )?casing.{0,160}red button.{0,160}power cables/i,
    );
    expect(announcementParagraphs.join(" ")).toMatch(/does not document.{0,100}(?:missing|bug|fix)/i);
    expect(discussionParagraphs.length).toBeGreaterThanOrEqual(1);
    expect(discussionParagraphs.join(" ")).toMatch(/December 2025/i);
    expect(discussionParagraphs.join(" ")).toMatch(/player report|not an official/i);
    expect(mdx).toMatch(/Grade A — Official announcement/);
    expect(mdx).toMatch(/Grade A — Official source/);
    expect(mdx).toMatch(/Grade C — Player report/);
  });

  it("qualifies report-only locations and restart behavior locally", () => {
    const mdx = readFileSync(mdxPath, "utf8");
    const paragraphs = mdx.split(/\n\s*\n/);
    const shelfClaims = paragraphs.filter((paragraph) =>
      /shelf|right (?:side of (?:the )?)?table|right work area/i.test(paragraph),
    );
    const restartClaims = paragraphs.filter((paragraph) => /restart/i.test(paragraph));

    expect(shelfClaims.length).toBeGreaterThanOrEqual(1);
    for (const paragraph of shelfClaims) {
      expect(paragraph).toMatch(/player report|reported|not guaranteed|not universal/i);
      expect(paragraph).toMatch(/December 2025/i);
    }
    expect(restartClaims.length).toBeGreaterThanOrEqual(1);
    for (const paragraph of restartClaims) {
      expect(paragraph).toMatch(/player report|reported|not guaranteed|not universal/i);
    }
  });

  it("keeps every risky troubleshooting detail locally qualified", () => {
    const mdx = readFileSync(mdxPath, "utf8");
    const riskyDetails = [
      "guaranteed location",
      "replacement spawn",
      "fixed input sequence",
      "save repair",
      "universal fix",
    ];

    for (const detail of riskyDetails) {
      const paragraphs = mdx
        .split(/\n\s*\n/)
        .filter((paragraph) => paragraph.toLowerCase().includes(detail));
      expect(paragraphs.length).toBeGreaterThanOrEqual(1);
      for (const paragraph of paragraphs) {
        expect(paragraph).toMatch(
          /unconfirmed|not guaranteed|no official confirmation|report-only|not universal/i,
        );
      }
    }
  });

  it("uses the safe troubleshooting order and avoids destructive save advice", () => {
    const mdx = readFileSync(mdxPath, "utf8");
    const physicalCheck = mdx.indexOf("First, identify whether");
    const areaCheck = mdx.indexOf("Next, inspect the visible shelf");
    const assemblyCheck = mdx.indexOf("Then recheck selection");
    const inputCheck = mdx.indexOf("Only after those physical checks");
    const restartCheck = mdx.indexOf("last-resort player-reported step");

    expect(physicalCheck).toBeGreaterThanOrEqual(0);
    expect(areaCheck).toBeGreaterThan(physicalCheck);
    expect(assemblyCheck).toBeGreaterThan(areaCheck);
    expect(inputCheck).toBeGreaterThan(assemblyCheck);
    expect(restartCheck).toBeGreaterThan(inputCheck);
    expect(mdx).not.toMatch(/delete (?:your |the )?save|overwrite (?:your |the )?save|start a new game/i);
    expect(mdx).not.toMatch(/promise.{0,80}(?:recover|recovery)/i);
  });
});
