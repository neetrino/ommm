-- History and settings cannot be removed by a button or a plain DELETE.
-- Cascade foreign keys become RESTRICT. Protected tables reject DELETE.
-- AuditLog also rejects UPDATE. The app role has no DELETE on those tables.
-- The developer enables login for ommm_app outside this repo.

ALTER TABLE "User" ADD COLUMN "deletedAt" TIMESTAMP(3);
ALTER TABLE "User" ADD COLUMN "deletedById" TEXT;

CREATE INDEX "User_deletedAt_idx" ON "User"("deletedAt");
CREATE INDEX "User_deletedById_idx" ON "User"("deletedById");

ALTER TABLE "User" ADD CONSTRAINT "User_deletedById_fkey"
  FOREIGN KEY ("deletedById") REFERENCES "User"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "CoachSalaryPayout" ADD COLUMN "voidedAt" TIMESTAMP(3);

-- Every foreign key that still cascades is rewritten to RESTRICT, whatever its name.
DO $$
DECLARE
  fk record;
  source_columns text;
  target_columns text;
BEGIN
  FOR fk IN
    SELECT
      c.conname,
      c.conrelid,
      c.confrelid,
      c.conkey,
      c.confkey,
      c.conrelid::regclass AS source_table,
      c.confrelid::regclass AS target_table
    FROM pg_constraint c
    WHERE c.contype = 'f' AND c.confdeltype = 'c'
  LOOP
    SELECT string_agg(quote_ident(attribute.attname), ', ' ORDER BY key_column.ordinality)
      INTO source_columns
    FROM unnest(fk.conkey) WITH ORDINALITY AS key_column(attnum, ordinality)
    JOIN pg_attribute attribute
      ON attribute.attrelid = fk.conrelid AND attribute.attnum = key_column.attnum;

    SELECT string_agg(quote_ident(attribute.attname), ', ' ORDER BY key_column.ordinality)
      INTO target_columns
    FROM unnest(fk.confkey) WITH ORDINALITY AS key_column(attnum, ordinality)
    JOIN pg_attribute attribute
      ON attribute.attrelid = fk.confrelid AND attribute.attnum = key_column.attnum;

    EXECUTE format('ALTER TABLE %s DROP CONSTRAINT %I', fk.source_table, fk.conname);
    EXECUTE format(
      'ALTER TABLE %s ADD CONSTRAINT %I FOREIGN KEY (%s) REFERENCES %s (%s) ON DELETE RESTRICT ON UPDATE CASCADE',
      fk.source_table,
      fk.conname,
      source_columns,
      fk.target_table,
      target_columns
    );
  END LOOP;
END $$;


CREATE OR REPLACE FUNCTION ommm_refuse_delete()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  RAISE EXCEPTION 'Hard delete is disabled for %.%', TG_TABLE_SCHEMA, TG_TABLE_NAME
    USING ERRCODE = '23001';
END;
$$;

CREATE OR REPLACE FUNCTION ommm_refuse_audit_change()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  RAISE EXCEPTION 'Audit log rows cannot be changed'
    USING ERRCODE = '23001';
END;
$$;

DO $$
DECLARE
  protected_table text;
  protected_tables text[] := ARRAY[
    'User',
    'OAuthAccount',
    'Booking',
    'BookingNote',
    'BookingConsumption',
    'ClientNote',
    'WaitlistEntry',
    'Payment',
    'EhdmReceipt',
    'EhdmState',
    'UserPackage',
    'UserPackageFreeze',
    'UserPackageBalance',
    'GiftCard',
    'GiftCardBatch',
    'GiftCardTransaction',
    'Coupon',
    'CouponRedemption',
    'ClassSession',
    'ClassType',
    'CoachProfile',
    'CoachSalaryAccrual',
    'CoachSalaryPayout',
    'PackagePlan',
    'ContentPost',
    'ContentPostTranslation',
    'SessionReview',
    'CallTask',
    'StaffActivityNotification',
    'ScheduleItem',
    'ContactMessage',
    'BarProduct',
    'WhatsappIntegration',
    'StudioSettings',
    'Achievement',
    'UserAchievement',
    'NotificationPreference',
    'ClassReminderSendLog',
    'BookingConfirmedSendLog',
    'PackagePurchasedSendLog',
    'MembershipExpiryReminderSendLog'
  ];
BEGIN
  FOREACH protected_table IN ARRAY protected_tables LOOP
    EXECUTE format(
      'DROP TRIGGER IF EXISTS ommm_refuse_delete ON %I',
      protected_table
    );
    EXECUTE format(
      'CREATE TRIGGER ommm_refuse_delete BEFORE DELETE ON %I FOR EACH ROW EXECUTE FUNCTION ommm_refuse_delete()',
      protected_table
    );
  END LOOP;
END $$;

DROP TRIGGER IF EXISTS ommm_refuse_audit_change ON "AuditLog";
CREATE TRIGGER ommm_refuse_audit_change
  BEFORE DELETE OR UPDATE ON "AuditLog"
  FOR EACH ROW EXECUTE FUNCTION ommm_refuse_audit_change();

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'ommm_app') THEN
    CREATE ROLE ommm_app NOLOGIN;
  END IF;
END $$;

GRANT USAGE ON SCHEMA public TO ommm_app;
GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA public TO ommm_app;
REVOKE DELETE ON ALL TABLES IN SCHEMA public FROM ommm_app;
GRANT DELETE ON TABLE
  "AuthToken",
  "PendingOAuthSignup",
  "PushDeviceToken",
  "CouponEligibleUser",
  "CouponEligibleProduct",
  "CoachClassTypeRate",
  "CoachAvailabilitySlot"
TO ommm_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO ommm_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE ON TABLES TO ommm_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT USAGE, SELECT ON SEQUENCES TO ommm_app;
