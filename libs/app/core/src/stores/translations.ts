import { defineStore } from 'pinia';
import { ref, unref, watch } from 'vue';

import { i18n } from '../application/lang';
import { getLiteralInterpolatedTranslation } from '../utils/get-literal-interpolated-translation';

export interface Translation {
  language: string;
  key: string;
  value: string;
}

export const useTranslationsStore = defineStore('translations', () => {
  const loading = ref(false);
  const translations = ref<Translation[]>([]);
  const lang = ref<string>('en-US');

  watch(translations, (newTranslations) => {
    const localeMessages = newTranslations?.reduce(
      (result: Record<string, string>, { key, value }: { key: string; value: string }) => {
        result[key] = getLiteralInterpolatedTranslation(value, true);
        return result;
      },
      {} as Record<string, string>
    );

    if (localeMessages) {
      i18n.global.mergeLocaleMessage(unref(lang), localeMessages);
    }
  });

  return { loading, translations };
});
