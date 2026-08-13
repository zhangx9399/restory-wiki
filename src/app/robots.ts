import type { MetadataRoute } from "next";

import { siteConfig } from "@/data/site";
import { absoluteUrl } from "@/lib/structured-data";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: absoluteUrl("/sitemap.xml"),
    host: siteConfig.origin,
  };
}
