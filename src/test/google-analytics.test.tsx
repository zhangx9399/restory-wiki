import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("next/script", () => ({
  default: ({ children, ...props }: React.ComponentProps<"script">) => (
    <script {...props}>{children}</script>
  ),
}));

import {
  GoogleAnalytics,
  normalizeGoogleAnalyticsId,
} from "@/components/google-analytics";

afterEach(cleanup);

describe("normalizeGoogleAnalyticsId", () => {
  it("returns undefined for missing and blank IDs", () => {
    expect(normalizeGoogleAnalyticsId()).toBeUndefined();
    expect(normalizeGoogleAnalyticsId("   \n\t ")).toBeUndefined();
  });

  it("trims and uppercases valid GA4 measurement IDs", () => {
    expect(normalizeGoogleAnalyticsId("  g-a1b2c3  ")).toBe("G-A1B2C3");
  });

  it("rejects non-GA4 and malformed IDs", () => {
    for (const invalidId of ["UA-123456-1", "G-12", "G-ABC-123"]) {
      expect(() => normalizeGoogleAnalyticsId(invalidId)).toThrow(
        "NEXT_PUBLIC_GA_ID must be a GA4 measurement ID",
      );
    }
  });
});

describe("GoogleAnalytics", () => {
  it("renders nothing without a measurement ID", () => {
    const { container, rerender } = render(<GoogleAnalytics />);
    expect(container).toBeEmptyDOMElement();

    rerender(<GoogleAnalytics measurementId="   " />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders matching Google tag scripts for a valid measurement ID", () => {
    const { container } = render(<GoogleAnalytics measurementId=" g-a1b2c3 " />);
    const scripts = container.querySelectorAll("script");

    expect(scripts).toHaveLength(2);
    expect(scripts[0]).toHaveAttribute(
      "src",
      "https://www.googletagmanager.com/gtag/js?id=G-A1B2C3",
    );
    expect(scripts[0]).toHaveAttribute("strategy", "afterInteractive");
    expect(scripts[1]).toHaveAttribute("id", "google-analytics");
    expect(scripts[1]).toHaveAttribute("strategy", "afterInteractive");
    expect(scripts[1]?.textContent).toContain("gtag('config', 'G-A1B2C3', { anonymize_ip: true })");
  });
});
