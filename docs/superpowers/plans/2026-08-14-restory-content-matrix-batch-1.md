# ReStory First Content Matrix Batch Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish four evidence-labeled ReStory articles—Demo, shop customization, system requirements, and painting—and connect them to the existing public guide hub without introducing unsupported game claims.

**Architecture:** Each article uses an App Router route, a focused MDX body, and a small data module shared by the visible FAQ and FAQPage schema. The existing `routes`, `pageSeo`, `guideEntries`, sitemap, shared article shell, and live SEO checker remain the source of truth for discovery and navigation.

**Tech Stack:** Next.js 16 App Router, React, TypeScript, MDX with `rehype-slug`, Vitest, Testing Library, Cheerio, ESLint, and the existing live SEO CLI.

---

## File map

New page units:

- `src/app/demo/page.tsx` — Demo metadata, schemas, breadcrumb, hero, TOC, and related links.
- `src/content/demo.mdx` — Demo guide prose and visible FAQ.
- `src/data/demo.ts` — Demo FAQ data shared with JSON-LD.
- `src/app/guide/customize-display/page.tsx` — Shop-customization page shell.
- `src/content/customize-display.mdx` — Shop-customization prose and evidence notes.
- `src/data/customize-display.ts` — Shop-customization FAQ data.
- `src/app/system-requirements/page.tsx` — System-requirements page shell.
- `src/content/system-requirements.mdx` — Requirements and version-labeled performance guidance.
- `src/data/system-requirements.ts` — Requirements FAQ data.
- `src/app/guide/painting/page.tsx` — Painting page shell.
- `src/content/painting.mdx` — Painting prose and evidence notes.
- `src/data/painting.ts` — Painting FAQ data.

New tests:

- `src/test/demo-page.test.tsx`
- `src/test/customize-display-page.test.tsx`
- `src/test/system-requirements-page.test.tsx`
- `src/test/painting-page.test.tsx`
- `src/test/content-evidence-contract.test.ts`

Existing files modified after all four routes exist:

- `src/data/site.ts` — seven route and SEO definitions.
- `src/data/guides.ts` — publish four cards with real hrefs.
- `src/components/site-header.tsx` — expose Demo and System Requirements in primary navigation.
- `src/test/pages.test.tsx` — seven-route and five-published-card inventory.
- `src/test/guide-page.test.tsx` — five linked cards and three inert cards.
- `src/test/home-page.test.tsx` — Demo and Customize featured links become active.
- `src/test/shared-components.test.tsx` — published-card accessibility contract.
- `src/test/metadata-routes.test.ts` — sitemap contains seven absolute production URLs.
- `scripts/check-live-seo.mjs` — audit all five article pages with the shared article contract.
- `scripts/check-live-seo.test.mjs` — expectations and regression fixtures for seven routes.

## Task 1: Establish a clean execution baseline

**Files:** No production changes.

- [ ] **Step 1: Confirm isolation and branch state**

Run:

```bash
git status --short
git branch --show-current
git rev-parse HEAD
git rev-parse origin/main
```

Expected: clean status on `feature/restory-public-launch`; HEAD contains the approved design and plan commits, and its parent content includes current `origin/main`.

- [ ] **Step 2: Install dependencies only if missing**

Run:

```bash
test -d node_modules || npm install
```

Expected: `node_modules` exists and the lockfile is not changed by installation.

- [ ] **Step 3: Prove the existing baseline is green**

Run:

```bash
npm test
npm run typecheck
npm run lint
npm run build -- --webpack
```

Expected: all current tests pass; typecheck, lint, and webpack production build exit 0. If any baseline check fails, stop and report the exact pre-existing failure before editing production files.

## Task 2: Build the Demo article with TDD

**Files:**

- Create: `src/test/demo-page.test.tsx`
- Create: `src/data/demo.ts`
- Create: `src/content/demo.mdx`
- Create: `src/app/demo/page.tsx`
- Modify: `src/data/site.ts`

- [ ] **Step 1: Write the failing route and content-contract test**

The test imports `DemoPage` and `metadata`, mocks `@/content/demo.mdx` only for component-level rendering, and reads the real MDX for editorial checks. It must assert:

