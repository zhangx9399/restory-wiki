"use client";

import Link from "next/link";
import { useState } from "react";

import { routes, siteConfig } from "@/data/site";

const navigationItems = [
  { label: "Guides", href: routes.guide },
  { label: "Repair & Cleaning", href: `${routes.guide}#repair-cleaning` },
  { label: "Cleaning Guide", href: routes.cleaning },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="site-header">
      <div className="shell header-inner">
        <Link className="brand" href={routes.home} aria-label="ReStory Wiki home">
          <span className="brand-logo" aria-hidden="true">
            <span />
          </span>
          <span>{siteConfig.name}</span>
        </Link>

        <button
          className="menu-button"
          type="button"
          aria-label="Menu"
          aria-expanded={open}
          aria-controls="site-nav"
          onClick={() => setOpen((isOpen) => !isOpen)}
        >
          <span aria-hidden="true" />
          <span aria-hidden="true" />
          <span aria-hidden="true" />
        </button>

        <nav
          id="site-nav"
          className="site-nav"
          aria-label="Primary navigation"
          data-open={open}
        >
          {navigationItems.map((item) => (
            <Link key={item.href} href={item.href} onClick={() => setOpen(false)}>
              {item.label}
            </Link>
          ))}
          <a
            className="steam-link"
            href={siteConfig.steamUrl}
            target="_blank"
            rel="noreferrer"
          >
            Official Steam
            <span aria-hidden="true"> ↗</span>
          </a>
        </nav>
      </div>
    </header>
  );
}
