import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import { t as translate, type Lang } from "@shared/translations";

type LanguageContextType = {
  language: Lang;
  setLanguage: (l: Lang) => void;
  toggleLanguage: () => void;
  t: (key: string) => string;
};

const LanguageContext = createContext<LanguageContextType | null>(null);

const langOrder: Lang[] = ["en", "hi", "mr"];

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Lang>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("language") as Lang | null;
      if (stored && langOrder.includes(stored)) return stored;
    }
    return "en";
  });

  useEffect(() => {
    localStorage.setItem("language", language);
    document.documentElement.lang = language === "mr" ? "mr" : language === "hi" ? "hi" : "en";
  }, [language]);

  const setLanguage = (l: Lang) => setLanguageState(l);

  const toggleLanguage = () =>
    setLanguageState((l) => {
      const idx = langOrder.indexOf(l);
      return langOrder[(idx + 1) % langOrder.length];
    });

  const t = useCallback((key: string) => translate(key, language), [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
