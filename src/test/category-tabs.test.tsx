import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { CategoryTabs } from "@/components/category-tabs";

afterEach(cleanup);

describe("CategoryTabs", () => {
  it("defaults to Beginner and exposes the active panel relationship", () => {
    render(<CategoryTabs />);

    const tablist = screen.getByRole("tablist", { name: "Guide categories" });
    const beginner = within(tablist).getByRole("tab", { name: "Beginner" });
    const panel = screen.getByRole("tabpanel");

    expect(beginner).toHaveAttribute("aria-selected", "true");
    expect(beginner).toHaveAttribute("tabindex", "0");
    expect(beginner).toHaveAttribute("aria-controls", panel.id);
    expect(panel).toHaveAttribute("aria-labelledby", beginner.id);
    expect(within(panel).getByText("Beginner Guide")).toBeInTheDocument();
    expect(within(panel).getByText("Demo vs Full Game")).toBeInTheDocument();
    expect(within(panel).queryByText("How to Clean Items")).not.toBeInTheDocument();
  });

  it("shows Repair guides when Repair is clicked", () => {
    render(<CategoryTabs />);

    const repair = screen.getByRole("tab", { name: "Repair" });
    fireEvent.click(repair);

    const panel = screen.getByRole("tabpanel");
    expect(repair).toHaveAttribute("aria-selected", "true");
    expect(repair).toHaveAttribute("tabindex", "0");
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
    expect(troubleshooting).toHaveAttribute("aria-selected", "true");

    fireEvent.keyDown(troubleshooting, { key: "ArrowRight" });
    expect(beginner).toHaveFocus();
    expect(beginner).toHaveAttribute("aria-selected", "true");

    fireEvent.keyDown(beginner, { key: "ArrowRight" });
    expect(repair).toHaveFocus();
    expect(repair).toHaveAttribute("aria-selected", "true");
  });

  it("moves to the first and last tabs with Home and End", () => {
    render(<CategoryTabs />);

    const beginner = screen.getByRole("tab", { name: "Beginner" });
    const repair = screen.getByRole("tab", { name: "Repair" });
    const troubleshooting = screen.getByRole("tab", { name: "Troubleshooting" });

    repair.focus();
    fireEvent.keyDown(repair, { key: "End" });
    expect(troubleshooting).toHaveFocus();
    expect(troubleshooting).toHaveAttribute("aria-selected", "true");

    fireEvent.keyDown(troubleshooting, { key: "Home" });
    expect(beginner).toHaveFocus();
    expect(beginner).toHaveAttribute("aria-selected", "true");
  });
});
