import { readFileSync } from "node:fs";
import { join } from "node:path";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import HomePage, { metadata } from "@/app/page";
import { guideEntries } from "@/data/guides";
import { pageSeo, routes, siteConfig } from "@/data/site";

const css = readFileSync(join(process.cwd(), "src/app/globals.css"), "utf8");

afterEach(cleanup);

describe("home page metadata", () => {
  it("uses the exact page SEO fields and canonical routes", () => {
    expect(metadata).toEqual({
      title: pageSeo.home.title,
      description: pageSeo.home.description,
      alternates: { canonical: routes.home },
      openGraph: {
        title: pageSeo.home.title,
        description: pageSeo.home.description,
        type: "website",
        url: routes.home,
      },
    });
  });
});

describe("HomePage", () => {
  it("has one page heading inside the main landmark", () => {
    const { container } = render(<HomePage />);

    const main = container.querySelector("main#main-content");
    expect(main).toBeInTheDocument();
    const headings = within(main as HTMLElement).getAllByRole("heading", { level: 1 });
    expect(headings).toHaveLength(1);
    expect(headings[0]).toHaveTextContent(pageSeo.home.h1);
  });

  it("renders the required hero structure and safe calls to action", () => {
    const { container } = render(<HomePage />);
    const hero = container.querySelector<HTMLElement>("section.hero");

    expect(hero?.querySelector("div.shell.hero-grid")).toBeInTheDocument();
    expect(container.querySelector("p.hero-copy")).toHaveTextContent(
      "Find source-checked walkthroughs, demo details, repair help, customization notes, and troubleshooting for ReStory.",
    );
    expect(
      within(hero as HTMLElement).getByRole("link", { name: "Start the Beginner Guide" }),
    ).toHaveAttribute("href", "/guide/beginner");
    expect(
      within(hero as HTMLElement).getByRole("link", { name: "Explore Repair Guides" }),
    ).toHaveAttribute("href", "/guide/how-to-clean");

    const steamLink = within(hero as HTMLElement).getByRole("link", { name: "Play on Steam ↗" });
    expect(steamLink).toHaveAttribute("href", siteConfig.steamUrl);
    expect(steamLink).toHaveAttribute("target", "_blank");
    expect(steamLink).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("places the approved gameplay video after the hero and before the guide matrix", () => {
    const { container } = render(<HomePage />);

    const hero = container.querySelector<HTMLElement>("section.hero");
    const videoSection = container.querySelector<HTMLElement>("section.gameplay-section");
    const guideSection = screen
      .getByRole("heading", { level: 2, name: "Your ReStory repair route" })
      .closest("section");

    expect(hero).toBeInTheDocument();
    expect(videoSection).toBeInTheDocument();
    expect(guideSection).toBeInTheDocument();
    expect(hero?.compareDocumentPosition(videoSection as HTMLElement)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );
    expect(videoSection?.compareDocumentPosition(guideSection as HTMLElement)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );
    expect(
      within(videoSection as HTMLElement).getByText("Watch the game", {
        selector: ".eyebrow",
      }),
    ).toBeInTheDocument();
    expect(
      within(videoSection as HTMLElement).getByRole("heading", {
        level: 2,
        name: "See ReStory in Action",
      }),
    ).toBeInTheDocument();
    expect(
      within(videoSection as HTMLElement).getByText(
        "Watch 20 minutes of real ReStory gameplay, including device repairs, shop management, and the cozy mid-2000s Tokyo atmosphere.",
      ),
    ).toBeInTheDocument();
  });

  it("embeds the selected IGN gameplay video with safe lazy-loaded player settings", () => {
    const { container } = render(<HomePage />);
    const videoSection = container.querySelector<HTMLElement>("section.gameplay-section");
    const player = within(videoSection as HTMLElement).getByTitle(
      "ReStory: Chill Electronics Repairs - 20 Minutes of Gameplay",
    );

    expect(player).toHaveAttribute(
      "src",
      "https://www.youtube-nocookie.com/embed/6xYOrUsTFWg",
    );
    expect(player).toHaveAttribute("loading", "lazy");
    expect(player).toHaveAttribute("referrerpolicy", "strict-origin-when-cross-origin");
    expect(player).toHaveAttribute(
      "allow",
      "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share",
    );
    expect(player).toHaveAttribute("allowfullscreen");
    expect(player.getAttribute("src")).not.toContain("autoplay=1");

    expect(
      within(videoSection as HTMLElement).getByRole("link", {
        name: "Start the Beginner Guide",
      }),
    ).toHaveAttribute("href", routes.beginner.slice(0, -1));

    const steamLink = within(videoSection as HTMLElement).getByRole("link", {
      name: "Play on Steam ↗",
    });
    expect(steamLink).toHaveAttribute("href", siteConfig.steamUrl);
    expect(steamLink).toHaveAttribute("target", "_blank");
    expect(steamLink).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("keeps the gameplay player responsive at a 16:9 aspect ratio", () => {
    expect(css).toMatch(
      /\.gameplay-video\s*\{[^}]*aspect-ratio:\s*16\s*\/\s*9\s*;[^}]*overflow:\s*hidden\s*;/,
    );
    expect(css).toMatch(
      /\.gameplay-video iframe\s*\{[^}]*width:\s*100%\s*;[^}]*height:\s*100%\s*;[^}]*border:\s*0\s*;/,
    );
  });

  it("uses the approved section labels and introductory copy", () => {
    render(<HomePage />);

    expect(screen.getByText("Start here", { selector: ".eyebrow" })).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 2, name: "Your ReStory repair route" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Begin with the information you need now, then move into repairs, shop systems, and technical help.",
      ),
    ).toBeInTheDocument();
    expect(screen.getByText("About the game", { selector: ".eyebrow" })).toBeInTheDocument();
    expect(screen.getByText("Quick answers", { selector: ".eyebrow" })).toBeInTheDocument();
  });

  it("shows the four cross-category starting cards before category tabs", () => {
    const { container } = render(<HomePage />);

    const startSection = screen
      .getByRole("heading", { level: 2, name: "Your ReStory repair route" })
      .closest("section");
    const featuredGrid = startSection?.querySelector<HTMLElement>(".guide-grid");
    expect(featuredGrid).toBeInTheDocument();
    expect(
      within(featuredGrid as HTMLElement)
        .getAllByRole("heading", { level: 3 })
        .map((heading) => heading.textContent),
    ).toEqual([
      "Beginner Guide",
      "Demo vs Full Game",
      "How to Clean Items",
      "Customize Your Shop",
    ]);
    expect(
      within(featuredGrid as HTMLElement).getByRole("link", {
        name: /Beginner Guide/i,
      }),
    ).toHaveAttribute("href", "/guide/beginner");
    expect(
      within(featuredGrid as HTMLElement).getByRole("link", {
        name: /How to Clean Items/i,
      }),
    ).toHaveAttribute("href", "/guide/how-to-clean");
    expect(
      within(featuredGrid as HTMLElement).getByRole("link", {
        name: /Demo vs Full Game/i,
      }),
    ).toHaveAttribute("href", "/demo");
    expect(
      within(featuredGrid as HTMLElement).getByRole("link", {
        name: /Customize Your Shop/i,
      }),
    ).toHaveAttribute("href", "/guide/customize-display");
    const beginnerCard = within(featuredGrid as HTMLElement)
      .getByRole("heading", { level: 3, name: "Beginner Guide" })
      .closest(".guide-card");
    expect(beginnerCard?.tagName).toBe("A");

    const browseHeading = within(startSection as HTMLElement).getByRole("heading", {
      level: 3,
      name: "Browse by category",
    });
    expect(browseHeading).toHaveClass("browse-heading");
    const tablist = within(startSection as HTMLElement).getByRole("tablist", {
      name: "Guide categories",
    });
    expect(
      featuredGrid?.compareDocumentPosition(browseHeading) ?? 0,
    ).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
    expect(browseHeading.compareDocumentPosition(tablist)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );
    expect(container.querySelectorAll("h1")).toHaveLength(1);
  });

  it("separates the category browser from the featured guide cards", () => {
    expect(css).toMatch(
      /\.browse-heading\s*\{[^}]*margin-block:\s*clamp\(2rem,\s*4vw,\s*3rem\)\s+1rem\s*;/,
    );
  });

  it("presents quick facts as a description list", () => {
    const { container } = render(<HomePage />);

    const facts = container.querySelector("dl.facts");
    expect(facts).toBeInTheDocument();
    const expectedFacts = [
      ["Developer", "Mandragora"],
      ["Publisher", "tinyBuild"],
      ["Release", "August 6, 2026"],
      ["Standard price", "US$19.99"],
      ["Main story", "15+ hours"],
      ["Platform", "Steam"],
    ];

    for (const [term, description] of expectedFacts) {
      const dt = within(facts as HTMLElement).getByText(term, { selector: "dt" });
      expect(dt.parentElement).toHaveClass("fact");
      expect(within(dt.parentElement as HTMLElement).getByText(description, { selector: "dd" })).toBeInTheDocument();
    }
  });

  it("keeps visible FAQ content in sync with FAQ structured data", () => {
    const { container } = render(<HomePage />);

    expect(screen.getByRole("heading", { level: 2, name: "ReStory FAQ" })).toBeInTheDocument();
    const scripts = Array.from(
      container.querySelectorAll<HTMLScriptElement>('script[type="application/ld+json"]'),
    ).map((script) => JSON.parse(script.textContent ?? "{}"));
    expect(scripts.some((schema) => schema["@type"] === "WebSite")).toBe(true);

    const faq = scripts.find((schema) => schema["@type"] === "FAQPage");
    expect(faq).toBeDefined();
    expect(faq.mainEntity).toEqual([
      {
        "@type": "Question",
        name: "What is ReStory?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "ReStory: Chill Electronics Repairs is a narrative-driven shop-management simulation about restoring nostalgic electronics in mid-2000s Tokyo.",
        },
      },
      {
        "@type": "Question",
        name: "Where can I play ReStory?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "The official ReStory store page is on Steam. Use the Steam link on this site for current platform, price, and availability information.",
        },
      },
      {
        "@type": "Question",
        name: "Is this an official ReStory website?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "No. ReStory Wiki is an independent fan-made guide and is not affiliated with Mandragora, tinyBuild, or Valve.",
        },
      },
    ]);
    for (const item of faq.mainEntity) {
      expect(screen.getByText(item.name)).toBeInTheDocument();
      expect(screen.getByText(item.acceptedAnswer.text)).toBeInTheDocument();
    }
  });

  it("links every guide card in each category tab", () => {
    render(<HomePage />);

    const expectedByTab = {
      Beginner: ["Beginner Guide", "Demo vs Full Game"],
      Repair: ["How to Clean Items", "Painting Guide"],
      Shop: ["How to Sell Devices", "Customize Your Shop"],
      Troubleshooting: ["System Requirements", "Missing Joystick"],
    } as const;

    for (const [label, expectedTitles] of Object.entries(expectedByTab)) {
      fireEvent.click(screen.getByRole("tab", { name: label }));
      const panel = screen.getByRole("tabpanel");
      const renderedTitles = within(panel)
        .getAllByRole("heading", { level: 3 })
        .map((heading) => heading.textContent);
      expect(renderedTitles).toEqual(expectedTitles);
      expect(renderedTitles).toHaveLength(2);

      for (const title of expectedTitles) {
        const guide = guideEntries.find((entry) => entry.title === title);
        expect(guide).toBeDefined();
        const card = within(panel)
          .getByRole("heading", { level: 3, name: title })
          .closest(".guide-card");

        expect(guide?.status).toBe("published");
        expect(card?.tagName).toBe("A");
      }
    }
  });

  it("ends with a clear route into the cleaning guide or all guides", () => {
    const { container } = render(<HomePage />);

    const heading = screen.getByRole("heading", {
      level: 2,
      name: "Ready for your first repair?",
    });
    const section = heading.closest("section");
    expect(section).toBe(container.querySelector("main")?.lastElementChild);
    expect(
      within(section as HTMLElement).getByRole("link", { name: "Read the cleaning guide" }),
    ).toHaveAttribute("href", "/guide/how-to-clean");
    expect(
      within(section as HTMLElement).getByRole("link", { name: "Browse all guides" }),
    ).toHaveAttribute("href", "/guide");
  });
});
