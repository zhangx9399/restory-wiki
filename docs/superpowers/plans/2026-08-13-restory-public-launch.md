# ReStory Wiki Public Launch Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish the ReStory Wiki to a production Vercel URL, connect GA4 and GSC, submit the sitemap, and prepare all Chapter 5 assignment evidence.

**Architecture:** One site-origin resolver supplies metadata, structured data, sitemap, and robots with a shared canonical origin. A root-layout GA component reads an optional measurement ID. GitHub `main` remains the deployment source; Vercel provides the public domain, then GA4 and GSC are configured against that exact HTTPS URL.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Vitest, Testing Library, GitHub, Vercel, GA4, GSC.

---

## File Map

- Create `src/lib/site-url.ts` and `src/test/site-url.test.ts` for canonical-origin resolution.
- Modify `src/data/site.ts` to remove the hard-coded localhost origin.
- Create `src/components/google-analytics.tsx` and `src/test/google-analytics.test.tsx` for global GA4 tracking.
- Modify `src/app/layout.tsx` to mount GA once.
- Create `src/app/sitemap.ts`, `src/app/robots.ts`, and `src/test/metadata-routes.test.ts`.
- Modify `scripts/check-live-seo.mjs` and `scripts/check-live-seo.test.mjs` to audit discovery files.
- Create the external assignment folder `第五关-部署上线/作业提交资料/` with its checklist, reflection, and screenshots.

### Task 1: Canonical Site Origin Resolver

**Files:**
- Create: `src/lib/site-url.ts`
- Modify: `src/data/site.ts`
- Create: `src/test/site-url.test.ts`
- Verify: `src/test/structured-data.test.ts`

- [ ] **Step 1: Write the failing test**

Create `src/test/site-url.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { getSiteOrigin, normalizeSiteOrigin } from "@/lib/site-url";

describe("site URL resolution", () => {
  it("uses and normalizes SITE_URL", () => {
    expect(getSiteOrigin({ SITE_URL: " https://restory-wiki.vercel.app/ " }))
      .toBe("https://restory-wiki.vercel.app");
  });

  it("uses Vercel's production domain when SITE_URL is absent", () => {
    expect(getSiteOrigin({
      VERCEL_PROJECT_PRODUCTION_URL: "restory-wiki.vercel.app",
    })).toBe("https://restory-wiki.vercel.app");
  });

  it("uses a deployment domain as the second Vercel fallback", () => {
    expect(getSiteOrigin({ VERCEL_URL: "restory-wiki-main.vercel.app" }))
      .toBe("https://restory-wiki-main.vercel.app");
  });

  it("falls back to localhost outside Vercel", () => {
    expect(getSiteOrigin({})).toBe("http://localhost:3000");
  });

  it("rejects paths, queries, unsupported protocols, and malformed URLs", () => {
    expect(() => normalizeSiteOrigin("https://example.com/guide/"))
      .toThrow("SITE_URL must be an origin without a path, query, or hash");
    expect(() => normalizeSiteOrigin("https://example.com/?ref=test"))
      .toThrow("SITE_URL must be an origin without a path, query, or hash");
    expect(() => normalizeSiteOrigin("ftp://example.com"))
      .toThrow("SITE_URL must use http or https");
    expect(() => normalizeSiteOrigin("not a URL")).toThrow("SITE_URL is invalid");
  });
});
```

- [ ] **Step 2: Run the test and confirm RED**

Run `npm test -- src/test/site-url.test.ts`.

Expected: FAIL because `@/lib/site-url` does not exist.

- [ ] **Step 3: Implement the resolver**

Create `src/lib/site-url.ts`:

```ts
type SiteEnvironment = Readonly<Record<string, string | undefined>>;
const LOCAL_ORIGIN = "http://localhost:3000";

export function normalizeSiteOrigin(value: string): string {
  let url: URL;
  try {
    url = new URL(value.trim());
  } catch {
    throw new Error("SITE_URL is invalid");
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error("SITE_URL must use http or https");
  }
  if (url.pathname !== "/" || url.search || url.hash) {
    throw new Error("SITE_URL must be an origin without a path, query, or hash");
  }
  return url.origin;
}

function normalizeVercelDomain(value: string): string {
  const candidate = /^https?:\/\//i.test(value) ? value : `https://${value}`;
  return normalizeSiteOrigin(candidate);
}

