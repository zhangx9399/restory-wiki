# ReStory Wiki Three-Page MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and locally verify a responsive English ReStory fan guide with a homepage, guide index, and evidence-labeled cleaning guide that passes the chapter-four SEO checks.

**Architecture:** Use the Next.js App Router with static server-rendered pages, shared TypeScript data for navigation and metadata, MDX for the article body, and small client components only where interaction is required. Keep the site content-only and database-free so the same templates can later expand from three to twelve pages.

**Tech Stack:** Next.js, React, TypeScript, Tailwind CSS, MDX, Vitest, Testing Library, Cheerio, ESLint

---

## File map

Create these files in the repository root:

- `package.json` — scripts and dependencies.
- `next.config.mjs` — MDX support and page extensions.
- `postcss.config.mjs` — Tailwind PostCSS plugin.
- `tsconfig.json` — strict TypeScript and `@/*` alias.
- `next-env.d.ts` — Next.js types.
- `eslint.config.mjs` — Next.js flat ESLint config.
- `vitest.config.ts` — jsdom test configuration.
- `vitest.setup.ts` — Testing Library matchers.
- `mdx-components.tsx` — global MDX component mapping.
- `src/app/layout.tsx` — global metadata, fonts, header, footer, and body shell.
- `src/app/globals.css` — Warm Guide Hub design system and responsive rules.
- `src/app/page.tsx` — homepage.
- `src/app/guide/page.tsx` — guide index.
- `src/app/guide/how-to-clean/page.tsx` — cleaning article wrapper and metadata.
- `src/components/site-header.tsx` — desktop and mobile navigation.
- `src/components/site-footer.tsx` — disclaimer and official links.
- `src/components/repair-bench-art.tsx` — original CSS/SVG-style hero decoration.
- `src/components/category-tabs.tsx` — accessible homepage category tabs.
- `src/components/guide-card.tsx` — linked and coming-next guide cards.
- `src/components/breadcrumbs.tsx` — semantic breadcrumb trail.
- `src/components/faq-list.tsx` — accessible FAQ disclosure list.
- `src/components/json-ld.tsx` — safe JSON-LD script output.
- `src/content/how-to-clean.mdx` — evidence-labeled cleaning guide body.
- `src/data/site.ts` — site identity, navigation, official links, and page SEO.
- `src/data/guides.ts` — three-page route information and future guide cards.
- `src/lib/structured-data.ts` — WebSite, CollectionPage, Article, Breadcrumb, and FAQ schemas.
- `src/lib/seo-rules.ts` — reusable SEO validation helpers.
- `src/test/seo-rules.test.ts` — metadata limits and heading rules.
- `src/test/category-tabs.test.tsx` — keyboard/click tab behavior.
- `src/test/pages.test.tsx` — three-page copy and heading smoke tests.
- `scripts/check-live-seo.mjs` — fetch local pages and verify title, description, canonical, and headings.
- `public/favicon.ico`, `public/favicon-16x16.png`, `public/favicon-32x32.png`, `public/apple-touch-icon.png`, `public/android-chrome-192x192.png`, `public/android-chrome-512x512.png` — copy from chapter-three assets.

## Task 1: Bootstrap the Next.js, MDX, Tailwind, and test toolchain

**Files:**

- Create: `package.json`
- Create: `next.config.mjs`
- Create: `postcss.config.mjs`
- Create: `tsconfig.json`
- Create: `next-env.d.ts`
- Create: `eslint.config.mjs`
- Create: `vitest.config.ts`
- Create: `vitest.setup.ts`
- Create: `mdx-components.tsx`

- [ ] **Step 1: Create the package manifest**

```json
{
  "name": "restory-wiki",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint .",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "test:watch": "vitest",
    "check:seo": "node scripts/check-live-seo.mjs"
  },
  "dependencies": {
    "@mdx-js/loader": "latest",
    "@mdx-js/react": "latest",
    "@next/mdx": "latest",
    "next": "latest",
    "react": "latest",
    "react-dom": "latest",
    "rehype-slug": "latest"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "latest",
    "@testing-library/jest-dom": "latest",
    "@testing-library/react": "latest",
    "@types/mdx": "latest",
    "@types/node": "latest",
    "@types/react": "latest",
    "@types/react-dom": "latest",
    "cheerio": "latest",
    "eslint": "latest",
    "eslint-config-next": "latest",
    "jsdom": "latest",
    "tailwindcss": "latest",
    "typescript": "latest",
    "vitest": "latest"
  }
}
```

- [ ] **Step 2: Add framework configuration**

```js
// next.config.mjs
import createMDX from "@next/mdx";
import rehypeSlug from "rehype-slug";

const withMDX = createMDX({ options: { mdxOptions: { rehypePlugins: [rehypeSlug] } } });

export default withMDX({
  pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],
  trailingSlash: true,
});
```

```js
// postcss.config.mjs
export default {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};
```

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": false,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "react-jsx",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts", "**/*.mdx"],
  "exclude": ["node_modules"]
}
```

```ts
/// <reference types="next" />
/// <reference types="next/image-types/global" />
```

```js
// eslint.config.mjs
import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

export default defineConfig([
  ...nextVitals,
  ...nextTypescript,
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
]);
```

```ts
// vitest.config.ts
import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
  resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
  test: { environment: "jsdom", setupFiles: ["./vitest.setup.ts"] },
});
```

```ts
// vitest.setup.ts
import "@testing-library/jest-dom/vitest";
```

```tsx
// mdx-components.tsx
import type { MDXComponents } from "mdx/types";

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return components;
}
```

- [ ] **Step 3: Install dependencies and lock versions**

Run: `npm install`

Expected: `package-lock.json` is created and `npm` exits with code 0.

- [ ] **Step 4: Verify the empty toolchain**

Run: `npm run typecheck`

Expected: PASS with no TypeScript errors.

- [ ] **Step 5: Commit the bootstrap**

```bash
git add package.json package-lock.json next.config.mjs postcss.config.mjs tsconfig.json next-env.d.ts eslint.config.mjs vitest.config.ts vitest.setup.ts mdx-components.tsx
git commit -m "chore: bootstrap ReStory wiki"
```

## Task 2: Define source-of-truth site data and SEO rules with tests

**Files:**

- Create: `src/data/site.ts`
- Create: `src/data/guides.ts`
- Create: `src/lib/seo-rules.ts`
- Create: `src/test/seo-rules.test.ts`

- [ ] **Step 1: Write failing SEO tests**

```ts
// src/test/seo-rules.test.ts
import { describe, expect, it } from "vitest";
import { pageSeo } from "@/data/site";
import { validateDescription, validateTitle } from "@/lib/seo-rules";

