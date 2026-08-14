import { describe, expect, it } from "vitest";

const routeExpectations = [
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
];

const expected = routeExpectations[2];
const articleExpectations = routeExpectations.filter(
  (pageExpected) => pageExpected.checkArticlePage,
);

const faq = [
  {
    question: "Why is the dirt still visible?",
    answer: "Check that the part is engaged with the cleaning area.",
  },
];

const validArticle = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: expected.h1,
  description: expected.description,
  mainEntityOfPage: "http://localhost:3000/guide/how-to-clean/",
};

const validBreadcrumbs = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      name: "Home",
      item: "http://localhost:3000/",
    },
  ],
};

function schemas({
  malformed = false,
  includeFaq = true,
  emptyFaq = false,
  article = validArticle,
  breadcrumbs = validBreadcrumbs,
  faqItems = faq,
} = {}) {
  const values = [article, breadcrumbs];
  if (includeFaq) {
    values.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: (emptyFaq ? [] : faqItems).map((item) => ({
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

function articleFixture(options = {}) {
  const pageExpected = options.pageExpected ?? expected;
  const canonical = options.canonical ?? `http://localhost:3000${pageExpected.route}`;
  const title = options.title ?? pageExpected.title;
  const description = options.description ?? pageExpected.description;
  const ogUrl = options.ogUrl ?? canonical;
  const headings =
    options.headings ??
    `<h1>${pageExpected.h1}</h1><h2 id="article-section">Article section</h2><h3>Step</h3><h2 id="faq">FAQ</h2>`;
  const article = {
    ...validArticle,
    headline: pageExpected.h1,
    description: pageExpected.description,
    mainEntityOfPage: canonical,
  };
  const jsonLd = options.jsonLd ?? schemas({ article });
  const tocTarget = options.tocTarget ?? "article-section";
  const faqAnswer = options.faqAnswer ?? faq[0].answer;
  const tocHtml =
    options.tocHtml ??
    `<aside aria-label="Table of contents"><a href="#${tocTarget}">Article section</a></aside>`;
  const faqHtml =
    options.faqHtml ??
    `<div class="faq-list"><details><summary>${faq[0].question}</summary><p>${faqAnswer}</p></details></div>`;
  const extraBody = options.extraBody ?? "";
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

function requiredPageHtml(url) {
  const pathname = new URL(url).pathname;
  const pageExpected = routeExpectations.find(
    (expectation) => expectation.route === pathname,
  );
  if (!pageExpected) return undefined;
  if (pageExpected.checkArticlePage) {
    return articleFixture({ pageExpected });
  }
  return pageFixture(
    pageExpected,
    pageExpected.route === "/guide/"
      ? '<section id="repair-cleaning"></section>'
      : "",
  );
}

function mockResponse(url, { status = 200, html = "", contentType = "text/html" }) {
  return {
    url,
    status,
    headers: {
      get: (name) =>
        name.toLowerCase() === "content-type" ? contentType : undefined,
    },
    text: async () => html,
  };
}

async function loadChecker() {
  return import("./check-live-seo.mjs").catch(() => ({}));
}

describe("public discovery-file audit", () => {
  const publicSiteUrl = "https://restory-wiki.vercel.app";
  const sitemapNamespace = "http://www.sitemaps.org/schemas/sitemap/0.9";
  const publicSitemap = `<?xml version="1.0"?><urlset xmlns="${sitemapNamespace}" xmlns:x="urn:ignored">${routeExpectations.map(({ route }) => `<url><loc>${publicSiteUrl}${route}</loc></url>`).join("")}</urlset>`;
  const publicRobots = `User-agent: *\nSitemap: ${publicSiteUrl}/sitemap.xml`;

  it("accepts canonical public sitemap and robots files", async () => {
    const { auditDiscoveryFiles } = await loadChecker();
    expect(auditDiscoveryFiles).toBeTypeOf("function");

    expect(
      auditDiscoveryFiles({
        siteUrl: publicSiteUrl,
        sitemapXml: publicSitemap,
        robotsText: publicRobots,
      }),
    ).toEqual([]);
  });

  it("reports localhost sitemap entries, missing public routes, and a wrong robots sitemap", async () => {
    const { auditDiscoveryFiles } = await loadChecker();
    expect(auditDiscoveryFiles).toBeTypeOf("function");

    const errors = auditDiscoveryFiles({
      siteUrl: "https://restory-wiki.vercel.app",
      sitemapXml: `<urlset xmlns="${sitemapNamespace}"><url><loc>http://localhost:3000/</loc></url></urlset>`,
      robotsText: "User-agent: *\nSitemap: https://wrong.example/sitemap.xml",
    });

    expect(errors).toEqual(
      expect.arrayContaining([
        "sitemap.xml must not contain localhost on a public deployment",
        "sitemap.xml is missing /guide/",
        "sitemap.xml is missing /guide/how-to-clean/",
        "robots.txt sitemap does not match the canonical origin",
      ]),
    );
  });

  it.each([
    ["an extra loc", publicSitemap.replace("</urlset>", `<url><loc>${publicSiteUrl}/extra/</loc></url></urlset>`)],
    ["a duplicate loc", publicSitemap.replace("</urlset>", `<url><loc>${publicSiteUrl}/guide/</loc></url></urlset>`)],
  ])("rejects sitemap with %s", async (_case, sitemapXml) => {
    const { auditDiscoveryFiles } = await loadChecker();

    expect(auditDiscoveryFiles({ siteUrl: publicSiteUrl, sitemapXml, robotsText: publicRobots })).toEqual(
      expect.arrayContaining(["sitemap.xml contains unexpected or duplicate URLs"]),
    );
  });

  it("ignores commented-out sitemap locs", async () => {
    const { auditDiscoveryFiles } = await loadChecker();
    const sitemapXml = `<!-- ${publicSitemap} --><urlset></urlset>`;

    expect(auditDiscoveryFiles({ siteUrl: publicSiteUrl, sitemapXml, robotsText: publicRobots })).toEqual(
      expect.arrayContaining([
        "sitemap.xml is missing /",
        "sitemap.xml is missing /guide/",
        "sitemap.xml is missing /guide/how-to-clean/",
      ]),
    );
  });

  it.each([
    ["an unclosed loc", publicSitemap.replace("</loc>", "")],
    ["an unclosed urlset", publicSitemap.replace("</urlset>", "")],
    ["multiple roots", `${publicSitemap}<urlset/>`],
  ])("rejects sitemap XML with %s", async (_case, sitemapXml) => {
    const { auditDiscoveryFiles } = await loadChecker();

    expect(auditDiscoveryFiles({ siteUrl: publicSiteUrl, sitemapXml, robotsText: publicRobots })).toEqual(
      expect.arrayContaining(["sitemap.xml is not well-formed XML"]),
    );
  });

  it("accepts well-formed XML declarations, comments, CDATA, namespaces, and quoted attributes", async () => {
    const { auditDiscoveryFiles } = await loadChecker();
    const sitemapXml = `<?xml version="1.0"?><urlset xmlns="${sitemapNamespace}" xmlns:x="urn:example"><!-- public routes --><x:meta data="a > b" /><![CDATA[metadata]]>${routeExpectations.map(({ route }) => `<url><loc>${publicSiteUrl}${route}</loc></url>`).join("")}</urlset>`;

    expect(auditDiscoveryFiles({ siteUrl: publicSiteUrl, sitemapXml, robotsText: publicRobots })).toEqual([]);
  });

  it.each([
    ["a bare ampersand", publicSitemap.replace(`${publicSiteUrl}/`, `${publicSiteUrl}/?a=1&b=2`)],
    ["an unclosed entity", publicSitemap.replace(`${publicSiteUrl}/`, `${publicSiteUrl}/?a=&broken`)],
    ["a duplicate attribute", publicSitemap.replace("<urlset", '<urlset version="1" version="2"')],
    ["a comment containing double hyphens", publicSitemap.replace("<urlset", "<!-- bad--comment --><urlset")],
    ["character data containing ]]>", publicSitemap.replace("<urlset", "<urlset>bad]]>text<urlset")],
    ["an XML declaration inside the root", publicSitemap.replace("<urlset", '<?xml version="1.0"?><urlset')],
    ["an XML declaration after the root", `${publicSitemap}<?xml version="1.0"?>`],
    ["a bare less-than sign in an attribute", publicSitemap.replace("<urlset", '<urlset data="a < b"')],
    ["a wrapper root", `<wrapper>${publicSitemap.replace('<?xml version="1.0"?>', "")}</wrapper>`],
    ["a sitemapindex root", '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"/>'],
  ])("rejects strict SAX invalid sitemap with %s", async (_case, sitemapXml) => {
    const { auditDiscoveryFiles } = await loadChecker();

    expect(auditDiscoveryFiles({ siteUrl: publicSiteUrl, sitemapXml, robotsText: publicRobots })).toEqual(
      expect.arrayContaining(["sitemap.xml is not well-formed XML"]),
    );
  });

  it("accepts default and prefixed sitemap namespaces", async () => {
    const { auditDiscoveryFiles } = await loadChecker();
    const namespace = sitemapNamespace;
    const sitemap = (prefix = "") => {
      const name = (local) => (prefix ? `${prefix}:${local}` : local);
      return `<${name("urlset")} xmlns${prefix ? `:${prefix}` : ""}="${namespace}">${routeExpectations.map(({ route }) => `<${name("url")}><${name("loc")}>${publicSiteUrl}${route}</${name("loc")}></${name("url")}>`).join("")}</${name("urlset")}>`;
    };

    expect(auditDiscoveryFiles({ siteUrl: publicSiteUrl, sitemapXml: sitemap(), robotsText: publicRobots })).toEqual([]);
    expect(auditDiscoveryFiles({ siteUrl: publicSiteUrl, sitemapXml: sitemap("sm"), robotsText: publicRobots })).toEqual([]);
  });

  it.each([
    ["a child element with text", `<x:ignored>evil</x:ignored>`],
    ["a self-closing child element", "<x:ignored/>"],
  ])("rejects a loc containing %s", async (_case, child) => {
    const { auditDiscoveryFiles } = await loadChecker();
    const sitemapXml = publicSitemap.replace(
      `${publicSiteUrl}/</loc>`,
      `${publicSiteUrl}/${child}</loc>`,
    );

    expect(auditDiscoveryFiles({ siteUrl: publicSiteUrl, sitemapXml, robotsText: publicRobots })).toEqual(
      expect.arrayContaining(["sitemap.xml is not well-formed XML"]),
    );
  });

  it.each([
    ["a commented directive", `# Sitemap: ${publicSiteUrl}/sitemap.xml`],
    ["a prefixed directive", `NotSitemap: ${publicSiteUrl}/sitemap.xml`],
    ["a suffixed URL", `Sitemap: ${publicSiteUrl}/sitemap.xml.evil`],
    ["multiple directives", `${publicRobots}\nSitemap: https://wrong.example/sitemap.xml`],
  ])("rejects robots with %s", async (_case, robotsText) => {
    const { auditDiscoveryFiles } = await loadChecker();

    expect(auditDiscoveryFiles({ siteUrl: publicSiteUrl, sitemapXml: publicSitemap, robotsText })).toEqual(
      expect.arrayContaining(["robots.txt sitemap does not match the canonical origin"]),
    );
  });

  it("accepts robots directives with CRLF, case, and surrounding whitespace", async () => {
    const { auditDiscoveryFiles } = await loadChecker();

    expect(
      auditDiscoveryFiles({
        siteUrl: publicSiteUrl,
        sitemapXml: `${publicSitemap}<!-- notlocalhost.example -->`,
        robotsText: `  sItEmAp :   ${publicSiteUrl}/sitemap.xml   \r\n`,
      }),
    ).toEqual([]);
  });

  it("requires HTTPS for public origins but permits localhost development audits", async () => {
    const { auditDiscoveryFiles } = await loadChecker();
    const localSiteUrl = "http://localhost:3000";
    const localSitemap = `<urlset xmlns="${sitemapNamespace}">${routeExpectations.map(({ route }) => `<url><loc>${localSiteUrl}${route}</loc></url>`).join("")}</urlset>`;

    expect(
      auditDiscoveryFiles({
        siteUrl: "http://example.com",
        sitemapXml: publicSitemap,
        robotsText: publicRobots,
      }),
    ).toEqual(expect.arrayContaining(["public discovery origin must use https"]));
    expect(
      auditDiscoveryFiles({
        siteUrl: localSiteUrl,
        sitemapXml: localSitemap,
        robotsText: `Sitemap: ${localSiteUrl}/sitemap.xml`,
      }),
    ).toEqual([]);
  });

  it("recognizes localhost namespaces and trailing dots without matching lookalikes", async () => {
    const { auditDiscoveryFiles } = await loadChecker();
    const localhostSitemap = (host) => `<urlset xmlns="${sitemapNamespace}"><url><loc>https://${host}/</loc></url></urlset>`;

    for (const host of ["localhost.", "dev.localhost"]) {
      expect(
        auditDiscoveryFiles({
          siteUrl: publicSiteUrl,
          sitemapXml: localhostSitemap(host),
          robotsText: publicRobots,
        }),
      ).toEqual(
        expect.arrayContaining(["sitemap.xml must not contain localhost on a public deployment"]),
      );
    }
    expect(
      auditDiscoveryFiles({
        siteUrl: "http://dev.localhost:3000",
        sitemapXml: `<urlset xmlns="${sitemapNamespace}">${routeExpectations.map(({ route }) => `<url><loc>http://dev.localhost:3000${route}</loc></url>`).join("")}</urlset>`,
        robotsText: "Sitemap: http://dev.localhost:3000/sitemap.xml",
      }),
    ).toEqual([]);
    expect(
      auditDiscoveryFiles({
        siteUrl: publicSiteUrl,
        sitemapXml: `${publicSitemap}<!-- notlocalhost.example -->`,
        robotsText: publicRobots,
      }),
    ).toEqual([]);
  });
});

describe("live SEO HTML audit", () => {
  it("defines the exact SEO contract for all seven public routes", async () => {
    const { PAGE_EXPECTATIONS } = await loadChecker();

    expect(PAGE_EXPECTATIONS).toEqual(routeExpectations);
  });

  it.each(articleExpectations)(
    "accepts a complete article fixture for $route",
    async (pageExpected) => {
      const { auditHtml } = await loadChecker();
      expect(auditHtml).toBeTypeOf("function");

      const result = auditHtml({
        route: pageExpected.route,
        html: articleFixture({ pageExpected }),
        siteUrl: "http://localhost:3000",
        expected: pageExpected,
        checkArticlePage: true,
      });

      expect(result).toEqual({ valid: true, errors: [] });
    },
  );

  it.each(
    articleExpectations.flatMap((pageExpected) => [
      {
        pageExpected,
        defect: "an empty TOC",
        fixture: { tocHtml: '<aside aria-label="Table of contents"></aside>' },
        code: "toc-missing",
      },
      {
        pageExpected,
        defect: "a TOC target on another path",
        fixture: {
          tocHtml:
            '<aside aria-label="Table of contents"><a href="/guide/#article-section">Article section</a></aside>',
        },
        code: "toc-target",
      },
      {
        pageExpected,
        defect: "an Article mainEntityOfPage URL mismatch",
        fixture: {
          jsonLd: schemas({
            article: {
              ...validArticle,
              headline: pageExpected.h1,
              description: pageExpected.description,
              mainEntityOfPage: "http://localhost:3000/not-this-article/",
            },
          }),
        },
        code: "article-entity",
      },
      {
        pageExpected,
        defect: "an empty visible FAQ",
        fixture: { faqHtml: '<div class="faq-list"></div>' },
        code: "faq-visible",
      },
      {
        pageExpected,
        defect: "visible and schema FAQ drift",
        fixture: { faqAnswer: "A different visible answer." },
        code: "faq-schema",
      },
      {
        pageExpected,
        defect: "a missing TOC fragment target",
        fixture: { tocTarget: "missing-article-section" },
        code: "toc-target",
      },
      {
        pageExpected,
        defect: "a duplicate TOC fragment target",
        fixture: {
          headings: `<h1>${pageExpected.h1}</h1><h2 id="article-section">First</h2><h2 id="article-section">Second</h2><h2 id="faq">FAQ</h2>`,
        },
        code: "toc-target",
      },
    ]),
  )(
    "applies the article contract to $pageExpected.route: rejects $defect",
    async ({ pageExpected, fixture, code }) => {
      const { auditHtml } = await loadChecker();

      const result = auditHtml({
        route: pageExpected.route,
        html: articleFixture({ pageExpected, ...fixture }),
        siteUrl: "http://localhost:3000",
        expected: pageExpected,
        checkArticlePage: true,
      });

      expect(result.valid).toBe(false);
      expect(result.errors.map((auditError) => auditError.code)).toContain(code);
    },
  );

  it("accepts a complete article-page fixture", async () => {
    const { auditHtml } = await loadChecker();
    expect(auditHtml).toBeTypeOf("function");

    const result = auditHtml({
      route: "/guide/how-to-clean/",
      html: articleFixture(),
      siteUrl: "http://localhost:3000",
      expected,
      checkArticlePage: true,
    });

    expect(result).toEqual({ valid: true, errors: [] });
  });

  it("reports exact metadata and heading hierarchy failures", async () => {
    const { auditHtml } = await loadChecker();
    expect(auditHtml).toBeTypeOf("function");

    const result = auditHtml({
      route: "/guide/how-to-clean/",
      html: articleFixture({
        title: "Wrong title",
        description: "Wrong description",
        canonical: "http://localhost:3000/wrong/",
        ogUrl: "http://localhost:3000/wrong/",
        headings: "<h2>Starts too low</h2><h4>Skipped a level</h4>",
      }),
      siteUrl: "http://localhost:3000",
      expected,
      checkArticlePage: true,
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
      html: articleFixture({
        jsonLd: schemas({ malformed: true, includeFaq: false }),
        tocTarget: "missing",
        faqAnswer: "Different visible answer.",
      }),
      siteUrl: "http://localhost:3000",
      expected,
      checkArticlePage: true,
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

  it.each([
    ["another origin", "https://evil.example/#cleaning"],
    ["another path", "/guide/#cleaning"],
    ["another query", "/guide/how-to-clean/?view=evil#cleaning"],
  ])("rejects a TOC link to %s even when its fragment exists locally", async (_case, href) => {
    const { auditHtml } = await loadChecker();

    const result = auditHtml({
      route: "/guide/how-to-clean/",
      html: articleFixture({
        tocHtml: `<aside aria-label="Table of contents"><a href="${href}">Cleaning</a></aside>`,
      }),
      siteUrl: "http://localhost:3000",
      expected,
      checkArticlePage: true,
    });

    expect(result.valid).toBe(false);
    expect(result.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: "toc-target", href }),
      ]),
    );
  });

  it("rejects an absent TOC and empty visible and schema FAQs", async () => {
    const { auditHtml } = await loadChecker();
    expect(auditHtml).toBeTypeOf("function");

    const result = auditHtml({
      route: "/guide/how-to-clean/",
      html: articleFixture({
        jsonLd: schemas({ emptyFaq: true }),
        tocHtml: "",
        faqHtml: "",
      }),
      siteUrl: "http://localhost:3000",
      expected,
      checkArticlePage: true,
    });

    expect(result.valid).toBe(false);
    expect(result.errors.map((auditError) => auditError.code)).toEqual(
      expect.arrayContaining(["toc-missing", "faq-visible", "faq-schema"]),
    );
  });

  it("rejects incomplete Article and BreadcrumbList entities", async () => {
    const { auditHtml } = await loadChecker();
    expect(auditHtml).toBeTypeOf("function");

    const result = auditHtml({
      route: "/guide/how-to-clean/",
      html: articleFixture({
        jsonLd: schemas({
          article: {
            "@context": "https://schema.org",
            "@type": "Article",
            headline: " ",
            description: 42,
            mainEntityOfPage: "not-an-absolute-url",
          },
          breadcrumbs: {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 0, name: " ", item: "relative" },
            ],
          },
        }),
      }),
      siteUrl: "http://localhost:3000",
      expected,
      checkArticlePage: true,
    });

    expect(result.valid).toBe(false);
    expect(result.errors.map((auditError) => auditError.code)).toEqual(
      expect.arrayContaining(["article-entity", "breadcrumb-entity"]),
    );
  });

  it.each([
    ["headline", { headline: "A different non-empty headline" }],
    ["description", { description: "A different non-empty description" }],
    ["mainEntityOfPage", { mainEntityOfPage: "relative-page" }],
  ])("rejects an invalid Article %s field", async (_field, articleOverride) => {
    const { auditHtml } = await loadChecker();
    expect(auditHtml).toBeTypeOf("function");

    const result = auditHtml({
      route: "/guide/how-to-clean/",
      html: articleFixture({
        jsonLd: schemas({
          article: { ...validArticle, ...articleOverride },
        }),
      }),
      siteUrl: "http://localhost:3000",
      expected,
      checkArticlePage: true,
    });

    expect(result.valid).toBe(false);
    expect(result.errors.map((auditError) => auditError.code)).toContain(
      "article-entity",
    );
  });

  it("rejects an absolute Article mainEntityOfPage for a different page", async () => {
    const { auditHtml } = await loadChecker();
    const wrongUrl = "http://localhost:3000/guide/another-page/";

    const result = auditHtml({
      route: "/guide/how-to-clean/",
      html: articleFixture({
        jsonLd: schemas({
          article: { ...validArticle, mainEntityOfPage: wrongUrl },
        }),
      }),
      siteUrl: "http://localhost:3000",
      expected,
      checkArticlePage: true,
    });

    expect(result.valid).toBe(false);
    expect(result.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: "article-entity", actual: wrongUrl }),
      ]),
    );
  });

  it("rejects a BreadcrumbList with no items", async () => {
    const { auditHtml } = await loadChecker();
    expect(auditHtml).toBeTypeOf("function");

    const result = auditHtml({
      route: "/guide/how-to-clean/",
      html: articleFixture({
        jsonLd: schemas({
          breadcrumbs: {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [],
          },
        }),
      }),
      siteUrl: "http://localhost:3000",
      expected,
      checkArticlePage: true,
    });

    expect(result.valid).toBe(false);
    expect(result.errors.map((auditError) => auditError.code)).toContain(
      "breadcrumb-entity",
    );
  });

  it.each([
    ["position type", { position: "1" }],
    ["positive position", { position: 0 }],
    ["name", { name: " " }],
    ["item URL", { item: "relative-item" }],
  ])("rejects an invalid breadcrumb %s field", async (_field, itemOverride) => {
    const { auditHtml } = await loadChecker();
    expect(auditHtml).toBeTypeOf("function");

    const result = auditHtml({
      route: "/guide/how-to-clean/",
      html: articleFixture({
        jsonLd: schemas({
          breadcrumbs: {
            ...validBreadcrumbs,
            itemListElement: [
              { ...validBreadcrumbs.itemListElement[0], ...itemOverride },
            ],
          },
        }),
      }),
      siteUrl: "http://localhost:3000",
      expected,
      checkArticlePage: true,
    });

    expect(result.valid).toBe(false);
    expect(result.errors.map((auditError) => auditError.code)).toContain(
      "breadcrumb-entity",
    );
  });

  it("rejects non-contiguous breadcrumb positions", async () => {
    const { auditHtml } = await loadChecker();
    const result = auditHtml({
      route: "/guide/how-to-clean/",
      html: articleFixture({
        jsonLd: schemas({
          breadcrumbs: {
            ...validBreadcrumbs,
            itemListElement: [
              validBreadcrumbs.itemListElement[0],
              {
                "@type": "ListItem",
                position: 3,
                name: "Cleaning",
                item: "http://localhost:3000/guide/how-to-clean/",
              },
            ],
          },
        }),
      }),
      siteUrl: "http://localhost:3000",
      expected,
      checkArticlePage: true,
    });

    expect(result.errors.map((auditError) => auditError.code)).toContain(
      "breadcrumb-entity",
    );
  });

  it("rejects a breadcrumb item on another origin", async () => {
    const { auditHtml } = await loadChecker();
    const result = auditHtml({
      route: "/guide/how-to-clean/",
      html: articleFixture({
        jsonLd: schemas({
          breadcrumbs: {
            ...validBreadcrumbs,
            itemListElement: [
              {
                ...validBreadcrumbs.itemListElement[0],
                item: "https://evil.example/",
              },
            ],
          },
        }),
      }),
      siteUrl: "http://localhost:3000",
      expected,
      checkArticlePage: true,
    });

    expect(result.errors.map((auditError) => auditError.code)).toContain(
      "breadcrumb-entity",
    );
  });

  it.each([
    ["Question", "WrongQuestionType", "Answer"],
    ["accepted Answer", "Question", "WrongAnswerType"],
  ])("rejects an invalid FAQ %s @type", async (_field, questionType, answerType) => {
    const { auditHtml } = await loadChecker();
    const faqSchema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": questionType,
          name: faq[0].question,
          acceptedAnswer: { "@type": answerType, text: faq[0].answer },
        },
      ],
    };

    const result = auditHtml({
      route: "/guide/how-to-clean/",
      html: articleFixture({
        jsonLd: `${schemas({ includeFaq: false })}<script type="application/ld+json">${JSON.stringify(faqSchema)}</script>`,
      }),
      siteUrl: "http://localhost:3000",
      expected,
      checkArticlePage: true,
    });

    expect(result.valid).toBe(false);
    expect(result.errors.map((auditError) => auditError.code)).toContain("faq-entity");
  });

  it("rejects blank visible and schema FAQ question-answer text", async () => {
    const { auditHtml } = await loadChecker();
    expect(auditHtml).toBeTypeOf("function");

    const result = auditHtml({
      route: "/guide/how-to-clean/",
      html: articleFixture({
        jsonLd: schemas({ faqItems: [{ question: " ", answer: " " }] }),
        faqHtml:
          '<div class="faq-list"><details><summary> </summary><p> </p></details></div>',
      }),
      siteUrl: "http://localhost:3000",
      expected,
      checkArticlePage: true,
    });

    expect(result.valid).toBe(false);
    expect(result.errors.map((auditError) => auditError.code)).toEqual(
      expect.arrayContaining(["faq-visible", "faq-entity"]),
    );
  });

  it.each([
    ["question", { question: " ", answer: faq[0].answer }],
    ["answer", { question: faq[0].question, answer: " " }],
  ])("rejects blank schema FAQ %s text", async (_field, faqItem) => {
    const { auditHtml } = await loadChecker();
    expect(auditHtml).toBeTypeOf("function");

    const result = auditHtml({
      route: "/guide/how-to-clean/",
      html: articleFixture({ jsonLd: schemas({ faqItems: [faqItem] }) }),
      siteUrl: "http://localhost:3000",
      expected,
      checkArticlePage: true,
    });

    expect(result.valid).toBe(false);
    expect(result.errors.map((auditError) => auditError.code)).toContain("faq-entity");
  });

  it.each([
    [
      "question",
      `<div class="faq-list"><details><summary> </summary><p>${faq[0].answer}</p></details></div>`,
    ],
    [
      "answer",
      `<div class="faq-list"><details><summary>${faq[0].question}</summary><p> </p></details></div>`,
    ],
  ])("rejects blank visible FAQ %s text", async (_field, faqHtml) => {
    const { auditHtml } = await loadChecker();
    expect(auditHtml).toBeTypeOf("function");

    const result = auditHtml({
      route: "/guide/how-to-clean/",
      html: articleFixture({ faqHtml }),
      siteUrl: "http://localhost:3000",
      expected,
      checkArticlePage: true,
    });

    expect(result.valid).toBe(false);
    expect(result.errors.map((auditError) => auditError.code)).toContain("faq-visible");
  });
});

