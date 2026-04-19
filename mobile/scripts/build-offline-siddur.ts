import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";

type SefariaIndexNode = {
  title?: string;
  heTitle?: string;
  key?: string;
  nodes?: SefariaIndexNode[];
};

type SefariaIndexResponse = {
  title: string;
  schema: SefariaIndexNode;
};

type SefariaTextResponse = {
  ref?: string;
  heRef?: string;
  he?: unknown;
  text?: unknown;
  error?: string;
};

type ServiceId = "shacharit" | "mincha" | "maariv" | "birkatHamazon";

type Segment = {
  id: string;
  he?: string;
  en?: string;
};

type Section = {
  id: string;
  title: string;
  heTitle: string;
  sourceRef: string;
  segmentCount: number;
  segments: Segment[];
};

type Service = {
  id: ServiceId;
  title: string;
  heTitle: string;
  description: string;
  source: string;
  sectionCount: number;
  segmentCount: number;
  sections: Section[];
};

type OfflineDataset = {
  version: string;
  generatedAt: string;
  source: {
    provider: string;
    providerUrl: string;
    primaryText: string;
    copyrightNotice: string;
  };
  serviceOrder: ServiceId[];
  services: Record<ServiceId, Service>;
};

type ServiceConfig = {
  id: ServiceId;
  title: string;
  heTitle: string;
  description: string;
  indexTitle: string;
  rootPath: string[];
  source: string;
};

const SERVICE_CONFIGS: ServiceConfig[] = [
  {
    id: "shacharit",
    title: "Shacharit",
    heTitle: "שחרית",
    description: "Weekday morning prayer",
    indexTitle: "Siddur_Ashkenaz",
    rootPath: ["Weekday", "Shacharit"],
    source: "Siddur Ashkenaz, Weekday, Shacharit",
  },
  {
    id: "mincha",
    title: "Mincha",
    heTitle: "מנחה",
    description: "Weekday afternoon prayer",
    indexTitle: "Siddur_Ashkenaz",
    rootPath: ["Weekday", "Minchah"],
    source: "Siddur Ashkenaz, Weekday, Minchah",
  },
  {
    id: "maariv",
    title: "Maariv",
    heTitle: "מעריב",
    description: "Weekday evening prayer",
    indexTitle: "Siddur_Ashkenaz",
    rootPath: ["Weekday", "Maariv"],
    source: "Siddur Ashkenaz, Weekday, Maariv",
  },
  {
    id: "birkatHamazon",
    title: "Birkat Hamazon",
    heTitle: "ברכת המזון",
    description: "Blessing after meals",
    indexTitle: "Birkat_Hamazon",
    rootPath: [],
    source: "Birkat Hamazon",
  },
];

const OUTPUT_PATH = path.resolve(
  process.cwd(),
  "assets/offline/siddur.offline.v1.json",
);
const SEFARIA_BASE = "https://www.sefaria.org";

function toSlug(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\u0590-\u05FF]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/--+/g, "-");
}

function flattenTextArray(value: unknown): string[] {
  if (typeof value === "string") {
    const cleaned = value.trim();
    return cleaned ? [cleaned] : [];
  }

  if (!Array.isArray(value)) {
    return [];
  }

  const result: string[] = [];

  for (const item of value) {
    result.push(...flattenTextArray(item));
  }

  return result;
}

async function sleep(ms: number) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchJsonWithRetry<T>(
  url: string,
  label: string,
  retries = 3,
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= retries; attempt += 1) {
    try {
      const response = await fetch(url, {
        headers: {
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`${label} failed with status ${response.status}`);
      }

      const json = (await response.json()) as T;
      return json;
    } catch (error) {
      lastError = error;

      if (attempt < retries) {
        await sleep(300 * attempt);
      }
    }
  }

  throw new Error(`${label} failed after ${retries} attempts: ${String(lastError)}`);
}

function getNodeByPath(root: SefariaIndexNode, pathParts: string[]): SefariaIndexNode {
  let current: SefariaIndexNode | undefined = root;

  for (const pathPart of pathParts) {
    const next = current?.nodes?.find(
      (node) => node.title === pathPart || node.key === pathPart,
    );

    if (!next) {
      throw new Error(`Could not find path part "${pathPart}" in index schema`);
    }

    current = next;
  }

  if (!current) {
    throw new Error("Schema root path not found");
  }

  return current;
}

type LeafRefInfo = {
  titlePath: string[];
  heTitlePath: string[];
  ref: string;
};

