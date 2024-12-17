// import { RequestError } from '@/api';
import { createI18n, I18nOptions } from 'vue-i18n';
import { snakeCase } from 'lodash';

import availableLanguages from './available-languages.yaml';
import datetimeFormats from './date-formats.yaml';
import numberFormats from './number-formats.yaml';
import enUSBase from './translations/en-US.yaml';

export const i18n = createI18n({
  legacy: false,
  locale: 'en-US',
  fallbackLocale: 'en-US',
  messages: {
    'en-US': enUSBase,
  } as I18nOptions['messages'],
  silentTranslationWarn: true,
  fallbackWarn: false,
  missingWarn: false,
  datetimeFormats,
  numberFormats,
});

export type Language = keyof typeof availableLanguages;

export const loadedLanguages: Language[] = ['en-US'];

export function translateAPIError(error: any | string = null): string {
  const defaultMsg = i18n.global.t('errors.unexpected_error');

  if (!error) return defaultMsg;

  const key = `errors.${snakeCase(error.replace(/\s+/g, '_'))}`;
  const exists = i18n.global.te(key);

  if (exists === false) return defaultMsg;

  return i18n.global.t(key);
}
