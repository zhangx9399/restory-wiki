import type { MDXComponents } from "mdx/types";
import type { ComponentPropsWithoutRef } from "react";

function MdxAnchor({ href, ...props }: ComponentPropsWithoutRef<"a">) {
  const isExternal = typeof href === "string" && /^https?:\/\//i.test(href);

  if (isExternal) {
    return (
      <a
        {...props}
        href={href}
        rel="noopener noreferrer"
        target="_blank"
      />
    );
  }

  return <a {...props} href={href} />;
}

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...components,
    a: MdxAnchor,
  };
}
