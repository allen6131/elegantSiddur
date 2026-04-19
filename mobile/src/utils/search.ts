import type { OfflineSection } from "../data/types";

export function normalizeSearchValue(value: string): string {
  return value.trim().toLowerCase();
}

export function sectionMatchesQuery(section: OfflineSection, query: string): boolean {
  const normalizedQuery = normalizeSearchValue(query);

  if (!normalizedQuery) {
    return true;
  }

  const title = normalizeSearchValue(section.title);
  const heTitle = normalizeSearchValue(section.heTitle);
  const sourceRef = normalizeSearchValue(section.sourceRef);

  return (
    title.includes(normalizedQuery) ||
    heTitle.includes(normalizedQuery) ||
    sourceRef.includes(normalizedQuery)
  );
}
