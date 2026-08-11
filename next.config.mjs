import createMDX from "@next/mdx";
import rehypeSlug from "rehype-slug";

const withMDX = createMDX({
  options: { mdxOptions: { rehypePlugins: [rehypeSlug] } },
});

export default withMDX({
  pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],
  trailingSlash: true,
});
