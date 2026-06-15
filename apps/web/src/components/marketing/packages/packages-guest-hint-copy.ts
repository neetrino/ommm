type PackagesGuestHintCopy = {
  loginLabel: string;
  registerLabel: string;
  connector: string;
  suffix: string;
  ariaLabel: string;
};

/** Resolves i18n strings for {@link PackagesGuestHint} from marketing + common namespaces. */
export function resolvePackagesGuestHintCopy(
  common: (key: "login" | "register") => string,
  marketing: (
    key: "packagesLoginHintConnector" | "packagesLoginHintSuffix" | "packagesLoginHintAria",
  ) => string,
): PackagesGuestHintCopy {
  return {
    loginLabel: common("login"),
    registerLabel: common("register"),
    connector: marketing("packagesLoginHintConnector"),
    suffix: marketing("packagesLoginHintSuffix"),
    ariaLabel: marketing("packagesLoginHintAria"),
  };
}
