import type { MetadataRoute } from "next";

import { pageSeo } from "@/data/site";
import { absoluteUrl } from "@/lib/structured-data";

export default function sitemap(): MetadataRoute.Sitemap {
  return Object.values(pageSeo).map(({ path }) => ({
    url: absoluteUrl(path),
    changeFrequency: path === "/" ? "weekly" : "monthly",
    priority: path === "/" ? 1 : 0.8,
  }));
}
