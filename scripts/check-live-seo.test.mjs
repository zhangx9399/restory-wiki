import { describe, expect, it } from "vitest";

const expected = {
  title: "How to Clean Items in ReStory — First Device Guide",
  description:
    "Learn how cleaning works in ReStory, where to place dirty parts, how to clean the first Pokia device, and what to check when dirt will not disappear.",
  h1: "How to Clean Items in ReStory",
  requiredSchemaTypes: ["Article", "BreadcrumbList", "FAQPage"],
};

const faq = [
  {
    question: "Why is the dirt still visible?",
    answer: "Check that the part is engaged with the cleaning area.",
  },
];

function schemas({ malformed = false, includeFaq = true, emptyFaq = false } = {}) {
  const values = [
    { "@context": "https://schema.org", "@type": "Article" },
    { "@context": "https://schema.org", "@type": "BreadcrumbList" },
  ];
  if (includeFaq) {
    values.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: (emptyFaq ? [] : faq).map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: { "@type": "Answer", text: item.answer },
      })),
    });
  }
  return `${values
    .map(
      (value) =>
        `<script type="application/ld+json">${JSON.stringify(value)}</script>`,
    )
    .join("")}${malformed ? '<script type="application/ld+json">{broken</script>' : ""}`;
}

function cleaningFixture({
  title = expected.title,
  description = expected.description,
  canonical = "http://localhost:3000/guide/how-to-clean/",
  ogUrl = canonical,
  headings = `<h1>${expected.h1}</h1><h2 id="cleaning">Cleaning</h2><h3>Step</h3><h2 id="faq">FAQ</h2>`,
  jsonLd = schemas(),
  tocTarget = "cleaning",
  faqAnswer = faq[0].answer,
  tocHtml = `<aside aria-label="Table of contents"><a href="#${tocTarget}">Cleaning</a></aside>`,
  faqHtml = `<div class="faq-list"><details><summary>${faq[0].question}</summary><p>${faqAnswer}</p></details></div>`,
  extraBody = "",
} = {}) {
  return `<!doctype html>
    <html><head>
      <title>${title}</title>
      <meta name="description" content="${description}">
      <link rel="canonical" href="${canonical}">
      <meta property="og:url" content="${ogUrl}">
      ${jsonLd}
    </head><body>
      ${headings}
      ${tocHtml}
      ${faqHtml}
      <a href="/guide/#repair-cleaning">Repair guides</a>
      ${extraBody}
    </body></html>`;
}

function pageFixture(pageExpected, extraBody = "") {
  const canonical = `http://localhost:3000${pageExpected.route}`;
  return `<!doctype html><html><head>
    <title>${pageExpected.title}</title>
    <meta name="description" content="${pageExpected.description}">
    <link rel="canonical" href="${canonical}">
    <meta property="og:url" content="${canonical}">
  </head><body><h1>${pageExpected.h1}</h1>${extraBody}</body></html>`;
}

async function loadChecker() {
  return import("./check-live-seo.mjs").catch(() => ({}));
}

describe("live SEO HTML audit", () => {
  it("accepts a complete cleaning-page fixture", async () => {
    const { auditHtml } = await loadChecker();
    expect(auditHtml).toBeTypeOf("function");

    const result = auditHtml({
      route: "/guide/how-to-clean/",
      html: cleaningFixture(),
      siteUrl: "http://localhost:3000",
      expected,
      checkCleaningPage: true,
    });

    expect(result).toEqual({ valid: true, errors: [] });
  });

  it("reports exact metadata and heading hierarchy failures", async () => {
    const { auditHtml } = await loadChecker();
    expect(auditHtml).toBeTypeOf("function");

    const result = auditHtml({
      route: "/guide/how-to-clean/",
      html: cleaningFixture({
        title: "Wrong title",
        description: "Wrong description",
        canonical: "http://localhost:3000/wrong/",
        ogUrl: "http://localhost:3000/wrong/",
        headings: "<h2>Starts too low</h2><h4>Skipped a level</h4>",
      }),
      siteUrl: "http://localhost:3000",
      expected,
      checkCleaningPage: true,
    });

    expect(result.valid).toBe(false);
    expect(result.errors.map((error) => error.code)).toEqual(
      expect.arrayContaining([
        "title",
        "description",
        "canonical",
        "og-url",
        "h1-count",
        "first-heading",
        "heading-level-jump",
      ]),
    );
  });

  it("reports malformed or missing schemas, broken TOC targets, and FAQ drift", async () => {
    const { auditHtml } = await loadChecker();
    expect(auditHtml).toBeTypeOf("function");

    const result = auditHtml({
      route: "/guide/how-to-clean/",
      html: cleaningFixture({
        jsonLd: schemas({ malformed: true, includeFaq: false }),
        tocTarget: "missing",
        faqAnswer: "Different visible answer.",
      }),
      siteUrl: "http://localhost:3000",
      expected,
      checkCleaningPage: true,
    });

    expect(result.valid).toBe(false);
    expect(result.errors.map((error) => error.code)).toEqual(
      expect.arrayContaining([
        "json-ld-parse",
        "schema-type",
        "toc-target",
        "faq-schema",
      ]),
    );
  });

  it("rejects an absent TOC and empty visible and schema FAQs", async () => {
    const { auditHtml } = await loadChecker();
    expect(auditHtml).toBeTypeOf("function");

    const result = auditHtml({
      route: "/guide/how-to-clean/",
      html: cleaningFixture({
        jsonLd: schemas({ emptyFaq: true }),
        tocHtml: "",
        faqHtml: "",
      }),
      siteUrl: "http://localhost:3000",
      expected,
      checkCleaningPage: true,
    });

    expect(result.valid).toBe(false);
    expect(result.errors.map((auditError) => auditError.code)).toEqual(
      expect.arrayContaining(["toc-missing", "faq-visible", "faq-schema"]),
    );
  });
});

