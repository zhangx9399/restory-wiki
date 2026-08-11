import type { Metadata } from "next";

import { Breadcrumbs } from "@/components/breadcrumbs";
import { GuideCard } from "@/components/guide-card";
import { JsonLd } from "@/components/json-ld";
import { guideCategories, guideEntries, type GuideCategory } from "@/data/guides";
import { pageSeo, routes } from "@/data/site";
import { absoluteUrl, breadcrumbSchema } from "@/lib/structured-data";

export const metadata: Metadata = {
  title: pageSeo.guide.title,
  description: pageSeo.guide.description,
  alternates: { canonical: routes.guide },
  openGraph: {
    title: pageSeo.guide.title,
    description: pageSeo.guide.description,
    url: routes.guide,
    type: "website",
  },
};

const categoryIds = {
  "Getting Started": "getting-started",
  "Repair & Cleaning": "repair-cleaning",
  "Shop & Customization": "shop-customization",
  "Technical Help": "technical-help",
} as const satisfies Record<GuideCategory, string>;

const collectionPageSchema = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: pageSeo.guide.h1,
  description: pageSeo.guide.description,
  url: absoluteUrl(routes.guide),
} as const;

const guideBreadcrumbSchema = breadcrumbSchema([
  { name: "Home", path: routes.home },
  { name: "Guides", path: routes.guide },
]);

export default function GuidePage() {
  return (
    <main id="main-content">
      <JsonLd data={collectionPageSchema} />
      <JsonLd data={guideBreadcrumbSchema} />

      <header className="page-hero">
        <div className="shell">
          <Breadcrumbs
            items={[
              { label: "Home", href: routes.home },
              { label: "Guides" },
            ]}
          />
          <p className="eyebrow">Source-labeled walkthroughs</p>
          <h1>{pageSeo.guide.h1}</h1>
          <p className="hero-copy">
            Start with cleaning and expand into repairs, shop management,
            customization, and technical help. Published pages are clickable;
            upcoming topics are clearly labeled.
          </p>
        </div>
      </header>

      <div className="section shell">
        {guideCategories.map((category) => (
          <section
            className="category-section"
            id={categoryIds[category]}
            key={category}
          >
            <h2>{category}</h2>
            <div className="guide-grid">
              {guideEntries
                .filter((guide) => guide.category === category)
                .map((guide) => (
                  <GuideCard key={guide.title} guide={guide} />
                ))}
            </div>
          </section>
        ))}
      </div>

      <aside className="evidence-note shell">
        <strong>Our content policy</strong>
        <p>
          Official sources establish game facts. Full gameplay can support visible
          actions. Player reports are labeled as reports and never presented as
          guaranteed fixes.
        </p>
      </aside>
    </main>
  );
}
