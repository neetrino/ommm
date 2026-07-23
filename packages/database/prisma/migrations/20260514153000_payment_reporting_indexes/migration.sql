-- Reporting-oriented indexes for payment and booking queries.
CREATE INDEX "Booking_status_createdAt_idx" ON "Booking"("status", "createdAt");

CREATE INDEX "Payment_status_createdAt_idx" ON "Payment"("status", "createdAt");

CREATE INDEX "Payment_createdAt_idx" ON "Payment"("createdAt");
