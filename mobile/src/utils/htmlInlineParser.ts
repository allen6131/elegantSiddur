export type InlineRun = {
  text: string;
  bold?: boolean;
  italic?: boolean;
  small?: boolean;
};

const BR_REGEX = /<br\s*\/?>/gi;
const OPEN_TAG_REGEX = /<([a-z0-9]+)(\s+[^>]+)?>/i;
const CLOSE_TAG_REGEX = /<\/([a-z0-9]+)>/i;

function decodeEntities(value: string) {
  return value
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&#x27;/gi, "'");
}

const SUPPORTED_BOLD = new Set(["b", "strong"]);
const SUPPORTED_ITALIC = new Set(["i", "em"]);
const SUPPORTED_SMALL = new Set(["small"]);

function splitHtml(input: string): string[] {
  return input
    .replace(BR_REGEX, "\n")
    .split(/(<[^>]+>)/g)
    .filter(Boolean);
}

export function parseInlineMarkupToRuns(input: string): InlineRun[] {
  if (!input) {
    return [];
  }

  const chunks = splitHtml(input);
  let boldDepth = 0;
  let italicDepth = 0;
  let smallDepth = 0;

  const runs: InlineRun[] = [];

  for (const chunk of chunks) {
    if (chunk.startsWith("<")) {
      const openMatch = chunk.match(OPEN_TAG_REGEX);
      const closeMatch = chunk.match(CLOSE_TAG_REGEX);

      if (openMatch) {
        const tag = openMatch[1]?.toLowerCase();
        if (SUPPORTED_BOLD.has(tag)) boldDepth += 1;
        if (SUPPORTED_ITALIC.has(tag)) italicDepth += 1;
        if (SUPPORTED_SMALL.has(tag)) smallDepth += 1;
      } else if (closeMatch) {
        const tag = closeMatch[1]?.toLowerCase();
        if (SUPPORTED_BOLD.has(tag)) boldDepth = Math.max(0, boldDepth - 1);
        if (SUPPORTED_ITALIC.has(tag)) italicDepth = Math.max(0, italicDepth - 1);
        if (SUPPORTED_SMALL.has(tag)) smallDepth = Math.max(0, smallDepth - 1);
      }
      continue;
    }

    const text = decodeEntities(chunk);
    if (!text) continue;

    runs.push({
      text,
      bold: boldDepth > 0 || undefined,
      italic: italicDepth > 0 || undefined,
      small: smallDepth > 0 || undefined,
    });
  }

  return runs.length > 0 ? runs : [{ text: decodeEntities(input) }];
}
