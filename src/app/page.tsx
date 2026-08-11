import type { Metadata } from "next";
import Link from "next/link";

import { CategoryTabs } from "@/components/category-tabs";
import { FaqList, type FaqItem } from "@/components/faq-list";
import { JsonLd } from "@/components/json-ld";
import { RepairBenchArt } from "@/components/repair-bench-art";
import { pageSeo, routes, siteConfig } from "@/data/site";
import { faqSchema, websiteSchema } from "@/lib/structured-data";

export const metadata: Metadata = {
  title: pageSeo.home.title,
  description: pageSeo.home.description,
  alternates: { canonical: routes.home },
  openGraph: {
    title: pageSeo.home.title,
    description: pageSeo.home.description,
    type: "website",
    url: routes.home,
  },
};

const homeFaqItems = [
  {
    question: "What is ReStory?",
    answer:
      "ReStory is a narrative-driven shop-management simulation about restoring nostalgic electronics in mid-2000s Tokyo.",
  },
  {
    question: "Where can I play ReStory?",
    answer:
      "ReStory is available through its official store page on Steam. Use the Steam link on this site to check the latest platform, price, and availability details.",
  },
  {
    question: "Is this an official ReStory website?",
    answer:
      "No. This is an independent fan-made website and is not affiliated with Mandragora, tinyBuild, or Valve.",
  },
] as const satisfies readonly FaqItem[];

const quickFacts = [
  ["Developer", "Mandragora"],
  ["Publisher", "tinyBuild"],
  ["Release", "August 6, 2026"],
  ["Standard price", "US$19.99"],
  ["Main story", "15+ hours"],
  ["Platform", "Steam"],
] as const;

export default function HomePage() {
  return (
    <main id="main-content">
      <JsonLd data={websiteSchema} />
      <JsonLd data={faqSchema(homeFaqItems)} />

      <section className="hero">
        <div className="shell hero-grid">
          <div>
            <p className="eyebrow">Fan-Made Repair Guide</p>
            <h1>{pageSeo.home.h1}</h1>
            <p className="hero-copy">
              Find source-checked walkthroughs, demo details, repair help,
              customization notes, and troubleshooting for ReStory.
            </p>
            <div className="actions">
              <Link className="action action-primary" href={routes.guide}>
                Start the Beginner Guide
              </Link>
              <Link className="action" href={routes.cleaning}>
                Explore Repair Guides
              </Link>
              <a
                className="action"
                href={siteConfig.steamUrl}
                target="_blank"
                rel="noreferrer"
              >
                Play on Steam
              </a>
            </div>
          </div>
          <RepairBenchArt />
        </div>
      </section>

      <section className="section section-soft">
        <div className="shell">
          <div className="section-heading">
            <div>
              <h2>Your ReStory repair route</h2>
              <p>
                Start with the basics, jump into a repair, plan your shop, or
                find help for a technical problem.
              </p>
            </div>
          </div>
          <CategoryTabs />
        </div>
      </section>

      <section className="section">
        <div className="shell">
          <div className="section-heading">
            <div>
              <h2>Restore devices and run a repair shop</h2>
              <p>
                ReStory combines hands-on electronics restoration with shop
                management and customer stories. You disassemble devices, clean
                parts, replace faults, rebuild gadgets, manage orders, and make
                choices that shape customer outcomes.
              </p>
            </div>
          </div>

          <h3>Quick Facts</h3>
          <dl className="facts">
            {quickFacts.map(([term, description]) => (
              <div className="fact" key={term}>
                <dt>{term}</dt>
                <dd>{description}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="section section-soft">
        <div className="shell">
          <div className="section-heading">
            <div>
              <h2>ReStory FAQ</h2>
              <p>Quick answers about the game, where to find it, and this guide.</p>
            </div>
          </div>
          <FaqList items={homeFaqItems} />
        </div>
      </section>
    </main>
  );
}
