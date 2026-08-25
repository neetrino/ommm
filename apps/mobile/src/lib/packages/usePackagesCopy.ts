import { useMemo } from "react";
import { useTranslations, useLocale } from "../../i18n/I18nProvider";
import { formatValidityDays, type TranslationValues } from "../../i18n/formatMessage";

export function usePackagesCopy() {
  const locale = useLocale();
  const tUserPackages = useTranslations("userPages.packages");
  const tMarketing = useTranslations("marketing");
  const tForms = useTranslations("forms");
  const tCommon = useTranslations("common");
  const tNav = useTranslations("nav");

  return useMemo(
    () => ({
      pageTitle: tNav("packages"),
      myPackagesTitle: tUserPackages("title"),
      myPackagesLead: tUserPackages("description"),
      catalogTitle: tMarketing("packagesPageTitle"),
      catalogLead: tMarketing("packagesPageLead"),
      detailsCta: tMarketing("packagesDetailsCta"),
      subscribeCta: tForms("packageCheckout.subscribe"),
      browsePackagesCta: tUserPackages("browsePackagesCta"),
      backToMyPackagesCta: tMarketing("packagesBackToList"),
      noPackagesYet: tUserPackages("noPackagesYet"),
      membershipDetailsPrice: tUserPackages("membershipDetailsPrice"),
      membershipDetailsValidity: tUserPackages("membershipDetailsValidity"),
      detailsClose: tMarketing("packagesDetailsClose"),
      subscribeTitle: tForms("manualPackagePayment.title"),
      subscribeConfirm: tForms("manualPackagePayment.confirm"),
      subscribeSuccessTitle: tForms("manualPackagePayment.successTitle"),
      subscribeSuccessBody: tForms("manualPackagePayment.successFollowUp"),
      subscribeFailed: tForms("manualPackagePayment.submitFailed"),
      discountBadge: tMarketing("packagesDiscountBadge"),
      sessionsUnlimitedShort: tMarketing("packagesSessionsUnlimitedShort"),
      tableTotalSessions: tMarketing("packagesTableTotalSessions"),
      tablePrice: tMarketing("packagesTablePrice"),
      originalPrice: tMarketing("packagesTablePrice"),
      tableValidity: tMarketing("packagesTableValidity"),
      tableGuests: tMarketing("packagesTableGuests"),
      tableFreeze: tMarketing("packagesTableFreeze"),
      formatPackageFreeze: (times: number, days: number) =>
        tMarketing("packagesFreezeTimesDays", { times, days }),
      typeSessionsType: tMarketing("packagesTypeSessionsType"),
      typeSessionsSession: tMarketing("packagesTypeSessionsSession"),
      typeSessionsExpandAria: (name: string) =>
        tMarketing("packagesTypeSessionsExpandAria", { name }),
      typeSessionsCollapseAria: (name: string) =>
        tMarketing("packagesTypeSessionsCollapseAria", { name }),
      empty: tUserPackages("emptyPlans"),
      loadError: tUserPackages("couldNotLoadPlans"),
      loadMembershipsError: tUserPackages("couldNotLoadPlans"),
      loading: tCommon("loading"),
      formatPackageValidityDays: (count: number) =>
        formatValidityDays(
          locale,
          count,
          (key: string, values?: TranslationValues) => tMarketing(key, values),
        ),
    }),
    [locale, tCommon, tForms, tMarketing, tNav, tUserPackages],
  );
}

export type PackagesCopy = ReturnType<typeof usePackagesCopy>;
