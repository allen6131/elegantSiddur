import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import type { OfflineDataset, ServiceId } from "../src/data/types";

const DATASET_PATH = resolve(process.cwd(), "assets/offline/siddur.offline.v1.json");

function fail(message: string): never {
  throw new Error(`[validate-offline-dataset] ${message}`);
}

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    fail(message);
  }
}

function validateService(serviceId: ServiceId, dataset: OfflineDataset) {
  const service = dataset.services[serviceId];
  assert(service, `Missing service entry for "${serviceId}".`);
  assert(service.sections.length > 0, `Service "${serviceId}" has no sections.`);

  const seenSectionIds = new Set<string>();

  for (const section of service.sections) {
    assert(section.id, `Service "${serviceId}" has section with empty id.`);
    assert(!seenSectionIds.has(section.id), `Duplicate section id "${section.id}" in "${serviceId}".`);
    seenSectionIds.add(section.id);
    assert(section.sourceRef, `Section "${section.id}" missing sourceRef.`);
    assert(section.segments.length > 0, `Section "${section.id}" has no segments.`);

    for (const segment of section.segments) {
      assert(segment.id, `Section "${section.id}" has segment missing id.`);
      assert(Boolean(segment.he || segment.en), `Segment "${segment.id}" in "${section.id}" has no text.`);
    }
  }

  const computedSegmentCount = service.sections.reduce((sum, section) => sum + section.segmentCount, 0);
  assert(
    computedSegmentCount === service.segmentCount,
    `Service "${serviceId}" segmentCount mismatch (declared=${service.segmentCount}, computed=${computedSegmentCount}).`,
  );
  assert(
    service.sectionCount === service.sections.length,
    `Service "${serviceId}" sectionCount mismatch (declared=${service.sectionCount}, computed=${service.sections.length}).`,
  );
}

function main() {
  assert(existsSync(DATASET_PATH), `Dataset file not found at ${DATASET_PATH}`);

  const raw = readFileSync(DATASET_PATH, "utf8");
  const parsed = JSON.parse(raw) as OfflineDataset;

  assert(parsed.version, "Dataset missing version.");
  assert(parsed.generatedAt, "Dataset missing generatedAt.");
  assert(parsed.serviceOrder.length > 0, "Dataset serviceOrder is empty.");

  const requiredServiceIds: ServiceId[] = ["shacharit", "mincha", "maariv", "birkatHamazon"];
  for (const serviceId of requiredServiceIds) {
    assert(parsed.serviceOrder.includes(serviceId), `serviceOrder missing required id "${serviceId}".`);
    validateService(serviceId, parsed);
  }

  console.log(
    `[validate-offline-dataset] OK: version=${parsed.version}, generatedAt=${parsed.generatedAt}, services=${parsed.serviceOrder.length}`,
  );
}

main();