describe("internal link audit", () => {
  it("accepts live pages whose internal routes and fragments resolve", async () => {
    const { auditInternalLinks } = await loadChecker();
    expect(auditInternalLinks).toBeTypeOf("function");

    const pages = new Map([
      [
        "http://localhost:3000/",
        {
          status: 200,
          html: '<a href="/guide/#repair-cleaning">Repair</a>',
        },
      ],
      [
        "http://localhost:3000/guide/",
        {
          status: 200,
          html: '<h1>Guides</h1><section id="repair-cleaning"></section>',
        },
      ],
    ]);

    expect(auditInternalLinks({ pages, siteUrl: "http://localhost:3000" })).toEqual(
      [],
    );
  });

  it("makes a recursively discovered page's dead link fail the live run", async () => {
    const { PAGE_EXPECTATIONS, runLiveSeoCheck } = await loadChecker();
    expect(runLiveSeoCheck).toBeTypeOf("function");

    const [home, guide] = PAGE_EXPECTATIONS;
    const responses = new Map([
      [
        "http://localhost:3000/",
        { status: 200, html: pageFixture(home, '<a href="/extra/">Extra</a>') },
      ],
      [
        "http://localhost:3000/guide/",
        {
          status: 200,
          html: pageFixture(guide, '<section id="repair-cleaning"></section>'),
        },
      ],
      [
        "http://localhost:3000/guide/how-to-clean/",
        { status: 200, html: cleaningFixture() },
      ],
      [
        "http://localhost:3000/extra/",
        { status: 200, html: '<a href="/missing/">Broken nested link</a>' },
      ],
    ]);
    const fetchImpl = async (url) => {
      const response = responses.get(url) ?? { status: 404, html: "Not found" };
      return {
        url,
        status: response.status,
        text: async () => response.html,
      };
    };

    const results = await runLiveSeoCheck({
      siteUrl: "http://localhost:3000",
      fetchImpl,
      write: () => undefined,
    });

    expect(results.some((result) => !result.valid)).toBe(true);
    expect(
      results.flatMap((result) => result.errors).map((auditError) => auditError.code),
    ).toContain("internal-route-status");
  });

  it("requests manual redirects and rejects a redirected required route", async () => {
    const { PAGE_EXPECTATIONS, runLiveSeoCheck } = await loadChecker();
    expect(runLiveSeoCheck).toBeTypeOf("function");

    const [home, guide] = PAGE_EXPECTATIONS;
    const fetchOptions = [];
    const fetchImpl = async (url, options) => {
      fetchOptions.push(options);
      if (url === "http://localhost:3000/") {
        return options?.redirect === "manual"
          ? { url, status: 308, text: async () => "Redirect" }
          : {
              url: "http://localhost:3000/redirected/",
              status: 200,
              redirected: true,
              text: async () => pageFixture(home),
            };
      }
      if (url === "http://localhost:3000/guide/") {
        return {
          url,
          status: 200,
          text: async () =>
            pageFixture(guide, '<section id="repair-cleaning"></section>'),
        };
      }
      if (url === "http://localhost:3000/guide/how-to-clean/") {
        return { url, status: 200, text: async () => cleaningFixture() };
      }
      return { url, status: 404, text: async () => "Not found" };
    };

    const results = await runLiveSeoCheck({
      siteUrl: "http://localhost:3000",
      fetchImpl,
      write: () => undefined,
    });

    expect(fetchOptions.every((options) => options?.redirect === "manual")).toBe(true);
    expect(results[0].valid).toBe(false);
    expect(results[0].errors.map((auditError) => auditError.code)).toContain(
      "route-status",
    );
  });

  it("reports dead routes and missing or duplicate fragment targets", async () => {
    const { auditInternalLinks } = await loadChecker();
    expect(auditInternalLinks).toBeTypeOf("function");

    const pages = new Map([
      [
        "http://localhost:3000/",
        {
          status: 200,
          html: [
            '<a href="/missing/">Missing route</a>',
            '<a href="/guide/#missing">Missing fragment</a>',
            '<a href="/guide/#duplicate">Duplicate fragment</a>',
          ].join(""),
        },
      ],
      ["http://localhost:3000/missing/", { status: 404, html: "Not found" }],
      [
        "http://localhost:3000/guide/",
        {
          status: 200,
          html: '<div id="duplicate"></div><span id="duplicate"></span>',
        },
      ],
    ]);

    expect(
      auditInternalLinks({ pages, siteUrl: "http://localhost:3000" }).map(
        (error) => error.code,
      ),
    ).toEqual(
      expect.arrayContaining([
        "internal-route-status",
        "internal-fragment-target",
        "internal-fragment-duplicate",
      ]),
    );
  });
});
