/**
 * Shared admin navigation route matching.
 *
 * One source of truth for active-state detection used by the desktop
 * sidebar, the mobile offcanvas and the mobile bottom navigation, so all
 * three always agree.
 *
 * Note: `/store/admin/job-cards` must NOT activate "Jobs" — segment matching
 * is prefix-based but always ends at a path segment boundary.
 */

const JOBS_PREFIXES = [
  '/store/admin/jobs',
  '/store/admin/job/',
];

/** Routes treated as the admin home destination. */
export function isAdminHome(url: string): boolean {
  return url === '/store/admin' || url === '/store/admin/';
}

/** Jobs list + job detail + job-item editor routes (not job-cards). */
export function isJobsArea(url: string): boolean {
  const path = stripQueryAndFragment(url);
  return JOBS_PREFIXES.some((prefix) =>
    path === prefix || path.startsWith(prefix.endsWith('/') ? prefix : prefix + '/')
  );
}

/** Customers list + customer detail routes. */
export function isCustomersArea(url: string): boolean {
  const path = stripQueryAndFragment(url);
  return (
    path === '/store/admin/customers' ||
    path.startsWith('/store/admin/customers/') ||
    path === '/store/admin/customer' ||
    path.startsWith('/store/admin/customer/')
  );
}

function stripQueryAndFragment(url: string): string {
  const q = url.indexOf('?');
  const h = url.indexOf('#');
  let end = url.length;
  if (q !== -1) end = Math.min(end, q);
  if (h !== -1) end = Math.min(end, h);
  return url.slice(0, end);
}