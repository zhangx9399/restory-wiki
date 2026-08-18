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

const evidenceLanguageRegressions = [
  {
    name: "plural profit formulas",
    contractName: "device selling",
    detail: "profit formula",
    source: "The profit formulas guarantee a 20% return.",
    violates: true,
  },
  {
    name: "plural replacement spawns",
    contractName: "missing joystick",
    detail: "replacement spawn",
    source: "Replacement spawns always appear on the right.",
    violates: true,
  },
  {
    name: "hyphenated sale multiplier",
    contractName: "device selling",
    detail: "sale multiplier",
    source: "The sale-multiplier guarantees twice the value.",
    violates: true,
  },
  {
    name: "qualified then contradictory profit formula",
    contractName: "device selling",
    detail: "profit formula",
    source: "The profit formula is unconfirmed but guarantees 20%.",
    violates: true,
  },
  {
    name: "colon-qualified profit formula",
    contractName: "device selling",
    detail: "profit formula",
    source: "The profit formula: unconfirmed.",
    violates: false,
  },
  {
    name: "dash-qualified fixed margin",
    contractName: "device selling",
    detail: "fixed margin",
    source: "The fixed margin — not documented.",
    violates: false,
  },
  {
    name: "contracted guaranteed price qualifier",
    contractName: "device selling",
    detail: "guaranteed price",
    source: "The guaranteed price isn't confirmed.",
    violates: false,
  },
  {
    name: "evidence-qualified demand algorithm",
    contractName: "device selling",
    detail: "demand algorithm",
    source: "There is no reliable evidence for a demand algorithm.",
    violates: false,
  },
] as const;

const claimParserRegressions = [
  {
    name: "copular fixed contradiction",
    contractName: "device selling",
    source: "The profit formula is unconfirmed but is fixed at 20%.",
    violatingDetails: ["profit formula"],
  },
  {
    name: "future always return contradiction",
    contractName: "device selling",
    source: "The profit formula is unconfirmed but will always return 20%.",
    violatingDetails: ["profit formula"],
  },
  {
    name: "copular guaranteed contradiction",
    contractName: "missing joystick",
    source: "The universal fix is unconfirmed but is guaranteed to work.",
    violatingDetails: ["universal fix"],
  },
  {
    name: "repeated subject contradiction",
    contractName: "device selling",
    source: "The profit formula is unconfirmed but this formula guarantees 20%.",
    violatingDetails: ["profit formula"],
  },
  {
    name: "decimal return contradiction",
    contractName: "device selling",
    source: "The profit formula is unconfirmed but returns a 20.5% margin.",
    violatingDetails: ["profit formula"],
  },
  {
    name: "plural copular qualifier",
    contractName: "device selling",
    source: "The profit formulas are unconfirmed.",
    violatingDetails: [],
  },
  {
    name: "plural replacement qualifier",
    contractName: "missing joystick",
    source: "Replacement spawns are not guaranteed.",
    violatingDetails: [],
  },
  {
    name: "uppercase hyphen plural qualifier",
    contractName: "device selling",
    source: "The PROFIT-FORMULAS are UNCONFIRMED.",
    violatingDetails: [],
  },
  {
    name: "shared plural qualifier",
    contractName: "device selling",
    source: "The profit formula and fixed margin are unconfirmed.",
    violatingDetails: [],
  },
  {
    name: "instructional always wording",
    contractName: "device selling",
    source: "The profit formula is unconfirmed but always check current values.",
    violatingDetails: [],
  },
  {
    name: "unsafe fixed assumptions wording",
    contractName: "device selling",
    source: "The profit formula is unconfirmed but fixed assumptions are unsafe.",
    violatingDetails: [],
  },
] as const;