```ts
expect(metadata.title).toBe(
  "ReStory Demo Guide — Download, Content & Full Game",
);
expect(metadata.description).toBe(
  "Learn where to download the ReStory demo, what it includes, how it differs from the full game, and what is known about demo save progress.",
);
expect(Object.values(routes)).toContain("/demo/");
expect(h1s).toHaveLength(1);
expect(h1s[0]).toHaveTextContent("ReStory Demo Guide");
expect(h2s).toEqual([
  "Where to Download the ReStory Demo",
  "What the Demo Includes",
  "ReStory Demo vs Full Game",
  "Does Demo Progress Carry Over?",
  "Demo Requirements and Known Limits",
  "Frequently Asked Questions",
  "Sources and Evidence Notes",
]);
```

It also checks one Quick Answer before the first H2, three JSON-LD blocks, TOC target equality, three visible FAQ entries synchronized with schema, 900–1,300 cleaned words, and at least three labeled source links.

- [ ] **Step 2: Run the Demo test and verify RED**

Run:

```bash
npm test -- src/test/demo-page.test.tsx
```

Expected: FAIL because `@/app/demo/page`, `@/content/demo.mdx`, and `@/data/demo` do not exist.

- [ ] **Step 3: Add the Demo route and SEO registry entries**

Add to `routes` and `pageSeo`:

```ts
demo: "/demo/",

demo: {
  path: routes.demo,
  title: "ReStory Demo Guide — Download, Content & Full Game",
  description:
    "Learn where to download the ReStory demo, what it includes, how it differs from the full game, and what is known about demo save progress.",
  h1: "ReStory Demo Guide",
},
```

- [ ] **Step 4: Create the shared Demo FAQ data**

Use these three evidence-safe questions:

```ts
export const demoFaqItems = [
  {
    question: "Where can I download the ReStory demo?",
    answer:
      "Use the separate ReStory demo listing on Steam, App ID 4146680. Check the live Steam page before downloading because availability can change.",
  },
  {
    question: "What is different in the full game?",
    answer:
      "Official launch information describes more devices, characters, tool upgrades, storage, shelves, wall customization, and decorations in the full release.",
  },
  {
    question: "Does ReStory demo progress carry over?",
    answer:
      "No equally authoritative official source was found for save transfer. A player report says their demo save did not transfer, so start the full game expecting that transfer may not be available and check current official guidance.",
  },
] as const;
```

- [ ] **Step 5: Write the complete Demo MDX**

The Quick Answer must state that the demo has a separate Steam listing and that save transfer is unconfirmed. Use the exact H2 order from Step 1. Support the first three sections with the Steam Demo page and official Steam news; label the save-transfer statement as a player report. Include these source URLs:

```text
https://store.steampowered.com/app/4146680
https://steamcommunity.com/app/3812600/allnews/
https://www.reddit.com/r/Games/comments/1vh8gz7/restory_chill_electronics_repairs_review_thread/
```

The article must not state a guaranteed demo length or save-transfer result.

- [ ] **Step 6: Create the Demo page shell**

Follow the existing cleaning route contract: `Metadata`, `Article`, `BreadcrumbList`, `FAQPage`, `header.page-hero`, `shell article-shell`, `article.article`, and `aside.article-aside`. Use `dateModified: "2026-08-14"`, the exact seven TOC anchors from Step 1, and related links to Guide, System Requirements, and Cleaning.

- [ ] **Step 7: Run the focused test and verify GREEN**

Run:

```bash
npm test -- src/test/demo-page.test.tsx
npm run typecheck
```

Expected: Demo suite passes and typecheck exits 0.

- [ ] **Step 8: Commit the Demo page**

```bash
git add src/app/demo/page.tsx src/content/demo.mdx src/data/demo.ts src/data/site.ts src/test/demo-page.test.tsx
git commit -m "feat: publish ReStory demo guide"
```

## Task 3: Build the shop-customization article with TDD

**Files:**

- Create: `src/test/customize-display-page.test.tsx`
- Create: `src/data/customize-display.ts`
- Create: `src/content/customize-display.mdx`
- Create: `src/app/guide/customize-display/page.tsx`
- Modify: `src/data/site.ts`

- [ ] **Step 1: Write the failing page contract**

Assert the exact metadata, route, H1, Quick Answer placement, three schemas, TOC targets, synchronized FAQ, labeled sources, and this H2 order:

