# CRYPTOSP Disaster Recovery & PostgreSQL Backup Documentation

## 1. PostgreSQL Backup Strategy

All financial state, ledger entries, and audit logs reside strictly within PostgreSQL.

### Daily Automated WAL-G / pg_dump Backups
Execute daily logical pg_dump backups and push to encrypted cloud storage (AWS S3 / GCP Storage):

```bash
pg_dump "postgresql://neondb_owner:npg_CZO6dgtDT3bX@ep-odd-dust-axohavgb.c-4.us-east-2.aws.neon.tech/neondb?sslmode=require" \
  --format=custom \
  --file="cryptosp_ledger_$(date +%Y%m%d_%H%M%S).dump"
```

## 2. Point-in-Time Recovery (PITR) Procedure

1. Provision clean PostgreSQL instance.
2. Restore base backup:
   ```bash
   pg_restore --clean --if-exists --dbname="DATABASE_URL" cryptosp_ledger_YYYYMMDD_HHMMSS.dump
   ```
3. Run Prisma migration sanity verification:
   ```bash
   npx prisma db push
   ```
4. Verify Double-Entry Balance Invariant:
   ```sql
   SELECT asset, SUM(CASE WHEN entry_type='CREDIT' THEN amount ELSE -amount END) AS net_balance FROM ledger_entries GROUP BY asset;
   ```
