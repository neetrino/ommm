-- Reassign historical inbox rows to the coach who taught the class.
UPDATE "StaffActivityNotification" AS n
SET "coachProfileId" = COALESCE(s."substituteCoachId", s."coachId")
FROM "Booking" AS b
INNER JOIN "ClassSession" AS s ON s."id" = b."sessionId"
WHERE n."bookingId" = b."id"
  AND n."coachProfileId" IS DISTINCT FROM COALESCE(s."substituteCoachId", s."coachId");
