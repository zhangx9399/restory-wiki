import Link from "next/link";

import { routes, siteConfig } from "@/data/site";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="shell footer-grid">
        <div className="footer-about">
          <Link className="footer-brand" href={routes.home}>
            {siteConfig.name}
          </Link>
          <p>
            A warm, source-labeled guide hub for learning the rhythms of repair,
            cleaning, and shopkeeping in ReStory.
          </p>
        </div>

        <nav className="footer-links" aria-label="Footer navigation">
          <h2>Explore</h2>
          <Link href={routes.home}>Home</Link>
          <Link href={routes.guide}>Guides</Link>
          <Link href={routes.cleaning}>Cleaning Guide</Link>
          <a
            href={siteConfig.steamUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            Official Steam ↗
          </a>
        </nav>

        <div className="footer-note">
          <h2>Independent project</h2>
          <p>
            ReStory Wiki is a fan-made guide site. It is not affiliated with,
            endorsed by, or operated by the game&apos;s developer or publisher.
          </p>
        </div>
      </div>
      <div className="shell footer-bottom">
        <p>Made by repair fans, with sources and uncertainty clearly labeled.</p>
      </div>
    </footer>
  );
}
