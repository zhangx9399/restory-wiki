import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

import * as cheerio from "cheerio";

export const PAGE_EXPECTATIONS = [
  {
    route: "/",
    title: "ReStory Wiki — Guides, Demo & Repair Tips",
    description:
      "Explore ReStory: Chill Electronics Repairs guides, demo details, system requirements, repair walkthroughs, customization tips, and troubleshooting help.",
    h1: "ReStory: Chill Electronics Repairs Guides",
  },
  {
    route: "/guide/",
    title: "ReStory Guides — Beginner, Repair & Shop Help",
    description:
      "Browse ReStory guides for beginners, cleaning, repairs, shop management, customization, system requirements, and common troubleshooting questions.",
    h1: "ReStory Guides",
  },
  {
    route: "/guide/how-to-clean/",
    title: "How to Clean Items in ReStory — First Device Guide",
    description:
      "Learn how cleaning works in ReStory, where to place dirty parts, how to clean the first Pokia device, and what to check when dirt will not disappear.",
    h1: "How to Clean Items in ReStory",
    requiredSchemaTypes: ["Article", "BreadcrumbList", "FAQPage"],
    checkCleaningPage: true,
  },
];

function normalizeText(value) {
  return value.replace(/\s+/g, " ").trim();
}

function error(code, message, details = {}) {
  return { code, message, ...details };
}

function expectedUrl(siteUrl, route) {
  return new URL(route, siteUrl).href;
}

function schemaTypes(value) {
  if (Array.isArray(value)) {
    return value.flatMap(schemaTypes);
  }
  if (!value || typeof value !== "object") {
    return [];
  }

  const ownTypes = Array.isArray(value["@type"])
    ? value["@type"]
    : value["@type"]
      ? [value["@type"]]
      : [];
  const graphTypes = Array.isArray(value["@graph"])
    ? value["@graph"].flatMap(schemaTypes)
    : [];
  return [...ownTypes, ...graphTypes];
}

function findSchemaByType(values, type) {
  for (const value of values) {
    if (Array.isArray(value)) {
      const nested = findSchemaByType(value, type);
      if (nested) return nested;
    } else if (value && typeof value === "object") {
      const types = Array.isArray(value["@type"])
        ? value["@type"]
        : [value["@type"]];
      if (types.includes(type)) return value;
      if (Array.isArray(value["@graph"])) {
        const nested = findSchemaByType(value["@graph"], type);
        if (nested) return nested;
      }
    }
  }
  return undefined;
}

function targetCount($, fragment) {
  let decoded = fragment;
  try {
    decoded = decodeURIComponent(fragment);
  } catch {
    return 0;
  }
  return $("[id]")
    .toArray()
    .filter((element) => $(element).attr("id") === decoded).length;
}

function auditHeadings($, expected, errors) {
  const headings = $("h1,h2,h3,h4,h5,h6").toArray();
  const h1s = $("h1").toArray();

  if (h1s.length !== 1) {
    errors.push(error("h1-count", `Expected exactly one H1, found ${h1s.length}.`));
  } else if (normalizeText($(h1s[0]).text()) !== expected.h1) {
    errors.push(
      error("h1-text", `Expected H1 ${JSON.stringify(expected.h1)}.`, {
        actual: normalizeText($(h1s[0]).text()),
      }),
    );
  }

  if (headings.length === 0 || headings[0].tagName.toLowerCase() !== "h1") {
    errors.push(error("first-heading", "The first heading must be H1."));
  }

  for (let index = 1; index < headings.length; index += 1) {
    const previous = Number(headings[index - 1].tagName.slice(1));
    const current = Number(headings[index].tagName.slice(1));
    if (current > previous + 1) {
      errors.push(
        error(
          "heading-level-jump",
          `Heading level jumps from H${previous} to H${current}.`,
        ),
      );
    }
  }
}

function parseJsonLd($, errors) {
  const schemas = [];
  $('script[type="application/ld+json"]').each((index, script) => {
    try {
      schemas.push(JSON.parse($(script).text()));
    } catch (cause) {
      errors.push(
        error("json-ld-parse", `JSON-LD block ${index + 1} is not valid JSON.`, {
          detail: cause instanceof Error ? cause.message : String(cause),
        }),
      );
    }
  });
  return schemas;
}

