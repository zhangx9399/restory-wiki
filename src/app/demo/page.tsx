/// <reference types="mdx" />

import type { Metadata } from "next";
import Link from "next/link";

import { Breadcrumbs } from "@/components/breadcrumbs";
import { JsonLd } from "@/components/json-ld";
import DemoContent from "@/content/demo.mdx";
import { demoFaqItems } from "@/data/demo";
import { pageSeo, routes, siteConfig } from "@/data/site";
import { absoluteUrl, breadcrumbSchema, faqSchema } from "@/lib/structured-data";

export const metadata: Metadata = {
  title: pageSeo.demo.title,
  description: pageSeo.demo.description,
  alternates: { canonical: routes.demo },
  openGraph: {
    title: pageSeo.demo.title,
    description: pageSeo.demo.description,
    type: "article",
    url: routes.demo,
  },
};

const articleSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: pageSeo.demo.h1,
  description: pageSeo.demo.description,
  dateModified: "2026-08-14",
  author: {
    "@type": "Organization",
    name: siteConfig.name,
  },
  mainEntityOfPage: absoluteUrl(routes.demo),
} as const;

const demoBreadcrumbSchema = breadcrumbSchema([
  { name: "Home", path: routes.home },
  { name: "Guides", path: routes.guide },
  { name: "Demo Guide", path: routes.demo },
]);

const tableOfContents = [
  ["Where to Download the ReStory Demo", "#where-to-download-the-restory-demo"],
  ["What the Demo Includes", "#what-the-demo-includes"],
  ["ReStory Demo vs Full Game", "#restory-demo-vs-full-game"],
  ["Does Demo Progress Carry Over?", "#does-demo-progress-carry-over"],
  [
    "Demo Requirements and Known Limits",
    "#demo-requirements-and-known-limits",
  ],
  ["Frequently Asked Questions", "#frequently-asked-questions"],
  ["Sources and Evidence Notes", "#sources-and-evidence-notes"],
] as const;

export default function DemoPage() {
  return (
    <main id="main-content">
      <JsonLd data={articleSchema} />
      <JsonLd data={demoBreadcrumbSchema} />
      <JsonLd data={faqSchema(demoFaqItems)} />

      <header className="page-hero">
        <div className="shell">
          <Breadcrumbs
            items={[
              { label: "Home", href: routes.home },
              { label: "Guides", href: routes.guide },
              { label: "Demo Guide" },
            ]}
          />
          <p className="eyebrow">Demo Guide · Evidence reviewed Aug 14, 2026</p>
          <h1>{pageSeo.demo.h1}</h1>
          <p className="hero-copy">
            Find the official demo, understand its evidence-backed scope, and
            compare it with the full release without assuming a fixed playtime or
            save transfer.
          </p>
        </div>
      </header>

      <div className="shell article-shell">
        <article className="article">
          <DemoContent />

          <p>
            Related guides: <Link href={routes.guide}>All ReStory guides</Link>,{" "}
            <Link href={routes.systemRequirements}>System requirements</Link>, and{" "}
            <Link href={routes.cleaning}>Cleaning guide</Link>.
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
