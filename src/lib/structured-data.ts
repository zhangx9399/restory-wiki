import { siteConfig } from "@/data/site";

export type BreadcrumbSchemaItem = Readonly<{
  name: string;
  path: string;
}>;

export type FaqSchemaItem = Readonly<{
  question: string;
  answer: string;
}>;

export function absoluteUrl(path: string): string {
  return new URL(path, siteConfig.origin).toString();
}

export const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: siteConfig.name,
  url: absoluteUrl("/"),
  description: siteConfig.description,
} as const;

export function breadcrumbSchema(items: readonly BreadcrumbSchemaItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  } as const;
}

export function faqSchema(items: readonly FaqSchemaItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  } as const;
}
