export function toExcerpt(md: string, maxLen = 400): string {
  return md
    .replace(/!\[.*?\]\(.*?\)/g, "")       // images
    .replace(/\n+/g, " ")                  // newlines first so . matches across former lines
    .replace(/\[(.+?)\]\(.*?\)/g, "$1")    // links → label only
    .replace(/#{1,6}\s+/g, "")             // headings
    .replace(/\*\*(.+?)\*\*/g, "$1")       // bold
    .replace(/\*(.+?)\*/g, "$1")           // italic
    .replace(/`(.+?)`/g, "$1")             // inline code
    .replace(/[-*+]\s+/g, "")             // list bullets
    .replace(/>\s+/g, "")                 // blockquotes
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLen);
}
