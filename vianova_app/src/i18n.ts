import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { getLocales } from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';

import ja from './locales/ja';
import en from './locales/en';
import zh from './locales/zh';
import ko from './locales/ko';

export const SUPPORTED = ['ja', 'en', 'zh', 'ko'] as const;
export type Lang = (typeof SUPPORTED)[number];
export const LANG_LABEL: Record<Lang, string> = {
  ja: '日本語',
  en: 'English',
  zh: '中文',
  ko: '한국어',
};

const STORE_KEY = 'vcp_lang';
const isSupported = (s: string): s is Lang => (SUPPORTED as readonly string[]).includes(s);

function deviceLang(): Lang {
  const code = getLocales()[0]?.languageCode ?? 'ja';
  return isSupported(code) ? code : 'ja';
}

export async function initI18n() {
  const saved = await AsyncStorage.getItem(STORE_KEY);
  const lng = saved && isSupported(saved) ? saved : deviceLang();
  await i18n.use(initReactI18next).init({
    resources: {
      ja: { translation: ja },
      en: { translation: en },
      zh: { translation: zh },
      ko: { translation: ko },
    },
    lng,
    fallbackLng: 'ja',
    interpolation: { escapeValue: false },
  });
  return i18n;
}

export async function setLang(lng: Lang) {
  await AsyncStorage.setItem(STORE_KEY, lng);
  await i18n.changeLanguage(lng);
}

export const currentLang = (): Lang => {
  const l = i18n.language || 'ja';
  return isSupported(l) ? l : 'ja';
};

export default i18n;
