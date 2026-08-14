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
const paintingOperationalClaim =
  /\b(?:press|hold|tap|click)\s+(?:the\s+)?[A-Z0-9]+\b[^.!?\n]*(?:to\s+)?paint|\bpainting\s+unlocks?\s+at\s+level\s+\d+\b/i;
const paintingScoringClaim = /\bscoring (?:formula|rule|algorithm)\b/i;
const paintingEvidenceLimit =
  /\b(?:not officially confirmed|unconfirmed|not documented|does not establish|cannot confirm|no reliable source (?:confirms|documents|establishes|supports))\b/i;

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

function sentences(source: string) {
  return source.match(/[^.!?]+[.!?]+|[^.!?]+$/g)?.map((sentence) => sentence.trim()) ?? [];
}

function paintingRisk(sentence: string): PaintingRisk | undefined {
  if (/\bpainting\s+unlocks?\s+at\s+level\s+\d+\b/i.test(sentence)) {
    return "unlock";
  }
  if (paintingOperationalClaim.test(sentence)) {
    return "control";
  }
  if (paintingScoringClaim.test(sentence)) {
    return "scoring";
  }
}

function hasSpecificRiskReference(sentence: string, risk: PaintingRisk) {
  const references = {
    control:
      /\b(?:(?:this|that) (?:control|button|key|instruction|method)|the (?:painting )?(?:control|button|key|instruction))\b/i,
    unlock:
      /\b(?:(?:this|that) (?:unlock(?: level)?|level|milestone|claim)|the (?:unlock level|milestone))\b/i,
    scoring: /\b(?:this|that|the) (?:scoring )?(?:formula|rule|algorithm|claim)\b/i,
  } as const;

  return references[risk].test(sentence);
}

function hasOwnRiskLimit(sentence: string, risk: PaintingRisk) {
  if (!paintingEvidenceLimit.test(sentence)) {
    return false;
  }
  const directLimit =
    /\b(?:is|remains)\s+(?:also\s+)?(?:not officially confirmed|unconfirmed|not documented)\b/i;

  if (risk === "control") {
    return (
      hasSpecificRiskReference(sentence, risk) ||
      new RegExp(
        `(?:${paintingOperationalClaim.source})\\s+${directLimit.source}`,
        "i",
      ).test(sentence)
    );
  }
  if (risk === "unlock") {
    return (
      hasSpecificRiskReference(sentence, risk) ||
      new RegExp(
        `\\bpainting\\s+unlocks?\\s+at\\s+level\\s+\\d+\\s+${directLimit.source}`,
        "i",
      ).test(sentence)
    );
  }

  return (
    new RegExp(
      `${paintingScoringClaim.source}(?:\\s+that applies everywhere)?\\s+${directLimit.source}`,
      "i",
    ).test(sentence) ||
    /\b(?:no reliable source (?:confirms|documents|establishes|supports)|cannot confirm|does not establish)[^.!?]*\bscoring (?:formula|rule|algorithm)\b/i.test(
      sentence,
    )
  );
}

function paintingRiskViolations(source: string) {
  return paragraphs(source).flatMap((paragraph) => {
    const paragraphSentences = sentences(paragraph);

    return paragraphSentences.filter((sentence, index) => {
      const risk = paintingRisk(sentence);
      if (!risk || hasOwnRiskLimit(sentence, risk)) {
        return false;
      }

      const nextSentence = paragraphSentences[index + 1];
      return !(
        nextSentence &&
        paintingEvidenceLimit.test(nextSentence) &&
        hasSpecificRiskReference(nextSentence, risk)
      );
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
    ).toEqual(["Press R to paint.", "Painting unlocks at level 4."]);
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
      "The scoring formula is fixed.",
      "A global scoring rule applies everywhere.",
      "The scoring algorithm is deterministic.",
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
    ).toEqual(["Press R to paint."]);
    expect(
      paintingRiskViolations(
        "Painting unlocks at level 4, while the undo method is unconfirmed.",
      ),
    ).toEqual([
      "Painting unlocks at level 4, while the undo method is unconfirmed.",
    ]);
    expect(
      paintingRiskViolations(
        "The scoring formula is fixed, while the undo method is unconfirmed.",
      ),
    ).toEqual([
      "The scoring formula is fixed, while the undo method is unconfirmed.",
    ]);
    expect(
      paintingRiskViolations(
        "Press R to paint. This control is not officially confirmed.",
      ),
    ).toEqual([]);
  });
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
