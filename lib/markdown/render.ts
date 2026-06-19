import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeSlug from "rehype-slug";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import rehypeStringify from "rehype-stringify";
import { visit } from "unist-util-visit";
import { toString as hastToString } from "hast-util-to-string";
import type { Element } from "hast";

export type HeadingItem = { id: string; text: string; depth: 2 | 3 };

const sanitizeSchema = {
  ...defaultSchema,
  clobberPrefix: "",
  attributes: {
    ...defaultSchema.attributes,
    h2: ["id"],
    h3: ["id"],
  },
};

export function wordCount(md: string): number {
  const cjk = (md.match(/[一-鿿㐀-䶿]/g) ?? []).length;
  const latin = (md.match(/\b[a-zA-Z]+\b/g) ?? []).length;
  return Math.max(1, Math.round((cjk + latin) / 400));
}

// Server-side markdown render — no body_html cache (eng review D13)
export async function renderMarkdown(
  md: string
): Promise<{ html: string; headings: HeadingItem[] }> {
  const headings: HeadingItem[] = [];

  const result = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypeSlug)
    .use(() => (tree) => {
      visit(tree, "element", (node: Element) => {
        if (
          (node.tagName === "h2" || node.tagName === "h3") &&
          typeof node.properties?.id === "string"
        ) {
          headings.push({
            id: node.properties.id,
            text: hastToString(node),
            depth: node.tagName === "h2" ? 2 : 3,
          });
        }
      });
    })
    .use(rehypeSanitize, sanitizeSchema)
    .use(rehypeStringify)
    .process(md);

  return { html: String(result), headings };
}
