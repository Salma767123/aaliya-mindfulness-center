export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

const dateFormatter = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

/** Formats an ISO date (YYYY-MM-DD) the same way on the server and in the browser. */
export function formatDate(iso: string): string {
  return dateFormatter.format(new Date(`${iso}T00:00:00Z`));
}

/**
 * Splits heading copy into words and marks emphasis.
 * Words wrapped in *asterisks* are emphasised; "\n" starts a new line.
 * Keeps headings as plain strings, which is what a CMS field will hold.
 */
export type HeadingWord = { text: string; em: boolean };

export function parseHeading(input: string): HeadingWord[][] {
  return input.split("\n").map((line) => {
    const words: HeadingWord[] = [];
    let em = false;
    for (const raw of line.trim().split(/\s+/)) {
      if (!raw) continue;
      let text = raw;
      let startsEm = false;
      if (text.startsWith("*")) {
        startsEm = true;
        text = text.slice(1);
      }
      const endsEm = text.endsWith("*") || /\*[.,;:!?]$/.test(text);
      if (endsEm) text = text.replace("*", "");
      if (startsEm) em = true;
      words.push({ text, em });
      if (endsEm) em = false;
    }
    return words;
  });
}

/** Plain-text version of heading copy, for aria-labels and metadata. */
export function plainHeading(input: string): string {
  return input.replace(/\*/g, "").replace(/\n/g, " ");
}
