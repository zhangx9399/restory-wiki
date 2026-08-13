import { describe, expect, it } from "vitest";

import robots from "@/app/robots";
import sitemap from "@/app/sitemap";

describe("metadata routes", () => {
  it("publishes only the current routes in sitemap order", () => {
    expect(sitemap().map(({ url }) => url)).toEqual([
      "http://localhost:3000/",
      "http://localhost:3000/guide/",
      "http://localhost:3000/guide/how-to-clean/",
    ]);
    expect(sitemap().map(({ url }) => url)).not.toContain("coming-next");
  });

  it("allows crawlers and advertises the local sitemap", () => {
    expect(robots()).toEqual({
      rules: { userAgent: "*", allow: "/" },
      sitemap: "http://localhost:3000/sitemap.xml",
      host: "http://localhost:3000",
    });
  });
});
