import Link from "next/link";

export type BreadcrumbItem = Readonly<{
  label: string;
  href?: string;
}>;

type BreadcrumbsProps = Readonly<{
  items: readonly BreadcrumbItem[];
}>;

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav className="breadcrumbs" aria-label="Breadcrumb">
      <ol>
        {items.map((item, index) => {
          const isCurrent = index === items.length - 1;

          return (
            <li key={`${item.label}-${index}`}>
              {index > 0 ? (
                <span className="breadcrumb-separator" aria-hidden="true">
                  /
                </span>
              ) : null}
              {isCurrent ? (
                <span aria-current="page">{item.label}</span>
              ) : item.href ? (
                <Link href={item.href}>{item.label}</Link>
              ) : (
                <span>{item.label}</span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