function auditCleaningPage($, schemas, errors) {
  const tableOfContents = $('[aria-label="Table of contents"]');
  const tocLinks = tableOfContents.find("a[href]");
  if (tableOfContents.length !== 1 || tocLinks.length === 0) {
    errors.push(
      error("toc-missing", "Cleaning page must have one non-empty table of contents."),
    );
  }

  tocLinks.each((_index, anchor) => {
    const href = $(anchor).attr("href") ?? "";
    const hashIndex = href.indexOf("#");
    const fragment = hashIndex >= 0 ? href.slice(hashIndex + 1) : "";
    const count = fragment ? targetCount($, fragment) : 0;
    if (count !== 1) {
      errors.push(
        error("toc-target", `TOC href ${JSON.stringify(href)} must have one target.`, {
          count,
        }),
      );
    }
  });

  const faqSchema = findSchemaByType(schemas, "FAQPage");
  if (!faqSchema || !Array.isArray(faqSchema.mainEntity)) {
    errors.push(error("faq-schema", "FAQPage mainEntity is missing or invalid."));
    return;
  }

  const visibleFaq = $(".faq-list details")
    .toArray()
    .map((details) => ({
      question: normalizeText($(details).find("summary").first().text()),
      answer: normalizeText($(details).find("p").first().text()),
    }));
  if (visibleFaq.length === 0) {
    errors.push(error("faq-visible", "Cleaning page must have visible FAQ entries."));
  }
  const schemaFaq = faqSchema.mainEntity.map((item) => ({
    question: normalizeText(typeof item?.name === "string" ? item.name : ""),
    answer: normalizeText(
      typeof item?.acceptedAnswer?.text === "string"
        ? item.acceptedAnswer.text
        : "",
    ),
  }));
  if (schemaFaq.length === 0) {
    errors.push(error("faq-schema", "FAQPage must have at least one question."));
  }

  if (JSON.stringify(visibleFaq) !== JSON.stringify(schemaFaq)) {
    errors.push(
      error("faq-schema", "Visible FAQ questions and answers do not match FAQPage JSON-LD."),
    );
  }
}

export function auditHtml({
  route,
  html,
  siteUrl,
  expected,
  checkCleaningPage = false,
}) {
  const $ = cheerio.load(html);
  const errors = [];
  const absolute = expectedUrl(siteUrl, route);
  const actualTitle = normalizeText($("title").first().text());
  const actualDescription = $("meta[name=description]").first().attr("content") ?? "";
  const actualCanonical = $("link[rel=canonical]").first().attr("href") ?? "";
  const actualOgUrl = $("meta[property='og:url']").first().attr("content") ?? "";

  if (actualTitle !== expected.title) {
    errors.push(error("title", "Title does not match pageSeo.", { actual: actualTitle }));
  }
  if (actualDescription !== expected.description) {
    errors.push(
      error("description", "Description does not match pageSeo.", {
        actual: actualDescription,
      }),
    );
  }
  if (actualCanonical !== absolute) {
    errors.push(
      error("canonical", `Canonical must be ${absolute}.`, { actual: actualCanonical }),
    );
  }
  if (actualOgUrl !== absolute) {
    errors.push(error("og-url", `Open Graph URL must be ${absolute}.`, { actual: actualOgUrl }));
  }

  auditHeadings($, expected, errors);
  const parsedSchemas = parseJsonLd($, errors);

  for (const type of expected.requiredSchemaTypes ?? []) {
    if (!schemaTypes(parsedSchemas).includes(type)) {
      errors.push(error("schema-type", `Missing required ${type} JSON-LD schema.`, { type }));
    }
  }
  if (checkCleaningPage) {
    auditCleaningPage($, parsedSchemas, errors);
  }

  return { valid: errors.length === 0, errors };
}

function alternatePageUrl(url) {
  const parsed = new URL(url);
  if (parsed.pathname === "/") return undefined;
  parsed.pathname = parsed.pathname.endsWith("/")
    ? parsed.pathname.slice(0, -1)
    : `${parsed.pathname}/`;
  return parsed.href;
}

function pageForUrl(pages, url) {
  return pages.get(url) ?? pages.get(alternatePageUrl(url));
}

export function collectInternalLinks({ html, pageUrl, siteUrl }) {
  const $ = cheerio.load(html);
  const siteOrigin = new URL(siteUrl).origin;
  const links = [];

  $("a[href]").each((_index, anchor) => {
    const href = $(anchor).attr("href");
    if (!href) return;

    let target;
    try {
      target = new URL(href, pageUrl);
    } catch {
      return;
    }
    if (!['http:', 'https:'].includes(target.protocol) || target.origin !== siteOrigin) {
      return;
    }

    const fragment = target.hash.slice(1);
    target.hash = "";
    links.push({
      href,
      targetUrl: target.href,
      fragment,
    });
  });

  return links;
}

