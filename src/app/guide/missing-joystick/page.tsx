/// <reference types="mdx" />

import type { Metadata } from "next";
import Link from "next/link";

import { Breadcrumbs } from "@/components/breadcrumbs";
import { JsonLd } from "@/components/json-ld";
import MissingJoystickContent from "@/content/missing-joystick.mdx";
import { missingJoystickFaqItems } from "@/data/missing-joystick";
import { pageSeo, routes, siteConfig } from "@/data/site";
import { absoluteUrl, breadcrumbSchema, faqSchema } from "@/lib/structured-data";

export const metadata: Metadata = {
  title: pageSeo.missingJoystick.title,
  description: pageSeo.missingJoystick.description,
  alternates: { canonical: routes.missingJoystick },
  openGraph: {
    title: pageSeo.missingJoystick.title,
    description: pageSeo.missingJoystick.description,
    type: "article",
    url: routes.missingJoystick,
  },
};

const articleSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: pageSeo.missingJoystick.h1,
  description: pageSeo.missingJoystick.description,
  dateModified: "2026-08-18",
  author: {
    "@type": "Organization",
    name: siteConfig.name,
  },
  mainEntityOfPage: absoluteUrl(routes.missingJoystick),
} as const;

const missingJoystickBreadcrumbSchema = breadcrumbSchema([
  { name: "Home", path: routes.home },
  { name: "Guide", path: routes.guide },
  { name: "Missing Joystick", path: routes.missingJoystick },
]);

const tableOfContents = [
  ["What Missing Joystick Can Mean", "#what-missing-joystick-can-mean"],
  [
    "Check the Device, Parts, and Work Area",
    "#check-the-device-parts-and-work-area",
  ],
  [
    "Recheck Selection and Assembly State",
    "#recheck-selection-and-assembly-state",
  ],
  ["Input and Session Troubleshooting", "#input-and-session-troubleshooting"],
  [
    "What Player Reports Can and Cannot Prove",
    "#what-player-reports-can-and-cannot-prove",
  ],
  [
    "When to Stop Repeating the Same Fix",
    "#when-to-stop-repeating-the-same-fix",
  ],
  ["Missing Joystick Checklist", "#missing-joystick-checklist"],
  ["Frequently Asked Questions", "#frequently-asked-questions"],
  ["Sources and Evidence Notes", "#sources-and-evidence-notes"],
] as const;

export default function MissingJoystickPage() {
  return (
    <main id="main-content">
      <JsonLd data={articleSchema} />
      <JsonLd data={missingJoystickBreadcrumbSchema} />
      <JsonLd data={faqSchema(missingJoystickFaqItems)} />

      <header className="page-hero">
        <div className="shell">
          <Breadcrumbs
            items={[
              { label: "Home", href: routes.home },
              { label: "Guide", href: routes.guide },
              { label: "Missing Joystick" },
            ]}
          />
          <p className="eyebrow">Troubleshooting · Evidence reviewed Aug 18, 2026</p>
          <h1>{pageSeo.missingJoystick.h1}</h1>
          <p className="hero-copy">
            Separate missing parts from selection and session problems, then use
            player reports as cautious examples instead of promised fixes.
          </p>
        </div>
      </header>

      <div className="shell article-shell">
        <article className="article">
          <MissingJoystickContent />

          <nav aria-label="Related guides">
            <h2>Related guides</h2>
            <ul>
              <li>
                <Link href={routes.beginner}>Beginner Guide</Link>
              </li>
              <li>
                <Link href={routes.cleaning}>Cleaning Guide</Link>
              </li>
              <li>
                <Link href={routes.howToSellDevices}>Selling Guide</Link>
              </li>
              <li>
                <Link href={routes.systemRequirements}>System Requirements</Link>
              </li>
              <li>
                <Link href={routes.guide}>All Guides</Link>
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
