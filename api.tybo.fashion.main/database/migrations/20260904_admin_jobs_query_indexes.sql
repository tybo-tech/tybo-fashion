-- ============================================================================
-- Migration: 20260904_admin_jobs_query_indexes.sql
-- Sprint 1 — Jobs server-side query path (get-admin-jobs.php)
--
-- Evidence (recorded against the production-shaped local snapshot, 677 jobs):
--   SHOW INDEX FROM job;      -> PRIMARY only
--   SHOW INDEX FROM customer; -> PRIMARY only
--
--   EXPLAIN (default paginated, status-filtered, job-number search,
--           customer-name search) BEFORE index:
--     job      -> type=ALL, rows=677, Extra="Using where; Using filesort"
--     customer -> type=eq_ref, key=PRIMARY (join already optimal)
--
--   EXPLAIN AFTER adding idx_job_company_status_date:
--     job      -> type=range, key=idx_job_company_status_date,
--                 Extra="Using index condition; Backward index scan"
--                 (full scan + filesort eliminated on all four shapes)
--     customer -> still eq_ref on PRIMARY
--
--   EXPLAIN AFTER adding idx_customer_company_customer (CompanyId, CustomerId):
--     customer -> possible_keys=PRIMARY,idx_customer_company_customer,
--                 key=PRIMARY  (index NOT used; redundant — CustomerId is the PK)
--
-- Conclusion (evidence-based):
--   ADD  idx_job_company_status_date ON job (CompanyId, StatusId, CreateDate)
--   DO NOT ADD any customer index (redundant, adds write cost)
--   DO NOT ADD job (CompanyId, JobNo) — does not serve LIKE '%term%' search
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Add the proven index
-- ----------------------------------------------------------------------------
CREATE INDEX idx_job_company_status_date
    ON job (CompanyId, StatusId, CreateDate);

-- ----------------------------------------------------------------------------
-- 2. Rollback (run only if the index must be removed)
-- ----------------------------------------------------------------------------
-- DROP INDEX idx_job_company_status_date ON job;
