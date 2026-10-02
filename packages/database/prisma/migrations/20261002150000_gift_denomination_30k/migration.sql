ALTER TABLE "StudioSettings"
  ALTER COLUMN "giftCardDenominationsJson" SET DEFAULT '[30000,70000,100000]';

UPDATE "StudioSettings"
SET "giftCardDenominationsJson" = (
  SELECT jsonb_agg(to_jsonb(amount) ORDER BY amount)::text
  FROM (
    SELECT DISTINCT CASE
      WHEN elem::int = 40000 THEN 30000
      ELSE elem::int
    END AS amount
    FROM jsonb_array_elements_text("giftCardDenominationsJson"::jsonb) AS elem
  ) mapped
)
WHERE "giftCardDenominationsJson"::jsonb @> '[40000]'::jsonb;