const finalPredicateRegressions = [
  {
    name: "possessive fixed return contradiction",
    contractName: "device selling",
    source: "The profit formula is unconfirmed but it has a fixed 20% return.",
    violatingDetails: ["profit formula"],
  },
  {
    name: "produced return contradiction",
    contractName: "device selling",
    source: "The profit formula is unconfirmed but produces a 20% return.",
    violatingDetails: ["profit formula"],
  },
  {
    name: "emphatic guarantee contradiction",
    contractName: "missing joystick",
    source: "The fixed input sequence is unconfirmed but does guarantee success.",
    violatingDetails: ["fixed input sequence"],
  },
  {
    name: "every-time work contradiction",
    contractName: "missing joystick",
    source: "The universal fix is unconfirmed but it works every time.",
    violatingDetails: ["universal fix"],
  },
  {
    name: "every-time appearance contradiction",
    contractName: "missing joystick",
    source: "The replacement spawn is unconfirmed but it appears every time.",
    violatingDetails: ["replacement spawn"],
  },
  {
    name: "copular always contradiction",
    contractName: "device selling",
    source: "The demand algorithm is unconfirmed but is always accurate.",
    violatingDetails: ["demand algorithm"],
  },
  {
    name: "neither-nor shared qualifier",
    contractName: "device selling",
    source: "Neither the profit formula nor the fixed margin is confirmed.",
    violatingDetails: [],
  },
] as const;

const riskLanguageCases = [
  {
    contractName: "device selling",
    detail: "profit formula",
    variants: [
      "profit formula",
      "profit formulas",
      "profit-formula",
      "profit-formulas",
    ],
  },
  {
    contractName: "device selling",
    detail: "fixed margin",
    variants: ["fixed margin", "fixed margins", "fixed-margin", "fixed-margins"],
  },
  {
    contractName: "device selling",
    detail: "guaranteed price",
    variants: [
      "guaranteed price",
      "guaranteed prices",
      "guaranteed-price",
      "guaranteed-prices",
    ],
  },
  {
    contractName: "device selling",
    detail: "demand algorithm",
    variants: [
      "demand algorithm",
      "demand algorithms",
      "demand-algorithm",
      "demand-algorithms",
    ],
  },
  {
    contractName: "device selling",
    detail: "sale multiplier",
    variants: [
      "sale multiplier",
      "sale multipliers",
      "sale-multiplier",
      "sale-multipliers",
    ],
  },
  {
    contractName: "missing joystick",
    detail: "guaranteed location",
    variants: [
      "guaranteed location",
      "guaranteed locations",
      "guaranteed-location",
      "guaranteed-locations",
    ],
  },
  {
    contractName: "missing joystick",
    detail: "replacement spawn",
    variants: [
      "replacement spawn",
      "replacement spawns",
      "replacement-spawn",
      "replacement-spawns",
    ],
  },
  {
    contractName: "missing joystick",
    detail: "fixed input sequence",
    variants: [
      "fixed input sequence",
      "fixed input sequences",
      "fixed-input-sequence",
      "fixed-input-sequences",
    ],
  },
  {
    contractName: "missing joystick",
    detail: "save repair",
    variants: ["save repair", "save repairs", "save-repair", "save-repairs"],
  },
  {
    contractName: "missing joystick",
    detail: "universal fix",
    variants: ["universal fix", "universal fixes", "universal-fix", "universal-fixes"],
  },
] as const;

const qualifierForms = [
  { name: "colon", render: (risk: string) => `The ${risk}: unconfirmed.` },
  { name: "em dash", render: (risk: string) => `The ${risk} — not documented.` },
  { name: "comma", render: (risk: string) => `The ${risk}, not guaranteed.` },
  {
    name: "semicolon",
    render: (risk: string) => `The ${risk}; no official confirmation.`,
  },
  { name: "bare but", render: (risk: string) => `The ${risk} but unconfirmed.` },
  { name: "bare and", render: (risk: string) => `The ${risk} and not documented.` },
] as const;

const contradictoryForms = [
  {
    name: "bare but guarantee",
    render: (risk: string) =>
      `The ${risk} is unconfirmed but guarantees a 20% return.`,
  },
  {
    name: "comma but always",
    render: (risk: string) =>
      `The ${risk} is unconfirmed, but always appears on the right.`,
  },
  {
    name: "semicolon fixed",
    render: (risk: string) => `The ${risk} is unconfirmed; fixed at 20%.`,
  },
  {
    name: "em dash numeric return",
    render: (risk: string) =>
      `The ${risk} is unconfirmed — returns a 20% margin.`,
  },
  {
    name: "bare and guarantee",
    render: (risk: string) =>
      `The ${risk} is unconfirmed and guarantees twice the value.`,
  },
] as const;

const evidenceLimitState = [
  "unconfirmed",
  String.raw`not\s+(?:officially\s+)?confirmed`,
  String.raw`not\s+guaranteed`,
  String.raw`no\s+official\s+confirmation`,
  String.raw`not\s+supported`,
  String.raw`not\s+documented`,
  "report-only",
  String.raw`not\s+universal`,
].join("|");

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

