import { existsSync } from "fs";
import { join } from "path";

function candidateDirs(): string[] {
  const productionFirst = process.env.NODE_ENV === "production";

  const prodCandidates = [
    join(process.cwd(), "public"),
    join(process.cwd(), "..", "public"),
  ];

  const devCandidates = [
    join(process.cwd(), "web", "dist"),
    join(process.cwd(), "..", "web", "dist"),
  ];

  return productionFirst
    ? [...prodCandidates, ...devCandidates]
    : [...devCandidates, ...prodCandidates];
}

export function resolveStaticAssetsDir(): string | null {
  for (const dir of candidateDirs()) {
    if (existsSync(join(dir, "index.html"))) {
      return dir;
    }
  }

  return null;
}

export function resolveStaticIndexFile(): string | null {
  const dir = resolveStaticAssetsDir();
  return dir ? join(dir, "index.html") : null;
}
