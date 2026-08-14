/// <reference types="mdx" />

import type { Metadata } from "next";
import Link from "next/link";

import { Breadcrumbs } from "@/components/breadcrumbs";
import { JsonLd } from "@/components/json-ld";
import PaintingContent from "@/content/painting.mdx";
import { paintingFaqItems } from "@/data/painting";
import { pageSeo, routes, siteConfig } from "@/data/site";
import { absoluteUrl, breadcrumbSchema, faqSchema } from "@/lib/structured-data";

export const metadata: Metadata = {
  title: pageSeo.painting.title,
  description: pageSeo.painting.description,
  alternates: { canonical: routes.painting },
  openGraph: {
    title: pageSeo.painting.title,
    description: pageSeo.painting.description,
    type: "article",
    url: routes.painting,
  },
};

const articleSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: pageSeo.painting.h1,
  description: pageSeo.painting.description,
  dateModified: "2026-08-14",
  author: {
    "@type": "Organization",
    name: siteConfig.name,
  },
  mainEntityOfPage: absoluteUrl(routes.painting),
} as const;

const paintingBreadcrumbSchema = breadcrumbSchema([
  { name: "Home", path: routes.home },
  { name: "Guide", path: routes.guide },
  { name: "Painting Guide", path: routes.painting },
]);

const tableOfContents = [
  ["What Painting Does in ReStory", "#what-painting-does-in-restory"],
  [
    "Getting the Airbrush and Color Palettes",
    "#getting-the-airbrush-and-color-palettes",
  ],
  ["Painting a Customer Device", "#painting-a-customer-device"],
  ["Pattern Orders and Custom Designs", "#pattern-orders-and-custom-designs"],
  [
    "Known Limits and Unconfirmed Details",
    "#known-limits-and-unconfirmed-details",
  ],
  ["Frequently Asked Questions", "#frequently-asked-questions"],
  ["Sources and Evidence Notes", "#sources-and-evidence-notes"],
] as const;

export default function PaintingPage() {
  return (
    <main id="main-content">
      <JsonLd data={articleSchema} />
      <JsonLd data={paintingBreadcrumbSchema} />
      <JsonLd data={faqSchema(paintingFaqItems)} />

      <header className="page-hero">
        <div className="shell">
          <Breadcrumbs
            items={[
              { label: "Home", href: routes.home },
              { label: "Guide", href: routes.guide },
              { label: "Painting Guide" },
            ]}
          />
          <p className="eyebrow">
            Painting &amp; Customization · Evidence reviewed Aug 14, 2026
          </p>
          <h1>{pageSeo.painting.h1}</h1>
          <p className="hero-copy">
            Find the Airbrush and palettes, separate device painting from shop
            customization, and follow pattern orders without turning unconfirmed
            controls or scoring theories into rules.
          </p>
        </div>
      </header>

      <div className="shell article-shell">
        <article className="article">
          <PaintingContent />

          <aside aria-label="Related guides">
            <h2>Related guides</h2>
            <ul>
              <li>
                <Link href="/guide/customize-display/">Customize Display</Link>
              </li>
              <li>
                <Link href={routes.guide}>Guide</Link>
              </li>
              <li>
                <Link href={routes.cleaning}>Cleaning</Link>
              </li>
            </ul>
          </aside>
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
