/// <reference types="mdx" />

import type { Metadata } from "next";
import Link from "next/link";

import { Breadcrumbs } from "@/components/breadcrumbs";
import { JsonLd } from "@/components/json-ld";
import SellingContent from "@/content/how-to-sell-devices.mdx";
import { howToSellDevicesFaqItems } from "@/data/how-to-sell-devices";
import { pageSeo, routes, siteConfig } from "@/data/site";
import { absoluteUrl, breadcrumbSchema, faqSchema } from "@/lib/structured-data";

export const metadata: Metadata = {
  title: pageSeo.howToSellDevices.title,
  description: pageSeo.howToSellDevices.description,
  alternates: { canonical: routes.howToSellDevices },
  openGraph: {
    title: pageSeo.howToSellDevices.title,
    description: pageSeo.howToSellDevices.description,
    type: "article",
    url: routes.howToSellDevices,
  },
};

const articleSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: pageSeo.howToSellDevices.h1,
  description: pageSeo.howToSellDevices.description,
  dateModified: "2026-08-18",
  author: {
    "@type": "Organization",
    name: siteConfig.name,
  },
  mainEntityOfPage: absoluteUrl(routes.howToSellDevices),
} as const;

const sellingBreadcrumbSchema = breadcrumbSchema([
  { name: "Home", path: routes.home },
  { name: "Guide", path: routes.guide },
  { name: "How to Sell Devices", path: routes.howToSellDevices },
]);

const tableOfContents = [
  ["How Device Selling Fits the Shop Loop", "#how-device-selling-fits-the-shop-loop"],
  [
    "Checking a Device Before Buying or Repairing",
    "#checking-a-device-before-buying-or-repairing",
  ],
  ["Tracking Parts and Repair Costs", "#tracking-parts-and-repair-costs"],
  ["Preparing a Device for Sale", "#preparing-a-device-for-sale"],
  [
    "Comparing Cost, Condition, and Sale Value",
    "#comparing-cost-condition-and-sale-value",
  ],
  [
    "Selling Mistakes and Unconfirmed Mechanics",
    "#selling-mistakes-and-unconfirmed-mechanics",
  ],
  ["A Safe Profit Checklist", "#a-safe-profit-checklist"],
  ["Frequently Asked Questions", "#frequently-asked-questions"],
  ["Sources and Evidence Notes", "#sources-and-evidence-notes"],
] as const;

export default function HowToSellDevicesPage() {
  return (
    <main id="main-content">
      <JsonLd data={articleSchema} />
      <JsonLd data={sellingBreadcrumbSchema} />
      <JsonLd data={faqSchema(howToSellDevicesFaqItems)} />

      <header className="page-hero">
        <div className="shell">
          <Breadcrumbs
            items={[
              { label: "Home", href: routes.home },
              { label: "Guide", href: routes.guide },
              { label: "How to Sell Devices" },
            ]}
          />
          <p className="eyebrow">Shop Guide · Evidence reviewed Aug 18, 2026</p>
          <h1>{pageSeo.howToSellDevices.h1}</h1>
          <p className="hero-copy">
            Use visible costs and current sale values to make cautious decisions,
            while keeping marketplace claims tied to their source and version.
          </p>
        </div>
      </header>

      <div className="shell article-shell">
        <article className="article">
          <SellingContent />

          <nav aria-label="Related guides">
            <h2>Related guides</h2>
            <ul>
              <li>
                <Link href={routes.beginner}>Beginner Guide</Link>
              </li>
              <li>
                <Link href={routes.demo}>Demo Guide</Link>
              </li>
              <li>
                <Link href={routes.cleaning}>Cleaning Guide</Link>
              </li>
              <li>
                <Link href={routes.customizeDisplay}>Customize Display Guide</Link>
              </li>
              <li>
                <Link href={routes.systemRequirements}>System Requirements</Link>
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