export function getSiteOrigin(
  environment: SiteEnvironment = process.env,
): string {
  const explicit = environment.SITE_URL?.trim();
  if (explicit) return normalizeSiteOrigin(explicit);
  const vercelDomain = environment.VERCEL_PROJECT_PRODUCTION_URL?.trim()
    || environment.VERCEL_URL?.trim();
  return vercelDomain ? normalizeVercelDomain(vercelDomain) : LOCAL_ORIGIN;
}
```

Modify `src/data/site.ts`:

```ts
import { getSiteOrigin } from "@/lib/site-url";

export const siteConfig = {
  name: "ReStory Wiki",
  origin: getSiteOrigin(),
```

Keep all other fields unchanged.

- [ ] **Step 4: Run GREEN verification**

Run `npm test -- src/test/site-url.test.ts src/test/structured-data.test.ts`.

Expected: both test files pass; structured-data tests continue to use localhost only as the local fallback.

- [ ] **Step 5: Commit**

```bash
git add src/lib/site-url.ts src/data/site.ts src/test/site-url.test.ts
git commit -m "feat: resolve canonical site origin"
```

### Task 2: Global GA4 Integration

**Files:**
- Create: `src/components/google-analytics.tsx`
- Modify: `src/app/layout.tsx`
- Create: `src/test/google-analytics.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `src/test/google-analytics.test.tsx`:

```tsx
import type { ComponentProps, ReactNode } from "react";
import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { GoogleAnalytics, normalizeGoogleAnalyticsId } from "@/components/google-analytics";

vi.mock("next/script", () => ({
  default: ({ children, strategy: _strategy, ...props }:
    ComponentProps<"script"> & { children?: ReactNode; strategy?: string }) => (
      <script {...props}>{children}</script>
    ),
}));

describe("Google Analytics", () => {
  it("renders nothing without a measurement ID", () => {
    const { container } = render(<GoogleAnalytics />);
    expect(container).toBeEmptyDOMElement();
  });

  it("normalizes a GA4 measurement ID", () => {
    expect(normalizeGoogleAnalyticsId(" G-ABC1234567 ")).toBe("G-ABC1234567");
  });

  it("rejects a legacy or malformed ID", () => {
    expect(() => normalizeGoogleAnalyticsId("UA-12345-1"))
      .toThrow("NEXT_PUBLIC_GA_ID must be a GA4 measurement ID");
  });

  it("loads and configures the same valid ID", () => {
    const { container } = render(<GoogleAnalytics measurementId="G-ABC1234567" />);
    const scripts = Array.from(container.querySelectorAll("script"));
    expect(scripts).toHaveLength(2);
    expect(scripts[0]).toHaveAttribute(
      "src",
      "https://www.googletagmanager.com/gtag/js?id=G-ABC1234567",
    );
    expect(scripts[1].textContent).toContain("gtag('config', 'G-ABC1234567'");
  });
});
```

- [ ] **Step 2: Run the test and confirm RED**

Run `npm test -- src/test/google-analytics.test.tsx`.

Expected: FAIL because the GA component does not exist.

- [ ] **Step 3: Implement the component**

Create `src/components/google-analytics.tsx`:

```tsx
import Script from "next/script";

type GoogleAnalyticsProps = Readonly<{ measurementId?: string }>;

export function normalizeGoogleAnalyticsId(value?: string): string | undefined {
  const normalized = value?.trim();
  if (!normalized) return undefined;
  if (!/^G-[A-Z0-9]{4,}$/i.test(normalized)) {
    throw new Error("NEXT_PUBLIC_GA_ID must be a GA4 measurement ID");
  }
  return normalized.toUpperCase();
}

export function GoogleAnalytics({ measurementId }: GoogleAnalyticsProps) {
  const id = normalizeGoogleAnalyticsId(measurementId);
  if (!id) return null;
  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${id}`}
        strategy="afterInteractive" />
      <Script id="google-analytics" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${id}', { anonymize_ip: true });`}
      </Script>
    </>
  );
}
```

Import `GoogleAnalytics` in `src/app/layout.tsx` and mount it immediately after `<SiteFooter />`:

```tsx
<GoogleAnalytics measurementId={process.env.NEXT_PUBLIC_GA_ID} />
```

- [ ] **Step 4: Run GREEN verification**

Run:

```bash
npm test -- src/test/google-analytics.test.tsx src/test/shell-contract.test.ts
npm run typecheck
```

Expected: tests and typecheck pass; no GA script renders when the variable is absent.

- [ ] **Step 5: Commit**

```bash
git add src/components/google-analytics.tsx src/app/layout.tsx src/test/google-analytics.test.tsx
git commit -m "feat: add optional GA4 tracking"
```

### Task 3: Sitemap and Robots

**Files:**
- Create: `src/app/sitemap.ts`
- Create: `src/app/robots.ts`
- Create: `src/test/metadata-routes.test.ts`

- [ ] **Step 1: Write the failing test**

Create `src/test/metadata-routes.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import robots from "@/app/robots";
import sitemap from "@/app/sitemap";

