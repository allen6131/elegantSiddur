export function removeNikud(input: string): string {
  return input.replace(/[\u0591-\u05C7]/g, "");
}

export function isMostlyHebrew(input: string): boolean {
  const hebrewMatches = input.match(/[\u0590-\u05FF]/g);
  const latinMatches = input.match(/[A-Za-z]/g);

  const hebrewCount = hebrewMatches?.length ?? 0;
  const latinCount = latinMatches?.length ?? 0;

  return hebrewCount > latinCount;
}
