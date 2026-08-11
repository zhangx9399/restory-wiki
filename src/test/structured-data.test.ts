import { describe, expect, it } from "vitest";

import {
  absoluteUrl,
  breadcrumbSchema,
  faqSchema,
  websiteSchema,
} from "@/lib/structured-data";

describe("structured data builders", () => {
  it("builds absolute URLs against the configured origin", () => {
    expect(absoluteUrl("/guide/how-to-clean/")).toBe(
      "http://localhost:3000/guide/how-to-clean/",
    );
  });

  it("describes the website with its canonical identity", () => {
    expect(websiteSchema).toMatchObject({
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "ReStory Wiki",
      url: "http://localhost:3000/",
    });
  });

  it("numbers breadcrumbs from one and expands their URLs", () => {
    expect(
      breadcrumbSchema([
        { name: "Home", path: "/" },
        { name: "Guides", path: "/guide/" },
      ]),
    ).toEqual({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: "http://localhost:3000/",
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Guides",
          item: "http://localhost:3000/guide/",
        },
      ],
    });
  });

  it("builds FAQ questions and accepted answers", () => {
    expect(faqSchema([{ question: "Is this official?", answer: "No." }])).toEqual(
      {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: "Is this official?",
            acceptedAnswer: { "@type": "Answer", text: "No." },
          },
        ],
      },
    );
  });
});
