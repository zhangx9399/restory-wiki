import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const contentCases = [
  { name: "demo", file: "demo.mdx", evidenceLabel: /\bplayer report\b/i },
  {
    name: "customize display",
    file: "customize-display.mdx",
    evidenceLabel: /\bvisible gameplay corroboration\b/i,
  },
  {
    name: "system requirements",
    file: "system-requirements.mdx",
    evidenceLabel: /\bolder build\/version note\b/i,
  },
  {
    name: "painting",
    file: "painting.mdx",
    evidenceLabel: /\bnot officially confirmed\b/i,
  },
] as const;

const riskyClaim =
  /officially recommended specifications|save progress (?:will|does) carry over|press the [A-Z0-9]+ button|unlocks? at level \d+|universal scoring formula/i;
const paintingControlClaim =
  /\b(?:press|hold|tap|click)\s+(?:the\s+)?[A-Z0-9]+\b[^.!?;,\n]*(?:to\s+)?paint/i;
const paintingUnlockClaim = /\bpainting\s+unlocks?\s+at\s+level\s+\d+\b/i;
const paintingScoringClaim = /\bscoring (?:formula|rule|algorithm)\b/i;
const paintingEvidenceLimit =
  /\b(?:not (?:officially )?confirmed|unconfirmed|not documented|does not establish|cannot confirm|no reliable source (?:confirms|documents|establishes|supports))\b/i;
const directEvidenceState =
  /\b(?:is|remains)\s+(?:also\s+)?(?:not (?:officially )?confirmed|unconfirmed|not documented)\b/i;

