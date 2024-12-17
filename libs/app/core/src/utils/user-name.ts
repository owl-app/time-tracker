import { User } from '@owl-app/lib-contracts';
import { i18n } from '../application/lang';

export function userName(user?: Partial<User>): string {
  if (!user) {
    return i18n.global.t('unknown_user') as string;
  }

  if (user.firstName && user.lastName) {
    return `${user.firstName} ${user.lastName}`;
  }

  if (user.firstName) {
    return user.firstName;
  }

  if (user.email) {
    return user.email;
  }

  return i18n.global.t('unknown_user') as string;
}
