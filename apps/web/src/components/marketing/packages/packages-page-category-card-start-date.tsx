type PackagesPageCategoryCardStartDateProps = {
  startDateLine: string | null | undefined;
  className: string;
};

export function PackagesPageCategoryCardStartDate({
  startDateLine,
  className,
}: PackagesPageCategoryCardStartDateProps) {
  if (startDateLine === null || startDateLine === undefined || startDateLine.length === 0) {
    return null;
  }

  return <p className={className}>{startDateLine}</p>;
}
