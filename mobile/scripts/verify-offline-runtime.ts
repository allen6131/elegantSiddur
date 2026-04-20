import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const SRC_ROOT = path.resolve(process.cwd(), "src");

const NETWORK_PATTERNS: Array<{ name: string; regex: RegExp }> = [
  { name: "fetch()", regex: /\bfetch\s*\(/g },
  { name: "axios", regex: /\baxios\b/g },
  { name: "XMLHttpRequest", regex: /\bXMLHttpRequest\b/g },
];

async function collectTsFiles(dir: string): Promise<string[]> {
  const entries = await readdir(dir);
  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry);
    const metadata = await stat(fullPath);

    if (metadata.isDirectory()) {
      files.push(...(await collectTsFiles(fullPath)));
      continue;
    }

    if (/\.(ts|tsx)$/.test(entry)) {
      files.push(fullPath);
    }
  }

  return files;
}

async function main() {
  const files = await collectTsFiles(SRC_ROOT);
  const violations: string[] = [];

  for (const file of files) {
    const content = await readFile(file, "utf8");
    const relative = path.relative(process.cwd(), file);

    for (const pattern of NETWORK_PATTERNS) {
      if (pattern.regex.test(content)) {
        violations.push(`${relative}: forbidden runtime network usage "${pattern.name}"`);
      }
      pattern.regex.lastIndex = 0;
    }
  }

  if (violations.length > 0) {
    throw new Error(
      `[verify-offline-runtime] Found ${violations.length} violations:\n${violations
        .map((issue) => `- ${issue}`)
        .join("\n")}`,
    );
  }

  console.log(`[verify-offline-runtime] OK: scanned ${files.length} source files`);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
