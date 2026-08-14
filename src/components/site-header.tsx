"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";

import { routes, siteConfig } from "@/data/site";

const navigationItems = [
  { label: "Guides", href: routes.guide },
  { label: "Demo", href: routes.demo },
  { label: "Repair & Cleaning", href: `${routes.guide}#repair-cleaning` },
  { label: "System Requirements", href: routes.systemRequirements },
] as const;

const subscribeToHydration = () => () => undefined;
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

export function SiteHeader() {
  const enhanced = useSyncExternalStore(
    subscribeToHydration,
    getClientSnapshot,
    getServerSnapshot,
  );
  const [open, setOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        menuButtonRef.current?.focus();
      }
    };

    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [open]);

  const closeMenu = () => setOpen(false);

  return (
    <header className="site-header" data-enhanced={enhanced}>
      <div className="shell header-inner">
        <Link
          className="brand"
          href={routes.home}
          aria-label="ReStory Wiki home"
          onClick={closeMenu}
        >
          <span className="brand-logo" aria-hidden="true">
            <span />
          </span>
          <span>{siteConfig.name}</span>
        </Link>

        <button
          ref={menuButtonRef}
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
            <Link key={item.href} href={item.href} onClick={closeMenu}>
              {item.label}
            </Link>
          ))}
          <a
            className="steam-link"
            href={siteConfig.steamUrl}
            target="_blank"
            rel="noreferrer"
            onClick={closeMenu}
          >
            Official Steam
            <span aria-hidden="true"> ↗</span>
          </a>
        </nav>
      </div>
    </header>
  );
}
