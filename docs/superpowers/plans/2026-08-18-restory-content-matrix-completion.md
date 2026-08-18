# ReStory Content Matrix Completion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish the final three evidence-labeled ReStory Wiki guides and remove every remaining `Coming Next` state.

**Architecture:** Each article uses the existing Next.js App Router + MDX article shell, a dedicated FAQ data module, shared route/SEO data, and Article/Breadcrumb/FAQ JSON-LD. Navigation, sitemap, and live SEO checks stay driven by the shared route registry.

**Tech Stack:** Next.js 16, React 19, TypeScript, MDX, rehype-slug, Vitest, Testing Library, ESLint, GitHub, and Vercel.

---

## File Map

Create four files per guide: `page.tsx`, an MDX body, a shared FAQ data module, and a focused test. Modify `src/data/site.ts`, `src/data/guides.ts`, the home/guide tests, sitemap tests, evidence contracts, and the live SEO checker expectations.

### Task 1: Beginner Guide RED

**Files:**
- Create: `src/test/beginner-page.test.tsx`
- Test: `src/test/beginner-page.test.tsx`

- [ ] **Step 1: Write the failing page and content contract**

Require the following exact H2 order:

```ts
const h2Contract = [
  "What to Know Before Starting",
  "Your First Repair Route",
  "Cleaning and Reassembly Basics",
  "Painting and Shop Customization",
  "Managing Time, Parts, and Customer Work",
  "Beginner Mistakes to Avoid",
  "What to Read Next",
  "Frequently Asked Questions",
  "Sources and Evidence Notes",
] as const;
```

The test must import `@/app/guide/beginner/page`, require 900–1,200 cleaned words, Quick Answer before the first H2, nine unique slugs compiled with `rehype-slug`, one H1, three FAQ items synchronized with FAQPage, Article/Breadcrumb/FAQ schemas, three source grades, and related links through `routes.*`.

- [ ] **Step 2: Run RED**

Run `npm test -- src/test/beginner-page.test.tsx`.

Expected: FAIL because the route and support modules do not exist.

### Task 2: Beginner Guide GREEN

**Files:**
- Create: `src/app/guide/beginner/page.tsx`
- Create: `src/content/beginner.mdx`
- Create: `src/data/beginner.ts`
- Modify: `src/test/beginner-page.test.tsx`

- [ ] **Step 1: Add shared FAQ data**

```ts
export const beginnerFaqItems = [
  { question: "What should a new ReStory player do first?", answer: "Start with the current tutorial and first customer device, follow visible task prompts, and use the cleaning guide when the first dirty part reaches the workbench." },
  { question: "Do I need to learn every shop system immediately?", answer: "No. Learn the first repair loop before expanding into painting, shop customization, resale work, and optional optimization." },
  { question: "Which guide should I read next?", answer: "Choose the guide for the system blocking your current session: cleaning, painting, customization, selling, or technical help." },
] as const;
```

- [ ] **Step 2: Write the 900–1,200 word MDX article**

Use the approved nine-H2 order and begin with:

```mdx
import { FaqList } from "@/components/faq-list";
import { beginnerFaqItems } from "@/data/beginner";

<div className="quick-answer">
**Quick answer:** Follow the current tutorial, finish the first device one visible task at a time, and expand into shop systems only after the basic repair loop makes sense.
</div>
```

Grade official Steam/tinyBuild material as primary evidence, visible gameplay as corroboration, and player discussion as report-only evidence. Do not invent a fixed universal beginner sequence.

- [ ] **Step 3: Add the route shell**

Follow `src/app/guide/painting/page.tsx`. Use `pageSeo.beginner`, `routes.beginner`, `beginnerFaqItems`, nine TOC entries, `dateModified: "2026-08-18"`, and shared routes for all related links.

- [ ] **Step 4: Verify GREEN and commit**

Run `npm test -- src/test/beginner-page.test.tsx`.

Expected: PASS.

Commit: `git commit -m "feat: add ReStory beginner guide"` with exactly the four Beginner files.

### Task 3: How to Sell Devices RED/GREEN

**Files:**
- Create: `src/app/guide/how-to-sell-devices/page.tsx`
- Create: `src/content/how-to-sell-devices.mdx`
- Create: `src/data/how-to-sell-devices.ts`
- Create: `src/test/how-to-sell-devices-page.test.tsx`

