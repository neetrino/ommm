import type { PackagesPageCategoryCardCopy } from "@/components/marketing/packages/packages-page-category-data";

type PackagesPageCategoryCardPriceProps = {
  category: Pick<
    PackagesPageCategoryCardCopy,
    "priceAmount" | "originalPriceAmount" | "priceFromPrefix"
  >;
  fromPrefixClassName: string;
  priceClassName: string;
  priceWithDiscountClassName: string;
  originalPriceClassName: string;
};

export function PackagesPageCategoryCardPrice({
  category,
  fromPrefixClassName,
  priceClassName,
  priceWithDiscountClassName,
  originalPriceClassName,
}: PackagesPageCategoryCardPriceProps) {
  if (category.priceAmount === null) {
    return null;
  }

  const hasOriginalPrice =
    category.originalPriceAmount !== undefined &&
    category.originalPriceAmount !== null;

  return (
    <>
      {category.priceFromPrefix !== undefined ? (
        <p className={fromPrefixClassName}>{category.priceFromPrefix}</p>
      ) : null}
      {hasOriginalPrice ? (
        <div className={priceWithDiscountClassName}>
          <span className={originalPriceClassName}>{category.originalPriceAmount}</span>
          <span className={priceClassName}>{category.priceAmount}</span>
        </div>
      ) : (
        <p className={priceClassName}>{category.priceAmount}</p>
      )}
    </>
  );
}
