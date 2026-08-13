import { describe, expect, it } from "vitest";

import { getSiteOrigin, normalizeSiteOrigin } from "@/lib/site-url";

describe("site URL resolution", () => {
  it("uses a trimmed SITE_URL as the canonical origin", () => {
    expect(
      getSiteOrigin({ SITE_URL: " https://restory-wiki.vercel.app/ " }),
    ).toBe("https://restory-wiki.vercel.app");
  });

  it("uses the production Vercel domain when SITE_URL is missing", () => {
    expect(
      getSiteOrigin({
        VERCEL_PROJECT_PRODUCTION_URL: "restory-wiki.vercel.app",
      }),
    ).toBe("https://restory-wiki.vercel.app");
  });

  it("uses the Vercel deployment domain when higher-priority values are missing", () => {
    expect(getSiteOrigin({ VERCEL_URL: "restory-wiki-main.vercel.app" })).toBe(
      "https://restory-wiki-main.vercel.app",
    );
  });

  it("falls back to the local development origin", () => {
    expect(getSiteOrigin({})).toBe("http://localhost:3000");
  });

  it.each([
    ["https://restory-wiki.vercel.app/guide/", "SITE_URL must be an origin without a path, query, or hash"],
    ["https://restory-wiki.vercel.app?source=test", "SITE_URL must be an origin without a path, query, or hash"],
    ["https://restory-wiki.vercel.app#top", "SITE_URL must be an origin without a path, query, or hash"],
    ["ftp://restory-wiki.vercel.app", "SITE_URL must use http or https"],
    ["not a URL", "SITE_URL is invalid"],
  ])("rejects invalid SITE_URL value %s", (value, message) => {
    expect(() => normalizeSiteOrigin(value)).toThrow(message);
  });
});