- [ ] **Step 1: Write and run the failing test**

Require this H2 order:

```ts
const h2Contract = [
  "How Device Selling Fits the Shop Loop",
  "Checking a Device Before Buying or Repairing",
  "Tracking Parts and Repair Costs",
  "Preparing a Device for Sale",
  "Comparing Cost, Condition, and Sale Value",
  "Selling Mistakes and Unconfirmed Mechanics",
  "A Safe Profit Checklist",
  "Frequently Asked Questions",
  "Sources and Evidence Notes",
] as const;
```

Also require 900–1,200 words, three schemas/FAQ items, nine real slugs, source grades, and local `unconfirmed` limits for `profit formula`, `fixed margin`, `guaranteed price`, `demand algorithm`, and `sale multiplier`.

Run `npm test -- src/test/how-to-sell-devices-page.test.tsx`.

Expected: FAIL because the route does not exist.

- [ ] **Step 2: Implement the article**

The FAQ answers how to judge a sale, whether profit can be guaranteed, and what to check before listing. The Quick Answer tells readers to record acquisition and parts costs, verify visible condition, and treat exact market formulas as unconfirmed. Use `pageSeo.howToSellDevices` and `routes.howToSellDevices` everywhere.

- [ ] **Step 3: Verify GREEN and commit**

Run `npm test -- src/test/how-to-sell-devices-page.test.tsx`.

Expected: PASS.

Commit: `git commit -m "feat: add ReStory device selling guide"`.

### Task 4: Missing Joystick RED/GREEN

**Files:**
- Create: `src/app/guide/missing-joystick/page.tsx`
- Create: `src/content/missing-joystick.mdx`
- Create: `src/data/missing-joystick.ts`
- Create: `src/test/missing-joystick-page.test.tsx`

- [ ] **Step 1: Write and run the failing test**

Require this H2 order:

```ts
const h2Contract = [
  "What Missing Joystick Can Mean",
  "Check the Device, Parts, and Work Area",
  "Recheck Selection and Assembly State",
  "Input and Session Troubleshooting",
  "What Player Reports Can and Cannot Prove",
  "When to Stop Repeating the Same Fix",
  "Missing Joystick Checklist",
  "Frequently Asked Questions",
  "Sources and Evidence Notes",
] as const;
```

Require 900–1,200 words and local limits for `guaranteed location`, `replacement spawn`, `fixed input sequence`, `save repair`, and `universal fix`. Require observable-state checks before restart advice.

Run `npm test -- src/test/missing-joystick-page.test.tsx`.

Expected: FAIL because the route does not exist.

- [ ] **Step 2: Implement the article**

The FAQ distinguishes a missing physical part from an input problem, explains that player reports are not guarantees, and tells readers when to stop repeating failed actions. Use `pageSeo.missingJoystick` and `routes.missingJoystick`. Keep every player-report qualifier adjacent to its claim.

- [ ] **Step 3: Verify GREEN and commit**

Run `npm test -- src/test/missing-joystick-page.test.tsx`.

Expected: PASS.

Commit: `git commit -m "feat: add ReStory missing joystick guide"`.

### Task 5: Publish Shared Routes and Navigation

**Files:**
- Modify: `src/data/site.ts`
- Modify: `src/data/guides.ts`
- Modify: `src/app/page.tsx`
- Modify: `src/test/seo-rules.test.ts`
- Modify: `src/test/metadata-routes.test.ts`
- Modify: `src/test/home-page.test.tsx`
- Modify: `src/test/guide-page.test.tsx`

- [ ] **Step 1: Extend tests first and run RED**

```ts
const addedRoutes = {
  beginner: "/guide/beginner/",
  howToSellDevices: "/guide/how-to-sell-devices/",
  missingJoystick: "/guide/missing-joystick/",
} as const;

expect(guideEntries).toHaveLength(8);
expect(guideEntries.every((entry) => entry.status === "published")).toBe(true);
expect(sitemap()).toHaveLength(10);
```

Require the home Beginner action to link to `routes.beginner` and the guide hub to contain no `Coming Next` badge.

