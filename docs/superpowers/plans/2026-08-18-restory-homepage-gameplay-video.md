# ReStory Homepage Gameplay Video Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add one privacy-enhanced, responsive IGN gameplay video module immediately after the ReStory home-page hero without redesigning the page.

**Architecture:** Extend the existing server-rendered home page with one semantic section and a native lazy-loaded YouTube iframe. Keep the implementation dependency-free, use existing shared route/site data for calls to action, and add only the CSS needed for the responsive player frame.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, CSS, Vitest, Testing Library, Vercel.

---

## File Map

- Modify `src/test/home-page.test.tsx`: define the module’s structure, placement, player, CTA, and CSS contracts before implementation.
- Modify `src/app/page.tsx`: render the approved gameplay section between the hero and guide matrix.
- Modify `src/app/globals.css`: add the responsive player frame and iframe rules.

No component extraction, data migration, metadata change, dependency addition, or non-home route modification is required.

### Task 1: Define the Gameplay Module Contract

**Files:**
- Modify: `src/test/home-page.test.tsx`
- Test: `src/test/home-page.test.tsx`

- [ ] **Step 1: Add the failing structure and placement test**

Add this test inside `describe("HomePage", ...)`:

```tsx
it("places the approved gameplay video after the hero and before the guide matrix", () => {
  const { container } = render(<HomePage />);

  const hero = container.querySelector<HTMLElement>("section.hero");
  const videoSection = container.querySelector<HTMLElement>("section.gameplay-section");
  const guideSection = screen
    .getByRole("heading", { level: 2, name: "Your ReStory repair route" })
    .closest("section");

  expect(hero).toBeInTheDocument();
  expect(videoSection).toBeInTheDocument();
  expect(guideSection).toBeInTheDocument();
  expect(hero?.compareDocumentPosition(videoSection as HTMLElement)).toBe(
    Node.DOCUMENT_POSITION_FOLLOWING,
  );
  expect(videoSection?.compareDocumentPosition(guideSection as HTMLElement)).toBe(
    Node.DOCUMENT_POSITION_FOLLOWING,
  );
  expect(within(videoSection as HTMLElement).getByText("Watch the game", { selector: ".eyebrow" })).toBeInTheDocument();
  expect(
    within(videoSection as HTMLElement).getByRole("heading", {
      level: 2,
      name: "See ReStory in Action",
    }),
  ).toBeInTheDocument();
  expect(
    within(videoSection as HTMLElement).getByText(
      "Watch 20 minutes of real ReStory gameplay, including device repairs, shop management, and the cozy mid-2000s Tokyo atmosphere.",
    ),
  ).toBeInTheDocument();
});
```

- [ ] **Step 2: Add the failing player and CTA test**

```tsx
it("embeds the selected IGN gameplay video with safe lazy-loaded player settings", () => {
  const { container } = render(<HomePage />);
  const videoSection = container.querySelector<HTMLElement>("section.gameplay-section");
  const player = within(videoSection as HTMLElement).getByTitle(
    "ReStory: Chill Electronics Repairs - 20 Minutes of Gameplay",
  );

  expect(player).toHaveAttribute(
    "src",
    "https://www.youtube-nocookie.com/embed/6xYOrUsTFWg",
  );
  expect(player).toHaveAttribute("loading", "lazy");
  expect(player).toHaveAttribute("referrerpolicy", "strict-origin-when-cross-origin");
  expect(player).toHaveAttribute(
    "allow",
    "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share",
  );
  expect(player).toHaveAttribute("allowfullscreen");
  expect(player.getAttribute("src")).not.toContain("autoplay=1");

  expect(
    within(videoSection as HTMLElement).getByRole("link", {
      name: "Start the Beginner Guide",
    }),
  ).toHaveAttribute("href", routes.beginner.slice(0, -1));

  const steamLink = within(videoSection as HTMLElement).getByRole("link", {
    name: "Play on Steam ↗",
  });
  expect(steamLink).toHaveAttribute("href", siteConfig.steamUrl);
  expect(steamLink).toHaveAttribute("target", "_blank");
  expect(steamLink).toHaveAttribute("rel", "noopener noreferrer");
});
```

- [ ] **Step 3: Add the failing responsive CSS test**

```tsx
it("keeps the gameplay player responsive at a 16:9 aspect ratio", () => {
  expect(css).toMatch(
    /\.gameplay-video\s*\{[^}]*aspect-ratio:\s*16\s*\/\s*9\s*;[^}]*overflow:\s*hidden\s*;/s,
  );
  expect(css).toMatch(
    /\.gameplay-video iframe\s*\{[^}]*width:\s*100%\s*;[^}]*height:\s*100%\s*;[^}]*border:\s*0\s*;/s,
  );
});
```

