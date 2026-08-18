# ReStory Content Matrix Completion Design

## Goal

Complete and publish the final three ReStory Wiki guide pages in one production batch:

1. Beginner Guide
2. How to Sell Devices
3. Missing Joystick

After this batch, every guide card on the home page and guide hub must be published and clickable, with no remaining `Coming Next` entries.

## Audience and Content Standard

The audience is an English-speaking ReStory player who needs a practical answer without having to separate official facts from forum speculation. Each article will contain approximately 900–1,200 cleaned English words and follow the evidence policy already used by the five published articles:

- Official store pages, official announcements, and official documentation establish game facts.
- Directly visible gameplay can support clearly observable actions.
- Player reports must be labeled as reports and cannot be presented as guaranteed fixes.
- Unsupported mechanics, exact profit formulas, unlock requirements, or universal solutions must not be invented.

## Page Architecture

Each route will use the existing article shell and contain:

1. Breadcrumbs and one H1
2. A short evidence/version label
3. Quick Answer before the first H2
4. A table of contents with links to real, unique heading IDs
5. Five to seven useful H2 sections
6. Three visible FAQ items
7. Sources and Evidence Notes
8. Related-guide links using the shared route registry

Each page will define exact metadata for title, description, canonical URL, Open Graph, and Article data. It will emit Article, BreadcrumbList, and FAQPage JSON-LD. Visible FAQ answers and FAQ schema must share one data source.

## Page Content

### Beginner Guide

Route: `/guide/beginner/`

Purpose: give a new player a reliable first-session route and connect the existing content into one journey.

Planned sections:

- What to Know Before Starting
- Your First Repair Route
- Cleaning and Reassembly Basics
- Painting and Shop Customization
- Managing Time, Parts, and Customer Work
- Beginner Mistakes to Avoid
- What to Read Next

This page will link to Demo vs Full Game, How to Clean Items, Painting Guide, Customize Your Shop, How to Sell Devices, and System Requirements.

### How to Sell Devices

Route: `/guide/how-to-sell-devices/`

Purpose: explain the observable repair-and-resale workflow while avoiding unsupported universal profit claims.

Planned sections:

- How Device Selling Fits the Shop Loop
- Checking a Device Before Buying or Repairing
- Tracking Parts and Repair Costs
- Preparing a Device for Sale
- Comparing Cost, Condition, and Sale Value
- Selling Mistakes and Unconfirmed Mechanics
- A Safe Profit Checklist

Any exact pricing, demand, score, or profit formula that is not established by an authoritative source will be described as unconfirmed rather than treated as fact.

### Missing Joystick

Route: `/guide/missing-joystick/`

Purpose: help players diagnose a missing joystick or input-part problem using safe checks and clearly labeled reports.

Planned sections:

- What “Missing Joystick” Can Mean
- Check the Device, Parts, and Work Area
- Recheck Selection and Assembly State
- Input and Session Troubleshooting
- What Player Reports Can and Cannot Prove
- When to Stop Repeating the Same Fix
- Missing Joystick Checklist

The article will not promise a guaranteed replacement location, input sequence, spawn behavior, or save-state repair unless an authoritative source confirms it.

## Shared Data and Navigation

The shared route registry will add the three new paths. `guideEntries` will convert the final three cards from `coming-next` to `published`. The home page Beginner Guide action and featured card will resolve to the new beginner page. The sitemap will include all ten public routes in a stable order.

Related links in the new and existing articles will use the shared route registry instead of duplicated path strings. All external links will open in a new tab with `noopener noreferrer`.

## Error and Evidence Handling

- If a claim has only player-report evidence, the limitation must appear with that specific claim rather than elsewhere in the paragraph.
- If sources conflict or refer to an older demo/pre-release build, the article must state the version boundary.
- If the researched evidence cannot support a requested detail, the page will say that the detail is not officially confirmed.
- Navigation must never expose a dead route. A guide card becomes published only in the same change that creates its route.

## Testing and Acceptance

Development will follow test-first RED → GREEN cycles. Tests will cover:

- Route rendering, metadata, canonical URLs, and one H1 per page
- Quick Answer order, H2/H3 structure, cleaned word count, FAQ synchronization, sources, and evidence limitations
- Real MDX compilation with `rehype-slug`, unique TOC targets, and no missing fragments
- Article, BreadcrumbList, and FAQPage JSON-LD
- Shared route use, guide-card publication, home-page links, sitemap order, and internal link safety
- Production build and live SEO checks for all ten routes
- Desktop and 390px mobile layouts with no horizontal overflow

Before deployment, the complete test suite, TypeScript checking, linting, and a production Webpack build must pass. After deployment, all ten public routes must return HTTP 200 and pass the live SEO checker with zero errors.

## Deployment

The three pages and navigation changes will be committed on the existing isolated launch branch. After final verification, the completed batch will be pushed non-force to GitHub `main`. Vercel will deploy from `main`, followed by public desktop/mobile, navigation, sitemap, and SEO verification. Fifth-chapter homework records will be updated with the new production result.
