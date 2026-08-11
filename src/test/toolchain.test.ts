import { describe, expect, it } from "vitest";

import { useMDXComponents } from "../../mdx-components";

describe("useMDXComponents", () => {
  it("preserves the incoming MDX component map", () => {
    const Heading = () => null;
    const components = { h1: Heading };

    const result = useMDXComponents(components);

    expect(result).toBe(components);
    expect(result.h1).toBe(Heading);
  });
});