function paragraphs(source: string) {
  return source
    .split(/\n\s*\n|(?=^\s*(?:[-*+]|\d+\.)\s+)/m)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

function cleanedWordCount(source: string) {
  const prose = source
    .replace(/^\s*import\b[\s\S]*?;\s*$/gm, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/^\s{0,3}#{1,6}\s+/gm, "")
    .replace(/^\s*(?:[-*+]|\d+\.)\s+/gm, " ");

  return prose.match(/[A-Za-z0-9]+(?:['’-][A-Za-z0-9]+)*/g)?.length ?? 0;
}

type PaintingRisk = "control" | "unlock" | "scoring";

type ArticleRiskContract = Readonly<{
  name: string;
  file: string;
  details: readonly string[];
  safeExamples: readonly (readonly [detail: string, source: string])[];
}>;

const articleRiskContracts: readonly ArticleRiskContract[] = [
  {
    name: "device selling",
    file: "how-to-sell-devices.mdx",
    details: [
      "profit formula",
      "fixed margin",
      "guaranteed price",
      "demand algorithm",
      "sale multiplier",
    ],
    safeExamples: [
      ["profit formula", "The profit formula is not officially confirmed."],
      ["fixed margin", "A fixed margin is not guaranteed."],
      ["guaranteed price", "A guaranteed price has no official confirmation."],
      ["demand algorithm", "The demand algorithm is unconfirmed."],
      ["sale multiplier", "A sale multiplier is not officially confirmed."],
    ],
  },
  {
    name: "missing joystick",
    file: "missing-joystick.mdx",
    details: [
      "guaranteed location",
      "replacement spawn",
      "fixed input sequence",
      "save repair",
      "universal fix",
    ],
    safeExamples: [
      ["guaranteed location", "A guaranteed location is not confirmed."],
      ["replacement spawn", "A replacement spawn is unconfirmed."],
      ["fixed input sequence", "A fixed input sequence is not guaranteed."],
      ["save repair", "A save repair has no official confirmation."],
      ["universal fix", "A universal fix is not supported."],
    ],
  },
];

const precedingDisclaimerRegressions = [
  {
    name: "selling detail before profit formula",
    contractName: "device selling",
    detail: "profit formula",
    source: "The fixed margin is unconfirmed and the profit formula is guaranteed.",
  },
  {
    name: "joystick detail before universal fix",
    contractName: "missing joystick",
    detail: "universal fix",
    source:
      "The replacement spawn is unconfirmed and the universal fix is guaranteed.",
  },
  {
    name: "unrelated recovery detail before profit formula",
    contractName: "device selling",
    detail: "profit formula",
    source:
      "The recovery method is unconfirmed and the profit formula is guaranteed.",
  },
] as const;

const riskLimit =
  /not (?:officially )?confirmed|unconfirmed|not guaranteed|no official confirmation|not supported|not documented|report-only|not universal/i;

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function hasBoundRiskLimit(claim: string, detail: string) {
  const escapedDetail = escapeRegExp(detail);
  const detailFirst = new RegExp(
    `\\b${escapedDetail}\\b\\s+(?:is|remains|has)\\s+(?:${riskLimit.source})`,
    "i",
  );
  const explicitlyUnconfirmedDetail = new RegExp(
    `\\bno\\s+(?:officially\\s+)?confirmed\\s+(?:current\\s+)?${escapedDetail}\\b`,
    "i",
  );
  const sourceLimit = new RegExp(
    `\\b(?:no (?:reliable )?source|none of these sources) confirms\\s+(?:a\\s+)?(?:current\\s+)?${escapedDetail}\\b`,
    "i",
  );
  const restartSaveLimit =
    detail === "save repair" &&
    /\bnever assume\s+(?:a\s+)?restart\s+performs\s+(?:a\s+)?save repair\b/i.test(
      claim,
    );

  return (
    detailFirst.test(claim) ||
    explicitlyUnconfirmedDetail.test(claim) ||
    sourceLimit.test(claim) ||
    restartSaveLimit
  );
}

function riskClaimViolations(source: string, details: readonly string[]) {
  return paragraphs(source).flatMap((paragraph) =>
    sentences(paragraph).flatMap((sentence) =>
      sentence
        .split(/\s*;\s*|\s*,\s*(?:but|while|and)\s+/i)
        .map((claim) => claim.trim())
        .filter(Boolean)
        .flatMap((claim) =>
          details.flatMap((detail) => {
            if (!new RegExp(`\\b${escapeRegExp(detail)}\\b`, "i").test(claim)) {
              return [];
            }

            return hasBoundRiskLimit(claim, detail) ? [] : [{ detail, claim }];
          }),
        ),
    ),
  );
}

function sentences(source: string) {
  return source.match(/[^.!?]+[.!?]+|[^.!?]+$/g)?.map((sentence) => sentence.trim()) ?? [];
}

function clauses(source: string) {
  return sentences(source).flatMap((sentence) =>
    sentence
      .split(/\s*;\s*|\s*,\s*(?:but|while)\s+/i)
      .map((clause) => clause.trim())
      .filter(Boolean),
  );
}

function paintingRisks(clause: string): PaintingRisk[] {
  return [
    ...(paintingUnlockClaim.test(clause) ? (["unlock"] as const) : []),
    ...(paintingControlClaim.test(clause) ? (["control"] as const) : []),
    ...(paintingScoringClaim.test(clause) ? (["scoring"] as const) : []),
  ];
}

function hasDirectReferencedLimit(clause: string, risk: PaintingRisk) {
  const references = {
    control:
      /\b(?:(?:this|that) (?:control|button|key|instruction|method)|the (?:painting )?(?:control|button|key|instruction))\b/i,
    unlock:
      /\b(?:(?:this|that) (?:unlock(?: level)?|level|milestone|claim)|the (?:unlock level|milestone))\b/i,
    scoring: /\b(?:this|that|the) (?:scoring )?(?:formula|rule|algorithm|claim)\b/i,
  } as const;

  return new RegExp(
    `${references[risk].source}\\s+${directEvidenceState.source}`,
    "i",
  ).test(clause);
}

function hasOwnRiskLimit(sentence: string, risk: PaintingRisk) {
  if (!paintingEvidenceLimit.test(sentence)) {
    return false;
  }
  if (risk === "control") {
    return (
      hasDirectReferencedLimit(sentence, risk) ||
      new RegExp(
        `(?:${paintingControlClaim.source})\\s+${directEvidenceState.source}`,
        "i",
      ).test(sentence)
    );
  }
  if (risk === "unlock") {
    return (
      hasDirectReferencedLimit(sentence, risk) ||
      new RegExp(
        `${paintingUnlockClaim.source}\\s+${directEvidenceState.source}`,
        "i",
      ).test(sentence)
    );
  }

  return (
    new RegExp(
      `${paintingScoringClaim.source}(?:\\s+that applies everywhere)?\\s+${directEvidenceState.source}`,
      "i",
    ).test(sentence) ||
    /\b(?:no reliable source (?:confirms|documents|establishes|supports)|cannot confirm|does not establish)[^.!?]*\bscoring (?:formula|rule|algorithm)\b/i.test(
      sentence,
    )
  );
}

function paintingRiskViolations(source: string) {
  return paragraphs(source).flatMap((paragraph) => {
    const paragraphClauses = clauses(paragraph);

    return paragraphClauses.flatMap((claim, index) => {
      const nextClause = paragraphClauses[index + 1];

      return paintingRisks(claim).flatMap((risk) => {
        const hasAdjacentLimit =
          nextClause && hasDirectReferencedLimit(nextClause, risk);

        return hasOwnRiskLimit(claim, risk) || hasAdjacentLimit
          ? []
          : [{ risk, claim }];
      });
    });
  });
}

describe.each(contentCases)("$name content evidence contract", ({ file, evidenceLabel }) => {
  const source = readFileSync(join(process.cwd(), "src/content", file), "utf8");

  it("contains 900 to 1,300 cleaned English words", () => {
    const wordCount = cleanedWordCount(source);

    expect(wordCount).toBeGreaterThanOrEqual(900);
    expect(wordCount).toBeLessThanOrEqual(1300);
  });

  it("leaves the page H1 to the route shell", () => {
    expect(source).not.toMatch(/^#\s+/m);
  });

  it("places Quick Answer before the first H2", () => {
    const quickAnswerIndex = source.search(/\*\*Quick answer:\*\*/i);
    const firstH2Index = source.search(/^##\s+/m);

    expect(quickAnswerIndex).toBeGreaterThanOrEqual(0);
    expect(firstH2Index).toBeGreaterThan(quickAnswerIndex);
  });

  it("places FAQ before Sources", () => {
    const faqIndex = source.indexOf("## Frequently Asked Questions");
    const sourcesIndex = source.indexOf("## Sources and Evidence Notes");

    expect(faqIndex).toBeGreaterThanOrEqual(0);
    expect(sourcesIndex).toBeGreaterThan(faqIndex);
  });

  it("cites at least three external links", () => {
    const links = Array.from(
      source.matchAll(/\]\((https?:\/\/[^)\s]+)\)/g),
      (match) => match[1],
    );

    expect(links.length).toBeGreaterThanOrEqual(3);
  });

  it("absolutely rejects prohibited claim phrasing", () => {
    expect(source).not.toMatch(riskyClaim);
  });

  it("uses its page-specific evidence label", () => {
    expect(source).toMatch(evidenceLabel);
  });
});

describe("page-specific evidence placement", () => {
  it("labels demo save-transfer reports as non-official in the same paragraph", () => {
    const source = readFileSync(
      join(process.cwd(), "src/content/demo.mdx"),
      "utf8",
    );
    const reportParagraphs = paragraphs(source).filter((paragraph) =>
      /\bplayer report\b/i.test(paragraph),
    );

    expect(reportParagraphs.length).toBeGreaterThan(0);
    for (const paragraph of reportParagraphs) {
      expect(paragraph, paragraph).toMatch(
        /\bnot an official\b|\bnot official\b|\bno\b[^.]*\bofficial confirmation\b/i,
      );
    }
  });

  it("labels version-specific system advice as older-build guidance", () => {
    const source = readFileSync(
      join(process.cwd(), "src/content/system-requirements.mdx"),
      "utf8",
    );
    const versionAdvice = paragraphs(source).filter(
      (paragraph) =>
        !paragraph.startsWith("##") &&
        /\bVSync\b|\b(?:30|60)\s*FPS\b|30 or 60 FPS/i.test(paragraph),
    );

    expect(versionAdvice.length).toBeGreaterThan(0);
    for (const paragraph of versionAdvice) {
      expect(paragraph, paragraph).toMatch(/\bolder build\/version note\b/i);
    }
  });

  it("limits customization video evidence in its source paragraph", () => {
    const source = readFileSync(
      join(process.cwd(), "src/content/customize-display.mdx"),
      "utf8",
    );
    const videoSource = paragraphs(source).find((paragraph) =>
      paragraph.includes("youtube.com/watch"),
    );

    expect(videoSource).toMatch(/\bvisible gameplay corroboration\b/i);
    expect(videoSource).toMatch(/\bnot evidence\b/i);
  });
});

describe("painting affirmative claim guard", () => {
  it("requires operational and level assertions to be limited in the same paragraph", () => {
    expect(
      paintingRiskViolations(
        "Press R to paint.\n\nControls elsewhere are unconfirmed.\n\nPainting unlocks at level 4.",
      ),
    ).toEqual([
      { risk: "control", claim: "Press R to paint." },
      { risk: "unlock", claim: "Painting unlocks at level 4." },
    ]);
    expect(
      paintingRiskViolations(
        "Press R to paint, but this control is not officially confirmed.\n\nPainting unlocks at level 4 is unconfirmed.",
      ),
    ).toEqual([]);
  });

  it("applies the same-paragraph guard to the painting article", () => {
    const source = readFileSync(
      join(process.cwd(), "src/content/painting.mdx"),
      "utf8",
    );

    expect(paintingRiskViolations(source)).toEqual([]);
  });

  it("rejects varied affirmative scoring claims while allowing explicit limits", () => {
    expect(
      paintingRiskViolations(
        "The scoring formula is fixed.\n\nA global scoring rule applies everywhere.\n\nThe scoring algorithm is deterministic.",
      ),
    ).toEqual([
      { risk: "scoring", claim: "The scoring formula is fixed." },
      {
        risk: "scoring",
        claim: "A global scoring rule applies everywhere.",
      },
      {
        risk: "scoring",
        claim: "The scoring algorithm is deterministic.",
      },
    ]);
    expect(
      paintingRiskViolations(
        "The scoring formula is unconfirmed.\n\nNo reliable source confirms a global scoring rule.\n\nThe scoring algorithm is not documented.",
      ),
    ).toEqual([]);
  });

  it("does not let an unrelated limitation excuse another risky detail", () => {
    expect(
      paintingRiskViolations(
        "Press R to paint. The undo method is unconfirmed.",
      ),
    ).toEqual([{ risk: "control", claim: "Press R to paint." }]);
    expect(
      paintingRiskViolations(
        "Painting unlocks at level 4, while the undo method is unconfirmed.",
      ),
    ).toEqual([{ risk: "unlock", claim: "Painting unlocks at level 4" }]);
    expect(
      paintingRiskViolations(
        "The scoring formula is fixed, while the undo method is unconfirmed.",
      ),
    ).toEqual([{ risk: "scoring", claim: "The scoring formula is fixed" }]);
    expect(
      paintingRiskViolations(
        "Press R to paint. This control is not officially confirmed.",
      ),
    ).toEqual([]);
  });

  it("binds each limitation to the specific risky clause it qualifies", () => {
    expect(
      paintingRiskViolations(
        "Press R to paint; this control is documented, while the undo method is unconfirmed.",
      ),
    ).toEqual([{ risk: "control", claim: "Press R to paint" }]);
    expect(
      paintingRiskViolations(
        "Press R to paint; this control is unconfirmed, but the scoring formula is fixed.",
      ),
    ).toEqual([
      { risk: "scoring", claim: "the scoring formula is fixed." },
    ]);
    expect(
      paintingRiskViolations(
        "Painting unlocks at level 4 is unconfirmed, but press R to paint.",
      ),
    ).toEqual([{ risk: "control", claim: "press R to paint." }]);
  });

  it("requires the adjacent qualifier to directly describe its risk referent", () => {
    for (const conjunction of ["but", "and"]) {
      expect(
        paintingRiskViolations(
          `Press R to paint; this control is documented ${conjunction} the undo method is unconfirmed.`,
        ),
      ).toEqual([{ risk: "control", claim: "Press R to paint" }]);
    }
  });
});

describe.each(articleRiskContracts)(
  "$name affirmative claim guard",
  ({ file, details, safeExamples }) => {
    it.each(details)("requires the %s limitation to bind to that same claim", (detail) => {
      expect(
        riskClaimViolations(
          `The ${detail} is guaranteed. The unrelated recovery method is unconfirmed.`,
          details,
        ),
      ).toEqual([
        { detail, claim: `The ${detail} is guaranteed.` },
      ]);
      expect(
        riskClaimViolations(
          `The ${detail} is unconfirmed. The unrelated recovery method is guaranteed.`,
          details,
        ),
      ).toEqual([]);
    });

    it("keeps every risky article claim locally and specifically limited", () => {
      const source = readFileSync(join(process.cwd(), "src/content", file), "utf8");

      for (const detail of details) {
        expect(source.toLowerCase()).toContain(detail);
      }
      expect(riskClaimViolations(source, details)).toEqual([]);
    });

    it.each(safeExamples)(
      "accepts the current article's explicit %s limitation form",
      (detail, source) => {
        expect(source.toLowerCase()).toContain(detail);
        expect(riskClaimViolations(source, details)).toEqual([]);
      },
    );

    it.each(details)(
      "rejects an affirmative %s claim after an unrelated same-sentence disclaimer",
      (detail) => {
        const limitedDetail = details.find((candidate) => candidate !== detail);
        expect(limitedDetail).toBeDefined();
        const source =
          `The ${limitedDetail} is unconfirmed and the ${detail} is guaranteed.`;

        expect(riskClaimViolations(source, details)).toEqual([
          { detail, claim: source },
        ]);
      },
    );

    it("does not borrow a different risky detail's disclaimer", () => {
      const [unlimitedDetail, limitedDetail] = details;
      const expectedViolation = [
        {
          detail: unlimitedDetail,
          claim: `The ${unlimitedDetail} is guaranteed`,
        },
      ];

      expect(
        riskClaimViolations(
          `The ${unlimitedDetail} is guaranteed, while the ${limitedDetail} is unconfirmed.`,
          details,
        ),
      ).toEqual(expectedViolation);
      expect(
        riskClaimViolations(
          `The ${unlimitedDetail} is guaranteed and the ${limitedDetail} is unconfirmed.`,
          details,
        ),
      ).toEqual([
        {
          detail: unlimitedDetail,
          claim: `The ${unlimitedDetail} is guaranteed and the ${limitedDetail} is unconfirmed.`,
        },
      ]);
    });
  },
);

describe("preceding disclaimer regressions", () => {
  it.each(precedingDisclaimerRegressions)(
    "rejects $name",
    ({ contractName, detail, source }) => {
      const contract = articleRiskContracts.find(
        ({ name }) => name === contractName,
      );

      expect(contract).toBeDefined();
      expect(riskClaimViolations(source, contract!.details)).toEqual([
        { detail, claim: source },
      ]);
    },
  );
});

describe("content parsing locality", () => {
  it("treats consecutive Markdown list items as separate evidence blocks", () => {
    const blocks = paragraphs(
      "- Official source: no fixed control is documented.\n- YouTube source: visible gameplay corroboration only.\n- Community source: not evidence for universal rules.",
    );

    expect(blocks).toEqual([
      "- Official source: no fixed control is documented.",
      "- YouTube source: visible gameplay corroboration only.",
      "- Community source: not evidence for universal rules.",
    ]);
    const videoBlock = blocks.find((block) => block.includes("YouTube"));
    expect(videoBlock).not.toMatch(/not evidence/i);
  });

  it("removes multiline imports before counting prose words", () => {
    expect(
      cleanedWordCount(`import {
  FaqList,
  OtherComponent,
} from "@/components/content";

One two three.`),
    ).toBe(3);
  });
});
