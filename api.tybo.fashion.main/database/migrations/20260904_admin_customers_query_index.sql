-- ============================================================================
-- Migration: 20260904_admin_customers_query_index.sql
-- Sprint 2 — Customer query optimization and lean admin list
--
-- Evidence (recorded against the production-shaped local snapshot, 428
-- customer rows; main company 423 active):
--   SHOW INDEX FROM customer; -> PRIMARY only
--
--   EXPLAIN (default page, name/full-name search, phone search, email search)
--   BEFORE index:
--     customer -> type=ALL, rows=428, Extra="Using where; Using filesort"
--
--   EXPLAIN AFTER adding idx_customer_company_type_status_modified:
--     customer -> type=range, key=idx_customer_company_type_status_modified,
--                 key_len=264, rows=423,
--                 Extra="Using index condition; Backward index scan"
--                 (full scan + filesort eliminated on all four shapes)
--
-- Conclusion (evidence-based):
--   ADD idx_customer_company_type_status_modified
--       ON customer (CompanyId, CustomerType, StatusId, ModifyDate,
--                    CreateDate, CustomerId)
--   The equality prefix (CompanyId, CustomerType, StatusId) serves the
--   tenant/type/active filter and the trailing columns allow the default
--   list to walk the ordering backwards. The leading-wildcard search
--   predicates do not become direct B-tree lookups, so NO separate indexes
--   on Name, Surname, PhoneNumber or Email are added.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Add the proven index
-- ----------------------------------------------------------------------------
CREATE INDEX idx_customer_company_type_status_modified
    ON customer (
        CompanyId,
        CustomerType,
        StatusId,
        ModifyDate,
        CreateDate,
        CustomerId
    );

-- ----------------------------------------------------------------------------
-- 2. Rollback (run only if the index must be removed)
-- ----------------------------------------------------------------------------
-- DROP INDEX idx_customer_company_type_status_modified ON customer;
