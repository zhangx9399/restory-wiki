/// <reference types="mdx" />

import type { Metadata } from "next";
import Link from "next/link";

import { Breadcrumbs } from "@/components/breadcrumbs";
import { JsonLd } from "@/components/json-ld";
import CustomizeDisplayContent from "@/content/customize-display.mdx";
import { customizeDisplayFaqItems } from "@/data/customize-display";
import { pageSeo, routes, siteConfig } from "@/data/site";
import { absoluteUrl, breadcrumbSchema, faqSchema } from "@/lib/structured-data";

export const metadata: Metadata = {
  title: pageSeo.customizeDisplay.title,
  description: pageSeo.customizeDisplay.description,
  alternates: { canonical: routes.customizeDisplay },
  openGraph: {
    title: pageSeo.customizeDisplay.title,
    description: pageSeo.customizeDisplay.description,
    type: "article",
    url: routes.customizeDisplay,
  },
};

const articleSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: pageSeo.customizeDisplay.h1,
  description: pageSeo.customizeDisplay.description,
  dateModified: "2026-08-14",
  author: {
    "@type": "Organization",
    name: siteConfig.name,
  },
  mainEntityOfPage: absoluteUrl(routes.customizeDisplay),
} as const;

const customizeDisplayBreadcrumbSchema = breadcrumbSchema([
  { name: "Home", path: routes.home },
  { name: "Guide", path: routes.guide },
  { name: "Customize Your Shop", path: routes.customizeDisplay },
]);

const tableOfContents = [
  [
    "Shop Customization vs Gadget Painting",
    "#shop-customization-vs-gadget-painting",
  ],
  ["What You Can Customize", "#what-you-can-customize"],
  ["Walls, Shelves, and Storage", "#walls-shelves-and-storage"],
  ["Adding and Arranging Decorations", "#adding-and-arranging-decorations"],
  [
    "Customization Tips and Version Notes",
    "#customization-tips-and-version-notes",
  ],
  ["Frequently Asked Questions", "#frequently-asked-questions"],
  ["Sources and Evidence Notes", "#sources-and-evidence-notes"],
] as const;

export default function CustomizeDisplayPage() {
  return (
    <main id="main-content">
      <JsonLd data={articleSchema} />
      <JsonLd data={customizeDisplayBreadcrumbSchema} />
      <JsonLd data={faqSchema(customizeDisplayFaqItems)} />

      <header className="page-hero">
        <div className="shell">
          <Breadcrumbs
            items={[
              { label: "Home", href: routes.home },
              { label: "Guide", href: routes.guide },
              { label: "Customize Your Shop" },
            ]}
          />
          <p className="eyebrow">
            Shop &amp; Customization · Evidence reviewed Aug 14, 2026
          </p>
          <h1>{pageSeo.customizeDisplay.h1}</h1>
          <p className="hero-copy">
            Learn which shop elements are officially confirmed, how shop changes
            differ from gadget painting, and where the current evidence stops.
          </p>
        </div>
      </header>

      <div className="shell article-shell">
        <article className="article">
          <CustomizeDisplayContent />

          <p>
            Related: <Link href={routes.painting}>Painting guide</Link> ·{" "}
            <Link href={routes.cleaning}>Cleaning guide</Link> ·{" "}
            <Link href={routes.guide}>Back to all guides</Link>
          </p>
        </article>

        <aside className="article-aside" aria-label="Table of contents">
          <h2>On this page</h2>
          <ul>
            {tableOfContents.map(([label, href]) => (
              <li key={href}>
                <a href={href}>{label}</a>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </main>
  );
}
