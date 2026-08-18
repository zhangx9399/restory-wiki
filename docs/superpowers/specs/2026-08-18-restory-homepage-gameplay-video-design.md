# ReStory Homepage Gameplay Video Design

## Goal

Add one real-gameplay video module to the ReStory Wiki home page so visitors can understand the repair loop and atmosphere without changing the existing home-page architecture.

## Scope

This is a local home-page enhancement, not a redesign. The existing header, hero, illustration, calls to action, guide matrix, category tabs, game facts, FAQ, footer, metadata, and content routes remain unchanged.

The new module appears directly after the existing hero and before the “Your ReStory repair route” guide section. This placement follows the tutorial’s central lesson: give a new visitor an immediate, visual understanding of the game before asking them to choose an article.

## Selected Video

- Title: `ReStory: Chill Electronics Repairs - 20 Minutes of Gameplay`
- Publisher: IGN
- YouTube video ID: `6xYOrUsTFWg`
- Public watch URL: `https://www.youtube.com/watch?v=6xYOrUsTFWg`
- Privacy-enhanced embed URL: `https://www.youtube-nocookie.com/embed/6xYOrUsTFWg`

The video shows an extended, continuous gameplay sample rather than a short promotional montage. It demonstrates the device-repair loop, shop-management context, and the game’s mid-2000s Tokyo atmosphere. YouTube’s oEmbed endpoint confirms that the video exposes a standard embeddable player.

## Module Structure

The home page gains one full-width section with the existing `section` and `shell` layout conventions:

1. Eyebrow: `Watch the game`
2. H2: `See ReStory in Action`
3. Introductory copy: `Watch 20 minutes of real ReStory gameplay, including device repairs, shop management, and the cozy mid-2000s Tokyo atmosphere.`
4. A responsive 16:9 YouTube player
5. Two existing destinations below the player:
   - `Start the Beginner Guide` → `routes.beginner`
   - `Play on Steam ↗` → `siteConfig.steamUrl`

The module must be a semantic `section`, keep the page’s single H1 unchanged, and place the video before the guide-matrix section in source order.

## Player Behavior and Privacy

The iframe will:

- use `youtube-nocookie.com` rather than the standard embed host;
- use `loading="lazy"` so it does not compete with the hero for initial loading;
- use the exact accessible title `ReStory: Chill Electronics Repairs - 20 Minutes of Gameplay`;
- allow full-screen playback;
- allow only the standard media capabilities needed by YouTube;
- use `referrerPolicy="strict-origin-when-cross-origin"`;
- never autoplay.

If YouTube is unavailable, the surrounding copy and calls to action remain usable. No custom JavaScript player, autoplay behavior, tracking event, consent workflow, or locally hosted video copy is introduced.

## Visual Design

The player sits inside a `.gameplay-video` wrapper with:

- a 16:9 aspect ratio;
- a dark border matching the existing ink color;
- the existing rounded-corner and offset-shadow language;
- `overflow: hidden` so the iframe follows the rounded frame;
- full-width iframe dimensions and no visible browser border.

The module inherits the current paper/surface/teal/yellow palette. It becomes a single column at every breakpoint, so 360px and 390px phones receive the same readable order with no horizontal scrolling.

## SEO and Accessibility Boundaries

- Do not change the home page Title, Description, canonical URL, Open Graph fields, H1, or JSON-LD.
- Add exactly one descriptive H2 and one iframe title.
- Keep both links keyboard-accessible and preserve the existing external-link safety attributes on Steam.
- Do not add VideoObject structured data because the site does not own or publish the IGN video.

## Testing and Acceptance

Development follows a RED → GREEN TDD cycle. Focused tests must prove:

- the module exists after the hero and before the guide matrix;
- the approved eyebrow, H2, and introductory copy render;
- the iframe uses the exact privacy-enhanced URL, title, lazy loading, referrer policy, allowed capabilities, and full-screen support;
- the player wrapper has responsive 16:9 CSS;
- the two calls to action use shared route/site data;
- the home page still has one H1 and unchanged metadata.

Final verification includes the full test suite, typecheck, lint, production Webpack build, live SEO checker, and desktop plus 390px visual inspection with no horizontal overflow.

