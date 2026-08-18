import { createElement, type ElementType } from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { useMDXComponents } from "../../mdx-components";

describe("useMDXComponents", () => {
  afterEach(cleanup);

  it("preserves incoming MDX component entries", () => {
    const Heading = () => null;
    const components = { h1: Heading };

    const result = useMDXComponents(components);

    expect(result.h1).toBe(Heading);
  });

  it("opens external MDX links in a safe new tab", () => {
    const components = useMDXComponents({});
    const Anchor = components.a as ElementType;

    render(
      createElement(
        Anchor,
        {
          href: "https://store.steampowered.com/app/3812600/ReStory_Chill_Electronic_Repairs/",
        },
        "Official source",
      ),
    );

    const link = screen.getByRole("link", { name: "Official source" });
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", expect.stringContaining("noopener"));
    expect(link).toHaveAttribute("rel", expect.stringContaining("noreferrer"));
  });

  it.each(["/guide/", "#sources-and-evidence-notes"])(
    "keeps same-site MDX link %s in the current tab",
    (href) => {
      const components = useMDXComponents({});
      const Anchor = components.a as ElementType;

      render(createElement(Anchor, { href }, "Same-site destination"));

      const link = screen.getByRole("link", { name: "Same-site destination" });
      expect(link).not.toHaveAttribute("target");
      expect(link).not.toHaveAttribute("rel");
    },
  );
});
