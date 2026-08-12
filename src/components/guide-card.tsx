import Link from "next/link";

import type { GuideEntry } from "@/data/guides";

type GuideCardProps = Readonly<{
  guide: GuideEntry;
}>;

export function GuideCard({ guide }: GuideCardProps) {
  const content = (
    <>
      <span className="guide-card-status">
        {guide.status === "published" ? "Read now" : "Coming next"}
      </span>
      <h3>{guide.title}</h3>
      <p>{guide.description}</p>
    </>
  );

  if (guide.status === "published") {
    return (
      <Link className="guide-card" href={guide.href}>
        {content}
      </Link>
    );
  }

  return (
    <div
      className="guide-card guide-card-muted"
      aria-label={`${guide.title}, coming next`}
    >
      {content}
    </div>
  );
}