function collectLeafRefs(
  node: SefariaIndexNode,
  titlePath: string[],
  heTitlePath: string[],
  indexTitle: string,
  refPrefixPath: string[],
  output: LeafRefInfo[],
) {
  const nodeTitle = node.title ?? node.key ?? "";
  const nodeHeTitle = node.heTitle ?? nodeTitle;
  const nextTitlePath = nodeTitle ? [...titlePath, nodeTitle] : titlePath;
  const nextHeTitlePath = nodeTitle ? [...heTitlePath, nodeHeTitle] : heTitlePath;

  if (!node.nodes || node.nodes.length === 0) {
    const normalizedIndexTitle = indexTitle.replace(/_/g, " ");
    const normalizedTitlePath =
      nextTitlePath[0] === normalizedIndexTitle
        ? nextTitlePath.slice(1)
        : nextTitlePath;

    output.push({
      titlePath: nextTitlePath,
      heTitlePath: nextHeTitlePath,
      ref: [normalizedIndexTitle, ...refPrefixPath, ...normalizedTitlePath].join(", "),
    });
    return;
  }

  for (const child of node.nodes) {
    collectLeafRefs(
      child,
      nextTitlePath,
      nextHeTitlePath,
      indexTitle,
      refPrefixPath,
      output,
    );
  }
}

async function fetchIndex(indexTitle: string): Promise<SefariaIndexResponse> {
  const url = `${SEFARIA_BASE}/api/index/${indexTitle}`;
  return fetchJsonWithRetry<SefariaIndexResponse>(url, `index ${indexTitle}`);
}

async function fetchLeafText(ref: string): Promise<SefariaTextResponse> {
  const encodedRef = encodeURIComponent(ref).replace(/%20/g, "_");
  const url = `${SEFARIA_BASE}/api/texts/${encodedRef}?lang=bi&commentary=0&context=0`;
  return fetchJsonWithRetry<SefariaTextResponse>(url, `texts ${ref}`);
}

function buildSectionFromLeaf(leaf: LeafRefInfo, text: SefariaTextResponse): Section {
  const heSegments = flattenTextArray(text.he);
  const enSegments = flattenTextArray(text.text);
  const maxSegments = Math.max(heSegments.length, enSegments.length, 1);

  const sectionId = toSlug(leaf.titlePath.join("-"));
  const sourceRef = text.ref ?? leaf.ref;
  const title = leaf.titlePath[leaf.titlePath.length - 1] ?? sectionId;
  const heTitle = leaf.heTitlePath[leaf.heTitlePath.length - 1] ?? title;

  const segments: Segment[] = Array.from({ length: maxSegments })
    .map((_, index) => {
      const heText = heSegments[index];
      const enText = enSegments[index];

      return {
        id: `${sectionId}-${index + 1}`,
        he: heText,
        en: enText,
      };
    })
    .filter((segment) => Boolean(segment.he || segment.en));

  return {
    id: sectionId,
    title,
    heTitle,
    sourceRef,
    segmentCount: segments.length,
    segments,
  };
}

async function buildService(config: ServiceConfig): Promise<Service> {
  const index = await fetchIndex(config.indexTitle);
  const rootNode = getNodeByPath(index.schema, config.rootPath);
  const leaves: LeafRefInfo[] = [];
  const refPrefixPath =
    config.rootPath.length > 0 ? config.rootPath.slice(0, config.rootPath.length - 1) : [];

  collectLeafRefs(rootNode, [], [], index.title, refPrefixPath, leaves);

  const sections: Section[] = [];

  for (const leaf of leaves) {
    const textResponse = await fetchLeafText(leaf.ref);
    if (textResponse.error) {
      throw new Error(`Sefaria text error for "${leaf.ref}": ${textResponse.error}`);
    }
    const section = buildSectionFromLeaf(leaf, textResponse);
    if (section.segmentCount > 0) {
      sections.push(section);
    }
  }

  return {
    id: config.id,
    title: config.title,
    heTitle: config.heTitle,
    description: config.description,
    source: config.source,
    sectionCount: sections.length,
    segmentCount: sections.reduce((sum, section) => sum + section.segmentCount, 0),
    sections,
  };
}

async function main() {
  const servicesArray = await Promise.all(SERVICE_CONFIGS.map((config) => buildService(config)));

  const services = servicesArray.reduce<Record<ServiceId, Service>>((acc, service) => {
    acc[service.id] = service;
    return acc;
  }, {} as Record<ServiceId, Service>);

  const dataset: OfflineDataset = {
    version: "1.0.0",
    generatedAt: new Date().toISOString(),
    source: {
      provider: "Sefaria",
      providerUrl: "https://www.sefaria.org",
      primaryText: "Siddur Ashkenaz and Birkat Hamazon",
      copyrightNotice:
        "Text sourced from Sefaria API and bundled locally for offline prayer use.",
    },
    serviceOrder: SERVICE_CONFIGS.map((config) => config.id),
    services,
  };

  await fs.mkdir(path.dirname(OUTPUT_PATH), { recursive: true });
  await fs.writeFile(OUTPUT_PATH, `${JSON.stringify(dataset, null, 2)}\n`, "utf8");

  console.log(
    `Wrote offline dataset to ${OUTPUT_PATH} with ${Object.keys(services).length} services.`,
  );
}

main().catch((error: unknown) => {
  console.error("Failed to build offline Siddur dataset:", error);
  process.exitCode = 1;
});
