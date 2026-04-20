import { parseInlineMarkupToRuns } from "./htmlInlineParser";

describe("parseInlineMarkupToRuns", () => {
  it("returns plain text for simple input", () => {
    expect(parseInlineMarkupToRuns("Shalom")).toEqual([{ text: "Shalom" }]);
  });

  it("supports bold and italic markup", () => {
    const runs = parseInlineMarkupToRuns(
      "Line <b>Bold</b> and <i>Italic</i> text",
    );

    expect(runs).toEqual([
      { text: "Line " },
      { text: "Bold", bold: true },
      { text: " and " },
      { text: "Italic", italic: true },
      { text: " text" },
    ]);
  });

  it("normalizes line break tags into new lines", () => {
    const runs = parseInlineMarkupToRuns("One<br>Two<br/>Three");

    expect(runs).toEqual([{ text: "One\nTwo\nThree" }]);
  });

  it("decodes common HTML entities", () => {
    const runs = parseInlineMarkupToRuns("&quot;A&amp;B&quot; &lt;test&gt;");

    expect(runs).toEqual([{ text: "\"A&B\" <test>" }]);
  });

  it("removes footnote markers and payloads", () => {
    const runs = parseInlineMarkupToRuns(
      "Blessed<sup class=\"footnote-marker\">1</sup><i class=\"footnote\">Some note</i> are You",
    );

    expect(runs).toEqual([{ text: "Blessed" }, { text: " are You" }]);
  });

  it("keeps regular italic text that is not footnotes", () => {
    const runs = parseInlineMarkupToRuns("Say <i>mitzvah</i> with care");

    expect(runs).toEqual([
      { text: "Say " },
      { text: "mitzvah", italic: true },
      { text: " with care" },
    ]);
  });
});
