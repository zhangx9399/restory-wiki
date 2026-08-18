import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it } from "vitest";

import { Breadcrumbs } from "@/components/breadcrumbs";
import { GuideCard } from "@/components/guide-card";
import { JsonLd } from "@/components/json-ld";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import type { GuideEntry } from "@/data/guides";

afterEach(cleanup);

describe("JsonLd", () => {
  it("escapes less-than signs in serialized data", () => {
    const { container } = render(
      <JsonLd data={{ value: "</script><script>alert(1)</script>" }} />,
    );

    const script = container.querySelector("script");
    expect(script).toHaveAttribute("type", "application/ld+json");
    expect(script?.textContent).toContain("\\u003c/script>");
    expect(script?.textContent).not.toContain("<script>");
  });
});

describe("GuideCard", () => {
  it("renders a published guide as a link", () => {
    const guide: GuideEntry = {
      title: "How to Clean Items",
      description: "Clean the first device.",
      category: "Repair & Cleaning",
      status: "published",
      href: "/guide/how-to-clean/",
    };

    render(<GuideCard guide={guide} />);

    expect(screen.getByRole("link", { name: /How to Clean Items/i })).toBeInTheDocument();
    expect(screen.getByText("Read now")).toBeInTheDocument();
  });

  it("renders a coming-next guide as a non-interactive card", () => {
    const guide: GuideEntry = {
      title: "Beginner Guide",
      description: "Start here.",
      category: "Getting Started",
      status: "coming-next",
    };

    const { container } = render(<GuideCard guide={guide} />);

    expect(within(container).queryByRole("link")).not.toBeInTheDocument();
    expect(
      within(container).getByLabelText(/Beginner Guide.*coming next/i),
    ).toBeInTheDocument();
    expect(container.firstElementChild).toHaveClass("guide-card-muted");
  });
});

describe("Breadcrumbs", () => {
  it("marks the final breadcrumb as the current page", () => {
    render(
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Guides", href: "/guide/" },
          { label: "Cleaning Guide" },
        ]}
      />,
    );

    expect(screen.getByRole("navigation", { name: "Breadcrumb" })).toBeInTheDocument();
    expect(screen.getByText("Cleaning Guide")).toHaveAttribute("aria-current", "page");
  });
});

describe("SiteHeader", () => {
  it("renders the public navigation in the approved order", () => {
    render(<SiteHeader />);

    const nav = screen.getByRole("navigation", { name: "Primary navigation" });
    expect(within(nav).getAllByRole("link").map((link) => link.textContent?.trim())).toEqual([
      "Guides",
      "Demo",
      "Repair & Cleaning",
      "System Requirements",
      "Official Steam ↗",
    ]);
    expect(within(nav).getAllByRole("link").map((link) => link.getAttribute("href"))).toEqual([
      "/guide",
      "/demo",
      "/guide#repair-cleaning",
      "/system-requirements",
      "https://store.steampowered.com/app/3812600/ReStory_Chill_Electronic_Repairs/",
    ]);
    expect(within(nav).getByRole("link", { name: "Official Steam" })).toHaveAttribute(
      "rel",
      "noopener noreferrer",
    );
  });

  it("server-renders navigation in the unenhanced state", () => {
    const html = renderToStaticMarkup(<SiteHeader />);

    expect(html).toContain('data-enhanced="false"');
    expect(html).toContain('id="site-nav"');
    expect(html).toContain("Official Steam");
  });

  it("opens the mobile navigation and updates its accessible state", () => {
    render(<SiteHeader />);

    const header = screen.getByRole("banner");
    const button = screen.getByRole("button", { name: "Menu" });
    const nav = screen.getByRole("navigation", { name: "Primary navigation" });
    expect(header).toHaveAttribute("data-enhanced", "true");
    expect(button).toHaveAttribute("aria-expanded", "false");
    expect(nav).toHaveAttribute("data-open", "false");

    fireEvent.click(button);

    expect(button).toHaveAttribute("aria-expanded", "true");
    expect(nav).toHaveAttribute("data-open", "true");
  });

  it("closes the menu when the button is clicked a second time", () => {
    render(<SiteHeader />);

    const button = screen.getByRole("button", { name: "Menu" });
    fireEvent.click(button);
    fireEvent.click(button);

    expect(button).toHaveAttribute("aria-expanded", "false");
  });

  it("closes the menu and restores button focus when Escape is pressed", () => {
    render(<SiteHeader />);

    const button = screen.getByRole("button", { name: "Menu" });
    fireEvent.click(button);
    const link = screen.getByRole("link", { name: "Guides" });
    link.focus();
    expect(link).toHaveFocus();

    fireEvent.keyDown(document, { key: "Escape" });

    expect(button).toHaveAttribute("aria-expanded", "false");
    expect(button).toHaveFocus();
  });

  it("closes the menu from every site and Steam link", () => {
    render(<SiteHeader />);

    const button = screen.getByRole("button", { name: "Menu" });
    const links = screen.getAllByRole("link");
    const preventNavigation = (event: MouseEvent) => event.preventDefault();
    document.addEventListener("click", preventNavigation, true);

    try {
      for (const link of links) {
        fireEvent.click(button);
        expect(button).toHaveAttribute("aria-expanded", "true");
        fireEvent.click(link);
        expect(button).toHaveAttribute("aria-expanded", "false");
      }
    } finally {
      document.removeEventListener("click", preventNavigation, true);
    }
  });
});

describe("SiteFooter", () => {
  it("opens the external Steam destination in a safe new tab", () => {
    render(<SiteFooter />);

    const link = screen.getByRole("link", { name: "Official Steam ↗" });
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });
});
