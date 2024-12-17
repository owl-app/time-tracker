import { loadDateFNSLocale } from '../../utils/get-date-fns-locale';

import availableLanguages from './available-languages.yaml';
import { i18n, Language, loadedLanguages } from './index';

export async function setLanguage(lang: Language): Promise<boolean> {
  if (Object.keys(availableLanguages).includes(lang) === false) {
    // eslint-disable-next-line no-console
    console.warn(`"${lang}" is not an available language in the app.`);
  } else {
    if (loadedLanguages.includes(lang) === false) {
      try {
        const { default: translations } = await import(`./translations/${lang}.yaml`);
        i18n.global.mergeLocaleMessage(lang, translations);
        loadedLanguages.push(lang);
      } catch (err: any) {
        // eslint-disable-next-line no-console
        console.warn(err);
      }
    }

    i18n.global.locale.value = lang;

    (document.querySelector('html') as HTMLElement).setAttribute('lang', lang);
  }

  try {
    await loadDateFNSLocale(lang);
  } catch {
    // eslint-disable-next-line no-console
    console.error('Failed loading translations');
  }

  return true;
}