describe("page SEO", () => {
  it.each(Object.entries(pageSeo))("keeps %s title within 30-60 characters", (_, seo) => {
    expect(validateTitle(seo.title)).toBe(true);
  });

  it.each(Object.entries(pageSeo))("keeps %s description within 140-160 characters", (_, seo) => {
    expect(validateDescription(seo.description)).toBe(true);
  });

  it("uses a distinct H1 for every route", () => {
    const headings = Object.values(pageSeo).map((seo) => seo.h1);
    expect(new Set(headings).size).toBe(headings.length);
  });
});
```

- [ ] **Step 2: Run the test and confirm it fails**

Run: `npm test -- src/test/seo-rules.test.ts`

Expected: FAIL because `@/data/site` and `@/lib/seo-rules` do not exist.

- [ ] **Step 3: Add site data and validators**

```ts
// src/lib/seo-rules.ts
export const validateTitle = (value: string) => value.length >= 30 && value.length <= 60;
export const validateDescription = (value: string) => value.length >= 140 && value.length <= 160;
```

```ts
// src/data/site.ts
export const siteConfig = {
  name: "ReStory Wiki",
  origin: "http://localhost:3000",
  steamUrl: "https://store.steampowered.com/app/3812600/ReStory_Chill_Electronic_Repairs/",
  discordUrl: "https://discord.gg/restory",
  description: "Independent, source-labeled ReStory guides for repairs, shop management, demo details, and troubleshooting.",
} as const;

export const pageSeo = {
  home: {
    path: "/",
    title: "ReStory Wiki — Guides, Demo & Repair Tips",
    description: "Explore ReStory: Chill Electronics Repairs guides, demo details, system requirements, repair walkthroughs, customization tips, and troubleshooting help.",
    h1: "ReStory: Chill Electronics Repairs Guides",
  },
  guide: {
    path: "/guide/",
    title: "ReStory Guides — Beginner, Repair & Shop Help",
    description: "Browse ReStory guides for beginners, cleaning, repairs, shop management, customization, system requirements, and common troubleshooting questions.",
    h1: "ReStory Guides",
  },
  cleaning: {
    path: "/guide/how-to-clean/",
    title: "How to Clean Items in ReStory — First Device Guide",
    description: "Learn how cleaning works in ReStory, where to place dirty parts, how to clean the first Pokia device, and what to check when dirt will not disappear.",
    h1: "How to Clean Items in ReStory",
  },
} as const;
```

```ts
// src/data/guides.ts
export type GuideStatus = "published" | "coming-next";
export type GuideCategory = "Getting Started" | "Repair & Cleaning" | "Shop & Customization" | "Technical Help";

export type GuideEntry = {
  title: string;
  description: string;
  category: GuideCategory;
  href?: string;
  status: GuideStatus;
};

export const guideEntries: GuideEntry[] = [
  { title: "Beginner Guide", description: "The recommended route through ReStory's first repairs and shop systems.", category: "Getting Started", status: "coming-next" },
  { title: "Demo vs Full Game", description: "What the demo includes and which details still need official confirmation.", category: "Getting Started", status: "coming-next" },
  { title: "How to Clean Items", description: "Clean the first Pokia device and troubleshoot dirt that will not disappear.", category: "Repair & Cleaning", href: "/guide/how-to-clean/", status: "published" },
  { title: "Painting Guide", description: "Airbrush, color palettes, and known customization limits.", category: "Repair & Cleaning", status: "coming-next" },
  { title: "How to Sell Devices", description: "Compare parts costs before repairing and reselling marketplace devices.", category: "Shop & Customization", status: "coming-next" },
  { title: "Customize Your Shop", description: "Understand gadget painting, walls, shelves, storage, and decorations.", category: "Shop & Customization", status: "coming-next" },
  { title: "System Requirements", description: "Official minimum specifications and version-labeled performance advice.", category: "Technical Help", status: "coming-next" },
  { title: "Missing Joystick", description: "Evidence-labeled reports and safe troubleshooting without invented fixes.", category: "Technical Help", status: "coming-next" },
];

