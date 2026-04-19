export type ServiceId = "shacharit" | "mincha" | "maariv" | "birkatHamazon";

export type DisplayMode = "hebrew" | "english" | "bilingual";

export type LanguageCode = "he" | "en";

export type OfflineSegment = {
  id: string;
  he?: string;
  en?: string;
};

export type OfflineSection = {
  id: string;
  title: string;
  heTitle: string;
  sourceRef: string;
  segmentCount: number;
  segments: OfflineSegment[];
};

export type OfflineService = {
  id: ServiceId;
  title: string;
  heTitle: string;
  description: string;
  source: string;
  sectionCount: number;
  segmentCount: number;
  sections: OfflineSection[];
};

export type OfflineDataset = {
  version: string;
  generatedAt: string;
  metadata: {
    leafCount: number;
    sectionCount: number;
    segmentCount: number;
    contentHash: string;
  };
  source: {
    provider: string;
    providerUrl: string;
    primaryText: string;
    copyrightNotice: string;
  };
  serviceOrder: ServiceId[];
  services: Record<ServiceId, OfflineService>;
};
