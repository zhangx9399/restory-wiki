import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { Breadcrumbs } from "@/components/breadcrumbs";
import { GuideCard } from "@/components/guide-card";
import { JsonLd } from "@/components/json-ld";
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
  it("opens the mobile navigation and updates its accessible state", () => {
    render(<SiteHeader />);

    const button = screen.getByRole("button", { name: "Menu" });
    const nav = screen.getByRole("navigation", { name: "Primary navigation" });
    expect(button).toHaveAttribute("aria-expanded", "false");
    expect(nav).toHaveAttribute("data-open", "false");

    fireEvent.click(button);

    expect(button).toHaveAttribute("aria-expanded", "true");
    expect(nav).toHaveAttribute("data-open", "true");
  });
});