```ts
[
  "Shop Customization vs Gadget Painting",
  "What You Can Customize",
  "Walls, Shelves, and Storage",
  "Adding and Arranging Decorations",
  "Customization Tips and Version Notes",
  "Frequently Asked Questions",
  "Sources and Evidence Notes",
]
```

The real-MDX assertions must reject unqualified claims containing `press`, `click`, `menu path`, `unlock level`, or `available from level` unless the same paragraph explicitly says the control or unlock condition is not officially confirmed.

- [ ] **Step 2: Verify RED**

Run:

```bash
npm test -- src/test/customize-display-page.test.tsx
```

Expected: FAIL because the customization route, data, and MDX modules do not exist.

- [ ] **Step 3: Add the route and SEO registry entries**

```ts
customizeDisplay: "/guide/customize-display/",

customizeDisplay: {
  path: routes.customizeDisplay,
  title: "How to Customize Your Shop in ReStory",
  description:
    "Understand ReStory shop customization, including walls, shelf styles, storage, decorations, and how shop changes differ from gadget painting.",
  h1: "How to Customize Your Shop in ReStory",
},
```

- [ ] **Step 4: Create three shared FAQ entries**

The questions must cover the difference between shop and gadget customization, confirmed shop elements, and unknown unlock conditions. The unknown-condition answer must explicitly say that current sources do not establish an exact unlock level or permanent menu path.

- [ ] **Step 5: Write the complete customization MDX**

Use the H2 order from Step 1 and these sources:

```text
https://steamcommunity.com/app/3812600/
https://steamcommunity.com/app/3812600/allnews/
https://www.youtube.com/watch?v=x6lq9h_5Xa0
```

State only that official launch information confirms wall colors, shelf styles, storage shelves, and decorations. Treat the long-form video as visible-scene corroboration, not as proof of every key, menu, or unlock condition.

- [ ] **Step 6: Create the route shell and schemas**

Use Guide as the second breadcrumb, `dateModified: "2026-08-14"`, the seven exact TOC anchors, and related links to Painting, Guide, and Cleaning.

- [ ] **Step 7: Verify GREEN and commit**

Run:

```bash
npm test -- src/test/customize-display-page.test.tsx
npm run typecheck
git add src/app/guide/customize-display/page.tsx src/content/customize-display.mdx src/data/customize-display.ts src/data/site.ts src/test/customize-display-page.test.tsx
git commit -m "feat: add ReStory shop customization guide"
```

Expected: focused tests and typecheck pass before the commit.

## Task 4: Build the system-requirements article with TDD

**Files:**

- Create: `src/test/system-requirements-page.test.tsx`
- Create: `src/data/system-requirements.ts`
- Create: `src/content/system-requirements.mdx`
- Create: `src/app/system-requirements/page.tsx`
- Modify: `src/data/site.ts`

- [ ] **Step 1: Write the failing requirements contract**

Assert exact metadata, one H1, Quick Answer placement, Article/Breadcrumb/FAQ schemas, TOC, FAQ synchronization, 900–1,300 words, and this H2 order:

```ts
[
  "Official Minimum System Requirements",
  "Can Your PC Run ReStory?",
  "Storage, DirectX, and Windows Support",
  "VSync and Frame-Rate Troubleshooting",
  "What Is Not Officially Confirmed",
  "Frequently Asked Questions",
  "Sources and Evidence Notes",
]
```

The source test must verify the presence of `Windows 10 x64`, `2 cores / 4 threads`, `4 GB RAM`, `GTX 750 Ti`, `DirectX 11`, and `1 GB available space`. It must reject a fabricated `recommended requirements` table.

- [ ] **Step 2: Verify RED**

```bash
npm test -- src/test/system-requirements-page.test.tsx
```

Expected: FAIL because the requirements modules do not exist.

- [ ] **Step 3: Add the route and exact SEO data**

```ts
systemRequirements: "/system-requirements/",

systemRequirements: {
  path: routes.systemRequirements,
  title: "ReStory System Requirements — Can Your PC Run It?",
  description:
    "Check ReStory's official minimum PC requirements, storage and DirectX needs, and version-labeled VSync and frame-rate troubleshooting advice.",
  h1: "ReStory System Requirements",
},
```

- [ ] **Step 4: Create three shared FAQ entries**

