/// <reference types="mdx" />

import type { Metadata } from "next";
import Link from "next/link";

import { Breadcrumbs } from "@/components/breadcrumbs";
import { JsonLd } from "@/components/json-ld";
import CleaningContent from "@/content/how-to-clean.mdx";
import { cleaningFaqItems } from "@/data/cleaning";
import { pageSeo, routes, siteConfig } from "@/data/site";
import { absoluteUrl, breadcrumbSchema, faqSchema } from "@/lib/structured-data";

export const metadata: Metadata = {
  title: pageSeo.cleaning.title,
  description: pageSeo.cleaning.description,
  alternates: { canonical: routes.cleaning },
  openGraph: {
    title: pageSeo.cleaning.title,
    description: pageSeo.cleaning.description,
    type: "article",
    url: routes.cleaning,
  },
};

const articleSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: pageSeo.cleaning.h1,
  description: pageSeo.cleaning.description,
  dateModified: "2026-08-10",
  author: {
    "@type": "Organization",
    name: siteConfig.name,
  },
  mainEntityOfPage: absoluteUrl(routes.cleaning),
} as const;

const cleaningBreadcrumbSchema = breadcrumbSchema([
  { name: "Home", path: routes.home },
  { name: "Guides", path: routes.guide },
  { name: "How to Clean", path: routes.cleaning },
]);

const tableOfContents = [
  ["How Cleaning Works in ReStory", "#how-cleaning-works-in-restory"],
  ["Cleaning the First Pokia Device", "#cleaning-the-first-pokia-device"],
  ["Using the Correct Workbench Area", "#using-the-correct-workbench-area"],
  ["Why Dirt Is Not Disappearing", "#why-dirt-is-not-disappearing"],
  ["Cleaning Troubleshooting Checklist", "#cleaning-troubleshooting-checklist"],
  ["Frequently Asked Questions", "#frequently-asked-questions"],
  ["Sources and Evidence Notes", "#sources-and-evidence-notes"],
] as const;

export default function CleaningPage() {
  return (
    <main id="main-content">
      <JsonLd data={articleSchema} />
      <JsonLd data={cleaningBreadcrumbSchema} />
      <JsonLd data={faqSchema(cleaningFaqItems)} />

      <header className="page-hero">
        <div className="shell">
          <Breadcrumbs
            items={[
              { label: "Home", href: routes.home },
              { label: "Guides", href: routes.guide },
              { label: "How to Clean" },
            ]}
          />
          <p className="eyebrow">
            Repair &amp; Cleaning · Evidence reviewed Aug 10, 2026
          </p>
          <h1>{pageSeo.cleaning.h1}</h1>
          <p className="hero-copy">
            Move the dirty component into the correct cleaning interaction, then
            use the scrubbing action. If dirt does not change, verify the part,
            station, input, and session before treating it as a bug.
          </p>
        </div>
      </header>

      <div className="shell article-shell">
        <article className="article">
          <CleaningContent />

          <p>
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
