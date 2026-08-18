import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

describe("metadata routes", () => {
  beforeEach(() => {
    vi.stubEnv("SITE_URL", "");
    vi.stubEnv("VERCEL_PROJECT_PRODUCTION_URL", "");
    vi.stubEnv("VERCEL_URL", "");
    vi.resetModules();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("publishes all ten current routes once in sitemap order", async () => {
    const { default: sitemap } = await import("@/app/sitemap");
    const urls = sitemap().map(({ url }) => url);

    expect(urls).toEqual([
      "http://localhost:3000/",
      "http://localhost:3000/guide/",
      "http://localhost:3000/guide/how-to-clean/",
      "http://localhost:3000/demo/",
      "http://localhost:3000/guide/customize-display/",
      "http://localhost:3000/system-requirements/",
      "http://localhost:3000/guide/painting/",
      "http://localhost:3000/guide/beginner/",
      "http://localhost:3000/guide/how-to-sell-devices/",
      "http://localhost:3000/guide/missing-joystick/",
    ]);
    expect(new Set(urls).size).toBe(10);
    expect(urls.every((url) => url.startsWith("http://localhost:3000/"))).toBe(true);
    expect(urls.some((url) => url.includes("coming-next"))).toBe(false);
  });

  it("allows crawlers and advertises the local sitemap", async () => {
    const { default: robots } = await import("@/app/robots");

    expect(robots()).toEqual({
      rules: { userAgent: "*", allow: "/" },
      sitemap: "http://localhost:3000/sitemap.xml",
      host: "http://localhost:3000",
    });
  });

  it("uses SITE_URL for production discovery metadata", async () => {
    vi.stubEnv("SITE_URL", "https://restory-wiki.vercel.app");
    vi.stubEnv("VERCEL_PROJECT_PRODUCTION_URL", "");
    vi.stubEnv("VERCEL_URL", "");
    vi.resetModules();

    const [{ default: sitemap }, { default: robots }] = await Promise.all([
      import("@/app/sitemap"),
      import("@/app/robots"),
    ]);
    const urls = sitemap().map(({ url }) => url);
    const robotsMetadata = robots();

    expect(urls).toEqual([
      "https://restory-wiki.vercel.app/",
      "https://restory-wiki.vercel.app/guide/",
      "https://restory-wiki.vercel.app/guide/how-to-clean/",
      "https://restory-wiki.vercel.app/demo/",
      "https://restory-wiki.vercel.app/guide/customize-display/",
      "https://restory-wiki.vercel.app/system-requirements/",
      "https://restory-wiki.vercel.app/guide/painting/",
      "https://restory-wiki.vercel.app/guide/beginner/",
      "https://restory-wiki.vercel.app/guide/how-to-sell-devices/",
      "https://restory-wiki.vercel.app/guide/missing-joystick/",
    ]);
    expect(new Set(urls).size).toBe(10);
    expect(
      urls.every((url) => url.startsWith("https://restory-wiki.vercel.app/")),
    ).toBe(true);
    expect(robotsMetadata.sitemap).toBe(
      "https://restory-wiki.vercel.app/sitemap.xml",
    );
    expect(robotsMetadata.host).toBe("https://restory-wiki.vercel.app");
    expect(JSON.stringify({ urls, robotsMetadata })).not.toContain("localhost");
  });
});
