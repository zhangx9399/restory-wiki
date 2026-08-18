import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

import * as cheerio from "cheerio";
import { SaxesParser } from "saxes";

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
    checkArticlePage: true,
  },
  {
    route: "/demo/",
    title: "ReStory Demo Guide — Download, Content & Full Game",
    description:
      "Learn where to download the ReStory demo, what it includes, how it differs from the full game, and what is known about demo save progress.",
    h1: "ReStory Demo Guide",
    requiredSchemaTypes: ["Article", "BreadcrumbList", "FAQPage"],
    checkArticlePage: true,
  },
  {
    route: "/guide/customize-display/",
    title: "How to Customize Your Shop in ReStory",
    description:
      "Understand ReStory shop customization, including walls, shelf styles, storage, decorations, and how shop changes differ from gadget painting.",
    h1: "How to Customize Your Shop in ReStory",
    requiredSchemaTypes: ["Article", "BreadcrumbList", "FAQPage"],
    checkArticlePage: true,
  },
  {
    route: "/system-requirements/",
    title: "ReStory System Requirements — Can Your PC Run It?",
    description:
      "Check ReStory's official minimum PC requirements, storage and DirectX needs, and version-labeled VSync and frame-rate troubleshooting advice.",
    h1: "ReStory System Requirements",
    requiredSchemaTypes: ["Article", "BreadcrumbList", "FAQPage"],
    checkArticlePage: true,
  },
  {
    route: "/guide/painting/",
    title: "ReStory Painting Guide — Airbrush & Color Palettes",
    description:
      "Learn what the Airbrush and color palettes do in ReStory, how painting differs from shop customization, and which painting details remain unconfirmed.",
    h1: "ReStory Painting Guide",
    requiredSchemaTypes: ["Article", "BreadcrumbList", "FAQPage"],
    checkArticlePage: true,
  },
  {
    route: "/guide/beginner/",
    title: "ReStory Beginner Guide — Your First Repair Route",
    description:
      "Start ReStory with a practical first repair route, cleaning and reassembly basics, shop priorities, time management, and evidence-labeled next steps.",
    h1: "ReStory Beginner Guide",
    requiredSchemaTypes: ["Article", "BreadcrumbList", "FAQPage"],
    checkArticlePage: true,
  },
  {
    route: "/guide/how-to-sell-devices/",
    title: "How to Sell Devices in ReStory — Safe Profit Guide",
    description:
      "Learn how to inspect, repair, price, and sell devices in ReStory while tracking costs, avoiding unsupported profit claims, and using evidence safely.",
    h1: "How to Sell Devices in ReStory",
    requiredSchemaTypes: ["Article", "BreadcrumbList", "FAQPage"],
    checkArticlePage: true,
  },
  {
    route: "/guide/missing-joystick/",
    title: "ReStory Missing Joystick Guide — Safe Fixes",
    description:
      "Troubleshoot a missing joystick in ReStory by checking boxes, shelves, assembly state, inputs, and session issues without treating reports as guarantees.",
    h1: "ReStory Missing Joystick Guide",
    requiredSchemaTypes: ["Article", "BreadcrumbList", "FAQPage"],
    checkArticlePage: true,
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

function isNonEmptyString(value) {
  return typeof value === "string" && normalizeText(value).length > 0;
}

function isAbsoluteHttpUrl(value) {
  if (!isNonEmptyString(value)) return false;
  try {
    return ["http:", "https:"].includes(new URL(value).protocol);
  } catch {
    return false;
  }
}

function isSameOriginHttpUrl(value, pageUrl) {
  if (!isAbsoluteHttpUrl(value)) return false;
  return new URL(value).origin === new URL(pageUrl).origin;
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

function auditArticlePage($, schemas, errors, expected, currentPageUrl) {
  const tableOfContents = $('[aria-label="Table of contents"]');
  const tocLinks = tableOfContents.find("a[href]");
  if (tableOfContents.length !== 1 || tocLinks.length === 0) {
    errors.push(
      error("toc-missing", "Article page must have one non-empty table of contents."),
    );
  }

  tocLinks.each((_index, anchor) => {
    const href = $(anchor).attr("href") ?? "";
    let target;
    try {
      target = new URL(href, currentPageUrl);
    } catch {
      target = undefined;
    }
    const current = new URL(currentPageUrl);
    const sameDocument =
      target &&
      target.origin === current.origin &&
      target.pathname === current.pathname &&
      target.search === current.search &&
      target.hash.length > 1;
    const count = sameDocument ? targetCount($, target.hash.slice(1)) : 0;
    if (!sameDocument || count !== 1) {
      errors.push(
        error(
          "toc-target",
          `TOC href ${JSON.stringify(href)} must be a fragment link to this page with one target.`,
          { href, count },
        ),
      );
    }
  });

  const articleSchema = findSchemaByType(schemas, "Article");
  if (
    articleSchema &&
    (!isNonEmptyString(articleSchema.headline) ||
      normalizeText(articleSchema.headline) !== normalizeText(expected.h1) ||
      !isNonEmptyString(articleSchema.description) ||
      normalizeText(articleSchema.description) !==
        normalizeText(expected.description) ||
      articleSchema.mainEntityOfPage !== currentPageUrl)
  ) {
    errors.push(
      error(
        "article-entity",
        "Article must match the page headline, description, and canonical page URL.",
        {
          expected: currentPageUrl,
          actual: articleSchema.mainEntityOfPage,
        },
      ),
    );
  }

  const breadcrumbSchema = findSchemaByType(schemas, "BreadcrumbList");
  if (
    breadcrumbSchema &&
    (!Array.isArray(breadcrumbSchema.itemListElement) ||
      breadcrumbSchema.itemListElement.length === 0 ||
      breadcrumbSchema.itemListElement.some(
        (item, index) =>
          !Number.isInteger(item?.position) ||
          item.position !== index + 1 ||
          !isNonEmptyString(item?.name) ||
          !isSameOriginHttpUrl(item?.item, currentPageUrl),
      ))
  ) {
    errors.push(
      error(
        "breadcrumb-entity",
        "BreadcrumbList must have entries positioned 1..N with names and same-origin absolute item URLs.",
      ),
    );
  }

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
    errors.push(error("faq-visible", "Article page must have visible FAQ entries."));
  }
  if (
    visibleFaq.some(
      (item) => !isNonEmptyString(item.question) || !isNonEmptyString(item.answer),
    )
  ) {
    errors.push(error("faq-visible", "Visible FAQ questions and answers must be non-empty."));
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
  if (
    faqSchema.mainEntity.some(
      (item) =>
        item?.["@type"] !== "Question" ||
        item?.acceptedAnswer?.["@type"] !== "Answer" ||
        !isNonEmptyString(item?.name) ||
        !isNonEmptyString(item?.acceptedAnswer?.text),
    )
  ) {
    errors.push(
      error(
        "faq-entity",
        "FAQPage entries must be Question/Answer entities with non-empty text.",
      ),
    );
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
  checkArticlePage = false,
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
  if (checkArticlePage) {
    auditArticlePage($, parsedSchemas, errors, expected, absolute);
  }

  return { valid: errors.length === 0, errors };
}

const SITEMAP_NAMESPACE = "http://www.sitemaps.org/schemas/sitemap/0.9";

function parseSitemapXml(xml) {
  const parser = new SaxesParser({ xmlns: true });
  const elements = [];
  const locUrls = [];
  let invalid = false;
  let sawRoot = false;

  parser.on("error", () => {
    invalid = true;
  });
  parser.on("doctype", () => {
    invalid = true;
  });
  parser.on("opentag", (tag) => {
    const parent = elements.at(-1);
    if (parent?.isDirectLoc) invalid = true;
    const isRoot = elements.length === 0;
    if (isRoot) {
      if (sawRoot || tag.local !== "urlset" || tag.uri !== SITEMAP_NAMESPACE) {
        invalid = true;
      }
      sawRoot = true;
    }
    const isDirectUrl =
      parent?.isRoot && tag.local === "url" && tag.uri === SITEMAP_NAMESPACE;
    const isDirectLoc =
      parent?.isDirectUrl && tag.local === "loc" && tag.uri === SITEMAP_NAMESPACE;
    elements.push({ isRoot, isDirectUrl, isDirectLoc, text: "" });
  });
  const appendText = (text) => {
    const current = elements.at(-1);
    if (current?.isDirectLoc) current.text += text;
  };
  parser.on("text", appendText);
  parser.on("cdata", appendText);
  parser.on("closetag", () => {
    const element = elements.pop();
    if (element?.isDirectLoc) locUrls.push(element.text.trim());
  });

  try {
    parser.write(xml).close();
  } catch {
    invalid = true;
  }
  return { valid: !invalid && sawRoot, locUrls: invalid ? [] : locUrls };
}

function normalizedHostname(hostname) {
  return hostname.toLowerCase().replace(/\.+$/, "");
}

function isLocalHostname(hostname) {
  const normalized = normalizedHostname(hostname);
  return normalized === "localhost" || normalized.endsWith(".localhost");
}

export function auditDiscoveryFiles({ siteUrl, sitemapXml, robotsText } = {}) {
  let site;
  try {
    site = new URL(siteUrl);
  } catch {
    return ["discovery site URL is invalid"];
  }
  if (!['http:', 'https:'].includes(site.protocol) || !site.hostname) {
    return ["discovery site URL is invalid"];
  }

  const origin = site.origin;
  const routes = PAGE_EXPECTATIONS.map(({ route }) => route);
  const errors = [];
  const sitemap = typeof sitemapXml === "string" ? sitemapXml : "";
  const robots = typeof robotsText === "string" ? robotsText : "";
  const expectedUrls = routes.map((route) => new URL(route, `${origin}/`).toString());
  const { valid: validSitemapXml, locUrls } = parseSitemapXml(sitemap);

  if (!validSitemapXml) {
    errors.push("sitemap.xml is not well-formed XML");
  }

  const isLocalAudit = site.protocol === "http:" && isLocalHostname(site.hostname);
  if (!isLocalAudit && site.protocol !== "https:") {
    errors.push("public discovery origin must use https");
  }

  const parsedLocUrls = locUrls.map((url) => {
    try {
      return new URL(url);
    } catch {
      return undefined;
    }
  });
  if (
    site.protocol === "https:" &&
    parsedLocUrls.some((url) => url && isLocalHostname(url.hostname))
  ) {
    errors.push("sitemap.xml must not contain localhost on a public deployment");
  }

  for (let index = 0; index < routes.length; index += 1) {
    if (locUrls.filter((url) => url === expectedUrls[index]).length === 0) {
      const route = routes[index];
      errors.push(`sitemap.xml is missing ${route}`);
    }
  }

  const hasUnexpectedOrDuplicateUrls = locUrls.some((url, index) => {
    const parsed = parsedLocUrls[index];
    const isExpected = expectedUrls.includes(url);
    const isPublicSameOrigin =
      site.protocol !== "https:" ||
      (parsed?.protocol === "https:" && parsed.origin === origin);
    return !isExpected || !isPublicSameOrigin || locUrls.indexOf(url) !== index;
  });
  if (hasUnexpectedOrDuplicateUrls) {
    errors.push("sitemap.xml contains unexpected or duplicate URLs");
  }

  const sitemapUrl = new URL("/sitemap.xml", `${origin}/`).toString();
  const robotSitemaps = robots
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"))
    .flatMap((line) => {
      const match = /^sitemap\s*:\s*(\S+)\s*$/i.exec(line);
      return match ? [match[1]] : [];
    });
  if (robotSitemaps.length !== 1 || robotSitemaps[0] !== sitemapUrl) {
    errors.push("robots.txt sitemap does not match the canonical origin");
  }

  return errors;
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
    target.searchParams.sort();
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
        const fetchFailure = targetPage?.fetchError;
        errors.push(
          error(
            "internal-route-status",
            `Internal href ${JSON.stringify(link.href)} did not return HTTP 200.${
              fetchFailure ? ` Fetch failed: ${fetchFailure}` : ""
            }`,
            {
              sourceUrl,
              targetUrl: link.targetUrl,
              status: targetPage?.status ?? 0,
              fetchError: fetchFailure,
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

async function fetchPage(fetchImpl, url, fetchTimeoutMs) {
  const controller = new AbortController();
  let timeout;
  try {
    return await Promise.race([
      (async () => {
        const response = await fetchImpl(url, {
          redirect: "manual",
          signal: controller.signal,
        });
        const contentType = response.headers?.get?.("content-type") ?? "";
        const isHtml =
          response.status >= 200 &&
          response.status < 300 &&
          /^text\/html(?:\s*;|$)/i.test(contentType);
        return {
          url: response.url || url,
          status: response.status,
          contentType,
          isHtml,
          html: isHtml ? await response.text() : "",
        };
      })(),
      new Promise((_, reject) => {
        timeout = setTimeout(() => {
          reject(new Error(`Fetch ${url} timed out after ${fetchTimeoutMs}ms.`));
          controller.abort();
        }, fetchTimeoutMs);
      }),
    ]);
  } catch (cause) {
    return {
      url,
      status: 0,
      html: "",
      fetchError: cause instanceof Error ? cause.message : String(cause),
    };
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchLinkedPages({
  siteUrl,
  fetchImpl,
  fetchTimeoutMs,
  maxPages,
  maxDepth,
  maxUrls,
}) {
  const pages = new Map();
  const crawlErrors = [];
  const initialUrls = PAGE_EXPECTATIONS.map(({ route }) => expectedUrl(siteUrl, route));
  const initialUrlsWithinBudget = initialUrls.slice(0, Math.max(0, maxUrls));
  const queued = initialUrlsWithinBudget.map((url) => ({ url, depth: 0 }));
  const discovered = new Set(initialUrlsWithinBudget);
  let fetchedPages = 0;
  let pageBudgetReported = false;
  let urlBudgetReported = initialUrlsWithinBudget.length < initialUrls.length;

  if (urlBudgetReported) {
    crawlErrors.push(
      error(
        "crawl-url-budget",
        `Crawler stopped discovering URLs after reaching maxUrls=${maxUrls}; increase maxUrls or constrain generated links.`,
        {
          targetUrl: initialUrls[initialUrlsWithinBudget.length],
          maxUrls,
        },
      ),
    );
  }

  while (queued.length > 0) {
    if (fetchedPages >= maxPages) {
      if (!pageBudgetReported) {
        crawlErrors.push(
          error(
            "crawl-page-budget",
            `Crawler stopped after reaching maxPages=${maxPages}; increase maxPages or remove an unbounded link chain.`,
            { maxPages, queuedUrls: queued.length, nextUrl: queued[0].url },
          ),
        );
        pageBudgetReported = true;
      }
      break;
    }

    const { url: requestedUrl, depth } = queued.shift();
    if (pages.has(requestedUrl)) continue;

    const page = await fetchPage(fetchImpl, requestedUrl, fetchTimeoutMs);
    fetchedPages += 1;
    pages.set(requestedUrl, page);
    pages.set(page.url, page);

    if (!page.isHtml) continue;

    for (const link of collectInternalLinks({
      html: page.html,
      pageUrl: page.url,
      siteUrl,
    })) {
      if (pages.has(link.targetUrl) || discovered.has(link.targetUrl)) continue;

      if (depth + 1 > maxDepth) {
        crawlErrors.push(
          error(
            "crawl-depth-budget",
            `Crawler did not fetch ${link.targetUrl} because it exceeds maxDepth=${maxDepth}.`,
            { sourceUrl: page.url, targetUrl: link.targetUrl, maxDepth },
          ),
        );
        continue;
      }
      if (discovered.size >= maxUrls) {
        if (!urlBudgetReported) {
          crawlErrors.push(
            error(
              "crawl-url-budget",
              `Crawler stopped discovering URLs after reaching maxUrls=${maxUrls}; increase maxUrls or constrain generated links.`,
              { sourceUrl: page.url, targetUrl: link.targetUrl, maxUrls },
            ),
          );
          urlBudgetReported = true;
        }
        continue;
      }

      discovered.add(link.targetUrl);
      queued.push({ url: link.targetUrl, depth: depth + 1 });
    }
  }

  return { pages, crawlErrors };
}

export async function runLiveSeoCheck({
  siteUrl = process.env.SITE_URL ?? "http://localhost:3000",
  fetchImpl = fetch,
  fetchTimeoutMs = 10_000,
  maxPages = 100,
  maxDepth = 5,
  maxUrls = 200,
  write = (line) => console.log(line),
} = {}) {
  const normalizedSiteUrl = new URL(siteUrl).origin;
  const { pages, crawlErrors } = await fetchLinkedPages({
    siteUrl: normalizedSiteUrl,
    fetchImpl,
    fetchTimeoutMs,
    maxPages,
    maxDepth,
    maxUrls,
  });
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
        error(
          "route-status",
          `Route ${expected.route} must return HTTP 200.${
            page?.fetchError ? ` Fetch failed: ${page.fetchError}` : ""
          }`,
          {
            status: page?.status ?? 0,
            detail: page?.fetchError,
            fetchError: page?.fetchError,
          },
        ),
      );
    } else {
      errors.push(
        ...auditHtml({
          route: expected.route,
          html: page.html,
          siteUrl: normalizedSiteUrl,
          expected,
          checkArticlePage: expected.checkArticlePage,
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
      errors.push(...crawlErrors);
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
