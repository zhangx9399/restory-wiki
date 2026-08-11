"use client";

import { useRef, useState, type KeyboardEvent } from "react";

import { GuideCard } from "@/components/guide-card";
import { guideEntries, type GuideCategory } from "@/data/guides";

const tabs = [
  { label: "Beginner", category: "Getting Started", id: "guide-tab-beginner" },
  { label: "Repair", category: "Repair & Cleaning", id: "guide-tab-repair" },
  { label: "Shop", category: "Shop & Customization", id: "guide-tab-shop" },
  {
    label: "Troubleshooting",
    category: "Technical Help",
    id: "guide-tab-troubleshooting",
  },
] as const satisfies readonly {
  label: string;
  category: GuideCategory;
  id: string;
}[];

const panelId = "guide-category-panel";

export function CategoryTabs() {
  const [activeIndex, setActiveIndex] = useState(0);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const activeTab = tabs[activeIndex];
  const activeGuides = guideEntries.filter(
    (guide) => guide.category === activeTab.category,
  );

  const activateTab = (index: number) => {
    setActiveIndex(index);
    tabRefs.current[index]?.focus();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    let nextIndex: number | undefined;

    switch (event.key) {
      case "ArrowRight":
        nextIndex = (index + 1) % tabs.length;
        break;
      case "ArrowLeft":
        nextIndex = (index - 1 + tabs.length) % tabs.length;
        break;
      case "Home":
        nextIndex = 0;
        break;
      case "End":
        nextIndex = tabs.length - 1;
        break;
      default:
        return;
    }

    event.preventDefault();
    activateTab(nextIndex);
  };

  return (
    <div>
      <div className="tab-list" role="tablist" aria-label="Guide categories">
        {tabs.map((tab, index) => {
          const isActive = index === activeIndex;

          return (
            <button
              key={tab.id}
              ref={(element) => {
                tabRefs.current[index] = element;
              }}
              id={tab.id}
              type="button"
              role="tab"
              aria-controls={panelId}
              aria-selected={isActive}
              tabIndex={isActive ? 0 : -1}
              onClick={() => setActiveIndex(index)}
              onKeyDown={(event) => handleKeyDown(event, index)}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <div
        id={panelId}
        className="guide-grid"
        role="tabpanel"
        aria-labelledby={activeTab.id}
      >
        {activeGuides.map((guide) => (
          <GuideCard key={guide.title} guide={guide} />
        ))}
      </div>
    </div>
  );
}
