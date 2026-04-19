import type { OfflineDataset, ServiceId } from "./types";
import datasetJson from "../../assets/offline/siddur.offline.v1.json";

const dataset = datasetJson as OfflineDataset;

export function getDataset(): OfflineDataset {
  return dataset;
}

export function getServiceData(serviceId: ServiceId) {
  return dataset.services[serviceId];
}
