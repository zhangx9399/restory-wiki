import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import HomePage, { metadata } from "@/app/page";
import { pageSeo, routes, siteConfig } from "@/data/site";

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

    expect(container.querySelector("section.hero > div.shell.hero-grid")).toBeInTheDocument();
    expect(container.querySelector("p.hero-copy")).toHaveTextContent(
      "Find source-checked walkthroughs, demo details, repair help, customization notes, and troubleshooting for ReStory.",
    );
    expect(screen.getByRole("link", { name: "Start the Beginner Guide" })).toHaveAttribute(
      "href",
      "/guide",
    );
    expect(screen.getByRole("link", { name: "Explore Repair Guides" })).toHaveAttribute(
      "href",
      "/guide/how-to-clean",
    );

    const steamLink = screen.getByRole("link", { name: "Play on Steam" });
    expect(steamLink).toHaveAttribute("href", siteConfig.steamUrl);
    expect(steamLink).toHaveAttribute("target", "_blank");
    expect(steamLink).toHaveAttribute("rel", "noreferrer");
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
    expect(faq.mainEntity).toHaveLength(3);
    for (const item of faq.mainEntity) {
      expect(screen.getByText(item.name)).toBeInTheDocument();
      expect(screen.getByText(item.acceptedAnswer.text)).toBeInTheDocument();
    }
  });

  it("does not link cards for coming-next guides", () => {
    const { container } = render(<HomePage />);

    for (const label of ["Beginner", "Repair", "Shop", "Troubleshooting"]) {
      fireEvent.click(screen.getByRole("tab", { name: label }));
      for (const card of container.querySelectorAll(".guide-card-muted")) {
        expect(card.tagName).toBe("DIV");
        expect(card.querySelector("a")).not.toBeInTheDocument();
      }
    }
  });
});
