import { buildSectionIndex } from "./selectors";
import type { OfflineDataset } from "./types";

const mockDataset: OfflineDataset = {
  version: "test",
  generatedAt: "2026-01-01T00:00:00.000Z",
  source: {
    provider: "Test",
    providerUrl: "https://example.com",
    primaryText: "Test Text",
    copyrightNotice: "Test",
  },
  serviceOrder: ["shacharit", "mincha", "maariv", "birkatHamazon"],
  services: {
    shacharit: {
      id: "shacharit",
      title: "Shacharit",
      heTitle: "שחרית",
      description: "",
      source: "",
      sectionCount: 1,
      segmentCount: 1,
      sections: [
        {
          id: "s-1",
          title: "Modeh Ani",
          heTitle: "מודה אני",
          sourceRef: "A",
          segmentCount: 1,
          segments: [{ id: "seg-1", he: "מודה אני" }],
        },
      ],
    },
    mincha: {
      id: "mincha",
      title: "Mincha",
      heTitle: "מנחה",
      description: "",
      source: "",
      sectionCount: 1,
      segmentCount: 1,
      sections: [
        {
          id: "m-1",
          title: "Ashrei",
          heTitle: "אשרי",
          sourceRef: "B",
          segmentCount: 1,
          segments: [{ id: "seg-2", he: "אשרי" }],
        },
      ],
    },
    maariv: {
      id: "maariv",
      title: "Maariv",
      heTitle: "מעריב",
      description: "",
      source: "",
      sectionCount: 0,
      segmentCount: 0,
      sections: [],
    },
    birkatHamazon: {
      id: "birkatHamazon",
      title: "Birkat Hamazon",
      heTitle: "ברכת המזון",
      description: "",
      source: "",
      sectionCount: 0,
      segmentCount: 0,
      sections: [],
    },
  },
};

describe("buildSectionIndex", () => {
  it("indexes sections by id", () => {
    const index = buildSectionIndex(mockDataset);

    expect(index.size).toBe(2);
    expect(index.get("s-1")?.serviceId).toBe("shacharit");
    expect(index.get("m-1")?.serviceId).toBe("mincha");
  });
});