describe("search engine discovery routes", () => {
  it("publishes exactly the three shipped pages", () => {
    expect(sitemap().map((entry) => entry.url)).toEqual([
      "http://localhost:3000/",
      "http://localhost:3000/guide/",
      "http://localhost:3000/guide/how-to-clean/",
    ]);
  });

  it("allows crawling and identifies the canonical sitemap", () => {
    expect(robots()).toEqual({
      rules: { userAgent: "*", allow: "/" },
      sitemap: "http://localhost:3000/sitemap.xml",
      host: "http://localhost:3000",
    });
  });
});
```

- [ ] **Step 2: Run the test and confirm RED**

Run `npm test -- src/test/metadata-routes.test.ts`.

Expected: FAIL because the metadata route modules do not exist.

- [ ] **Step 3: Implement both routes**

Create `src/app/sitemap.ts`:

```ts
import type { MetadataRoute } from "next";
import { pageSeo } from "@/data/site";
import { absoluteUrl } from "@/lib/structured-data";

export default function sitemap(): MetadataRoute.Sitemap {
  return Object.values(pageSeo).map(({ path }, index) => ({
    url: absoluteUrl(path),
    changeFrequency: index === 0 ? "weekly" : "monthly",
    priority: index === 0 ? 1 : 0.8,
  }));
}
```

Create `src/app/robots.ts`:

```ts
import type { MetadataRoute } from "next";
import { siteConfig } from "@/data/site";
import { absoluteUrl } from "@/lib/structured-data";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: absoluteUrl("/sitemap.xml"),
    host: siteConfig.origin,
  };
}
```

- [ ] **Step 4: Run GREEN verification**

Run `npm test -- src/test/metadata-routes.test.ts src/test/pages.test.tsx`.

Expected: PASS and no coming-soon page appears in the sitemap.

- [ ] **Step 5: Commit**

```bash
git add src/app/sitemap.ts src/app/robots.ts src/test/metadata-routes.test.ts
git commit -m "feat: publish sitemap and robots"
```

### Task 4: Add Discovery-File Contract Tests

**Files:**
- Modify: `scripts/check-live-seo.mjs`
- Modify: `scripts/check-live-seo.test.mjs`

- [ ] **Step 1: Add failing public-discovery tests**

Reuse the existing `loadChecker()` helper in `scripts/check-live-seo.test.mjs`, then add:

```js
describe("auditDiscoveryFiles", () => {
  it("accepts the expected public sitemap and robots", async () => {
    const { auditDiscoveryFiles } = await loadChecker();
    expect(auditDiscoveryFiles).toBeTypeOf("function");
    expect(auditDiscoveryFiles({
      siteUrl: "https://restory-wiki.vercel.app",
      sitemapXml: `<?xml version="1.0"?><urlset>
        <url><loc>https://restory-wiki.vercel.app/</loc></url>
        <url><loc>https://restory-wiki.vercel.app/guide/</loc></url>
        <url><loc>https://restory-wiki.vercel.app/guide/how-to-clean/</loc></url>
      </urlset>`,
      robotsText: `User-agent: *\nAllow: /\nSitemap: https://restory-wiki.vercel.app/sitemap.xml`,
    })).toEqual([]);
  });

  it("rejects localhost, missing routes, and a wrong robots sitemap", async () => {
    const { auditDiscoveryFiles } = await loadChecker();
    expect(auditDiscoveryFiles).toBeTypeOf("function");
    expect(auditDiscoveryFiles({
      siteUrl: "https://restory-wiki.vercel.app",
      sitemapXml: `<urlset><url><loc>http://localhost:3000/</loc></url></urlset>`,
      robotsText: `User-agent: *\nSitemap: https://wrong.example/sitemap.xml`,
    })).toEqual(expect.arrayContaining([
      expect.stringContaining("localhost"),
      expect.stringContaining("/guide/"),
      expect.stringContaining("robots.txt sitemap"),
    ]));
  });
});
```

- [ ] **Step 2: Run the focused test and confirm RED**

Run `npm test -- scripts/check-live-seo.test.mjs`.

Expected: FAIL because `auditDiscoveryFiles` is not exported.

- [ ] **Step 3: Implement the pure audit helper**

Add to `scripts/check-live-seo.mjs`:

```js
export function auditDiscoveryFiles({ siteUrl, sitemapXml, robotsText }) {
  const origin = new URL(siteUrl).origin;
  const routes = ["/", "/guide/", "/guide/how-to-clean/"];
  const errors = [];

  if (origin.startsWith("https://") && /localhost(?::\d+)?/i.test(sitemapXml)) {
    errors.push("sitemap.xml must not contain localhost on a public deployment");
  }

  for (const route of routes) {
    const expected = new URL(route, `${origin}/`).toString();
    if (!sitemapXml.includes(`<loc>${expected}</loc>`)) {
      errors.push(`sitemap.xml is missing ${route}`);
    }
  }

  const expectedSitemap = new URL("/sitemap.xml", `${origin}/`).toString();
  if (!robotsText.includes(`Sitemap: ${expectedSitemap}`)) {
    errors.push("robots.txt sitemap does not match the canonical origin");
  }

  return errors;
}
```

Keep this helper pure and independent from the crawler so the existing fetch fixtures, timeout, redirect, crawl-budget, schema, heading, and internal-link checks do not change. Public fetching is verified visibly in Task 10.

- [ ] **Step 4: Run GREEN verification**

```bash
npm test -- scripts/check-live-seo.test.mjs
npm test
```

Expected: all checker tests and all project tests pass.

- [ ] **Step 5: Commit**

```bash
git add scripts/check-live-seo.mjs scripts/check-live-seo.test.mjs
git commit -m "test: verify public discovery files"
```

### Task 5: Full Local Release Verification

**Files:**
- Verify all source and test files changed in Tasks 1–4.
- Do not accept incidental Next.js rewrites as feature changes.

- [ ] **Step 1: Run the complete static gate**

```bash
npm test
npm run typecheck
npm run lint
npm run build -- --webpack
```

Expected: zero failed tests, zero type errors, zero lint errors, and a successful production build listing `/`, `/guide`, `/guide/how-to-clean`, `/sitemap.xml`, and `/robots.txt`.

- [ ] **Step 2: Start the local production build**

Run `SITE_URL=http://localhost:3000 npm start`.

