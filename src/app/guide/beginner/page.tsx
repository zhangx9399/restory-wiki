/// <reference types="mdx" />

import type { Metadata } from "next";
import Link from "next/link";

import { Breadcrumbs } from "@/components/breadcrumbs";
import { JsonLd } from "@/components/json-ld";
import BeginnerContent from "@/content/beginner.mdx";
import { beginnerFaqItems } from "@/data/beginner";
import { pageSeo, routes, siteConfig } from "@/data/site";
import { absoluteUrl, breadcrumbSchema, faqSchema } from "@/lib/structured-data";

export const metadata: Metadata = {
  title: pageSeo.beginner.title,
  description: pageSeo.beginner.description,
  alternates: { canonical: routes.beginner },
  openGraph: {
    title: pageSeo.beginner.title,
    description: pageSeo.beginner.description,
    type: "article",
    url: routes.beginner,
  },
};

const articleSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: pageSeo.beginner.h1,
  description: pageSeo.beginner.description,
  dateModified: "2026-08-18",
  author: {
    "@type": "Organization",
    name: siteConfig.name,
  },
  mainEntityOfPage: absoluteUrl(routes.beginner),
} as const;

const beginnerBreadcrumbSchema = breadcrumbSchema([
  { name: "Home", path: routes.home },
  { name: "Guide", path: routes.guide },
  { name: "Beginner Guide", path: routes.beginner },
]);

const tableOfContents = [
  ["What to Know Before Starting", "#what-to-know-before-starting"],
  ["Your First Repair Route", "#your-first-repair-route"],
  ["Cleaning and Reassembly Basics", "#cleaning-and-reassembly-basics"],
  ["Painting and Shop Customization", "#painting-and-shop-customization"],
  [
    "Managing Time, Parts, and Customer Work",
    "#managing-time-parts-and-customer-work",
  ],
  ["Beginner Mistakes to Avoid", "#beginner-mistakes-to-avoid"],
  ["What to Read Next", "#what-to-read-next"],
  ["Frequently Asked Questions", "#frequently-asked-questions"],
  ["Sources and Evidence Notes", "#sources-and-evidence-notes"],
] as const;

export default function BeginnerPage() {
  return (
    <main id="main-content">
      <JsonLd data={articleSchema} />
      <JsonLd data={beginnerBreadcrumbSchema} />
      <JsonLd data={faqSchema(beginnerFaqItems)} />

      <header className="page-hero">
        <div className="shell">
          <Breadcrumbs
            items={[
              { label: "Home", href: routes.home },
              { label: "Guide", href: routes.guide },
              { label: "Beginner Guide" },
            ]}
          />
          <p className="eyebrow">
            Beginner Guide · Evidence reviewed Aug 18, 2026
          </p>
          <h1>{pageSeo.beginner.h1}</h1>
          <p className="hero-copy">
            Learn a cautious first repair route, understand the shop systems that can
            wait, and separate confirmed mechanics from version-specific advice.
          </p>
        </div>
      </header>

      <div className="shell article-shell">
        <article className="article">
          <BeginnerContent />

          <nav aria-label="Related guides">
            <h2>Related guides</h2>
            <ul>
              <li>
                <Link href={routes.demo}>Demo guide</Link>
              </li>
              <li>
                <Link href={routes.cleaning}>Cleaning guide</Link>
              </li>
              <li>
                <Link href={routes.painting}>Painting guide</Link>
              </li>
              <li>
                <Link href={routes.customizeDisplay}>Customize Display guide</Link>
              </li>
              <li>
                <Link href={routes.systemRequirements}>System Requirements</Link>
              </li>
              <li>
                <Link href={routes.howToSellDevices}>How to Sell Devices</Link>
              </li>
            </ul>
          </nav>
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
