import { getDataset } from "./loader";
import type { OfflineDataset, OfflineSection, ServiceId } from "./types";

export type IndexedSection = {
  serviceId: ServiceId;
  section: OfflineSection;
};

export function buildSectionIndex(dataset: OfflineDataset): Map<string, IndexedSection> {
  const index = new Map<string, IndexedSection>();

  for (const serviceId of dataset.serviceOrder) {
    const service = dataset.services[serviceId];
    for (const section of service.sections) {
      index.set(section.id, { serviceId, section });
    }
  }

  return index;
}

export type SectionLookupResult = {
  serviceId: ServiceId;
  serviceTitle: string;
  section: OfflineSection;
};

export function findSectionById(sectionId: string): SectionLookupResult | null {
  const dataset = getDataset();

  for (const serviceId of dataset.serviceOrder) {
    const service = dataset.services[serviceId];
    const section = service.sections.find((item) => item.id === sectionId);

    if (section) {
      return {
        serviceId,
        serviceTitle: service.title,
        section,
      };
    }
  }

  return null;
}
