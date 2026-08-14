/// <reference types="mdx" />

import type { Metadata } from "next";
import Link from "next/link";

import { Breadcrumbs } from "@/components/breadcrumbs";
import { JsonLd } from "@/components/json-ld";
import SystemRequirementsContent from "@/content/system-requirements.mdx";
import { systemRequirementsFaqItems } from "@/data/system-requirements";
import { pageSeo, routes, siteConfig } from "@/data/site";
import { absoluteUrl, breadcrumbSchema, faqSchema } from "@/lib/structured-data";

export const metadata: Metadata = {
  title: pageSeo.systemRequirements.title,
  description: pageSeo.systemRequirements.description,
  alternates: { canonical: routes.systemRequirements },
  openGraph: {
    title: pageSeo.systemRequirements.title,
    description: pageSeo.systemRequirements.description,
    type: "article",
    url: routes.systemRequirements,
  },
};

const articleSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: pageSeo.systemRequirements.h1,
  description: pageSeo.systemRequirements.description,
  dateModified: "2026-08-14",
  author: {
    "@type": "Organization",
    name: siteConfig.name,
  },
  mainEntityOfPage: absoluteUrl(routes.systemRequirements),
} as const;

const systemRequirementsBreadcrumbSchema = breadcrumbSchema([
  { name: "Home", path: routes.home },
  { name: "System Requirements", path: routes.systemRequirements },
]);

const tableOfContents = [
  ["Official Minimum System Requirements", "#official-minimum-system-requirements"],
  ["Can Your PC Run ReStory?", "#can-your-pc-run-restory"],
  ["Storage, DirectX, and Windows Support", "#storage-directx-and-windows-support"],
  ["VSync and Frame-Rate Troubleshooting", "#vsync-and-frame-rate-troubleshooting"],
  ["What Is Not Officially Confirmed", "#what-is-not-officially-confirmed"],
  ["Frequently Asked Questions", "#frequently-asked-questions"],
  ["Sources and Evidence Notes", "#sources-and-evidence-notes"],
] as const;

export default function SystemRequirementsPage() {
  return (
    <main id="main-content">
      <JsonLd data={articleSchema} />
      <JsonLd data={systemRequirementsBreadcrumbSchema} />
      <JsonLd data={faqSchema(systemRequirementsFaqItems)} />

      <header className="page-hero">
        <div className="shell">
          <Breadcrumbs
            items={[
              { label: "Home", href: routes.home },
              { label: "System Requirements" },
            ]}
          />
          <p className="eyebrow">PC Requirements · Evidence reviewed Aug 14, 2026</p>
          <h1>{pageSeo.systemRequirements.h1}</h1>
          <p className="hero-copy">
            Compare your Windows PC with ReStory&apos;s official minimum, then use
            carefully version-labeled checks for storage, DirectX, and GPU performance.
          </p>
        </div>
      </header>

      <div className="shell article-shell">
        <article className="article">
          <SystemRequirementsContent />

          <nav aria-label="Related guides">
            <p>
              <strong>Related guides</strong>
            </p>
            <ul>
              <li>
                <Link href="/demo/">Demo guide</Link>
              </li>
              <li>
                <Link href={routes.guide}>All ReStory guides</Link>
              </li>
              <li>
                <Link href={routes.cleaning}>Cleaning guide</Link>
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
