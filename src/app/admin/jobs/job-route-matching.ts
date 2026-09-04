import { UrlMatcher, UrlSegment } from '@angular/router';

/**
 * Sprint 5 §1 — routing locks.
 *
 * `/jobs/:jobId` must never collide with the legacy `/jobs/:status`
 * parameter route, and unknown status slugs must fall back to the plain
 * jobs list (they cannot "fall back" by route shape once `/jobs/:status`
 * is removed, because `/jobs/anything` matches `/jobs/:jobId`). Both are
 * solved here: job IDs match only UUIDs, status slugs match only the
 * known set, and a `/jobs/**` wildcard catches everything else.
 */

/** Canonical status slugs — mirrors the map in api/job/get-admin-jobs.php. */
export const JOB_STATUS_SLUGS: readonly string[] = [
  'not-started',
  'in-progress',
  'completed',
  'complete', // legacy alias
  'stuck',
  'terminated',
  'paused',
];

/** MySQL uuid() output — case-insensitive standard UUID with dashes. */
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isUuid(value: string | undefined | null): boolean {
  return !!value && UUID_PATTERN.test(value);
}

/** Matches `/jobs/:jobId` only when :jobId is a UUID. */
export const jobIdRouteMatcher: UrlMatcher = (
  segments: UrlSegment[]
) => {
  if (
    segments.length === 2 &&
    segments[0].path === 'jobs' &&
    isUuid(segments[1].path)
  ) {
    return { consumed: segments, posParams: { jobId: segments[1] } };
  }
  return null;
};

/** Matches `/jobs/:statusSlug` only for the known status slugs. */
export const jobStatusSlugMatcher: UrlMatcher = (
  segments: UrlSegment[]
) => {
  if (
    segments.length === 2 &&
    segments[0].path === 'jobs' &&
    JOB_STATUS_SLUGS.includes(segments[1].path)
  ) {
    return { consumed: segments, posParams: { statusSlug: segments[1] } };
  }
  return null;
};