export function auditInternalLinks({ pages, siteUrl }) {
  const errors = [];
  const auditedPages = new Set();

  for (const [sourceUrl, sourcePage] of pages) {
    if (auditedPages.has(sourcePage)) continue;
    auditedPages.add(sourcePage);

    for (const link of collectInternalLinks({
      html: sourcePage.html,
      pageUrl: sourcePage.url ?? sourceUrl,
      siteUrl,
    })) {
      const targetPage = pageForUrl(pages, link.targetUrl);
      if (!targetPage || targetPage.status !== 200) {
        errors.push(
          error(
            "internal-route-status",
            `Internal href ${JSON.stringify(link.href)} did not return HTTP 200.`,
            {
              sourceUrl,
              targetUrl: link.targetUrl,
              status: targetPage?.status ?? 0,
            },
          ),
        );
        continue;
      }

      if (link.fragment) {
        const $target = cheerio.load(targetPage.html);
        const count = targetCount($target, link.fragment);
        if (count === 0) {
          errors.push(
            error(
              "internal-fragment-target",
              `Internal fragment ${JSON.stringify(link.href)} has no target.`,
              { sourceUrl, targetUrl: link.targetUrl },
            ),
          );
        } else if (count > 1) {
          errors.push(
            error(
              "internal-fragment-duplicate",
              `Internal fragment ${JSON.stringify(link.href)} has ${count} targets.`,
              { sourceUrl, targetUrl: link.targetUrl, count },
            ),
          );
        }
      }
    }
  }

  return errors;
}

async function fetchPage(fetchImpl, url) {
  try {
    const response = await fetchImpl(url, { redirect: "manual" });
    return {
      url: response.url || url,
      status: response.status,
      html: await response.text(),
    };
  } catch (cause) {
    return {
      url,
      status: 0,
      html: "",
      fetchError: cause instanceof Error ? cause.message : String(cause),
    };
  }
}

async function fetchLinkedPages({ siteUrl, fetchImpl }) {
  const pages = new Map();
  const queued = PAGE_EXPECTATIONS.map(({ route }) => expectedUrl(siteUrl, route));

  while (queued.length > 0) {
    const requestedUrl = queued.shift();
    if (pages.has(requestedUrl)) continue;

    const page = await fetchPage(fetchImpl, requestedUrl);
    pages.set(requestedUrl, page);
    pages.set(page.url, page);

    for (const link of collectInternalLinks({
      html: page.html,
      pageUrl: page.url,
      siteUrl,
    })) {
      if (!pages.has(link.targetUrl) && !queued.includes(link.targetUrl)) {
        queued.push(link.targetUrl);
      }
    }
  }

  return pages;
}

export async function runLiveSeoCheck({
  siteUrl = process.env.SITE_URL ?? "http://localhost:3000",
  fetchImpl = fetch,
  write = (line) => console.log(line),
} = {}) {
  const normalizedSiteUrl = new URL(siteUrl).origin;
  const pages = await fetchLinkedPages({ siteUrl: normalizedSiteUrl, fetchImpl });
  const linkErrors = auditInternalLinks({ pages, siteUrl: normalizedSiteUrl });
  const expectedPages = new Set(
    PAGE_EXPECTATIONS.map(({ route }) =>
      pageForUrl(pages, expectedUrl(normalizedSiteUrl, route)),
    ).filter(Boolean),
  );
  const discoveredPageErrors = linkErrors.filter(
    (linkError) =>
      !linkError.sourceUrl ||
      !expectedPages.has(pageForUrl(pages, linkError.sourceUrl)),
  );
  const results = PAGE_EXPECTATIONS.map((expected) => {
    const pageUrl = expectedUrl(normalizedSiteUrl, expected.route);
    const page = pageForUrl(pages, pageUrl);
    const errors = [];

    if (!page || page.status !== 200) {
      errors.push(
        error("route-status", `Route ${expected.route} must return HTTP 200.`, {
          status: page?.status ?? 0,
          detail: page?.fetchError,
        }),
      );
    } else {
      errors.push(
        ...auditHtml({
          route: expected.route,
          html: page.html,
          siteUrl: normalizedSiteUrl,
          expected,
          checkCleaningPage: expected.checkCleaningPage,
        }).errors,
      );
    }

    errors.push(
      ...linkErrors.filter((linkError) => {
        if (!linkError.sourceUrl) return false;
        return pageForUrl(pages, linkError.sourceUrl) === page;
      }),
    );
    if (expected.route === "/") {
      errors.push(...discoveredPageErrors);
    }

    const result = {
      route: expected.route,
      status: page?.status ?? 0,
      valid: errors.length === 0,
      errors,
    };
    write(JSON.stringify(result));
    return result;
  });

  return results;
}

async function main() {
  const results = await runLiveSeoCheck();
  if (results.some((result) => !result.valid)) {
    process.exitCode = 1;
  }
}

const isDirectRun =
  process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href;

if (isDirectRun) {
  await main();
}
