import { normalizeSearchValue, sectionMatchesQuery } from "./search";

describe("search helpers", () => {
  it("normalizes case and whitespace", () => {
    expect(normalizeSearchValue("  AshREI ")).toBe("ashrei");
  });

  it("matches section title and heTitle", () => {
    const section = {
      id: "ashrei",
      title: "Ashrei",
      heTitle: "אשרי",
      sourceRef: "Siddur Ashkenaz, Weekday, Minchah, Ashrei",
      segmentCount: 2,
      segments: [],
    };

    expect(sectionMatchesQuery(section, "ash")).toBe(true);
    expect(sectionMatchesQuery(section, "אשר")).toBe(true);
    expect(sectionMatchesQuery(section, "minchah")).toBe(true);
    expect(sectionMatchesQuery(section, "xyz")).toBe(false);
  });
});
