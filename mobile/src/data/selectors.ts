import { getDataset } from "./loader";
import type { OfflineSection, ServiceId } from "./types";

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