type RiskOccurrence = Readonly<{
  detail: string;
  start: number;
  end: number;
}>;

function riskSpellings(detail: string) {
  const words = detail.split(" ");
  const lastWord = words.at(-1)!;
  const pluralLastWord = lastWord === "fix" ? "fixes" : `${lastWord}s`;
  const plural = [...words.slice(0, -1), pluralLastWord].join(" ");

  return [
    detail,
    plural,
    detail.replaceAll(" ", "-"),
    plural.replaceAll(" ", "-"),
  ];
}

function riskOccurrences(claim: string, details: readonly string[]) {
  return details
    .flatMap((detail): RiskOccurrence[] => {
      const variants = riskSpellings(detail)
        .sort((left, right) => right.length - left.length)
        .map(escapeRegExp)
        .join("|");
      const pattern = new RegExp(`\\b(?:${variants})\\b`, "gi");

      return Array.from(claim.matchAll(pattern), (match) => ({
        detail,
        start: match.index,
        end: match.index + match[0].length,
      }));
    })
    .sort((left, right) => left.start - right.start);
}

function qualifierLengthAfterRisk(suffix: string) {
  const state = `(?:${evidenceLimitState})`;
  const linkedState = [
    state,
    `(?:is|are|remain|remains)\\s+${state}`,
    String.raw`(?:has|have)\s+no\s+official\s+confirmation`,
    String.raw`(?:isn['’]t|aren['’]t)\s+(?:officially\s+)?(?:confirmed|documented|guaranteed|supported)`,
    `(?:but|and)\\s+(?:(?:is|are|remain|remains)\\s+)?${state}`,
  ].join("|");
  const match = suffix.match(
    new RegExp(
      `^(?:\\s*(?:[:,;]|[-–—])\\s*|\\s+)(?:${linkedState})`,
      "i",
    ),
  );

  return match?.[0].length;
}

function hasQualifierImmediatelyBeforeRisk(prefix: string, detail: string) {
  const sharedLimits = [
    String.raw`(?:there\s+is\s+)?no\s+reliable\s+evidence\s+for\s+(?:an?|the)?\s*$`,
    String.raw`(?:there\s+is\s+)?no\s+(?:officially\s+)?confirmed\s+(?:current\s+)?$`,
    String.raw`(?:no\s+(?:reliable\s+)?source|none\s+of\s+these\s+sources)\s+confirms\s+(?:an?\s+)?(?:current\s+)?$`,
  ];
  if (sharedLimits.some((source) => new RegExp(source, "i").test(prefix))) {
    return true;
  }

  return (
    detail === "save repair" &&
    /\bnever\s+assume\s+(?:a\s+)?restart\s+performs\s+(?:a\s+)?$/i.test(
      prefix,
    )
  );
}

function isRiskListConnector(source: string) {
  return /^\s*(?:,\s*(?:and\s+)?|and\s+)(?:the|an?)?\s*$/i.test(source);
}

type RiskQualification = Readonly<{
  through: number;
  groupEnd: number;
}>;

function neitherNorQualification(
  claim: string,
  occurrences: readonly RiskOccurrence[],
  index: number,
): RiskQualification | undefined {
  const norConnector = /^\s+nor\s+(?:the|an?)?\s*$/i;
  let groupStart = index;
  let groupEnd = index;

  while (
    occurrences[groupStart - 1] &&
    norConnector.test(
      claim.slice(occurrences[groupStart - 1].end, occurrences[groupStart].start),
    )
  ) {
    groupStart -= 1;
  }
  while (
    occurrences[groupEnd + 1] &&
    norConnector.test(
      claim.slice(occurrences[groupEnd].end, occurrences[groupEnd + 1].start),
    )
  ) {
    groupEnd += 1;
  }
  if (
    groupStart === groupEnd ||
    !/\bneither\s+(?:the|an?)?\s*$/i.test(
      claim.slice(0, occurrences[groupStart].start),
    )
  ) {
    return undefined;
  }

  const finalOccurrence = occurrences[groupEnd];
  const confirmation = claim
    .slice(finalOccurrence.end)
    .match(/^\s+(?:is|are|remain|remains)\s+confirmed\b/i);
  return confirmation
    ? { through: finalOccurrence.end + confirmation[0].length, groupEnd }
    : undefined;
}

