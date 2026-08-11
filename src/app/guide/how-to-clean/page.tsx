/// <reference types="mdx" />

import type { Metadata } from "next";
import Link from "next/link";

import { Breadcrumbs } from "@/components/breadcrumbs";
import { FaqList, type FaqItem } from "@/components/faq-list";
import { JsonLd } from "@/components/json-ld";
import CleaningContent from "@/content/how-to-clean.mdx";
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

const cleaningFaqItems = [
  {
    question: "Why can I hear cleaning but the dirt stays visible?",
    answer:
      "The part may not be fully engaged, the wrong object may be selected, the input may not be registering, or the interface may be stuck. Player reports do not establish one universal cause or fix.",
  },
  {
    question: "Is the cleaning cup on the upper-right of the workbench?",
    answer:
      "A player-verified reply identifies the cup on the upper-right as the cleaning area. Treat that as a gameplay clue, not a permanent official control description.",
  },
  {
    question: "Should I reinstall the game immediately?",
    answer:
      "No. First check the selected part and cleaning area, re-enter the interaction, reload the current session, and restart the game before considering a reinstall.",
  },
] as const satisfies readonly FaqItem[];

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

          <h2 id="frequently-asked-questions">Frequently Asked Questions</h2>
          <FaqList items={cleaningFaqItems} />

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
