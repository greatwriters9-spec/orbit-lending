const ALLOWED_TAGS = new Set([
  "a",
  "b",
  "blockquote",
  "br",
  "div",
  "em",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "hr",
  "i",
  "img",
  "li",
  "ol",
  "p",
  "span",
  "strong",
  "sub",
  "sup",
  "table",
  "tbody",
  "td",
  "th",
  "thead",
  "tr",
  "u",
  "ul",
]);

const GLOBAL_ATTRS = new Set(["style", "class", "align", "dir"]);
const TAG_ATTRS: Record<string, Set<string>> = {
  a: new Set(["href", "target", "rel", "title"]),
  img: new Set(["src", "alt", "width", "height", "title"]),
  td: new Set(["colspan", "rowspan", "width", "height"]),
  th: new Set(["colspan", "rowspan", "width", "height"]),
};

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function stripDisallowedTags(html: string) {
  return html.replace(/<\/?([a-zA-Z0-9:-]+)([^>]*)>/g, (match, tagName) => {
    const tag = String(tagName).toLowerCase();
    if (!ALLOWED_TAGS.has(tag)) {
      return "";
    }
    return match;
  });
}

function sanitizeAttributes(html: string) {
  return html.replace(
    /<([a-zA-Z0-9:-]+)([^>]*)>/g,
    (match, tagName, rawAttributes) => {
      const tag = String(tagName).toLowerCase();
      if (!ALLOWED_TAGS.has(tag)) {
        return "";
      }

      const allowedForTag = new Set([
        ...GLOBAL_ATTRS,
        ...(TAG_ATTRS[tag] ?? []),
      ]);

      const attributes = String(rawAttributes).match(
        /([a-zA-Z0-9:-]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g,
      );

      if (!attributes?.length) {
        return `<${tag}>`;
      }

      const cleaned: string[] = [];
      for (const attribute of attributes) {
        const parsed = attribute.match(
          /^([a-zA-Z0-9:-]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?$/,
        );
        if (!parsed) {
          continue;
        }

        const name = parsed[1].toLowerCase();
        const value = parsed[2] ?? parsed[3] ?? parsed[4] ?? "";

        if (!allowedForTag.has(name)) {
          continue;
        }

        if (name.startsWith("on")) {
          continue;
        }

        if (name === "href" || name === "src") {
          const normalized = value.trim().toLowerCase();
          if (
            normalized.startsWith("javascript:") ||
            normalized.startsWith("data:text/html")
          ) {
            continue;
          }
        }

        if (value) {
          cleaned.push(`${name}="${value.replace(/"/g, "&quot;")}"`);
        } else {
          cleaned.push(name);
        }
      }

      return cleaned.length > 0 ? `<${tag} ${cleaned.join(" ")}>` : `<${tag}>`;
    },
  );
}

export function stripHtmlToText(html: string): string {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function isHtmlContent(value: string): boolean {
  return /<[a-z][\s\S]*>/i.test(value);
}

export function sanitizeEmailCompositionHtml(html: string): string {
  const withoutScripts = html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<iframe[\s\S]*?<\/iframe>/gi, "")
    .replace(/<object[\s\S]*?<\/object>/gi, "")
    .replace(/<embed[\s\S]*?\/?>/gi, "")
    .replace(/\son[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "");

  const normalized = sanitizeAttributes(stripDisallowedTags(withoutScripts));
  return normalized.replace(
    new RegExp(`(${Array.from(ALLOWED_TAGS).map(escapeRegExp).join("|")})`, "gi"),
    (tag) => tag.toLowerCase(),
  );
}