describe("internal link audit", () => {
  it("times out even when an injected fetch ignores the abort signal", async () => {
    const { runLiveSeoCheck } = await loadChecker();
    expect(runLiveSeoCheck).toBeTypeOf("function");

    const fetchOptions = [];
    const run = runLiveSeoCheck({
      siteUrl: "http://localhost:3000",
      fetchTimeoutMs: 10,
      fetchImpl: (_url, options) => {
        fetchOptions.push(options);
        return new Promise(() => undefined);
      },
      write: () => undefined,
    });
    const testGuard = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("test guard expired")), 250);
    });

    const results = await Promise.race([run, testGuard]);

    expect(fetchOptions).toHaveLength(7);
    expect(fetchOptions.every((options) => options.signal instanceof AbortSignal)).toBe(
      true,
    );
    expect(fetchOptions.every((options) => options.signal.aborted)).toBe(true);
    expect(results).toHaveLength(7);
    expect(results.every((result) => result.status === 0 && !result.valid)).toBe(true);
    expect(
      results.every((result) =>
        result.errors.some(
          (auditError) =>
            auditError.code === "route-status" &&
            auditError.detail.includes("timed out after 10ms"),
        ),
      ),
    ).toBe(true);
  });

  it("preserves a required route's concrete network error in structured output", async () => {
    const { PAGE_EXPECTATIONS, runLiveSeoCheck } = await loadChecker();
    const [, guide] = PAGE_EXPECTATIONS;
    const fetchImpl = async (url) => {
      if (url === "http://localhost:3000/") {
        throw new Error("DNS lookup failed for local test host");
      }
      if (url === "http://localhost:3000/guide/") {
        return mockResponse(url, {
          html: pageFixture(guide, '<section id="repair-cleaning"></section>'),
        });
      }
      return mockResponse(url, { html: requiredPageHtml(url) });
    };

    const results = await runLiveSeoCheck({
      siteUrl: "http://localhost:3000",
      fetchImpl,
      write: () => undefined,
    });
    const routeError = results[0].errors.find(
      (auditError) => auditError.code === "route-status",
    );

    expect(routeError).toMatchObject({
      status: 0,
      fetchError: "DNS lookup failed for local test host",
    });
    expect(routeError.message).toContain("DNS lookup failed for local test host");
  });

  it("reports an actionable page-budget error for an unbounded query chain", async () => {
    const { PAGE_EXPECTATIONS, runLiveSeoCheck } = await loadChecker();
    expect(runLiveSeoCheck).toBeTypeOf("function");

    const fetched = [];
    const [home, guide] = PAGE_EXPECTATIONS;
    const fetchImpl = async (url) => {
      fetched.push(url);
      if (url === "http://localhost:3000/") {
        return mockResponse(url, {
          html: pageFixture(home, '<a href="/loop?n=0">Loop</a>'),
        });
      }
      if (url === "http://localhost:3000/guide/") {
        return mockResponse(url, {
          html: pageFixture(guide, '<section id="repair-cleaning"></section>'),
        });
      }
      if (url === "http://localhost:3000/guide/how-to-clean/") {
        return mockResponse(url, { html: articleFixture() });
      }
      const requiredHtml = requiredPageHtml(url);
      if (requiredHtml) return mockResponse(url, { html: requiredHtml });
      const n = Number(new URL(url).searchParams.get("n"));
      if (Number.isInteger(n) && n < 20) {
        return mockResponse(url, {
          html: `<a href="/loop?n=${n + 1}">Next query page</a>`,
        });
      }
      return new Promise(() => undefined);
    };
    const run = runLiveSeoCheck({
      siteUrl: "http://localhost:3000",
      fetchImpl,
      fetchTimeoutMs: 1_000,
      maxPages: 10,
      maxDepth: 30,
      maxUrls: 30,
      write: () => undefined,
    });
    const testGuard = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("test guard expired")), 250);
    });

    const results = await Promise.race([run, testGuard]);
    const budgetError = results
      .flatMap((result) => result.errors)
      .find((auditError) => auditError.code === "crawl-page-budget");

    expect(fetched).toHaveLength(10);
    expect(budgetError).toMatchObject({ maxPages: 10 });
    expect(budgetError.message).toContain("maxPages=10");
  });

  it.each([
    ["depth", { maxDepth: 0 }, "crawl-depth-budget", "maxDepth=0"],
    ["URL", { maxUrls: 7 }, "crawl-url-budget", "maxUrls=7"],
  ])(
    "reports an actionable %s-budget error instead of silently truncating",
    async (_budget, limits, code, messagePart) => {
      const { PAGE_EXPECTATIONS, runLiveSeoCheck } = await loadChecker();
      const [home, guide] = PAGE_EXPECTATIONS;
      const fetched = [];
      const fetchImpl = async (url) => {
        fetched.push(url);
        if (url === "http://localhost:3000/") {
          return mockResponse(url, {
            html: pageFixture(home, '<a href="/extra/">Extra</a>'),
          });
        }
        if (url === "http://localhost:3000/guide/") {
          return mockResponse(url, {
            html: pageFixture(guide, '<section id="repair-cleaning"></section>'),
          });
        }
        if (url === "http://localhost:3000/guide/how-to-clean/") {
          return mockResponse(url, { html: articleFixture() });
        }
        const requiredHtml = requiredPageHtml(url);
        if (requiredHtml) return mockResponse(url, { html: requiredHtml });
        return mockResponse(url, { html: "<p>Extra</p>" });
      };

      const results = await runLiveSeoCheck({
        siteUrl: "http://localhost:3000",
        fetchImpl,
        ...limits,
        write: () => undefined,
      });
      const budgetError = results
        .flatMap((result) => result.errors)
        .find((auditError) => auditError.code === code);

      expect(fetched).not.toContain("http://localhost:3000/extra/");
      if (limits.maxUrls) {
        expect(fetched.length).toBeLessThanOrEqual(limits.maxUrls);
      }
      expect(budgetError.message).toContain(messagePart);
      expect(budgetError).toMatchObject({
        sourceUrl: "http://localhost:3000/",
        targetUrl: "http://localhost:3000/extra/",
      });
    },
  );

  it("counts required route seeds against the maxUrls crawler budget", async () => {
    const { runLiveSeoCheck } = await loadChecker();
    const fetched = [];
    const maxUrls = 3;

    const results = await runLiveSeoCheck({
      siteUrl: "http://localhost:3000",
      maxUrls,
      fetchImpl: async (url) => {
        fetched.push(url);
        return mockResponse(url, { html: requiredPageHtml(url) });
      },
      write: () => undefined,
    });
    const budgetError = results
      .flatMap((result) => result.errors)
      .find((auditError) => auditError.code === "crawl-url-budget");

    expect(fetched).toHaveLength(maxUrls);
    expect(budgetError).toMatchObject({
      maxUrls,
      targetUrl: "http://localhost:3000/demo/",
    });
    expect(budgetError.message).toContain(`maxUrls=${maxUrls}`);
  });

  it("does not parse or enqueue links from a non-HTML response", async () => {
    const { PAGE_EXPECTATIONS, runLiveSeoCheck } = await loadChecker();
    const [home, guide] = PAGE_EXPECTATIONS;
    const fetched = [];
    const fetchImpl = async (url) => {
      fetched.push(url);
      if (url === "http://localhost:3000/") {
        return mockResponse(url, {
          html: pageFixture(home, '<a href="/download/">Download</a>'),
        });
      }
      if (url === "http://localhost:3000/guide/") {
        return mockResponse(url, {
          html: pageFixture(guide, '<section id="repair-cleaning"></section>'),
        });
      }
      if (url === "http://localhost:3000/guide/how-to-clean/") {
        return mockResponse(url, { html: articleFixture() });
      }
      const requiredHtml = requiredPageHtml(url);
      if (requiredHtml) return mockResponse(url, { html: requiredHtml });
      if (url === "http://localhost:3000/download/") {
        return mockResponse(url, {
          contentType: "application/pdf",
          html: '<a href="/should-not-fetch/">PDF-like bytes</a>',
        });
      }
      return mockResponse(url, { status: 404, html: "Not found" });
    };

    await runLiveSeoCheck({
      siteUrl: "http://localhost:3000",
      fetchImpl,
      write: () => undefined,
    });

    expect(fetched).toContain("http://localhost:3000/download/");
    expect(fetched).not.toContain("http://localhost:3000/should-not-fetch/");
  });

  it("does not parse or enqueue links from a non-2xx response", async () => {
    const { PAGE_EXPECTATIONS, runLiveSeoCheck } = await loadChecker();
    const [home, guide] = PAGE_EXPECTATIONS;
    const fetched = [];
    const fetchImpl = async (url) => {
      fetched.push(url);
      if (url === "http://localhost:3000/") {
        return mockResponse(url, {
          html: pageFixture(home, '<a href="/gone/">Gone</a>'),
        });
      }
      if (url === "http://localhost:3000/guide/") {
        return mockResponse(url, {
          html: pageFixture(guide, '<section id="repair-cleaning"></section>'),
        });
      }
      if (url === "http://localhost:3000/guide/how-to-clean/") {
        return mockResponse(url, { html: articleFixture() });
      }
      const requiredHtml = requiredPageHtml(url);
      if (requiredHtml) return mockResponse(url, { html: requiredHtml });
      if (url === "http://localhost:3000/gone/") {
        return mockResponse(url, {
          status: 404,
          html: '<a href="/should-not-fetch/">Error-page link</a>',
        });
      }
      return mockResponse(url, { status: 404, html: "Not found" });
    };

    await runLiveSeoCheck({
      siteUrl: "http://localhost:3000",
      fetchImpl,
      write: () => undefined,
    });

    expect(fetched).toContain("http://localhost:3000/gone/");
    expect(fetched).not.toContain("http://localhost:3000/should-not-fetch/");
  });

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
        { status: 200, html: articleFixture() },
      ],
      [
        "http://localhost:3000/extra/",
        { status: 200, html: '<a href="/missing/">Broken nested link</a>' },
      ],
    ]);
    const fetched = [];
    const fetchImpl = async (url) => {
      fetched.push(url);
      if (url === "http://localhost:3000/missing/") {
        throw new Error("socket exploded while fetching missing page");
      }
      const response = responses.get(url) ??
        (requiredPageHtml(url)
          ? { status: 200, html: requiredPageHtml(url) }
          : { status: 404, html: "Not found" });
      return mockResponse(url, response);
    };

    const results = await runLiveSeoCheck({
      siteUrl: "http://localhost:3000",
      fetchImpl,
      write: () => undefined,
    });

    expect(fetched).toContain("http://localhost:3000/missing/");
    const deadLinkError = results
      .flatMap((result) => result.errors)
      .find((auditError) => auditError.code === "internal-route-status");
    expect(deadLinkError).toMatchObject({
      sourceUrl: "http://localhost:3000/extra/",
      targetUrl: "http://localhost:3000/missing/",
      status: 0,
      fetchError: "socket exploded while fetching missing page",
    });
    expect(deadLinkError.message).toContain(
      "socket exploded while fetching missing page",
    );
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
        return { url, status: 200, text: async () => articleFixture() };
      }
      const requiredHtml = requiredPageHtml(url);
      if (requiredHtml) {
        return { url, status: 200, text: async () => requiredHtml };
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
