// Hadron versions as data files write them: a release ("0.3.3"), a development build on the
// way to a release ("0.3.0-dev": built from main after 0.2.x, before 0.3.0 was tagged), or
// "unknown" when the reporter didn't say.

export const VERSION_PATTERN = /^(\d+)\.(\d+)\.(\d+)(-dev)?$/;

export interface ParsedVersion {
  major: number;
  minor: number;
  patch: number;
  dev: boolean;
}

export function parseVersion(v: string): ParsedVersion | null {
  const m = VERSION_PATTERN.exec(v.trim());
  if (!m) return null;
  return { major: Number(m[1]), minor: Number(m[2]), patch: Number(m[3]), dev: m[4] !== undefined };
}

/** Negative when a is older than b. "unknown" sorts below every version. A dev build sorts just
 * below the release it leads to, as semver pre-releases do. */
export function compareVersions(a: string, b: string): number {
  const pa = parseVersion(a);
  const pb = parseVersion(b);
  if (!pa || !pb) return (pa ? 1 : 0) - (pb ? 1 : 0);
  return (
    pa.major - pb.major ||
    pa.minor - pb.minor ||
    pa.patch - pb.patch ||
    (pa.dev === pb.dev ? 0 : pa.dev ? -1 : 1)
  );
}

export function isRelease(v: string): boolean {
  const p = parseVersion(v);
  return p !== null && !p.dev;
}

export function formatVersion(v: string): string {
  const p = parseVersion(v);
  if (!p) return "Version not given";
  if (p.dev) return `Development build before ${p.major}.${p.minor}.${p.patch}`;
  return `Hadron ${v}`;
}

/** Short form for badges and tables. */
export function shortVersion(v: string): string {
  const p = parseVersion(v);
  if (!p) return "unknown";
  return p.dev ? `pre-${p.major}.${p.minor}.${p.patch}` : v;
}

/** Normalise what a person typed into a report form: "v0.3.3", "Hadron 0.3.3", "0.3.3 (Homebrew)". */
export function normaliseVersionInput(input: string): string | null {
  const m = /(\d+\.\d+\.\d+)(-dev)?/.exec(input);
  return m ? m[1] + (m[2] ?? "") : null;
}