Run `npm test -- src/test/seo-rules.test.ts src/test/metadata-routes.test.ts src/test/home-page.test.tsx src/test/guide-page.test.tsx`.

Expected: FAIL on missing routes and inert cards.

- [ ] **Step 2: Implement shared data**

Add the three route values to `routes`, add unique 30–60 character titles, 130–160 character descriptions, and distinct H1 values to `pageSeo`, publish all three guide entries with shared hrefs, and point the home action to `routes.beginner`.

- [ ] **Step 3: Verify GREEN and commit**

Rerun the focused command. Expected: PASS with eight published cards and ten sitemap entries.

Commit: `git commit -m "feat: publish complete ReStory guide matrix"`.

### Task 6: Evidence Contracts and Cross-Links

**Files:**
- Modify: `src/test/content-evidence-contract.test.ts`
- Modify: relevant `src/app/**/page.tsx` related-link lists
- Modify: corresponding page tests

- [ ] **Step 1: Add parameterized failing cases**

Reject unsupported selling formulas and guaranteed joystick fixes. Require new related links to use `routes.beginner`, `routes.howToSellDevices`, and `routes.missingJoystick`, never hard-coded paths.

- [ ] **Step 2: Run RED**

Run `npm test -- src/test/content-evidence-contract.test.ts src/test/*-page.test.tsx`.

Expected: FAIL on a missing cross-link or any locally unqualified risky claim.

- [ ] **Step 3: Correct only verified failures and rerun GREEN**

A limitation must qualify the same clause as the risky detail. A limitation about a different mechanic cannot satisfy the contract.

Commit: `git commit -m "test: enforce final guide evidence boundaries"`.

### Task 7: Ten-Route Live SEO Contract

**Files:**
- Modify: `scripts/check-live-seo.test.mjs`
- Modify only if needed: `scripts/check-live-seo.mjs`

- [ ] **Step 1: Add three route expectations and run RED**

Each new route must specify `requiredSchemaTypes: ["Article", "BreadcrumbList", "FAQPage"]` and `checkArticlePage: true`.

Run `npm test -- scripts/check-live-seo.test.mjs`.

Expected: FAIL until the checker recognizes ten routes.

- [ ] **Step 2: Keep the checker generic, verify GREEN, and commit**

Do not create page-specific validation branches. Rerun the test and commit with `git commit -m "test: audit all ten ReStory routes"`.

### Task 8: Complete Local Verification

**Files:** all changed files from Tasks 1–7.

- [ ] **Step 1: Run fresh automated verification**

```bash
npm test
npm run typecheck
npm run lint
npm run build -- --webpack
git diff --check
```

Expected: every command exits 0 and the build lists ten static content routes plus metadata routes.

- [ ] **Step 2: Run local production SEO verification**

Start production with `SITE_URL=http://localhost:3000 npm run start`, then run `SITE_URL=http://localhost:3000 npm run check:seo`.

Expected: ten routes return `status: 200`, `valid: true`, and `errors: []`.

- [ ] **Step 3: Browser acceptance**

At 1280px and 390px, inspect all ten routes for one H1, no horizontal overflow, unique TOC fragments, valid internal links, and preserved mobile menu/Escape behavior.

- [ ] **Step 4: Review the full diff and rerun verification after fixes**

The worktree must be clean after the final commit.

### Task 9: Deploy and Update Homework Records

**Files:**
- Modify: `第五关-部署上线/作业提交资料/README.md`
- Modify: `第五关-部署上线/作业提交资料/第五关作业复盘.md`

- [ ] **Step 1: Push non-force and verify GitHub**

Run `git push origin HEAD:main`, then `git ls-remote origin refs/heads/main`.

Expected: remote `main` equals local HEAD.

- [ ] **Step 2: Verify Vercel and public SEO**

Wait for the production deployment to succeed. Run `SITE_URL=https://restory-wiki.vercel.app npm run check:seo`.

Expected: ten public routes, all HTTP 200 and valid with zero errors.

- [ ] **Step 3: Capture evidence and update homework files**

Capture the public guide hub showing all eight cards published. Record the commit SHA, ten-route result, sitemap count, SEO result, and 390px audit. Keep the Google indexing request pending until Search Console reports success.
