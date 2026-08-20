-- Past ACTIVE/FULL class sessions can transition to FINISHED after endsAt.
ALTER TYPE "ClassSessionStatus" ADD VALUE IF NOT EXISTS 'FINISHED';
