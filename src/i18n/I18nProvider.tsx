import { createContext, useContext, useMemo, useState, useEffect } from "react";
import { Locale, translations } from "./translations";

type I18nContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
  availableLocales: Array<{ value: Locale; label: string }>;
};

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

const STORAGE_KEY = "rmp_locale";
const DEFAULT_LOCALE: Locale = "en";

const getInitialLocale = (): Locale => {
  if (typeof window === "undefined") return DEFAULT_LOCALE;
  const stored = window.localStorage.getItem(STORAGE_KEY) as Locale | null;
  if (stored && stored in translations) {
    return stored;
  }
  const browser = window.navigator.language.toLowerCase();
  return browser.startsWith("es") ? "es" : DEFAULT_LOCALE;
};

export const I18nProvider = ({ children }: { children: React.ReactNode }) => {
  const [locale, setLocaleState] = useState<Locale>(getInitialLocale);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, locale);
    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = (next: Locale) => {
    setLocaleState(next);
  };

  const t = useMemo(() => {
    return (key: string) =>
      translations[locale]?.[key] ??
      translations[DEFAULT_LOCALE][key] ??
      key;
  }, [locale]);

  const availableLocales = useMemo(
    () => [
      { value: "en" as const, label: translations.en["language.english"] },
      { value: "es" as const, label: translations.es["language.spanish"] },
    ],
    [],
  );

  const value = useMemo(
    () => ({ locale, setLocale, t, availableLocales }),
    [locale, t, availableLocales],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export const useI18n = () => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used within I18nProvider");
  }
  return context;
};
