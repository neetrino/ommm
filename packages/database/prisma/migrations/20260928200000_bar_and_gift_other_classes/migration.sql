CREATE TABLE "BarProduct" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "priceAmd" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BarProduct_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "GiftCard" ADD COLUMN "allowOtherClasses" BOOLEAN NOT NULL DEFAULT false;
