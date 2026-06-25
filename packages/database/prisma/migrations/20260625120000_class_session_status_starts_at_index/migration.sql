-- Public schedule queries filter by status and startsAt, then order by startsAt.
CREATE INDEX "ClassSession_status_startsAt_idx" ON "ClassSession"("status", "startsAt");
