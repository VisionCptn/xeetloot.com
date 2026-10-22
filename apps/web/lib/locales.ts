import type { Locale } from "@/i18n/routing";

export interface LocaleInfo {
  code: Locale;
  native: string;
  english: string;
}

// Keep in sync with i18n/routing.ts's `locales` — only locales with fully
// translated messages/<locale>.json belong here. See that file's comment
// for why ru/uk/de/fr/ja/ko/th/hi aren't listed yet.
export const LOCALE_INFO: LocaleInfo[] = [
  { code: "en", native: "English", english: "English" },
  { code: "es", native: "Español", english: "Spanish" },
  { code: "pt-BR", native: "Português (Brasil)", english: "Portuguese" },
  { code: "tr", native: "Türkçe", english: "Turkish" },
  { code: "id", native: "Bahasa Indonesia", english: "Indonesian" },
  { code: "ar", native: "العربية", english: "Arabic" },
  { code: "vi", native: "Tiếng Việt", english: "Vietnamese" },
];