export const guideCategories: GuideCategory[] = ["Getting Started", "Repair & Cleaning", "Shop & Customization", "Technical Help"];
```

- [ ] **Step 4: Run tests**

Run: `npm test -- src/test/seo-rules.test.ts`

Expected: PASS, 7 assertions across title, description, and H1 checks.

- [ ] **Step 5: Commit the data model**

```bash
git add src/data src/lib/seo-rules.ts src/test/seo-rules.test.ts
git commit -m "test: define page SEO and guide data"
```

## Task 3: Build shared layout, navigation, visual system, and structured data

**Files:**

- Create: `src/app/globals.css`
- Create: `src/app/layout.tsx`
- Create: `src/components/site-header.tsx`
- Create: `src/components/site-footer.tsx`
- Create: `src/components/repair-bench-art.tsx`
- Create: `src/components/guide-card.tsx`
- Create: `src/components/breadcrumbs.tsx`
- Create: `src/components/faq-list.tsx`
- Create: `src/components/json-ld.tsx`
- Create: `src/lib/structured-data.ts`
- Copy: `../../第三关-游戏信息与素材/favicon/*` → `public/`

- [ ] **Step 1: Add reusable structured-data builders**

```ts
// src/lib/structured-data.ts
import { siteConfig } from "@/data/site";

export const absoluteUrl = (path: string) => new URL(path, siteConfig.origin).toString();

export const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: siteConfig.name,
  url: siteConfig.origin,
  description: siteConfig.description,
};

export const breadcrumbSchema = (items: { name: string; path: string }[]) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: items.map((item, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: item.name,
    item: absoluteUrl(item.path),
  })),
});

export const faqSchema = (items: { question: string; answer: string }[]) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: items.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: { "@type": "Answer", text: item.answer },
  })),
});
```

- [ ] **Step 2: Add small semantic components**

```tsx
// src/components/json-ld.tsx
export function JsonLd({ data }: { data: object }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}
```

```tsx
// src/components/breadcrumbs.tsx
import Link from "next/link";

export function Breadcrumbs({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="breadcrumbs">
      <ol>{items.map((item, index) => <li key={item.label}>{item.href ? <Link href={item.href}>{item.label}</Link> : <span aria-current="page">{item.label}</span>}{index < items.length - 1 && <span aria-hidden="true">/</span>}</li>)}</ol>
    </nav>
  );
}
```

```tsx
// src/components/faq-list.tsx
export function FaqList({ items }: { items: { question: string; answer: string }[] }) {
  return <div className="faq-list">{items.map((item) => <details key={item.question}><summary>{item.question}</summary><p>{item.answer}</p></details>)}</div>;
}
```

```tsx
// src/components/guide-card.tsx
import Link from "next/link";
import type { GuideEntry } from "@/data/guides";

export function GuideCard({ guide }: { guide: GuideEntry }) {
  const content = <><span className="guide-status">{guide.status === "published" ? "Read now" : "Coming next"}</span><h3>{guide.title}</h3><p>{guide.description}</p></>;
  return guide.href ? <Link className="guide-card" href={guide.href}>{content}</Link> : <div className="guide-card guide-card-muted" aria-label={`${guide.title}, coming next`}>{content}</div>;
}
```

- [ ] **Step 3: Add header, footer, and original hero art**

```tsx
// src/components/site-header.tsx
"use client";

import Link from "next/link";
import { useState } from "react";
import { siteConfig } from "@/data/site";

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  return <header className="site-header"><div className="shell nav-shell"><Link className="brand" href="/"><span className="brand-mark" aria-hidden="true" />ReStory Wiki</Link><button className="menu-toggle" type="button" aria-expanded={open} aria-controls="site-nav" onClick={() => setOpen((value) => !value)}>Menu</button><nav id="site-nav" aria-label="Primary" data-open={open}><Link href="/guide/">Guides</Link><Link href="/guide/#repair-cleaning">Repairs</Link><Link href="/guide/how-to-clean/">How to Clean</Link><a className="steam-link" href={siteConfig.steamUrl} target="_blank" rel="noreferrer">Play on Steam ↗</a></nav></div></header>;
}
```

```tsx
// src/components/site-footer.tsx
import Link from "next/link";
import { siteConfig } from "@/data/site";

export function SiteFooter() {
  return <footer className="site-footer"><div className="shell footer-grid"><div><strong>ReStory Wiki</strong><p>Independent, source-labeled guides for ReStory players.</p></div><nav aria-label="Footer"><Link href="/">Home</Link><Link href="/guide/">Guides</Link><Link href="/guide/how-to-clean/">Cleaning Guide</Link><a href={siteConfig.steamUrl} target="_blank" rel="noreferrer">Official Steam page ↗</a></nav></div><div className="shell disclaimer">Fan-made guide. Not affiliated with Mandragora, tinyBuild, or Valve.</div></footer>;
}
```

```tsx
// src/components/repair-bench-art.tsx
export function RepairBenchArt() {
  return <div className="repair-art" role="img" aria-label="Original illustration of a screwdriver, circuit board, and warm repair lamp"><span className="repair-lamp" /><span className="repair-board"><i /><i /><i /></span><span className="repair-tool" /></div>;
}
```

- [ ] **Step 4: Add the root layout and metadata base**

```tsx
// src/app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { siteConfig } from "@/data/site";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.origin),
  applicationName: siteConfig.name,
  icons: { icon: [{ url: "/favicon.ico" }, { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" }], apple: "/apple-touch-icon.png" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><a className="skip-link" href="#main-content">Skip to content</a><SiteHeader />{children}<SiteFooter /></body></html>;
}
```

- [ ] **Step 5: Add the Warm Guide Hub CSS**

Create `src/app/globals.css` with the complete token and component rules below:

```css
@import "tailwindcss";

:root { --paper:#f7f2e5; --surface:#fffdf7; --ink:#203139; --muted:#5f6d70; --yellow:#f2c84b; --teal:#245f66; --teal-dark:#17464c; --coral:#d96855; --line:#ddd4bf; --shadow:0 18px 45px rgba(36,62,66,.10); }
* { box-sizing:border-box; }
html { scroll-behavior:smooth; }
body { margin:0; color:var(--ink); background:var(--paper); font-family:Arial, Helvetica, sans-serif; line-height:1.65; }
a { color:inherit; }
.shell { width:min(1120px, calc(100% - 32px)); margin-inline:auto; }
.skip-link { position:fixed; top:8px; left:8px; z-index:100; transform:translateY(-150%); padding:8px 12px; background:#fff; color:#111; }
.skip-link:focus { transform:none; }
.site-header { position:sticky; top:0; z-index:50; background:rgba(242,200,75,.96); border-bottom:1px solid rgba(32,49,57,.15); backdrop-filter:blur(12px); }
.nav-shell { min-height:68px; display:flex; align-items:center; gap:24px; }
.brand { display:flex; align-items:center; gap:10px; margin-right:auto; font-weight:850; text-decoration:none; letter-spacing:-.02em; }
.brand-mark { position:relative; width:30px; height:30px; border-radius:9px; background:var(--teal); box-shadow:inset 0 0 0 3px rgba(255,255,255,.18); }
.brand-mark::after { content:""; position:absolute; width:5px; height:22px; left:13px; top:4px; border-radius:5px; background:var(--yellow); transform:rotate(42deg); }
#site-nav { display:flex; align-items:center; gap:22px; font-size:.94rem; font-weight:700; }
#site-nav a { text-decoration:none; }
#site-nav a:hover, #site-nav a:focus-visible { text-decoration:underline; text-underline-offset:5px; }
.steam-link { padding:9px 13px; border:1px solid rgba(32,49,57,.35); border-radius:10px; }
.menu-toggle { display:none; border:1px solid rgba(32,49,57,.35); background:transparent; border-radius:9px; padding:8px 10px; font-weight:750; }
.hero { padding:72px 0 54px; overflow:hidden; }
.hero-grid { display:grid; grid-template-columns:minmax(0,1.05fr) minmax(320px,.95fr); align-items:center; gap:48px; }
.eyebrow { margin:0 0 12px; color:#9b463b; font-size:.78rem; font-weight:850; letter-spacing:.16em; text-transform:uppercase; }
h1,h2,h3 { line-height:1.12; letter-spacing:-.035em; }
h1 { max-width:780px; margin:0; font-size:clamp(2.5rem,7vw,5.2rem); }
h2 { margin:0 0 16px; font-size:clamp(1.8rem,4vw,3rem); }
h3 { margin:0 0 8px; font-size:1.18rem; }
.hero-copy { max-width:650px; margin:22px 0; color:var(--muted); font-size:1.08rem; }
.actions { display:flex; flex-wrap:wrap; gap:12px; }
.action { display:inline-flex; align-items:center; justify-content:center; min-height:46px; padding:10px 17px; border:1px solid var(--teal); border-radius:12px; color:var(--teal); font-weight:800; text-decoration:none; }
.action-primary { color:#fff; background:var(--teal); }
.action:hover, .action:focus-visible { transform:translateY(-2px); box-shadow:0 8px 18px rgba(36,95,102,.18); }
.repair-art { position:relative; min-height:390px; border:1px solid var(--line); border-radius:32px; background:linear-gradient(145deg,#fff9df,#ead9bd); box-shadow:var(--shadow); overflow:hidden; }
.repair-lamp { position:absolute; width:260px; height:260px; right:-40px; top:-50px; border-radius:50%; background:radial-gradient(circle,#fff4b8 0 18%,#f2c84b 19% 42%,transparent 43%); opacity:.8; }
.repair-board { position:absolute; width:220px; height:150px; left:54px; bottom:62px; border-radius:24px; background:var(--teal); transform:rotate(-7deg); box-shadow:0 22px 30px rgba(23,70,76,.24); }
.repair-board::before,.repair-board::after,.repair-board i { content:""; position:absolute; border:3px solid #f7df7d; border-radius:50%; }
.repair-board::before { width:44px; height:44px; left:26px; top:28px; }
.repair-board::after { width:62px; height:28px; right:24px; bottom:24px; border-radius:8px; }
.repair-board i:nth-child(1) { width:18px; height:18px; right:35px; top:25px; }
.repair-board i:nth-child(2) { width:10px; height:10px; left:88px; bottom:24px; }
.repair-board i:nth-child(3) { width:74px; height:3px; left:70px; top:65px; border-width:0; background:#f7df7d; }
.repair-tool { position:absolute; width:28px; height:250px; right:84px; bottom:40px; border-radius:18px; background:linear-gradient(#df6d57 0 38%,#d7dce0 39% 78%,#38474d 79%); transform:rotate(38deg); box-shadow:0 18px 24px rgba(32,49,57,.22); }
.section { padding:64px 0; }
.section-soft { background:#efe5d1; border-block:1px solid var(--line); }
.section-heading { max-width:720px; margin-bottom:26px; }
.section-heading p { color:var(--muted); }
.guide-grid { display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:16px; }
.guide-card { display:block; min-height:190px; padding:22px; border:1px solid var(--line); border-radius:18px; background:var(--surface); box-shadow:0 8px 22px rgba(32,49,57,.06); text-decoration:none; }
a.guide-card:hover,a.guide-card:focus-visible { transform:translateY(-4px); border-color:var(--teal); }
.guide-card-muted { box-shadow:none; background:rgba(255,253,247,.48); }
.guide-status { display:inline-block; margin-bottom:22px; color:#8f473d; font-size:.72rem; font-weight:850; letter-spacing:.1em; text-transform:uppercase; }
.guide-card p { margin:0; color:var(--muted); font-size:.92rem; }
.tab-list { display:flex; flex-wrap:wrap; gap:8px; margin:0 0 22px; }
.tab-list button { padding:9px 13px; border:1px solid var(--line); border-radius:999px; background:var(--surface); color:var(--ink); font-weight:750; }
.tab-list button[aria-selected="true"] { border-color:var(--teal); background:var(--teal); color:#fff; }
.facts { display:grid; grid-template-columns:repeat(3,1fr); gap:12px; margin:28px 0 0; }
.fact { padding:18px; border:1px solid var(--line); border-radius:14px; background:var(--surface); }
.fact dt { color:var(--muted); font-size:.76rem; font-weight:800; letter-spacing:.1em; text-transform:uppercase; }
.fact dd { margin:4px 0 0; font-weight:800; }
.faq-list details { border-top:1px solid var(--line); padding:18px 0; }
.faq-list details:last-child { border-bottom:1px solid var(--line); }
.faq-list summary { cursor:pointer; font-weight:800; }
.faq-list p { color:var(--muted); }
.page-hero { padding:58px 0 34px; }
.page-hero h1 { max-width:900px; font-size:clamp(2.5rem,6vw,4.7rem); }
.breadcrumbs ol { display:flex; flex-wrap:wrap; gap:8px; margin:0 0 22px; padding:0; list-style:none; color:var(--muted); font-size:.9rem; }
.breadcrumbs li { display:flex; gap:8px; }
.category-section { padding:30px 0; scroll-margin-top:90px; }
.article-shell { display:grid; grid-template-columns:minmax(0,760px) minmax(220px,1fr); gap:48px; align-items:start; }
.article { padding-bottom:70px; }
.article > p:first-of-type { font-size:1.15rem; color:#42565b; }
.article h2 { margin-top:52px; font-size:2rem; }
.article h3 { margin-top:28px; font-size:1.3rem; }
.article a { color:var(--teal-dark); font-weight:700; }
.quick-answer,.evidence-note { margin:26px 0; padding:20px 22px; border-radius:16px; }
.quick-answer { border-left:5px solid var(--teal); background:#e4efeb; }
.evidence-note { border:1px solid #e2c46e; background:#fff2c8; }
.article-aside { position:sticky; top:96px; padding:20px; border:1px solid var(--line); border-radius:16px; background:var(--surface); }
.article-aside a { display:block; margin:9px 0; color:var(--teal-dark); }
.site-footer { padding:48px 0 20px; color:#eaf0ef; background:#1d3439; }
.footer-grid { display:grid; grid-template-columns:1fr auto; gap:36px; }
.footer-grid p { color:#b9c7c8; }
.footer-grid nav { display:grid; gap:8px; }
.footer-grid a { color:#fff; }
.disclaimer { margin-top:34px; padding-top:18px; border-top:1px solid rgba(255,255,255,.15); color:#b9c7c8; font-size:.85rem; }
@media (max-width:820px) { .hero-grid,.article-shell { grid-template-columns:1fr; } .guide-grid { grid-template-columns:repeat(2,1fr); } .repair-art { min-height:320px; } .article-aside { position:static; } #site-nav { position:absolute; display:none; top:68px; left:0; right:0; padding:18px 16px 24px; background:var(--yellow); flex-direction:column; align-items:stretch; } #site-nav[data-open="true"] { display:flex; } .menu-toggle { display:block; } }
@media (max-width:520px) { .shell { width:min(100% - 24px,1120px); } .hero { padding-top:46px; } .hero-grid { gap:28px; } .repair-art { min-height:260px; border-radius:22px; } .repair-board { left:28px; bottom:42px; transform:scale(.8) rotate(-7deg); transform-origin:left bottom; } .repair-tool { right:58px; bottom:22px; transform:scale(.8) rotate(38deg); transform-origin:bottom; } .guide-grid,.facts,.footer-grid { grid-template-columns:1fr; } h1 { font-size:2.5rem; } .section { padding:48px 0; } }
```

- [ ] **Step 6: Copy the independent favicon set**

Run from the repository root:

```bash
mkdir -p public
cp ../../第三关-游戏信息与素材/favicon/favicon.ico public/
cp ../../第三关-游戏信息与素材/favicon/favicon-16x16.png public/
cp ../../第三关-游戏信息与素材/favicon/favicon-32x32.png public/
cp ../../第三关-游戏信息与素材/favicon/apple-touch-icon.png public/
cp ../../第三关-游戏信息与素材/favicon/android-chrome-192x192.png public/
cp ../../第三关-游戏信息与素材/favicon/android-chrome-512x512.png public/
```

Expected: all six files exist under `public/`.

- [ ] **Step 7: Run static checks and commit**

Run: `npm run typecheck && npm run lint`

Expected: both commands PASS.

```bash
git add src/app src/components src/lib/structured-data.ts public
git commit -m "feat: add warm guide hub shell"
```

## Task 4: Build and test the accessible homepage tabs and homepage

**Files:**

- Create: `src/components/category-tabs.tsx`
- Create: `src/test/category-tabs.test.tsx`
- Create: `src/app/page.tsx`

- [ ] **Step 1: Write the failing interaction test**

```tsx
// src/test/category-tabs.test.tsx
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CategoryTabs } from "@/components/category-tabs";

describe("CategoryTabs", () => {
  it("shows repair guides after selecting Repair", () => {
    render(<CategoryTabs />);
    fireEvent.click(screen.getByRole("tab", { name: "Repair" }));
    expect(screen.getByRole("tab", { name: "Repair" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByText("How to Clean Items")).toBeVisible();
  });
});
```

- [ ] **Step 2: Run the test and confirm it fails**

Run: `npm test -- src/test/category-tabs.test.tsx`

Expected: FAIL because `CategoryTabs` does not exist.

- [ ] **Step 3: Implement the tabs**

```tsx
// src/components/category-tabs.tsx
"use client";

import { useState } from "react";
import { guideEntries } from "@/data/guides";
import { GuideCard } from "@/components/guide-card";

const tabs = ["Beginner", "Repair", "Shop", "Troubleshooting"] as const;
const categoryMap = { Beginner: "Getting Started", Repair: "Repair & Cleaning", Shop: "Shop & Customization", Troubleshooting: "Technical Help" } as const;

export function CategoryTabs() {
  const [active, setActive] = useState<(typeof tabs)[number]>("Beginner");
  const guides = guideEntries.filter((guide) => guide.category === categoryMap[active]);
  return <div><div className="tab-list" role="tablist" aria-label="Guide categories">{tabs.map((tab) => <button key={tab} type="button" role="tab" aria-selected={active === tab} aria-controls="guide-tab-panel" onClick={() => setActive(tab)}>{tab}</button>)}</div><div id="guide-tab-panel" role="tabpanel" className="guide-grid">{guides.map((guide) => <GuideCard key={guide.title} guide={guide} />)}</div></div>;
}
```

- [ ] **Step 4: Implement the homepage**

```tsx
// src/app/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { CategoryTabs } from "@/components/category-tabs";
import { FaqList } from "@/components/faq-list";
import { JsonLd } from "@/components/json-ld";
import { RepairBenchArt } from "@/components/repair-bench-art";
import { pageSeo, siteConfig } from "@/data/site";
import { faqSchema, websiteSchema } from "@/lib/structured-data";

const faqs = [
  { question: "What is ReStory?", answer: "ReStory: Chill Electronics Repairs is a narrative-driven shop-management simulation about restoring nostalgic electronics in mid-2000s Tokyo." },
  { question: "Where can I play ReStory?", answer: "The official ReStory store page is on Steam. Use the Steam link on this site for current platform, price, and availability information." },
  { question: "Is this an official ReStory website?", answer: "No. ReStory Wiki is an independent fan-made guide and is not affiliated with Mandragora, tinyBuild, or Valve." },
];

export const metadata: Metadata = { title: pageSeo.home.title, description: pageSeo.home.description, alternates: { canonical: pageSeo.home.path }, openGraph: { title: pageSeo.home.title, description: pageSeo.home.description, type: "website", url: pageSeo.home.path } };

export default function HomePage() {
  return <main id="main-content"><JsonLd data={websiteSchema} /><JsonLd data={faqSchema(faqs)} /><section className="hero"><div className="shell hero-grid"><div><p className="eyebrow">Fan-Made Repair Guide</p><h1>{pageSeo.home.h1}</h1><p className="hero-copy">Find source-checked walkthroughs, demo details, repair help, customization notes, and troubleshooting for ReStory.</p><div className="actions"><Link className="action action-primary" href="/guide/">Start the Beginner Guide</Link><Link className="action" href="/guide/how-to-clean/">Explore Repair Guides</Link><a className="action" href={siteConfig.steamUrl} target="_blank" rel="noreferrer">Play on Steam ↗</a></div></div><RepairBenchArt /></div></section><section className="section section-soft"><div className="shell"><div className="section-heading"><p className="eyebrow">Start here</p><h2>Your ReStory repair route</h2><p>Begin with the information you need now, then move into repairs, shop systems, and technical help.</p></div><CategoryTabs /></div></section><section className="section"><div className="shell"><div className="section-heading"><p className="eyebrow">About the game</p><h2>Restore devices and run a repair shop</h2><p>ReStory combines hands-on electronics restoration with shop management and customer stories. You disassemble devices, clean parts, replace faults, rebuild gadgets, manage orders, and make choices that shape customer outcomes.</p></div><dl className="facts"><div className="fact"><dt>Developer</dt><dd>Mandragora</dd></div><div className="fact"><dt>Publisher</dt><dd>tinyBuild</dd></div><div className="fact"><dt>Release</dt><dd>August 6, 2026</dd></div><div className="fact"><dt>Standard price</dt><dd>US$19.99</dd></div><div className="fact"><dt>Main story</dt><dd>15+ hours</dd></div><div className="fact"><dt>Platform</dt><dd>Steam</dd></div></dl></div></section><section className="section section-soft"><div className="shell"><div className="section-heading"><p className="eyebrow">Quick answers</p><h2>ReStory FAQ</h2></div><FaqList items={faqs} /></div></section></main>;
}
```

- [ ] **Step 5: Run interaction and static checks**

Run: `npm test -- src/test/category-tabs.test.tsx && npm run typecheck && npm run lint`

Expected: PASS.

- [ ] **Step 6: Commit the homepage**

```bash
git add src/components/category-tabs.tsx src/test/category-tabs.test.tsx src/app/page.tsx
git commit -m "feat: build ReStory homepage"
```

## Task 5: Build the Guide navigation page

**Files:**

- Create: `src/app/guide/page.tsx`

- [ ] **Step 1: Implement the guide index with exactly one H1**

```tsx
// src/app/guide/page.tsx
import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { GuideCard } from "@/components/guide-card";
import { JsonLd } from "@/components/json-ld";
import { guideCategories, guideEntries } from "@/data/guides";
import { pageSeo, siteConfig } from "@/data/site";
import { breadcrumbSchema } from "@/lib/structured-data";

export const metadata: Metadata = { title: pageSeo.guide.title, description: pageSeo.guide.description, alternates: { canonical: pageSeo.guide.path }, openGraph: { title: pageSeo.guide.title, description: pageSeo.guide.description, url: pageSeo.guide.path } };

const collectionSchema = { "@context": "https://schema.org", "@type": "CollectionPage", name: pageSeo.guide.h1, description: pageSeo.guide.description, url: `${siteConfig.origin}/guide/` };

export default function GuidePage() {
  return <main id="main-content"><JsonLd data={collectionSchema} /><JsonLd data={breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Guides", path: "/guide/" }])} /><header className="page-hero"><div className="shell"><Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Guides" }]} /><p className="eyebrow">Source-labeled walkthroughs</p><h1>{pageSeo.guide.h1}</h1><p className="hero-copy">Start with cleaning and expand into repairs, shop management, customization, and technical help. Published pages are clickable; upcoming topics are clearly labeled.</p></div></header><div className="shell">{guideCategories.map((category) => <section className="category-section" id={category === "Repair & Cleaning" ? "repair-cleaning" : undefined} key={category}><div className="section-heading"><h2>{category}</h2></div><div className="guide-grid">{guideEntries.filter((guide) => guide.category === category).map((guide) => <GuideCard key={guide.title} guide={guide} />)}</div></section>)}<aside className="evidence-note"><strong>Our content policy</strong><p>Official sources establish game facts. Full gameplay can support visible actions. Player reports are labeled as reports and never presented as guaranteed fixes.</p></aside></div></main>;
}
```

- [ ] **Step 2: Run static checks**

Run: `npm run typecheck && npm run lint`

Expected: PASS.

- [ ] **Step 3: Commit the Guide page**

```bash
git add src/app/guide/page.tsx
git commit -m "feat: add guide navigation page"
```

## Task 6: Build the evidence-labeled cleaning article in MDX

**Files:**

- Create: `src/content/how-to-clean.mdx`
- Create: `src/app/guide/how-to-clean/page.tsx`

- [ ] **Step 1: Write the MDX article body**

```mdx
## How Cleaning Works in ReStory

Cleaning is one part of ReStory's wider repair loop. The official Steam description confirms that repairs involve opening devices, cleaning individual parts, replacing damaged components, and putting the device back together. That means the cleaning interaction applies to a removed part at the appropriate work area, not automatically to the complete device wherever it is sitting.

For the first Pokia repair, players report that the dirty component needs to be moved to the cleaning position near the cup at the upper-right side of the workbench. Enter the cleaning interaction there and choose the available scrubbing action. This location and interaction sequence comes from player troubleshooting, not a published official control guide, so interface wording may change between versions or input methods.

<div className="quick-answer"><strong>Quick answer:</strong> Remove the dirty part, move it into the cleaning area by the cup on the upper-right of the workbench, enter the cleaning interaction, and use the scrubbing action. If you hear the action but the dirt does not change, stop repeating the same input and work through the checks below.</div>

## Cleaning the First Pokia Device

Start by treating the Pokia as a device made of separate components. Open or disassemble it far enough to select the part that is actually marked as dirty. A whole-device view can make it look as though cleaning should work immediately, while the game may be waiting for the individual component to be placed in the correct work area.

Move the dirty component away from the general assembly space and toward the cleaning position. Player replies to the first-item discussion identify the cup or cleaning spot at the upper-right of the workbench as the relevant target. Once the component is accepted by that area, enter the cleaning interaction and use the offered brushing or scrubbing action.

Watch the part rather than relying only on sound. A successful interaction should produce visible progress or a state change. If the game plays a sound but the dirt remains unchanged, the part may not be correctly engaged with the cleaning station, the input may not be registering as intended, or the current build may be showing a UI or interaction bug.

## Using the Correct Workbench Area

ReStory separates disassembly, cleaning, parts handling, and reassembly into related workbench interactions. Keep these spaces conceptually separate: selecting a part on the main bench is not the same as placing it into the cleaning interaction, and storing a part is not the same as cleaning it.

Before trying again, confirm three things. First, the object under the cursor is the dirty component rather than the assembled device or a nearby part. Second, the component has been moved into the cleaning area instead of simply placed near it. Third, the cleaning interface or action has actually opened before you begin scrubbing.

The exact labels, prompts, and input icons can vary by game version and control method. This guide therefore describes the verified interaction idea without inventing a fixed button name.

## Why Dirt Is Not Disappearing

### The part is near the station but not engaged

Visual proximity is not always enough. Pick up the dirty component, move it away, and place it back into the cleaning position deliberately. Wait for the cleaning interaction to appear before using the action again.

### The wrong object is selected

Return to the device view and verify which component is marked dirty. If the complete shell or a clean component is selected, scrubbing may make noise without advancing the repair objective.

### The input is not registering correctly

Release the current input, exit the cleaning interaction, and enter it again. If you changed between mouse, keyboard, or controller, retry with the input method that produced the on-screen prompt. ReStory has had player-reported input and interface issues, but the reports do not prove that every cleaning failure has the same cause.

### The current session may be stuck

Save when the game allows it, return to the menu, and reload the repair. If the same part still cannot be cleaned after the normal interaction is repeated carefully, restart the game and check the Steam community's Bugs & Technical Issues area for a matching current-version report.

## Cleaning Troubleshooting Checklist

1. Confirm that cleaning is required for the selected component.
2. Separate or expose the dirty component instead of targeting the complete device.
3. Move that component into the cup or cleaning area at the upper-right of the workbench.
4. Wait for the cleaning interaction before using the scrubbing action.
5. Look for visible cleaning progress rather than relying only on sound.
6. Exit and re-enter the interaction if the part is accepted but does not change.
7. Reload the repair or restart the game if the interaction remains stuck.
8. Report a reproducible problem with the game version, input method, and exact part involved.

## Sources and Evidence Notes

- **Official source:** [ReStory Steam store page](https://store.steampowered.com/app/3812600/ReStory_Chill_Electronic_Repairs/) — confirms cleaning as part of the core repair loop.
- **Player report:** [Stuck at First Item discussion](https://steamcommunity.com/app/3812600/discussions/1/684114096137749161/) — supports the cup/cleaning-area interaction clue and the report of sound without progress.
- **Player reports:** [Bugs & Technical Issues](https://steamcommunity.com/app/3812600/discussions/1/) — supports the existence of cleaning and input-related problems, not a guaranteed universal fix.

Last evidence review: August 10, 2026. Recheck official patch notes and current discussions after major updates.
```

- [ ] **Step 2: Add the article wrapper, one H1, metadata, and schemas**

```tsx
// src/app/guide/how-to-clean/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { FaqList } from "@/components/faq-list";
import { JsonLd } from "@/components/json-ld";
import HowToCleanContent from "@/content/how-to-clean.mdx";
import { pageSeo, siteConfig } from "@/data/site";
import { breadcrumbSchema, faqSchema } from "@/lib/structured-data";

const faqs = [
  { question: "Why can I hear cleaning but the dirt stays visible?", answer: "The part may not be fully engaged, the wrong object may be selected, the input may not be registering, or the interface may be stuck. Current evidence does not support one universal fix." },
  { question: "Is the cleaning cup on the upper-right of the workbench?", answer: "A player-verified reply identifies that location. Treat it as a gameplay clue rather than a permanent official control description." },
  { question: "Should I reinstall the game immediately?", answer: "No. First check the part and cleaning area, re-enter the interaction, reload the repair, and restart the game." },
];

export const metadata: Metadata = { title: pageSeo.cleaning.title, description: pageSeo.cleaning.description, alternates: { canonical: pageSeo.cleaning.path }, openGraph: { title: pageSeo.cleaning.title, description: pageSeo.cleaning.description, type: "article", url: pageSeo.cleaning.path } };

const articleSchema = { "@context": "https://schema.org", "@type": "Article", headline: pageSeo.cleaning.h1, description: pageSeo.cleaning.description, dateModified: "2026-08-10", author: { "@type": "Organization", name: siteConfig.name }, mainEntityOfPage: `${siteConfig.origin}${pageSeo.cleaning.path}` };

export default function CleaningGuidePage() {
  return <main id="main-content"><JsonLd data={articleSchema} /><JsonLd data={breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Guides", path: "/guide/" }, { name: "How to Clean", path: pageSeo.cleaning.path }])} /><JsonLd data={faqSchema(faqs)} /><header className="page-hero"><div className="shell"><Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Guides", href: "/guide/" }, { label: "How to Clean" }]} /><p className="eyebrow">Repair & Cleaning · Evidence reviewed Aug 10, 2026</p><h1>{pageSeo.cleaning.h1}</h1><p className="hero-copy">Move the dirty component into the correct cleaning interaction, then use the scrubbing action. If dirt does not change, verify the part, station, input, and session before treating it as a bug.</p></div></header><div className="shell article-shell"><article className="article"><HowToCleanContent /><section aria-labelledby="article-faq"><h2 id="article-faq">Frequently Asked Questions</h2><FaqList items={faqs} /></section></article><aside className="article-aside"><strong>On this page</strong><a href="#how-cleaning-works-in-restory">How cleaning works</a><a href="#cleaning-the-first-pokia-device">First Pokia device</a><a href="#why-dirt-is-not-disappearing">Dirt not disappearing</a><a href="#cleaning-troubleshooting-checklist">Checklist</a><Link href="/guide/">All ReStory guides →</Link></aside></div></main>;
}
```

- [ ] **Step 3: Run type, lint, and build checks**

Run: `npm run typecheck && npm run lint && npm run build`

Expected: all three commands PASS and Next.js lists `/`, `/guide`, and `/guide/how-to-clean` as generated routes.

- [ ] **Step 4: Commit the article**

```bash
git add src/content/how-to-clean.mdx src/app/guide/how-to-clean/page.tsx
git commit -m "feat: publish evidence-labeled cleaning guide"
```

## Task 7: Add page smoke tests and a live SEO checker

**Files:**

- Create: `src/test/pages.test.tsx`
- Create: `scripts/check-live-seo.mjs`

- [ ] **Step 1: Write page source-of-truth smoke tests**

```tsx
// src/test/pages.test.tsx
import { describe, expect, it } from "vitest";
import { guideEntries } from "@/data/guides";
import { pageSeo } from "@/data/site";

describe("MVP routes", () => {
  it("defines exactly three published routes", () => {
    const routes = [pageSeo.home.path, pageSeo.guide.path, pageSeo.cleaning.path];
    expect(routes).toEqual(["/", "/guide/", "/guide/how-to-clean/"]);
  });

  it("publishes the cleaning guide and leaves future cards non-clickable", () => {
    const published = guideEntries.filter((guide) => guide.status === "published");
    expect(published).toHaveLength(1);
    expect(published[0].href).toBe("/guide/how-to-clean/");
    expect(guideEntries.filter((guide) => guide.status === "coming-next").every((guide) => !guide.href)).toBe(true);
  });
});
```

- [ ] **Step 2: Add a local-server SEO checker**

```js
// scripts/check-live-seo.mjs
import * as cheerio from "cheerio";

const base = process.env.SITE_URL || "http://localhost:3000";
const routes = ["/", "/guide/", "/guide/how-to-clean/"];
let failed = false;

for (const route of routes) {
  const response = await fetch(new URL(route, base));
  if (!response.ok) throw new Error(`${route} returned ${response.status}`);
  const $ = cheerio.load(await response.text());
  const title = $("title").text().trim();
  const description = $('meta[name="description"]').attr("content")?.trim() || "";
  const canonical = $('link[rel="canonical"]').attr("href") || "";
  const h1Count = $("h1").length;
  const headings = $("h1,h2,h3").map((_, element) => element.tagName.toUpperCase()).get();
  const valid = title.length >= 30 && title.length <= 60 && description.length >= 140 && description.length <= 160 && canonical.length > 0 && h1Count === 1 && headings[0] === "H1";
  console.log(JSON.stringify({ route, titleLength: title.length, descriptionLength: description.length, canonical, h1Count, headings, valid }));
  if (!valid) failed = true;
}

if (failed) process.exit(1);
```

- [ ] **Step 3: Run the full automated suite**

Run: `npm test && npm run typecheck && npm run lint && npm run build`

Expected: all commands PASS.

- [ ] **Step 4: Start the production server and run live SEO checks**

Terminal A: `npm start`

Terminal B: `npm run check:seo`

Expected: three JSON lines with `valid:true`, `h1Count:1`, and a non-empty canonical.

- [ ] **Step 5: Commit verification tooling**

```bash
git add src/test/pages.test.tsx scripts/check-live-seo.mjs
git commit -m "test: verify MVP routes and live SEO"
```

## Task 8: Browser, mobile, AITDK, and final repository verification

**Files:**

- Modify only files implicated by real verification failures.

- [ ] **Step 1: Verify browser navigation at desktop width**

Open these URLs and click through the header, homepage cards, breadcrumb links, Guide card, and footer:

- `http://localhost:3000/`
- `http://localhost:3000/guide/`
- `http://localhost:3000/guide/how-to-clean/`

Expected: no blank pages, every published internal link works, Steam opens as an external URL, and coming-next cards are not links.

- [ ] **Step 2: Verify approximately 360px mobile layout**

Expected: menu opens and closes, no horizontal scroll, headings do not overflow, cards stack to one column, article aside moves below or beside content without covering it, and all tap targets remain usable.

- [ ] **Step 3: Check AITDK Overview for each route**

Expected for every page:

- title present;
- description present;
- exactly one H1;
- H2/H3 list matches the visible content structure.

- [ ] **Step 4: Run final command verification**

Run: `npm test && npm run typecheck && npm run lint && npm run build`

Expected: all commands exit 0.

- [ ] **Step 5: Check repository status and commit only genuine fixes**

Run: `git status --short`

Expected before any genuine fix: clean working tree.

If verification changes any tracked implementation file, stage only the known site paths and commit them:

```bash
git add src scripts public package.json package-lock.json next.config.mjs postcss.config.mjs tsconfig.json eslint.config.mjs vitest.config.ts vitest.setup.ts mdx-components.tsx
git commit -m "fix: resolve MVP verification findings"
```

If verification changes nothing, do not create an empty commit. Do not create a remote or push until the user provides or approves the GitHub destination.