- [ ] **Step 4: Run the focused test and verify RED**

Run:

```bash
npm test -- src/test/home-page.test.tsx
```

Expected: FAIL only on the three new tests because `section.gameplay-section`, the approved iframe, and `.gameplay-video` CSS do not exist.

### Task 2: Implement the Approved Module

**Files:**
- Modify: `src/app/page.tsx`
- Modify: `src/app/globals.css`
- Test: `src/test/home-page.test.tsx`

- [ ] **Step 1: Add the semantic section after the hero**

Insert this block immediately after the existing `</section>` for `section.hero` and before the existing `section.section-soft` guide matrix:

```tsx
<section className="section gameplay-section">
  <div className="shell">
    <div className="section-heading">
      <div>
        <p className="eyebrow">Watch the game</p>
        <h2>See ReStory in Action</h2>
        <p>
          Watch 20 minutes of real ReStory gameplay, including device repairs,
          shop management, and the cozy mid-2000s Tokyo atmosphere.
        </p>
      </div>
    </div>

    <div className="gameplay-video">
      <iframe
        src="https://www.youtube-nocookie.com/embed/6xYOrUsTFWg"
        title="ReStory: Chill Electronics Repairs - 20 Minutes of Gameplay"
        loading="lazy"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen
      />
    </div>

    <div className="actions">
      <Link className="action action-primary" href={routes.beginner}>
        Start the Beginner Guide
      </Link>
      <a
        className="action"
        href={siteConfig.steamUrl}
        target="_blank"
        rel="noopener noreferrer"
      >
        Play on Steam ↗
      </a>
    </div>
  </div>
</section>
```

- [ ] **Step 2: Add the minimal responsive frame CSS**

Add near the existing section/layout rules in `src/app/globals.css`:

```css
.gameplay-video {
  width: 100%;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  border: 3px solid var(--ink);
  border-radius: 1rem;
  background: var(--ink);
  box-shadow: 10px 10px 0 var(--yellow), 13px 13px 0 var(--ink);
}

.gameplay-video iframe {
  display: block;
  width: 100%;
  height: 100%;
  border: 0;
}
```

- [ ] **Step 3: Run the focused test and verify GREEN**

Run:

```bash
npm test -- src/test/home-page.test.tsx
```

Expected: every home-page test passes, including the three new contracts.

- [ ] **Step 4: Commit the feature**

```bash
git add src/app/page.tsx src/app/globals.css src/test/home-page.test.tsx
git commit -m "feat: add homepage gameplay video"
```

### Task 3: Verify the Complete Site

**Files:**
- Verify all tracked files; modify only if a confirmed regression is found through a new failing test.

- [ ] **Step 1: Run fresh automated checks**

```bash
npm test
npm run typecheck
npm run lint
npm run build -- --webpack
git diff --check
```

Expected: all commands exit 0; the production build continues to list the same public content routes.

- [ ] **Step 2: Run local production SEO verification**

Start the production server with:

```bash
SITE_URL=http://localhost:3000 npm run start
```

In a second shell run:

```bash
SITE_URL=http://localhost:3000 npm run check:seo
```

Expected: every configured route returns HTTP 200, `valid: true`, and no errors.

- [ ] **Step 3: Inspect desktop and mobile output**

At desktop width and 390×844:

- confirm the original hero is unchanged;
- confirm the video is immediately below it and above the guide matrix;
- play the video once to confirm the embed works;
- confirm the player maintains 16:9 without horizontal overflow;
- confirm both calls to action work and the mobile menu remains usable.

- [ ] **Step 4: Review final scope and status**

Run `git status --short --branch` and `git show --stat --oneline HEAD`. The feature commit must contain only the home page, global CSS, and home-page test changes. The earlier design/plan documentation commits remain separate.

### Task 4: Production Deployment (After Explicit Approval)

**Files:** none unless production verification identifies a confirmed issue.

- [ ] **Step 1: Push non-force to GitHub main after approval**

```bash
git push origin HEAD:main
git ls-remote origin refs/heads/main
```

Expected: remote `main` equals the verified local HEAD.

- [ ] **Step 2: Verify the Vercel deployment**

After Vercel reports the new deployment ready, run:

```bash
SITE_URL=https://restory-wiki.vercel.app npm run check:seo
```

Expected: all public routes remain HTTP 200 and SEO-valid.

- [ ] **Step 3: Verify the public video module**

Open `https://restory-wiki.vercel.app/` at desktop and mobile width. Confirm the player loads, remains responsive, and the two calls to action reach the existing Beginner Guide and Steam destinations.

