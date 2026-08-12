import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { CategoryTabs } from "@/components/category-tabs";

afterEach(cleanup);

function expectOneActiveTab(activeLabel: string) {
  const tabs = screen.getAllByRole("tab");
  expect(tabs.filter((tab) => tab.getAttribute("aria-selected") === "true")).toHaveLength(1);
  expect(tabs.filter((tab) => tab.tabIndex === 0)).toHaveLength(1);
  expect(screen.getByRole("tab", { name: activeLabel })).toHaveAttribute(
    "aria-selected",
    "true",
  );
  expect(screen.getByRole("tab", { name: activeLabel })).toHaveAttribute("tabindex", "0");
}

function pressTabFrom(element: HTMLElement) {
  const tabbableElements = Array.from(
    document.querySelectorAll<HTMLElement>("button, a[href], [tabindex]"),
  ).filter((candidate) => candidate.tabIndex >= 0);
  const currentIndex = tabbableElements.indexOf(element);

  fireEvent.keyDown(element, { key: "Tab" });
  tabbableElements[currentIndex + 1]?.focus();
  fireEvent.keyUp(element, { key: "Tab" });
}

describe("CategoryTabs", () => {
  it("defaults to Beginner and exposes the active panel relationship", () => {
    render(<CategoryTabs />);

    const tablist = screen.getByRole("tablist", { name: "Guide categories" });
    const beginner = within(tablist).getByRole("tab", { name: "Beginner" });
    const panel = screen.getByRole("tabpanel");

    expectOneActiveTab("Beginner");
    expect(beginner).toHaveAttribute("aria-controls", panel.id);
    expect(panel).toHaveAttribute("aria-labelledby", beginner.id);
    expect(panel).toHaveAttribute("tabindex", "0");
    expect(within(panel).getByText("Beginner Guide")).toBeInTheDocument();
    expect(within(panel).getByText("Demo vs Full Game")).toBeInTheDocument();
    expect(within(panel).queryByText("How to Clean Items")).not.toBeInTheDocument();
  });

  it("shows Repair guides when Repair is clicked", () => {
    render(<CategoryTabs />);

    const repair = screen.getByRole("tab", { name: "Repair" });
    fireEvent.click(repair);

    const panel = screen.getByRole("tabpanel");
    expectOneActiveTab("Repair");
    expect(within(panel).getByRole("link", { name: /How to Clean Items/i })).toHaveAttribute(
      "href",
      "/guide/how-to-clean",
    );
    expect(within(panel).getByText("Painting Guide")).toBeInTheDocument();
    expect(within(panel).queryByText("Beginner Guide")).not.toBeInTheDocument();
  });

  it("cycles tabs with arrow keys and moves focus", () => {
    render(<CategoryTabs />);

    const beginner = screen.getByRole("tab", { name: "Beginner" });
    const repair = screen.getByRole("tab", { name: "Repair" });
    const troubleshooting = screen.getByRole("tab", { name: "Troubleshooting" });

    beginner.focus();
    fireEvent.keyDown(beginner, { key: "ArrowLeft" });
    expect(troubleshooting).toHaveFocus();
    expectOneActiveTab("Troubleshooting");

    fireEvent.keyDown(troubleshooting, { key: "ArrowRight" });
    expect(beginner).toHaveFocus();
    expectOneActiveTab("Beginner");

    fireEvent.keyDown(beginner, { key: "ArrowRight" });
    expect(repair).toHaveFocus();
    expectOneActiveTab("Repair");
  });

  it("moves to the first and last tabs with Home and End", () => {
    render(<CategoryTabs />);

    const beginner = screen.getByRole("tab", { name: "Beginner" });
    const repair = screen.getByRole("tab", { name: "Repair" });
    const troubleshooting = screen.getByRole("tab", { name: "Troubleshooting" });

    repair.focus();
    fireEvent.keyDown(repair, { key: "End" });
    expect(troubleshooting).toHaveFocus();
    expectOneActiveTab("Troubleshooting");

    fireEvent.keyDown(troubleshooting, { key: "Home" });
    expect(beginner).toHaveFocus();
    expectOneActiveTab("Beginner");
  });

  it("places the active panel next in the tab order", () => {
    render(<CategoryTabs />);

    const beginner = screen.getByRole("tab", { name: "Beginner" });
    const panel = screen.getByRole("tabpanel");
    beginner.focus();

    pressTabFrom(beginner);

    expect(panel).toHaveFocus();
  });

  it("creates distinct tab and panel relationships for each instance", () => {
    render(
      <>
        <CategoryTabs />
        <CategoryTabs />
      </>,
    );

    const panels = screen.getAllByRole("tabpanel");
    const beginnerTabs = screen.getAllByRole("tab", { name: "Beginner" });
    expect(new Set(panels.map((panel) => panel.id)).size).toBe(2);
    expect(new Set(beginnerTabs.map((tab) => tab.id)).size).toBe(2);
    expect(beginnerTabs[0]).toHaveAttribute("aria-controls", panels[0].id);
    expect(beginnerTabs[1]).toHaveAttribute("aria-controls", panels[1].id);
  });
});
