import type { ServiceId } from "../data/types";

export type RootStackParamList = {
  Home: undefined;
  Service: { serviceId: ServiceId; serviceTitle?: string };
  Reader: {
    serviceId: ServiceId;
    sectionId: string;
    sectionTitle?: string;
  };
  Bookmarks: undefined;
  Settings: undefined;
};