Answer whether 4 GB RAM is the official minimum, whether recommended requirements exist, and what to try for GPU-bound performance. The performance answer must say the VSync and 30/60 FPS guidance came from an older official build notice and may not diagnose every current issue.

- [ ] **Step 5: Write the complete requirements MDX**

Use only the official Steam values as the minimum table. Explain that meeting a minimum is not a performance guarantee. Use these sources:

```text
https://store.steampowered.com/app/3812600/ReStory_Chill_Electronic_Repairs/
https://www.pcgamingwiki.com/wiki/ReStory%3A_Chill_Electronics_Repairs
https://steamcommunity.com/app/3812600/allnews/
```

The performance section must carry an `older build` or equivalent version label in every paragraph that recommends changing VSync or target FPS.

- [ ] **Step 6: Create the route shell and verify GREEN**

Use Home and System Requirements breadcrumbs, `dateModified: "2026-08-14"`, seven exact TOC anchors, and related links to Demo, Guide, and Cleaning.

Run:

```bash
npm test -- src/test/system-requirements-page.test.tsx
npm run typecheck
```

Expected: focused tests and typecheck pass.

- [ ] **Step 7: Commit**

```bash
git add src/app/system-requirements/page.tsx src/content/system-requirements.mdx src/data/system-requirements.ts src/data/site.ts src/test/system-requirements-page.test.tsx
git commit -m "feat: publish ReStory system requirements"
```

## Task 5: Build the painting article with TDD

**Files:**

- Create: `src/test/painting-page.test.tsx`
- Create: `src/data/painting.ts`
- Create: `src/content/painting.mdx`
- Create: `src/app/guide/painting/page.tsx`
- Modify: `src/data/site.ts`

- [ ] **Step 1: Write the failing painting contract**

Assert exact metadata, one H1, Quick Answer placement, three schemas, TOC, FAQ synchronization, 900–1,300 words, three labeled sources, and this H2 order:

```ts
[
  "What Painting Does in ReStory",
  "Getting the Airbrush and Color Palettes",
  "Painting a Customer Device",
  "Pattern Orders and Custom Designs",
  "Known Limits and Unconfirmed Details",
  "Frequently Asked Questions",
  "Sources and Evidence Notes",
]
```

The test must reject a claimed permanent button, unlock level, undo method, paint-consumption formula, or scoring formula unless the paragraph explicitly states that the detail is unconfirmed.

- [ ] **Step 2: Verify RED**

```bash
npm test -- src/test/painting-page.test.tsx
```

Expected: FAIL because the painting modules do not exist.

- [ ] **Step 3: Add route and exact SEO data**

```ts
painting: "/guide/painting/",

painting: {
  path: routes.painting,
  title: "ReStory Painting Guide — Airbrush & Color Palettes",
  description:
    "Learn what the Airbrush and color palettes do in ReStory, how painting differs from shop customization, and which painting details remain unconfirmed.",
  h1: "ReStory Painting Guide",
},
```

- [ ] **Step 4: Create three shared FAQ entries**

Cover where the Airbrush and palettes come from, whether painting is the same as shop customization, and whether the guide can guarantee a scoring formula. The scoring answer must state that no reliable source supports a universal formula.

- [ ] **Step 5: Write the complete painting MDX**

Use these sources:

```text
https://steamcommunity.com/app/3812600/allnews/
https://steamcommunity.com/app/3812600/
https://www.youtube.com/watch?v=x6lq9h_5Xa0
```

Official sources support Airbrush, color palettes, custom device skins, and community designs. The video and its discussion may corroborate pattern-order existence but may not establish controls or scoring rules.

- [ ] **Step 6: Create route shell, verify GREEN, and commit**

Use Guide as the second breadcrumb, `dateModified: "2026-08-14"`, seven exact TOC anchors, and related links to Customize Display, Guide, and Cleaning.

Run:

```bash
npm test -- src/test/painting-page.test.tsx
npm run typecheck
git add src/app/guide/painting/page.tsx src/content/painting.mdx src/data/painting.ts src/data/site.ts src/test/painting-page.test.tsx
git commit -m "feat: publish ReStory painting guide"
```

Expected: focused tests and typecheck pass before commit.

## Task 6: Enforce the cross-page evidence contract

**Files:**