Expected: Next.js reports Ready on port 3000.

- [ ] **Step 3: Run the live checker against the original symptom surface**

In a second terminal, run:

```bash
SITE_URL=http://localhost:3000 npm run check:seo
```

Expected: the three content pages are valid and report no errors.

Also open `http://localhost:3000/sitemap.xml` and `http://localhost:3000/robots.txt` in the local browser. Confirm sitemap lists the three published routes and robots names the localhost sitemap used for local testing.

- [ ] **Step 4: Inspect repository state**

```bash
git diff --check
git status --short
```

Expected: no uncommitted source change. If `next-env.d.ts` or `tsconfig.json` changed only because Next.js rewrote generated settings, restore their exact pre-build contents with `apply_patch`, rerun typecheck, and inspect status again.

### Task 6: Reconcile and Push GitHub `main`

**Files:**
- No content changes expected.
- Git history may gain one non-destructive merge commit because the initial public upload used GitHub's REST API.

- [ ] **Step 1: Fetch the public branch**

Run `git fetch origin main`.

Expected: `origin/main` resolves to the public repository branch.

- [ ] **Step 2: Prove the remote baseline matches the local MVP baseline**

Run:

```bash
git diff --exit-code 78572a3 origin/main -- .
```

Expected: no output and exit code 0. If content differs, stop and inspect; never force-push an unverified tree.

- [ ] **Step 3: Join matching but unrelated histories**

Run:

```bash
git merge --allow-unrelated-histories --no-edit origin/main
```

