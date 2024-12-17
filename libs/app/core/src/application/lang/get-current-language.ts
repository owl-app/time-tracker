import { useUserStore } from '../../stores/user';

export function getCurrentLanguage(fallback = 'en-US') {
  const usersStore = useUserStore();

  let lang = fallback;

  if (
    usersStore.currentUser &&
    'language' in usersStore.currentUser &&
    usersStore.currentUser.language
  ) {
    lang = usersStore.currentUser.language;
  }

  return lang;
}