- Create: `src/test/content-evidence-contract.test.ts`
- Modify: the four MDX files only when a RED assertion reveals a real contract violation.

- [ ] **Step 1: Write a parameterized failing editorial test**

For each new MDX file, strip imports, JSX tags, Markdown links, headings, and list markers before counting words. Assert 900–1,300 words, no H1, Quick Answer before the first H2, FAQ before Sources, at least three external sources, and no absolute unsupported language matching:

```ts
/officially recommended specifications|save progress (?:will|does) carry over|press the [A-Z0-9]+ button|unlocks? at level \d+|universal scoring formula/i
```

Add page-specific assertions for `player report`, `older build`, `not officially confirmed`, and `visible gameplay corroboration` where the design requires them.

- [ ] **Step 2: Run and verify RED when a contract is missing**

```bash
npm test -- src/test/content-evidence-contract.test.ts
```

Expected: at least one precise editorial assertion fails on the first run; failures identify the file and missing label rather than a parser error.

- [ ] **Step 3: Correct only the reported evidence gaps**

Edit the relevant MDX paragraph so its source class and limitation are explicit. Do not add generic disclaimers far away from the affected instruction.

- [ ] **Step 4: Verify GREEN and commit**

```bash
npm test -- src/test/content-evidence-contract.test.ts
git add src/test/content-evidence-contract.test.ts src/content/demo.mdx src/content/customize-display.mdx src/content/system-requirements.mdx src/content/painting.mdx
git commit -m "test: enforce ReStory content evidence labels"
```

## Task 7: Publish the four routes across navigation and discovery

**Files:**

- Modify: `src/data/guides.ts`
- Modify: `src/components/site-header.tsx`
- Modify: `src/test/pages.test.tsx`
- Modify: `src/test/guide-page.test.tsx`
- Modify: `src/test/home-page.test.tsx`
- Modify: `src/test/shared-components.test.tsx`
- Modify: `src/test/metadata-routes.test.ts`

- [ ] **Step 1: Change inventory tests first**

Assert exactly seven shipped routes in this order:

```ts
[
  "/",
  "/guide/",
  "/guide/how-to-clean/",
  "/demo/",
  "/guide/customize-display/",
  "/system-requirements/",
  "/guide/painting/",
]
```

Assert five published guide entries—Demo, Cleaning, Painting, Customize, and System Requirements—and three inert cards—Beginner, Sell, and Missing Joystick. Assert sitemap output contains seven same-origin absolute URLs and no duplicate loc values.

- [ ] **Step 2: Verify RED**

```bash
npm test -- src/test/pages.test.tsx src/test/guide-page.test.tsx src/test/home-page.test.tsx src/test/shared-components.test.tsx src/test/metadata-routes.test.ts
```

Expected: FAIL because four guide entries still have `coming-next` status and the primary navigation lacks Demo and System Requirements.

- [ ] **Step 3: Publish only real guide entries**

Update these records:

```ts
{
  title: "Demo vs Full Game",
  href: routes.demo,
  status: "published",
}
{
  title: "Painting Guide",
  href: routes.painting,
  status: "published",
}
{
  title: "Customize Your Shop",
  href: routes.customizeDisplay,
  status: "published",
}
{
  title: "System Requirements",
  href: routes.systemRequirements,
  status: "published",
}
```

Do not add href fields to Beginner Guide, How to Sell Devices, or Missing Joystick.

- [ ] **Step 4: Update primary navigation**

Use this order:

```ts
[
  { label: "Guides", href: routes.guide },
  { label: "Demo", href: routes.demo },
  { label: "Repair & Cleaning", href: `${routes.guide}#repair-cleaning` },
  { label: "System Requirements", href: routes.systemRequirements },
]
```

The Official Steam external link remains last.

- [ ] **Step 5: Verify GREEN and commit**

```bash
npm test -- src/test/pages.test.tsx src/test/guide-page.test.tsx src/test/home-page.test.tsx src/test/shared-components.test.tsx src/test/metadata-routes.test.ts
npm run typecheck
git add src/data/guides.ts src/components/site-header.tsx src/test/pages.test.tsx src/test/guide-page.test.tsx src/test/home-page.test.tsx src/test/shared-components.test.tsx src/test/metadata-routes.test.ts
git commit -m "feat: publish first ReStory guide batch"
```

## Task 8: Generalize the live SEO checker for every article

**Files:**

- Modify: `scripts/check-live-seo.mjs`
- Modify: `scripts/check-live-seo.test.mjs`

- [ ] **Step 1: Add the four exact page expectations**

Each new route must include its exact title, description, H1, `requiredSchemaTypes: ["Article", "BreadcrumbList", "FAQPage"]`, and `checkArticlePage: true`.

- [ ] **Step 2: Write RED fixtures for the shared article contract**

Rename the cleaning-only audit concept to `auditArticlePage` and add fixtures proving that every checked article fails when it has an empty TOC, a TOC link to another path, an Article mainEntity URL mismatch, empty visible FAQ, or visible/schema FAQ drift.

Run:

```bash
npm test -- scripts/check-live-seo.test.mjs
```

Expected: FAIL because only `checkCleaningPage` invokes the current article audit.

- [ ] **Step 3: Implement the minimal generic audit**

Replace `checkCleaningPage` with `checkArticlePage` in expectations and invocation. Preserve all existing crawler budgets, fetch timeout, content-type gates, redirect handling, breadcrumb validation, exact canonical comparison, and internal-link verification.

- [ ] **Step 4: Verify GREEN and commit**

```bash
npm test -- scripts/check-live-seo.test.mjs
git add scripts/check-live-seo.mjs scripts/check-live-seo.test.mjs
git commit -m "test: audit every ReStory article route"
```

## Task 9: Full local and production-like verification

**Files:** No intended production changes; restore any Next-generated config changes before committing.

- [ ] **Step 1: Run the complete static verification suite**

```bash
npm test
npm run typecheck
npm run lint
git diff --check
```

Expected: all suites pass with no TypeScript or lint errors and no whitespace failures.

- [ ] **Step 2: Build the production application**

```bash
SITE_URL=https://restory-wiki.vercel.app npm run build -- --webpack
```

Expected: build exits 0 and lists seven static content routes plus sitemap and robots metadata routes.

- [ ] **Step 3: Run the local production server and live checker**

```bash
SITE_URL=http://localhost:3000 npm start
SITE_URL=http://localhost:3000 npm run check:seo
```

Expected: `/`, `/guide/`, `/guide/how-to-clean/`, `/demo/`, `/guide/customize-display/`, `/system-requirements/`, and `/guide/painting/` all return status 200 with `valid: true` and no errors.

- [ ] **Step 4: Perform responsive browser checks**

At desktop width and 390×844 mobile viewport, verify each new page has no horizontal overflow, the mobile menu opens and closes, all TOC links scroll to unique targets, external sources open safely, and the related internal links return 200.

- [ ] **Step 5: Restore generated side effects and commit only intentional fixes**

If Next rewrites `next-env.d.ts` or `tsconfig.json`, restore only those generated diffs with an explicit patch. If verification revealed a real defect, add a failing regression test before fixing it and commit the minimal fix.

## Task 10: Integrate, deploy, and verify the public site

**Files:** Git history and deployment state; no force push.

- [ ] **Step 1: Review the complete branch diff**

```bash
git status --short
git diff origin/main...HEAD --stat
git log --oneline origin/main..HEAD
```

Expected: clean worktree; only the approved design, plan, four page units, navigation/discovery changes, and tests appear.

- [ ] **Step 2: Obtain explicit push authorization if the current user message does not already authorize writing to public `main`**

The push must be non-force and target `github.com/zhangx9399/restory-wiki` branch `main`.

- [ ] **Step 3: Push and wait for Vercel production deployment**

```bash
git push origin HEAD:main
```

Expected: non-fast-forward protection is respected; no force flag is used. Vercel reports the production deployment Ready.

- [ ] **Step 4: Run public live verification**

```bash
SITE_URL=https://restory-wiki.vercel.app npm run check:seo
```

Expected: all seven routes return 200 and `valid: true`; sitemap contains seven page loc values; canonical, Open Graph, Article, BreadcrumbList, and FAQPage URLs use `https://restory-wiki.vercel.app`.

- [ ] **Step 5: Record the launch result**

Report the four public URLs, test totals, build result, live SEO result, deployment status, commit SHA, and any evidence limitation that remains intentionally visible on the pages.