function qualificationForOccurrence(
  claim: string,
  occurrences: readonly RiskOccurrence[],
  index: number,
): RiskQualification | undefined {
  const occurrence = occurrences[index];
  const neitherNor = neitherNorQualification(claim, occurrences, index);
  if (neitherNor) {
    return neitherNor;
  }

  const directLength = qualifierLengthAfterRisk(claim.slice(occurrence.end));
  if (directLength !== undefined) {
    return { through: occurrence.end + directLength, groupEnd: index };
  }

  if (
    hasQualifierImmediatelyBeforeRisk(
      claim.slice(0, occurrence.start),
      occurrence.detail,
    )
  ) {
    return { through: occurrence.end, groupEnd: index };
  }

  let groupEnd = index;
  while (
    occurrences[groupEnd + 1] &&
    isRiskListConnector(
      claim.slice(occurrences[groupEnd].end, occurrences[groupEnd + 1].start),
    )
  ) {
    groupEnd += 1;
  }
  if (groupEnd === index) {
    return undefined;
  }

  const finalOccurrence = occurrences[groupEnd];
  const sharedLength = qualifierLengthAfterRisk(
    claim.slice(finalOccurrence.end),
  );
  return sharedLength === undefined
    ? undefined
    : { through: finalOccurrence.end + sharedLength, groupEnd };
}

function predicateAfterQualifier(tail: string, detail: string) {
  let predicate = tail.trimStart();
  predicate = predicate.replace(/^[,;–—-]\s*/, "");
  predicate = predicate.replace(/^(?:but|and|yet|however)\s+/i, "");
  predicate = predicate.replace(/^still\s+/i, "");

  const lastWord = detail.split(" ").at(-1)!;
  const subjectNouns = [
    lastWord,
    lastWord === "fix" ? "fixes" : `${lastWord}s`,
    "mechanic",
    "mechanics",
    "method",
    "methods",
  ]
    .map(escapeRegExp)
    .join("|");
  predicate = predicate.replace(
    new RegExp(`^(?:it|(?:this|that|the)\\s+(?:${subjectNouns}))\\s+`, "i"),
    "",
  );

  return predicate;
}

function hasRiskPredicateContradiction(tail: string, detail: string) {
  const predicate = predicateAfterQualifier(tail, detail);
  const guaranteePredicate = [
    /^guarantee(?:s|d)?\b/i,
    /^(?:do|does|did)\s+guarantee\b/i,
    /^(?:is|are)\s+guaranteed\b/i,
    /^(?:will|can)\s+(?:be\s+guaranteed|guarantee)\b/i,
  ];
  const fixedPredicate = [
    /^fixed\s+(?:at|to|by)\b/i,
    /^(?:has|have)\s+a\s+fixed\s+(?:\d+(?:\.\d+)?\s*%\s*)?(?:return|margin|price|value)\b/i,
    /^(?:is|are)\s+fixed\b/i,
    /^(?:will|can)\s+be\s+fixed\b/i,
  ];
  const alwaysPredicate = [
    /^always\s+(?:appear|appears|guarantee|guarantees|return|returns|yield|yields|work|works|cost|costs|spawn|spawns)\b/i,
    /^(?:will|can)\s+always\s+(?:appear|guarantee|return|yield|work|cost|spawn)\b/i,
    /^(?:is|are)\s+always\s+(?:accurate|available|fixed|guaranteed|present|successful)\b/i,
    /^(?:appear|appears|work|works)\s+(?:every\s+time|in\s+every\s+build)\b/i,
  ];
  const numericReturnPredicate = [
    /^(?:(?:will|can)\s+)?(?:return|returns|yield|yields|promise|promises)\s+(?:a\s+)?\d+(?:\.\d+)?\s*%/i,
    /^(?:produce|produces|deliver|delivers)\s+(?:a\s+)?\d+(?:\.\d+)?\s*%\s+return\b/i,
    /^\d+(?:\.\d+)?\s*%\s*(?:return|margin|profit|value)\b/i,
  ];

  return [
    ...guaranteePredicate,
    ...fixedPredicate,
    ...alwaysPredicate,
    ...numericReturnPredicate,
  ].some((pattern) => pattern.test(predicate));
}

