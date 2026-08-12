import type { AssessmentRecord } from "./types";

/**
 * WHY sessionStorage AND NOT localStorage OR A DATABASE
 * ------------------------------------------------------
 * Three constraints pull in different directions:
 *
 *  1. A parent or teacher who accidentally refreshes on Task 4 and loses
 *     everything will not come back. In-memory-only state is hostile.
 *  2. This is data about a preschool child, often on a shared classroom
 *     tablet. Anything written to localStorage sits there, with the child's
 *     name in it, for the next person who picks the device up.
 *  3. Ann's stated requirement is that student information be stored
 *     anonymously — which is much easier to honour if it is never stored.
 *
 * sessionStorage threads all three: it survives a refresh, and it is destroyed
 * when the tab closes. No network request is made at any point; nothing about
 * a child leaves the device unless the administrator explicitly exports a file.
 *
 * If per-child history is ever required, that is a real backend with a real
 * privacy review (COPPA/FERPA), NOT a change from sessionStorage to
 * localStorage. See docs/DECISIONS.md, ADR-003.
 */

const KEY = "rnr.musical-fitness.session.v1";

export function saveSession(record: AssessmentRecord): void {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(record));
  } catch {
    // Private mode, quota, or storage disabled. The assessment still works —
    // it just will not survive a refresh. Not worth interrupting the user.
  }
}

export function loadSession(): AssessmentRecord | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AssessmentRecord;
    if (!parsed || typeof parsed !== "object" || !parsed.responses) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function clearSession(): void {
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}

export function todayIso(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
