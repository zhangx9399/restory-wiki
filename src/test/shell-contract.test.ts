import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { metadata } from "@/app/layout";
import { siteConfig } from "@/data/site";

const css = readFileSync(join(process.cwd(), "src/app/globals.css"), "utf8");

function luminance(hex: string): number {
  const channels = hex
    .replace("#", "")
    .match(/.{2}/g)
    ?.map((channel) => Number.parseInt(channel, 16) / 255)
    .map((channel) =>
      channel <= 0.04045
        ? channel / 12.92
        : ((channel + 0.055) / 1.055) ** 2.4,
    );

  if (!channels || channels.length !== 3) {
    throw new Error(`Expected a six-digit hex color, received ${hex}`);
  }

  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

function contrastRatio(foreground: string, background: string): number {
  const foregroundLuminance = luminance(foreground);
  const backgroundLuminance = luminance(background);
  const lightest = Math.max(foregroundLuminance, backgroundLuminance);
  const darkest = Math.min(foregroundLuminance, backgroundLuminance);

  return (lightest + 0.05) / (darkest + 0.05);
}

describe("shared shell contracts", () => {
  it("keeps the site title as a default without a template", () => {
    expect(metadata.title).toBe(siteConfig.name);
  });

  it("supports every class name reserved by the page implementation plan", () => {
    for (const selector of [
      ".hero-grid",
      ".action",
      ".action-primary",
      ".section-soft",
      ".article-shell",
      ".article",
    ]) {
      expect(css, `${selector} is missing`).toMatch(
        new RegExp(`${selector.replace(".", "\\.")}(?=[\\s,{])`),
      );
    }

    expect(css).toMatch(/\.hero-grid[^{}]*\{[^}]*display:\s*grid/);
    expect(css).not.toMatch(/\.hero\s*\{[^}]*display:\s*grid/);
    expect(css).toMatch(
      /@media \(max-width: 820px\)[\s\S]*?\.hero-grid,[\s\S]*?\.article-shell[^{}]*\{[^}]*grid-template-columns:\s*1fr/,
    );
    expect(css).toMatch(
      /@media \(max-width: 520px\)[\s\S]*?\.hero-grid[^{}]*\{[^}]*gap:/,
    );
    expect(css).not.toMatch(/body\s*\{[^}]*overflow-x:\s*hidden/);
  });

  it("keeps mobile navigation visible until JavaScript enhancement runs", () => {
    expect(css).toMatch(
      /@media \(max-width: 820px\)[\s\S]*?\.menu-button\s*\{[^}]*display:\s*none/,
    );
    expect(css).toMatch(
      /\.site-header\[data-enhanced="true"\] \.menu-button\s*\{[^}]*display:\s*block/,
    );
    expect(css).toMatch(
      /\.site-header\[data-enhanced="true"\] \.site-nav\s*\{[^}]*display:\s*none/,
    );
    expect(css).toMatch(
      /\.site-header\[data-enhanced="true"\] \.site-nav\[data-open="true"\]\s*\{[^}]*display:\s*flex/,
    );
  });

  it("uses contrast-safe focus and coming-next colors", () => {
    expect(css).toMatch(
      /:focus-visible\s*\{[^}]*outline:\s*3px solid var\(--teal-dark\)/,
    );
    expect(css).toMatch(/\.guide-card-muted\s*\{[^}]*color:\s*#4f5e62/);
    expect(css).toMatch(
      /\.guide-card-muted \.guide-card-status\s*\{[^}]*color:\s*#4f5e62/,
    );
    expect(contrastRatio("#17464c", "#f2c84b")).toBeGreaterThanOrEqual(3);
    expect(contrastRatio("#4f5e62", "#eee9dc")).toBeGreaterThanOrEqual(4.5);
  });
});