function riskClaimViolations(source: string, details: readonly string[]) {
  return paragraphs(source).flatMap((paragraph) =>
    sentences(paragraph).flatMap((claim) => {
      const occurrences = riskOccurrences(claim, details);

      return occurrences.flatMap((occurrence, index) => {
        const qualification = qualificationForOccurrence(
          claim,
          occurrences,
          index,
        );
        if (!qualification) {
          return [{ detail: occurrence.detail, claim }];
        }

        const nextOccurrenceStart =
          occurrences[qualification.groupEnd + 1]?.start ?? claim.length;
        const predicateTail = claim.slice(
          qualification.through,
          nextOccurrenceStart,
        );

        return hasRiskPredicateContradiction(predicateTail, occurrence.detail)
          ? [{ detail: occurrence.detail, claim }]
          : [];
      });
    }),
  );
}

function sentences(source: string) {
  const results: string[] = [];
  let sentenceStart = 0;

  for (let index = 0; index < source.length; index += 1) {
    const character = source[index];
    if (!".!?".includes(character)) {
      continue;
    }
    if (
      character === "." &&
      /\d/.test(source[index - 1] ?? "") &&
      /\d/.test(source[index + 1] ?? "")
    ) {
      continue;
    }

    const sentence = source.slice(sentenceStart, index + 1).trim();
    if (sentence) {
      results.push(sentence);
    }
    sentenceStart = index + 1;
  }

  const remainder = source.slice(sentenceStart).trim();
  if (remainder) {
    results.push(remainder);
  }
  return results;
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
      const commaSource =
        `The ${unlimitedDetail} is guaranteed, while the ${limitedDetail} is unconfirmed.`;
      const expectedViolation = [
        {
          detail: unlimitedDetail,
          claim: commaSource,
        },
      ];

      expect(
        riskClaimViolations(commaSource, details),
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

describe("risk language variants", () => {
  function contractDetails(contractName: string) {
    const contract = articleRiskContracts.find(
      ({ name }) => name === contractName,
    );
    if (!contract) {
      throw new Error(`Unknown evidence contract: ${contractName}`);
    }
    return contract.details;
  }

  it.each(evidenceLanguageRegressions)(
    "$name: $source",
    ({ contractName, detail, source, violates }) => {
      expect(riskClaimViolations(source, contractDetails(contractName))).toEqual(
        violates ? [{ detail, claim: source }] : [],
      );
    },
  );

  it.each(claimParserRegressions)(
    "$name: $source",
    ({ contractName, source, violatingDetails }) => {
      expect(riskClaimViolations(source, contractDetails(contractName))).toEqual(
        violatingDetails.map((detail) => ({ detail, claim: source })),
      );
    },
  );

  it.each(finalPredicateRegressions)(
    "$name: $source",
    ({ contractName, source, violatingDetails }) => {
      expect(riskClaimViolations(source, contractDetails(contractName))).toEqual(
        violatingDetails.map((detail) => ({ detail, claim: source })),
      );
    },
  );

  it.each(
    riskLanguageCases.flatMap(({ contractName, detail, variants }) =>
      variants.map((variant) => ({ contractName, detail, variant })),
    ),
  )("detects the unqualified $variant variant", ({ contractName, detail, variant }) => {
    const source = `Reports treat ${variant} as guaranteed.`;

    expect(riskClaimViolations(source, contractDetails(contractName))).toEqual([
      { detail, claim: source },
    ]);
  });

  it.each(riskLanguageCases)(
    "detects uppercase $detail language",
    ({ contractName, detail, variants }) => {
      const source = `REPORTS TREAT ${variants[0].toUpperCase()} AS GUARANTEED.`;

      expect(riskClaimViolations(source, contractDetails(contractName))).toEqual([
        { detail, claim: source },
      ]);
    },
  );

  it.each(
    riskLanguageCases.flatMap((riskCase) =>
      qualifierForms.map(({ name, render }, index) => ({
        ...riskCase,
        qualifier: name,
        source: render(riskCase.variants[index % riskCase.variants.length]),
      })),
    ),
  )(
    "accepts $qualifier qualification for $detail",
    ({ contractName, source }) => {
      expect(riskClaimViolations(source, contractDetails(contractName))).toEqual(
        [],
      );
    },
  );

  it.each(
    riskLanguageCases.flatMap((riskCase) =>
      contradictoryForms.map(({ name, render }) => ({
        ...riskCase,
        affirmation: name,
        source: render(riskCase.variants[0]),
      })),
    ),
  )(
    "rejects $detail followed by a contradictory $affirmation",
    ({ contractName, detail, source }) => {
      expect(riskClaimViolations(source, contractDetails(contractName))).toEqual([
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