Expected: a merge commit with no content conflict because both baseline trees match.

- [ ] **Step 4: Ask for push approval, then push**

After the user approves the external push, run:

```bash
git push -u origin main
gh api repos/zhangx9399/restory-wiki/commits/main --jq '.sha'
git rev-parse HEAD
```

Expected: GitHub and local SHAs are identical. If LibreSSL reports a transient TLS failure, retry once with `git -c http.version=HTTP/1.1 push -u origin main`. Do not disable certificate validation and do not force-push.

### Task 7: Import GitHub into Vercel

**Files:**
- Vercel may create local `.vercel/` linkage metadata; confirm it remains ignored before any later commit.

- [ ] **Step 1: Sign in to Vercel**

Open `https://vercel.com/login`, choose GitHub, and let the user personally complete login, OTP, CAPTCHA, terms, or account authorization. Confirm the active Vercel account after login.

- [ ] **Step 2: Select the deployment scope**

If only the personal scope exists, use it. If multiple teams exist, list their exact slugs and ask the user to select one before continuing.

- [ ] **Step 3: Import the repository**

Open `https://vercel.com/new`, authorize repository access if prompted, choose `zhangx9399/restory-wiki`, and configure exactly:

```text
Project Name: restory-wiki
Framework Preset: Next.js
Root Directory: ./
Production Branch: main
```

Do not add `NEXT_PUBLIC_GA_ID` yet because the GA4 data stream does not exist. The optional component must allow this first build to succeed.

- [ ] **Step 4: Deploy production**

Click Deploy and wait until Vercel reports the production deployment as `Ready`. Record the assigned HTTPS `vercel.app` URL in the execution notes as `RESTORY_SITE_URL`.

- [ ] **Step 5: Verify Vercel's authoritative state**

Confirm in the Vercel UI: status `Ready`, framework Next.js, source branch `main`, two automatic system domain variables available, and the displayed production URL opens the homepage. Do not add a custom domain in this chapter.

### Task 8: Create GA4 and Redeploy with Environment Variables

**Files:**
- No source file stores the real measurement ID.
- Vercel Production environment stores `SITE_URL` and `NEXT_PUBLIC_GA_ID`.

- [ ] **Step 1: Create the GA4 property**

Open `https://analytics.google.com/analytics/web/` with the user's Google account. The user completes Google sign-in and accepts required terms. Use:

```text
Account name: ReStory Wiki
Property name: ReStory Wiki
Reporting time zone: China (GMT+08:00)
Currency: United States Dollar (USD)
Business size: Small
Business objective: Other business objectives
Platform: Web
Web stream URL: the exact RESTORY_SITE_URL host
Stream name: ReStory Wiki Production
```

Record the resulting ID and verify it matches `G-[A-Z0-9]+`.

- [ ] **Step 2: Add Vercel Production variables**

In Vercel Project → Settings → Environment Variables, create:

```text
SITE_URL = the exact RESTORY_SITE_URL including https:// and no trailing slash
NEXT_PUBLIC_GA_ID = the exact GA4 measurement ID
Environment = Production
```

Never commit Google credentials or the Vercel account session to Git.

- [ ] **Step 3: Redeploy production**

Redeploy the latest `main` production deployment so both variables enter the build. Wait for status `Ready`.

- [ ] **Step 4: Verify real-time data**

Open the public homepage, guide page, and cleaning page once. In GA4, run the installation test or open Realtime and confirm the active visit appears. Save a screenshot that identifies the ReStory property and successful collection without exposing account secrets.

### Task 9: Connect GSC and Submit Sitemap

**Files:**
- No source change expected when GA verification succeeds.

- [ ] **Step 1: Add the correct property type**

Open `https://search.google.com/search-console/` with the same Google account. Add a **URL-prefix property**, not a Domain property, because the user cannot control DNS for the Vercel-owned default domain. Enter the exact `RESTORY_SITE_URL` including `https://`.

- [ ] **Step 2: Verify ownership**

Choose Google Analytics verification after GA is live. If it is unavailable, stop and report the exact verification methods shown; create a separate tested metadata task before using an HTML tag. Do not attempt DNS verification on `vercel.app`.

- [ ] **Step 3: Submit the sitemap**

In GSC → Sitemaps, submit `sitemap.xml`.

Expected: GSC accepts `${RESTORY_SITE_URL}/sitemap.xml` without a fetch error. Save a screenshot showing the verified property or submitted sitemap status.

- [ ] **Step 4: Request indexing**

Use URL Inspection on the exact homepage, run Test Live URL, and click Request Indexing. Record that the request was accepted; do not claim immediate indexing because Google's processing is asynchronous.

### Task 10: Public QA and Chapter 5 Assignment Package

**Files:**
- Create: `第五关-部署上线/作业提交资料/README.md`
- Create: `第五关-部署上线/作业提交资料/第五关作业复盘.md`
- Create screenshots in: `第五关-部署上线/作业提交资料/`

- [ ] **Step 1: Run the public live gate**

Run:

```bash
SITE_URL="$RESTORY_SITE_URL" npm run check:seo
```

Expected: the three content pages pass; canonical and structured data use HTTPS and no localhost appears.

Then open `${RESTORY_SITE_URL}/sitemap.xml` and `${RESTORY_SITE_URL}/robots.txt` in the browser. Confirm sitemap lists exactly the three published URLs and robots points to the same HTTPS sitemap origin.

- [ ] **Step 2: Test desktop and a physical phone**

Open these exact paths on both devices:

```text
RESTORY_SITE_URL/
RESTORY_SITE_URL/guide/
RESTORY_SITE_URL/guide/how-to-clean/
```

Expected: every page loads over HTTPS, navigation works, text is readable, and no horizontal overflow blocks use.

- [ ] **Step 3: Capture assignment evidence**

Create readable screenshots with no password, recovery code, or private account detail:

```text
01-vercel-production.png
02-public-home-desktop.png
03-public-guide-desktop.png
04-public-cleaning-desktop.png
05-public-home-mobile.png
06-ga4-connected.png
07-gsc-verified-or-sitemap.png
```

- [ ] **Step 4: Write the checklist**

Create `第五关-部署上线/作业提交资料/README.md`:

```markdown
# 第五关作业提交资料

## 公网链接

- 网站：RESTORY_SITE_URL
- Sitemap：RESTORY_SITE_URL/sitemap.xml
- Robots：RESTORY_SITE_URL/robots.txt

## 必交资料

- [x] 网站线上链接
- [x] Vercel 部署成功截图
- [x] GA4 已接入截图
- [x] GSC 验证成功或 sitemap 提交截图
- [x] 电脑端公网访问截图
- [x] 手机端公网访问截图
- [x] 第五关复盘文案

## 最终现场检查

- [ ] 用户已在真实手机打开网站
- [ ] 用户已确认 GA4 Realtime 出现访问
- [ ] 用户已确认 GSC sitemap 已提交
- [ ] 用户已上传至第五关作业页面

作业提交地址：https://scys.com/activity/10092/task/88083
```

Replace every `RESTORY_SITE_URL` token with the actual HTTPS URL before checking any corresponding item.

- [ ] **Step 5: Write the reflection**

Create `第五关-部署上线/作业提交资料/第五关作业复盘.md`:

```markdown
# 第五关作业复盘

## 最大的收获

这次我第一次把本地网站变成了任何人都能访问的公网网站，也理解了 Vercel、GA4 和 GSC 的分工：Vercel 负责让网站上线，GA4 记录访客行为，GSC 记录 Google 搜索中的展示、点击、收录和抓取问题。

## 遇到的卡点

最容易混乱的是操作顺序。如果网站还没有公网地址，就无法正确设置 canonical、创建准确的 GA Web 数据流，也很难完成 GSC 验证。代码中原来还把 localhost 写死，并且缺少 sitemap 和 robots。

## 如何解决

我先让代码统一从环境变量读取正式网址，并补上全站 GA 接口、sitemap 和 robots；然后从 GitHub 部署到 Vercel，取得真实 HTTPS 地址，再创建 GA4、回填测量 ID并重新部署，最后接入 GSC、提交 sitemap 和请求索引。这样每一步都有可验证结果，也避免把本地地址提交给 Google。
```

- [ ] **Step 6: Run the final evidence gate**

Verify every artifact exists, visually inspect every screenshot, confirm the public links in `README.md` are clickable, and leave the four user-performed checkboxes unchecked until the user confirms them. Do not mark GA, GSC, indexing, or physical-phone testing complete from code evidence alone.
